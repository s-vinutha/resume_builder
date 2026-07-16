import { useState } from 'react';
// IMPORT CHART COMPONENTS
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  // Navigation State: 'landing', 'ats', or 'builder'
  const [currentView, setCurrentView] = useState('landing');

  // Existing ATS Scanner States
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('job_description', jobDescription);
    
    if (resumeFile) {
      formData.append('resume_file', resumeFile);
    } else {
      formData.append('resume', resumeText);
    }

    try {
      const response = await fetch('http://127.0.0.1:5001/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      
      {/* ========================================================= */}
      {/* 🚀 1. WELCOME LANDING VIEW VIEW                           */}
      {/* ========================================================= */}
      {currentView === 'landing' && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h1>🤖 AI-Powered Career Suite</h1>
          <p style={{ color: '#666', marginBottom: '40px' }}>Select an option below to get started on optimizing your career applications.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
            
            {/* CARD ONE: ATS CHECKER */}
            <div 
              onClick={() => setCurrentView('ats')}
              style={{ padding: '30px 20px', border: '2px solid #007BFF', borderRadius: '8px', cursor: 'pointer', background: '#f0f7ff', transition: 'transform 0.2s' }}
            >
              <h2 style={{ color: '#007BFF', margin: '0 0 10px 0' }}>📊 Check ATS Score</h2>
              <p style={{ fontSize: '14px', color: '#4a5568', margin: 0 }}>Scan your resume against any target job description to look for matching metrics, missing skills, and optimization strategies.</p>
            </div>

            {/* CARD TWO: CUSTOM GENERATOR */}
            <div 
              onClick={() => setCurrentView('builder')}
              style={{ padding: '30px 20px', border: '2px solid #28a745', borderRadius: '8px', cursor: 'pointer', background: '#f4fff6', transition: 'transform 0.2s' }}
            >
              <h2 style={{ color: '#28a745', margin: '0 0 10px 0' }}>📝 Custom Make Resume</h2>
              <p style={{ fontSize: '14px', color: '#4a5568', margin: 0 }}>Input your profile milestones to build an optimized, structurally structured, ATS-compliant application outline from clean layouts.</p>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 📊 2. ATS SCORE CHECKER COMPONENT                         */}
      {/* ========================================================= */}
      {currentView === 'ats' && (
        <div>
          <button 
            onClick={() => setCurrentView('landing')}
            style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}
          >
            ⬅️ Back to Home
          </button>
          
          <h1>📊 ATS Score Checker</h1>
          
          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Upload Resume (PDF):</label>
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
                style={{ marginBottom: '10px' }}
              />
              
              {!resumeFile && (
                <>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>- OR paste text instead -</p>
                  <textarea 
                    rows="4" 
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    placeholder="Paste your resume details..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Paste Job Description:</label>
              <textarea 
                rows="5" 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="Paste target job requirements here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '12px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Analyzing Application...' : 'Run ATS Scanner'}
            </button>
          </form>

          {error && <p style={{ color: 'red', marginTop: '15px' }}>⚠️ {error}</p>}

          {result && (
            <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#1a202c' }}>
              <h2 style={{ margin: '0 0 10px 0', textAlign: 'center', color: '#1a202c' }}>📊 Scanner Diagnostics</h2>
              
              <div style={{ width: '100%', height: 180, display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                <ResponsiveContainer width="60%" height="100%">
                  <RadialBarChart 
  cx="50%" 
  cy="70%" 
  innerRadius="80%" 
  outerRadius="110%" 
  barSize={18} 
  /* 1. Pass two entries: a hidden 100% background track placeholder, and the score track */
  data={[
    { name: 'Max', value: 100, fill: '#f1f5f9' }, 
    { name: 'Score', value: parseFloat(result.ats_score), fill: '#007BFF' }
  ]} 
  startAngle={180} 
  endAngle={0}
>
  {/* 2. Remove 'background' prop so it renders our custom data scale track layer */}
  <RadialBar clockWise={true} dataKey="value" cornerRadius={10} />
  <text 
    x="50%" 
    y="65%" 
    textAnchor="middle" 
    dominantBaseline="middle" 
    style={{ fontSize: '28px', fontWeight: 'bold', fill: '#1a202c' }}
  >
    {result.ats_score}
  </text>
</RadialBarChart>
                </ResponsiveContainer>
              </div>

              {result.ai_recommendations && result.ai_recommendations.length > 0 && (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#ebf8ff', borderRadius: '6px', border: '1px solid #bee3f8' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#2b6cb0' }}>🤖 AI Optimization Strategy:</h4>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    {result.ai_recommendations.map((tip, idx) => (
                      <li key={idx} style={{ marginBottom: '8px', fontSize: '14px', color: '#2d3748', textAlign: 'left' }}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <h4 style={{ color: '#2d3748', margin: '20px 0 10px 0', textAlign: 'left' }}>🔍 Key Words Missing From Your Resume:</h4>
              <ul style={{ paddingLeft: '20px', margin: '0', textAlign: 'left' }}>
                {result.missing_keywords.map((word, idx) => (
                  <li key={idx} style={{ color: '#dd6b20', fontWeight: 'bold', marginBottom: '5px' }}>{word}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 📝 3. CUSTOM RESUME BUILDER PLACEHOLDER                   */}
      {/* ========================================================= */}
      {currentView === 'builder' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <button 
            onClick={() => setCurrentView('landing')}
            style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', display: 'block' }}
          >
            ⬅️ Back to Home
          </button>
          
          <h1>📝 Custom Resume Builder</h1>
          <div style={{ padding: '40px', border: '2px dashed #ccc', borderRadius: '8px', background: '#fafafa', marginTop: '20px' }}>
            <h3>🛠️ Resume Generator Module Under Development</h3>
            <p style={{ color: '#666' }}>Next, we can build fields here for contact info, education, and work history to render a downloadable PDF template file directly!</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;