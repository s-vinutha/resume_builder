from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import io
import traceback
from matcher import calculate_ats_score, extract_missing_keywords
from ai_advisor import local_ai_engine

app = Flask(__name__)
CORS(app)

def extract_text_from_pdf_stream(file_storage_object):
    """Extracts pristine plain text layers from an uploaded PDF file stream."""
    try:
        with pdfplumber.open(file_storage_object) as pdf:
            extracted_text = ""
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        return extracted_text
    except Exception as e:
        print(f"❌ PDF Parser Error: {e}")
        return ""

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    try:
        company_name = request.form.get('company_name', '').strip()
        
        # 1. Parse Job Description Text/PDF
        job_description = ""
        if 'jd_file' in request.files and request.files['jd_file'].filename != '':
            job_description = extract_text_from_pdf_stream(request.files['jd_file'])
        else:
            job_description = request.form.get('job_description', '')

        # 2. Parse Resume Text/PDF
        resume_text = ""
        if 'resume_file' in request.files and request.files['resume_file'].filename != '':
            resume_file_obj = request.files['resume_file']
            resume_text = extract_text_from_pdf_stream(resume_file_obj)
        else:
            resume_text = request.form.get('resume', '')

        # Terminal Print Verification Logs
        print(r"=== DEBUG: EXTRACTED RESUME LENGTH ===", len(resume_text))
        print(r"=== DEBUG: EXTRACTED JD LENGTH ===", len(job_description))

        if not resume_text.strip():
            return jsonify({'error': 'Failed to extract text from the resume file. Please ensure it is a text-based PDF.'}), 400
        if not job_description.strip():
            return jsonify({'error': 'Job Description or target profile is missing.'}), 400

        # 3. Compute ATS Calculations
        score = calculate_ats_score(resume_text, job_description)
        missing_badges = extract_missing_keywords(resume_text, job_description)
        
        ignore_words = {
            'technical', 'coresoftware', 'apis', 'ai-powered', 'b.tech', 
            'mandatory', 'm.e', 'm.tech', 'm.sc', 'b.e', 'applicants', 
            'understanding', 'concepts', 'fundamentals', 'practices', 'nice'
        }
        clean_missing_badges = [w for w in missing_badges if w.lower() not in ignore_words]

        # 4. Generate AI Advice Insights Matrix
        ai_insights = local_ai_engine.generate_tailored_strategy(resume_text, clean_missing_badges, company_name)

        return jsonify({
            'ats_score': score,
            'missing_keywords': clean_missing_badges[:8],
            'recommended_skills': ai_insights["recommended_skills"],
            'company_insights': ai_insights["company_insights"],
            'formatting_rules': ai_insights["formatting_rules"]
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)