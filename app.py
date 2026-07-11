from flask import Flask, request, jsonify
from flask_cors import CORS
from matcher import calculate_ats_score, extract_missing_keywords
from database import init_db, save_analysis
from pypdf import PdfReader  # <-- Import the PDF Reader tool

app = Flask(__name__)
CORS(app)

init_db()

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    # 1. INPUT: Check if a file was uploaded, otherwise fall back to raw text
    job_desc_text = request.form.get('job_description', '')
    resume_text = ""

    if 'resume_file' in request.files:
        file = request.files['resume_file']
        if file.filename != '':
            try:
                # Parse binary data directly out of the uploaded PDF file
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
        # Fall back to text input if no file is present
        resume_text = request.form.get('resume', '')

    # Safety check: Make sure we actually obtained text for both fields
    if not resume_text.strip() or not job_desc_text.strip():
        return jsonify({"error": "Please provide both a resume (file or text) and a job description."}), 400
        
    # 2. PROCESS: Run the matching engine logic
    match_score = calculate_ats_score(resume_text, job_desc_text)
    missing_words = extract_missing_keywords(resume_text, job_desc_text)
    
    # 3. SAVE DATA: Log the metrics to SQLite
    save_analysis(match_score, missing_words)
    
    # 4. OUTPUT: Return results
    response_data = {
        "status": "success",
        "ats_score": f"{match_score}%",
        "missing_keywords": missing_words
    }
    
    return jsonify(response_data), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)