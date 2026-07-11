from flask import Flask, request, jsonify
from matcher import calculate_ats_score, extract_missing_keywords
from database import init_db, save_analysis  # <-- Import database functions

app = Flask(__name__)

# Initialize the SQL database table right when the server spins up
init_db()

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    data = request.get_json()
    
    if not data or 'resume' not in data or 'job_description' not in data:
        return jsonify({"error": "Please provide both 'resume' and 'job_description' text."}), 400
        
    resume_text = data['resume']
    job_desc_text = data['job_description']
    
    match_score = calculate_ats_score(resume_text, job_desc_text)
    missing_words = extract_missing_keywords(resume_text, job_desc_text)
    
    # 3. SAVE DATA: Log the processed results inside our database
    save_analysis(match_score, missing_words)
    
    response_data = {
        "status": "success",
        "ats_score": f"{match_score}%",
        "missing_keywords": missing_words
    }
    
    return jsonify(response_data), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)