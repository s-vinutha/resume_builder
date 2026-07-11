import sqlite3
from datetime import datetime

DB_NAME = "ats_history.db"

def init_db():
    """Creates the analysis logs table if it doesn't exist yet."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Create a table to save our inputs, processed data, and outputs
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resume_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            ats_score REAL NOT NULL,
            missing_skills TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

def save_analysis(score, missing_keywords):
    """Saves the calculated score and missing keywords into the database."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Convert list of missing skills to a comma-separated string to save in SQL
    skills_str = ", ".join(missing_keywords)
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute('''
        INSERT INTO resume_logs (timestamp, ats_score, missing_skills)
        VALUES (?, ?, ?)
    ''', (current_time, score, skills_str))
    
    conn.commit()
    conn.close()