import { useState } from 'react';
import './App.css';

function App() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Connect to your local Flask API server running on port 5001
      const response = await fetch('http://127.0.0.1:5001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: resume,
          job_description: jobDescription,
        }),
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
      <p>Analyze how well your profile matches the target job requirements instantly.</p>

      <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Paste Resume Text:</label>
          <textarea 
            rows="6" 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="Paste your resume profile or experience here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Paste Job Description:</label>
          <textarea 
            rows="6" 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="Paste the target job requirements here..."
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
          {loading ? 'Analyzing Profile...' : 'Run ATS Scanner'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '15px' }}>⚠️ {error}</p>}

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <h2>📊 Scanner Diagnostics</h2>
          <h3 style={{ color: '#2b6cb0' }}>ATS Match Score: {result.ats_score}</h3>
          
          <h4>🔍 Key Words Missing From Your Resume:</h4>
          {result.missing_keywords.length > 0 ? (
            <ul>
              {result.missing_keywords.map((word, idx) => (
                <li key={idx} style={{ color: '#dd6b20', fontWeight: '500' }}>{word}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'green' }}>✅ Excellent keyword matching! Your profile covers the core terms.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;