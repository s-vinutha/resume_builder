import { useState } from 'react';
// IMPORT CHART COMPONENTS
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
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
      <h1>🤖 AI ATS-Friendly Resume Builder</h1>
      
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

      {/* DIAGNOSTICS CARD CONTAINING BOTH THE PROGRESS CHART & AI ADVICE LAYER */}
      {result && (
        <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#1a202c' }}>
          <h2 style={{ margin: '0 0 10px 0', textAlign: 'center', color: '#1a202c' }}>📊 Scanner Diagnostics</h2>
          
          {/* Progress Gauge Chart */}
          <div style={{ width: '100%', height: 180, display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
            <ResponsiveContainer width="60%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="70%" 
                innerRadius="80%" 
                outerRadius="110%" 
                barSize={18} 
                data={[{ name: 'Score', value: parseFloat(result.ats_score), fill: '#007BFF' }]} 
                startAngle={180} 
                endAngle={0}
              >
                <RadialBar background clockWise={true} dataKey="value" cornerRadius={10} />
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

          {/* AI RECOMMENDATIONS ENGINE DISPLAY */}
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
  );
}

export default App;