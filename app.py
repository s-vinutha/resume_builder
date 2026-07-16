from flask import Flask, request, jsonify
from flask_cors import CORS
from matcher import calculate_ats_score, extract_missing_keywords
# NEW: Import our local AI engine instance
from ai_advisor import local_ai_engine

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    try:
        job_description = request.form.get('job_description', '')
        resume_text = request.form.get('resume', '')
        
        # Handle file upload extraction if present
        if 'resume_file' in request.files:
            file = request.files['resume_file']
            # Assuming you have your pypdf or pdfplumber reader active here:
            # resume_text = extract_text_from_pdf(file)
            pass

        # 1. Compute mechanical metrics via our regex pattern matrix
        score = calculate_ats_score(resume_text, job_description)
        missing_badges = extract_missing_keywords(resume_text, job_description)
        
        # 2. Compute semantic recommendations via the On-Device local LLM pipeline
        if local_ai_engine:
            ai_insights = local_ai_engine.analyze_profile_gaps(resume_text, job_description)
            recommended_skills = ai_insights["recommended_skills"]
            formatting_rules = ai_insights["formatting_rules"]
        else:
            # Fallback safe directives if library installation is skipped
            recommended_skills = [f"Focus heavily on deep technical competencies aligned with: {job_description}"]
            formatting_rules = ["Maintain a clean, scannable single-column typography profile layout."]

        return jsonify({
            'ats_score': score,
            'missing_keywords': missing_badges[:8],
            'recommended_skills': recommended_skills,
            'formatting_rules': formatting_rules
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)