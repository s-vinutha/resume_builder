import re

def calculate_ats_score(resume_text, job_description):
    """Computes a basic mechanical keyword matching score between the resume and JD."""
    if not resume_text.strip() or not job_description.strip():
        return 0
        
    # Extract words/tokens
    jd_words = set(re.findall(r'\b\w+\b', job_description.lower()))
    resume_words = set(re.findall(r'\b\w+\b', resume_text.lower()))
    
    if not jd_words:
        return 0
        
    # Find how many target keywords intersect
    matches = jd_words.intersection(resume_words)
    score = (len(matches) / len(jd_words)) * 100
    return round(score, 1)

def extract_missing_keywords(resume_text, job_description):
    """Identifies technical terminology present in the JD but absent in the resume."""
    jd_words = set(re.findall(r'\b\w+\b', job_description.lower()))
    resume_words = set(re.findall(r'\b\w+\b', resume_text.lower()))
    
    # Filter out short noise characters
    missing = list(jd_words.difference(resume_words))
    return [word for word in missing if len(word) > 2]

def calculate_standalone_structural_score(resume_text):
    """
    Hyper-Strict Enterprise-Grade Resume Auditor.
    Enforces deep density checks on metrics, verbs, content length, and sectioning.
    Scoring 100% requires a mathematically flawless, metric-dense document structure.
    """
    if not resume_text.strip():
        return 0, [], []

    score = 100
    critiques = []
    strengths = []
    
    # Normalize layout spacings for text mapping
    text_lower = " ".join(resume_text.lower().split())

    # --- 1. RIGOROUS SECTION HEADER VERIFICATION ---
    has_summary = bool(re.search(r'\b(summary|objective|about me)\b', text_lower))
    has_skills = bool(re.search(r'\b(skills|competencies|tools)\b', text_lower))
    has_education = bool(re.search(r'\b(education|academic)\b', text_lower))
    has_experience = bool(re.search(r'\b(experience|internship|employment|history)\b', text_lower))
    has_projects = bool(re.search(r'\b(projects|accomplishments)\b', text_lower))

    if not has_summary:
        score -= 10
        critiques.append("📝 Summary Section Missing: Missing a distinct 'Professional Summary' or 'Career Objective' block at the top to anchor your profile.")
    else:
        strengths.append("ui-check: Introductory summary block verified.")

    missing_headers = []
    if not has_skills: missing_headers.append("SKILLS")
    if not has_education: missing_headers.append("EDUCATION")
    if not has_experience: missing_headers.append("EXPERIENCE/INTERNSHIP")
    if not has_projects: missing_headers.append("PROJECTS")
    
    if missing_headers:
        score -= (10 * len(missing_headers))
        critiques.append(f"📋 Missing Structural Anchors: The tracking parser missed these essential structural headings: {', '.join(missing_headers)}.")

    # --- 2. ISOLATE ACTIVE CONTENT (EXPERIENCE & PROJECTS) ---
    action_content = ""
    action_match = re.search(r'\b(projects|experience|internship|history|work)\b.*', text_lower)
    action_content = action_match.group(0) if action_match else text_lower

    # --- 3. DENSITY AUDIT: ACTION VERBS ---
    action_verbs = {
        'architected', 'optimized', 'engineered', 'implemented', 'developed', 
        'formulated', 'designed', 'built', 'led', 'managed', 'created', 
        'analyzed', 'evaluated', 'spearheaded', 'orchestrated', 'streamlined'
    }
    found_verbs = [v for v in action_verbs if v in action_content]
    
    # Multi-tiered verb density checklist
    if len(found_verbs) < 4:
        score -= 15
        critiques.append(f"🚫 Low Action Verb Density: Found only {len(found_verbs)} unique elite action verbs. Expand vocabulary with high-impact words (e.g., 'Spearheaded', 'Streamlined').")
    elif len(found_verbs) < 7:
        score -= 5
        critiques.append("💡 Action Verb Refinement: Good starter verbs found, but increasing diversity across descriptions strengthens impact loops.")
    else:
        strengths.append("✅ Dynamic Vocabulary: High-density integration of professional action verbs.")

    # --- 4. DATA-DRIVEN METRIC FREQUENCY AUDIT (THE 100% BLOCKER) ---
    # Finds distinct instances of numbers combined with metrics: %, $, cr, lpa, numbers over 10, etc.
    metric_instances = re.findall(r'(\b\d+%\b|\b\d+\s*percent\b|\$\d+|\b\d+x\b|\b\d{2,}\b)', action_content)
    
    # Strip out standard years so they don't trick the algorithm into a pass
    metric_instances = [m for m in metric_instances if not (m.startswith('19') or m.startswith('20') and len(m) == 4)]

    if len(metric_instances) == 0:
        score -= 25
        critiques.append("📉 Zero Quantifiable Impact: No specific performance metrics, monetary values, or conversion percentages were found in your bullet logs. Purely descriptive lists are routinely filtered out.")
    elif len(metric_instances) < 3:
        score -= 15
        critiques.append(f"📉 Insufficient Metric Frequency: Found only {len(metric_instances)} data metrics. Top-tier resumes require strong performance metrics distributed across multiple bullet lines.")
    else:
        strengths.append(f"✅ Quantifiable Impact: Solid metric frequency with {len(metric_instances)} verifiable data benchmarks.")

    # --- 5. WORK HISTORY DEPTH & TIMELINE DENSITY ---
    # Scans for distinct timeline formats or role markers to evaluate professional volume
    role_markers = len(re.findall(r'\b(intern|engineer|developer|analyst|coordinator|lead|manager)\b', text_lower))
    
    if text_lower.count("internship") < 2 and text_lower.count("experience") < 2 and role_markers < 3:
        score -= 15
        critiques.append("💼 Shallow Experience Record: The auditor prefers at least 2 distinct professional track records (jobs/internships) to show progression. Expand minor entries or add academic/volunteer roles.")
    else:
        strengths.append("✅ Track Record Depth: Balanced chronological tracking depth verified.")

    # --- 6. TEXT CONTRACTION & SCANNABILITY CHECK ---
    total_words = len(resume_text.split())
    if total_words < 250:
        score -= 10
        critiques.append("📐 Sub-optimal Content Density: Document word count is thin (below 250 words). Add deeper technical project attributes to improve scanning optimization.")
    elif total_words > 650:
        score -= 10
        critiques.append("📐 Text Overflow Hazard: Word count exceeds 650 words. Condense descriptions into punchy, scannable statements to fit cleanly on one single page.")

    # Pin score floor to a highly protective realistic level
    final_score = max(20, min(100, score))
    return final_score, critiques, strengths