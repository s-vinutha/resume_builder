import re
import math
from collections import Counter

def extract_keywords_automatically(text):
    """
    Automatically extracts technical skills and key phrases without a pre-defined list.
    It identifies acronyms (AWS, UI), camelCase (ReactJS, SpringBoot), 
    and alphanumeric technical terms (CI/CD, C++, C#).
    """
    # Pattern to capture Tech Terms: Acronyms, words with symbols (C++, C#), 
    # CamelCase/PascalCase, or mixed alphanumeric strings (Next.js, CI/CD)
    pattern = r'\b[A-Z0-9][a-zA-Z0-9\+\#\-\.]+\b|\b[a-z]+[A-Z][a-zA-Z0-9]+\b'
    
    # Find all pattern matches
    raw_matches = re.findall(pattern, text)
    
    # Clean and normalize the discovered terms to lowercase
    discovered_keywords = set()
    for word in raw_matches:
        # Strip trailing punctuation marks like periods or commas if caught
        cleaned = word.strip('.,()[]{}').lower()
        if len(cleaned) > 1 and not cleaned.isdigit():
            discovered_keywords.add(cleaned)
            
    return discovered_keywords

def advanced_clean_and_tokenize(text, dynamic_keywords):
    """Normalizes text and filters out common structural stop words."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s\+\#\-\.]', ' ', text)
    words = text.split()
    
    stop_words = {
        'the', 'and', 'a', 'of', 'to', 'in', 'is', 'for', 'with', 'on', 'an', 'as', 'by', 
        'at', 'our', 'your', 'we', 'you', 'that', 'are', 'be', 'or', 'from', 'this', 'will',
        'with', 'experience', 'team', 'work', 'skills', 'role', 'working', 'years', 'job'
    }
    
    return [w for w in words if w not in stop_words]

def calculate_ats_score(resume_text, job_desc_text):
    """Computes matching score by automatically extracting and weighting key terms."""
    # Automatically discover the core tech terms from the Job Description dynamically!
    dynamic_keywords = extract_keywords_automatically(job_desc_text)
    
    resume_tokens = advanced_clean_and_tokenize(resume_text, dynamic_keywords)
    job_tokens = advanced_clean_and_tokenize(job_desc_text, dynamic_keywords)
    
    if not resume_tokens or not job_tokens:
        return 0.0
        
    resume_counts = Counter(resume_tokens)
    job_counts = Counter(job_tokens)
    all_unique_words = set(resume_counts.keys()).union(set(job_counts.keys()))
    
    dot_product = 0.0
    resume_magnitude = 0.0
    job_magnitude = 0.0
    
    for word in all_unique_words:
        # Heavily weight terms that match the automatically discovered tech patterns
        weight = 3.0 if word in dynamic_keywords else 1.0
        
        r_val = resume_counts[word] * weight
        j_val = job_counts[word] * weight
        
        dot_product += r_val * j_val
        resume_magnitude += r_val ** 2
        job_magnitude += j_val ** 2
        
    if resume_magnitude == 0 or job_magnitude == 0:
        return 0.0
        
    cosine_similarity = dot_product / (math.sqrt(resume_magnitude) * math.sqrt(job_magnitude))
    return round(cosine_similarity * 100, 2)

def extract_missing_keywords(resume_text, job_desc_text):
    """Dynamically finds keywords present in the JD patterns that are missing from the resume."""
    dynamic_keywords = extract_keywords_automatically(job_desc_text)
    resume_set = set(advanced_clean_and_tokenize(resume_text, dynamic_keywords))
    
    missing_skills = dynamic_keywords - resume_set
    return list(missing_skills)[:8] # Return top 8 missing auto-detected keywords

def generate_ai_recommendations(score, missing_keywords):
    """Generates standard optimization directives based on the computed matrix results."""
    recommendations = []
    
    if score >= 75:
        recommendations.append("🌟 Strong Vector Alignment: Your experience statements closely reflect the primary requirements.")
    elif 40 <= score < 75:
        recommendations.append("📈 Moderate Matching: The core framework matches, but the scanner detected a structural deficit in explicit keyword frequency.")
    else:
        recommendations.append("⚠️ Structural Mismatch: Your layout profile needs significant optimization. Crucial target key-phrases are missing.")
        
    if missing_keywords:
        skills_string = ", ".join([skill.upper() for skill in missing_keywords[:3]])
        recommendations.append(f"💡 Action Item: Construct context bullet points explicitly mentioning: {skills_string}.")
        recommendations.append("🎯 Strategy: Do not just list them in a block; inject them inside achievements (e.g., 'Utilized X framework to optimize Y process').")
    else:
        recommendations.append("✅ Excellent coverage! Your technical stack accounts for all required fields identified.")
        
    return recommendations