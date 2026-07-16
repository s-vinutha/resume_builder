class OnDeviceCareerAI:
    def generate_tailored_strategy(self, resume_text, missing_keywords, company_name=None):
        """
        Calculates actionable recommendations and tailored projects 
        instantly based on identified technical keyword gaps.
        """
        # Select the top critical missing skills for tracking
        tracked_skills = [w.upper() for w in missing_keywords[:3]]
        
        if not tracked_skills:
            skills_phrase = "Advanced Generative AI Frameworks"
            project_name = "Enterprise AI Orchestration Hub"
            project_desc = "Design an orchestration layer integrating multiple LLMs, prompt pipelines, and continuous vector memory."
        else:
            skills_phrase = ", ".join(tracked_skills)
            project_name = f"Intelligent {tracked_skills[0].title()} Integration Pipeline"
            project_desc = f"Build an production-grade application leveraging {skills_phrase} to handle complex data indexing, semantic query vectors, and automated processing pipelines."

        recommended_skills = [
            f"🚀 Recommended Project: {project_name}",
            f"💡 Technical Blueprint: {project_desc}"
        ]

        # Handle target corporate tracking insight blocks
        if company_name and company_name.strip():
            c_name = company_name.strip()
            company_insights = [
                f"🏢 Corporate Strategy: {c_name} requires strong hands-on ownership of foundational system concepts.",
                f"🎯 Tactical Interview Target: Be prepared to discuss how you would architect microservices using {skills_phrase} to fit inside {c_name}'s production ecosystem."
            ]
        else:
            company_insights = [
                "💡 Corporate Intelligence: Add a specific company name in the form header inputs to generate customized interview alignment advice."
            ]

        formatting_rules = [
            "📋 Layout Order: Maintain a strict top-down structure: Header -> Tech Skills -> Professional Experience -> Projects -> Education.",
            "📐 Structural Balance: Use a crisp single-column configuration with standard 0.75-inch margins to keep text tracks clear for scanners.",
            "🖋️ Impact Verbs: Ensure every project and job milestone bullet points begins with a strong action verb (e.g., 'Architected', 'Optimized')."
        ]

        return {
            "recommended_skills": recommended_skills,
            "company_insights": company_insights,
            "formatting_rules": formatting_rules
        }

# Instantiate the engine smoothly
local_ai_engine = OnDeviceCareerAI()