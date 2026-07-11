import re
from collections import Counter
import math

def clean_text(text):
    """Converts text to lowercase and removes punctuation/special characters."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text

def get_tokens(text):
    """Splits text into individual words (tokens)."""
    cleaned = clean_text(text)
    return cleaned.split()

def calculate_ats_score(resume_text, job_desc_text):
    """Calculates a match percentage using Cosine Similarity."""
    resume_words = get_tokens(resume_text)
    job_words = get_tokens(job_desc_text)
    
    # Count word frequencies
    resume_counts = Counter(resume_words)
    job_counts = Counter(job_words)
    
    # Get the unique words across both texts
    all_unique_words = set(resume_counts.keys()).union(set(job_counts.keys()))
    
    # Calculate the dot product and magnitudes for Cosine Similarity
    dot_product = sum(resume_counts[word] * job_counts[word] for word in all_unique_words)
    resume_magnitude = math.sqrt(sum(resume_counts[word]**2 for word in resume_counts))
    job_magnitude = math.sqrt(sum(job_counts[word]**2 for word in job_counts))
    
    if not resume_magnitude or not job_magnitude:
        return 0.0
        
    cosine_similarity = dot_product / (resume_magnitude * job_magnitude)
    return round(cosine_similarity * 100, 2)

def extract_missing_keywords(resume_text, job_desc_text):
    """Identifies important words in the job description that are missing from the resume."""
    resume_words = set(get_tokens(resume_text))
    job_words = set(get_tokens(job_desc_text))
    
    # Common "stop words" to filter out so we only focus on skills
    stop_words = {
        'the', 'and', 'a', 'of', 'to', 'in', 'is', 'for', 'with', 'on', 'an', 
        'as', 'by', 'at', 'our', 'your', 'we', 'you', 'that', 'are', 'be', 'or'
    }
    
    important_job_words = job_words - stop_words
    missing_words = important_job_words - resume_words
    return list(missing_words)[:10]  # Return top 10 missing keywords