from flask import Flask, request, jsonify
from flask_cors import CORS
# 1. UPDATE THE IMPORTS LINE AT THE TOP TO INCLUDE THE NEW FUNCTION
from matcher import calculate_ats_score, extract_missing_keywords, generate_ai_recommendations
from database import init_db, save_analysis

app = Flask(__name__)
CORS(app)

init_db()

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    job_desc_text = request.form.get('job_description', '')
    resume_text = ""

    if 'resume_file' in request.files:
        from pypdf import PdfReader
        file = request.files['resume_file']
        if file.filename != '':
            try:
                reader = PdfReader(file)
                extracted_text = []
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text.append(text)
                resume_text = "\n".join(extracted_text)
            except Exception as e:
                return jsonify({"error": f"Failed to parse PDF file: {str(e)}"}), 400
    else:
        resume_text = request.form.get('resume', '')

    if not resume_text.strip() or not job_desc_text.strip():
        return jsonify({"error": "Please provide both a resume and a job description."}), 400
        
    match_score = calculate_ats_score(resume_text, job_desc_text)
    missing_words = extract_missing_keywords(resume_text, job_desc_text)
    
    # 2. GENERATE AI TIPS
    ai_tips = generate_ai_recommendations(match_score, missing_words)
    
    save_analysis(match_score, missing_words)
    
    # 3. APPEND THE RECOMMENDATIONS TO OUTPUT OBJECT
    response_data = {
        "status": "success",
        "ats_score": f"{match_score}%",
        "missing_keywords": missing_words,
        "ai_recommendations": ai_tips # Added here
    }
    
    return jsonify(response_data), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)