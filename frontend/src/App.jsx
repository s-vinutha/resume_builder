import { useState } from 'react';
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

    // Create a Multi-part Form payload to allow file handling over HTTP
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
        body: formData, // Send form payload directly
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

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <h2>📊 Scanner Diagnostics</h2>
          <h3 style={{ color: '#2b6cb0' }}>ATS Match Score: {result.ats_score}</h3>
          <h4>🔍 Key Words Missing From Your Resume:</h4>
          <ul>
            {result.missing_keywords.map((word, idx) => (
              <li key={idx} style={{ color: '#dd6b20' }}>{word}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;