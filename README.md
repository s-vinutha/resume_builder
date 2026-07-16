# 🚀 Career Suite - AI Resume Analyzer

A full-stack web application that allows users to upload their PDF resumes and scan them against specific job descriptions. The system leverages an AI scoring backend to calculate matching scores and return immediate compliance formatting analytics.

## 🌐 Live Application
* **Frontend UI:** [https://career-suite-client.onrender.com](https://career-suite-client.onrender.com)
* **Backend API:** [https://resume-builder-api-8rh1.onrender.com](https://resume-builder-api-8rh1.onrender.com)

---

## 🛠️ Tech Stack

### Frontend
* **Core:** React (Vite)
* **Styling:** Tailwind CSS
* **Export & Sanitization:** html2canvas, jsPDF, DOMPurify

### Backend
* **Core framework:** Python, Flask, Flask-CORS
* **Production Web Server:** Gunicorn
* **Parsing Utilities:** pypdf, pdfplumber

### Hosting & Infrastructure
* **Deployment Platform:** Render (Decoupled Static Site + Web Service architecture)

---

## 🏗️ Architecture & Directory Structure
This project is built using a decoupled architecture to keep the client application cleanly separated from the processing engine:
* `/frontend` - The compiled client-side single-page application (SPA).
* **Root level files** (`app.py`, `requirements.txt`) - The Python Flask API backend web service.

---

## 🚀 Local Setup Instructions

If you wish to clone this repository and run the project locally on your machine, follow these steps:

### 1. Backend Setup
Navigate to the project root directory, configure your python virtual environment, and run:
```bash
# Install the required Python packages
pip install -r requirements.txt

# Start the Flask development server
python app.py
