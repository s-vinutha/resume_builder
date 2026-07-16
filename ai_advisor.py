import sys
from transformers import pipeline

class OnDeviceCareerAI:
    def __init__(self):
        print("🤖 Initializing Local AI Component (Zero API Keys required)...")
        # Using a highly responsive, optimized small text pipeline model
        # it downloads once, caches locally, and processes text entirely offline
        self.generator = pipeline(
            "text2text-generation", 
            model="google/flan-t5-base",
            device=-1 # Forces CPU execution so it runs on any laptop without a GPU
        )

    def analyze_profile_gaps(self, resume_text, job_input):
        """
        Uses an on-device language model to dynamically infer what skills are 
        missing and how to optimize formatting based on textual signals.
        """
        # Formulate a structured prompt for the localized AI model
        prompt = (
            f"Context: A candidate is applying for a position/description defined as '{job_input}'. "
            f"Their current resume text content contains: '{resume_text[:600]}'. "
            f"Task: Based on standard ATS guidelines, what are 2 high-impact technical skills "
            f"or tools that this candidate must add to pass screening filters? Be specific."
        )
        
        try:
            res = self.generator(prompt, max_length=120, num_return_sequences=1)
            ai_output = res[0]['generated_text']
        except Exception as e:
            ai_output = "Incorporate advanced industry engineering tools relevant to " + str(job_input)

        # Structure formatting directives dynamically based on content parsing length
        formatting_tips = [
            "📋 Layout Order: Maintain a strict top-down structure: Header -> Tech Skills -> Professional Experience -> Projects -> Education.",
            "📐 Structural Balance: Use a single-column layout with 0.75-inch margins. Multi-column structures break basic text parsers.",
            "🖋️ Action Verbs: Begin all project and experience bullet entries with robust verbs like 'Architected', 'Optimized', or 'Orchestrated'."
        ]
        
        if len(resume_text) < 300:
            formatting_tips.append("⚠️ Content Density Deficit: Your profile data layout is too brief. Expand achievements using the STAR methodology.")
            
        return {
            "recommended_skills": [f"🤖 AI Inference: {ai_output}"],
            "formatting_rules": formatting_tips
        }

# Singleton instance initialization helper
try:
    local_ai_engine = OnDeviceCareerAI()
except Exception as e:
    print(f"Fallback active: {e}")
    local_ai_engine = None