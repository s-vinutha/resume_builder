import { useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');

  // --- ATS Scanner States ---
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Advanced Resume Builder States ---
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '', email: '', phone: '', location: '', github: '', linkedin: ''
  });
  const [skills, setSkills] = useState('');
  const [experiences, setExperiences] = useState([{ company: '', role: '', dates: '', bulletPoints: '' }]);
  const [education, setEducation] = useState([{ school: '', degree: '', dates: '' }]);
  const [projects, setProjects] = useState([{ name: '', description: '', techStack: '', timeline: '' }]);

  const handlePersonalChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const addExperience = () => setExperiences([...experiences, { company: '', role: '', dates: '', bulletPoints: '' }]);
  const addEducation = () => setEducation([...education, { school: '', degree: '', dates: '' }]);
  const addProject = () => setProjects([...projects, { name: '', description: '', techStack: '', timeline: '' }]);

  const updateExperience = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const updateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  // --- ATS-Compliant PDF Compiler ---
  const generatePDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
    const margin = 0.75;
    let y = 0.75;

    const addSectionHeader = (title) => {
      y += 0.25;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(26, 32, 44);
      doc.text(title.toUpperCase(), margin, y);
      y += 0.08;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.01);
      doc.line(margin, y, 8.5 - margin, y);
      y += 0.18;
    };

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(personalInfo.fullName || 'YOUR NAME', 4.25, y, { align: 'center' });
    
    y += 0.22;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(74, 85, 104);
    
    const contactLine = [
      personalInfo.email, personalInfo.phone, personalInfo.location, 
      personalInfo.linkedin, personalInfo.github
    ].filter(Boolean).join('  |  ');
    doc.text(contactLine, 4.25, y, { align: 'center' });

    if (skills) {
      addSectionHeader('Technical Skills');
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(45, 55, 72);
      const splitSkills = doc.splitTextToSize(`Skills & Frameworks: ${skills}`, 7.0);
      doc.text(splitSkills, margin, y);
      y += splitSkills.length * 0.2;
    }

    if (experiences.some(exp => exp.company || exp.role)) {
      addSectionHeader('Professional Experience');
      experiences.forEach((exp) => {
        if (!exp.company && !exp.role) return;
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(45, 55, 72);
        doc.text(exp.role || 'Role Title', margin, y);
        
        doc.setFont('Helvetica', 'normal');
        doc.text(`${exp.company || 'Company'}  |  ${exp.dates || 'Dates'}`, 8.5 - margin, y, { align: 'right' });
        y += 0.2;

        if (exp.bulletPoints) {
          doc.setFontSize(10);
          const lines = exp.bulletPoints.split('\n');
          lines.forEach((line) => {
            if (!line.trim()) return;
            const cleanLine = line.startsWith('-') ? line.substring(1).trim() : line.trim();
            const splitBullet = doc.splitTextToSize(`•  ${cleanLine}`, 6.8);
            doc.text(splitBullet, margin + 0.15, y);
            y += splitBullet.length * 0.18;
          });
        }
        y += 0.1;
      });
    }

    if (projects.some(proj => proj.name)) {
      addSectionHeader('Projects');
      projects.forEach((proj) => {
        if (!proj.name) return;

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(45, 55, 72);
        doc.text(proj.name, margin, y);

        if (proj.timeline) {
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(10);
          doc.text(proj.timeline, 8.5 - margin, y, { align: 'right' });
        }
        y += 0.2;

        if (proj.techStack) {
          doc.setFont('Helvetica', 'oblique');
          doc.setFontSize(9.5);
          doc.setTextColor(74, 85, 104);
          doc.text(`Tech Stack: ${proj.techStack}`, margin, y);
          y += 0.18;
        }

        if (proj.description) {
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(45, 55, 72);
          
          const lines = proj.description.split('\n');
          lines.forEach((line) => {
            if (!line.trim()) return;
            const cleanLine = line.startsWith('-') ? line.substring(1).trim() : line.trim();
            const splitDesc = doc.splitTextToSize(`•  ${cleanLine}`, 6.8);
            doc.text(splitDesc, margin + 0.15, y);
            y += splitDesc.length * 0.18;
          });
        }
        y += 0.12;
      });
    }

    if (education.some(edu => edu.school)) {
      addSectionHeader('Education');
      education.forEach((edu) => {
        if (!edu.school) return;
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(edu.degree || 'Degree details', margin, y);
        doc.setFont('Helvetica', 'normal');
        doc.text(`${edu.school}  |  ${edu.dates}`, 8.5 - margin, y, { align: 'right' });
        y += 0.22;
      });
    }

    const fileName = `${(personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}_Built_Resume.pdf`;
    doc.save(fileName);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const formDataPayload = new FormData();
    formDataPayload.append('job_description', jobDescription);
    if (resumeFile) {
      formDataPayload.append('resume_file', resumeFile);
    } else {
      formDataPayload.append('resume', resumeText);
    }

    try {
      const response = await fetch('http://127.0.0.1:5001/api/analyze', { method: 'POST', body: formDataPayload });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Modern Inline Sleek Element Styles
  const containerStyle = { maxWidth: '900px', margin: '40px auto', padding: '0 24px', fontFamily: '"Inter", -apple-system, sans-serif', color: '#f8fafc' };
  const cardStyle = { background: '#1e293b', padding: '32px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };
  const inputStyle = { padding: '12px 16px', borderRadius: '8px', border: '1px solid #475569', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s', background: '#0f172a', color: '#ffffff' };
  const primaryBtnStyle = { padding: '12px 24px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'background 0.2s' };
  const secondaryBtnStyle = { padding: '12px 24px', background: '#1e293b', color: '#ffffff', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };
  const labelStyle = { display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '6px', color: '#cbd5e1' };

  return (
    <div style={containerStyle}>
      
      {/* 🚀 VIBRANT HIGH-CONTRAST LANDING VIEW */}
      {currentView === 'landing' && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '16px', color: '#ffffff' }}>AI Career Intelligence Suite</h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '56px', maxWidth: '600px', margin: '0 auto 56px', lineHeight: '1.6' }}>Optimize your professional footprint with automated grading algorithms and single-page layout generation engines.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', maxWidth: '780px', margin: '0 auto' }}>
            
            {/* CARD 1: ATS SCORE CHECKER */}
            <div 
              onClick={() => setCurrentView('ats')} 
              style={{ ...cardStyle, cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '100%', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="2" width="18" height="20" rx="2" stroke="#38bdf8" strokeWidth="1.5" fill="#0f172a" fillOpacity="0.5"/>
                  <line x1="7" y1="7" x2="13" y2="7" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="7" y1="11" x2="17" y2="11" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="7" y1="15" x2="15" y2="15" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="17" cy="18" r="4" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5"/>
                  <path d="M16 17L17 18L19 16" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 12px 0', color: '#ffffff' }}>ATS Score Checker</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>Scan your application text files against any job posting description instantly to surface gaps.</p>
            </div>

            {/* CARD 2: CUSTOM RESUME MAKER */}
            <div 
              onClick={() => setCurrentView('builder')} 
              style={{ ...cardStyle, cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4ade80'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '100%', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 20H21" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M5 16L9 11L14 13L19 6" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 6H19V10" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="4" y="4" width="5" height="4" rx="1" fill="#4ade80" fillOpacity="0.1" stroke="#4ade80" strokeWidth="1" strokeDasharray="2 2"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 12px 0', color: '#ffffff' }}>Custom Resume Maker</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>Input your milestone histories inside a structurally calibrated, clean canvas structure.</p>
            </div>

          </div>
        </div>
      )}

      {/* 📊 ATS SCANNER VIEW */}
      {currentView === 'ats' && (
        <div>
          <button onClick={() => setCurrentView('landing')} style={{ ...secondaryBtnStyle, marginBottom: '32px', padding: '8px 16px' }}>⬅ Back to Home</button>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px', color: '#ffffff' }}>ATS Score Diagnostics</h2>
          
          <div style={cardStyle}>
            <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={labelStyle}>Upload Document (PDF)</label>
                <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files[0])} style={{ ...inputStyle, padding: '10px' }} />
                {!resumeFile && (
                  <div style={{ marginTop: '16px' }}>
                    <label style={labelStyle}>Or Paste Clear Profile Text</label>
                    <textarea rows="5" style={inputStyle} placeholder="Paste resume plain text parameters here..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Target Job Profile Requirements</label>
                <textarea rows="6" style={inputStyle} placeholder="Paste target requirements details..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} style={primaryBtnStyle}>
                {loading ? 'Executing Core Vector Alignment Check...' : 'Run Diagnostics Matrix'}
              </button>
            </form>
          </div>

          {error && <p style={{ color: '#ef4444', fontWeight: '500', marginTop: '16px' }}>⚠️ {error}</p>}

          {result && (
            <div style={{ ...cardStyle, marginTop: '32px' }}>
              <h3 style={{ margin: '0 0 24px 0', textAlign: 'center', fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Scanner Analytics Profile</h3>
              
              <div style={{ width: '100%', height: 160, display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <ResponsiveContainer width="40%" height="100%">
                  <RadialBarChart cx="50%" cy="80%" innerRadius="85%" outerRadius="115%" barSize={14} data={[{ name: 'Max', value: 100, fill: '#334155' }, { name: 'Score', value: parseFloat(result.ats_score), fill: '#38bdf8' }]} startAngle={180} endAngle={0}>
                    <RadialBar clockWise={true} dataKey="value" cornerRadius={8} />
                    <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '26px', fontWeight: '800', fill: '#ffffff' }}>{result.ats_score}</text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              {result.ai_recommendations && result.ai_recommendations.length > 0 && (
                <div style={{ marginBottom: '24px', padding: '20px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontWeight: '700' }}>🤖 AI Strategic Checklists</h4>
                  <ul style={{ paddingLeft: '20px', margin: '0', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                    {result.ai_recommendations.map((tip, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{tip}</li>)}
                  </ul>
                </div>
              )}

              <h4 style={{ color: '#cbd5e1', margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700' }}>🔍 Targeted Missing Industry Terminology</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.missing_keywords.map((word, idx) => (
                  <span key={idx} style={{ padding: '6px 14px', background: '#0f172a', color: '#94a3b8', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid #334155' }}>{word}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 📝 SLEEK RESUME BUILDER FORM VIEW */}
      {currentView === 'builder' && (
        <div>
          <button onClick={() => setCurrentView('landing')} style={{ ...secondaryBtnStyle, marginBottom: '32px', padding: '8px 16px' }}>⬅ Back to Home</button>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: '#ffffff' }}>Resume Blueprint Configurator</h2>
          <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '14px' }}>Draft standard formatting profiles dynamically optimized for baseline parsers.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Form Box 1 */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>👤 Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label style={labelStyle}>Full Name</label><input type="text" name="fullName" style={inputStyle} placeholder="John Doe" onChange={handlePersonalChange} /></div>
                <div><label style={labelStyle}>Email Address</label><input type="email" name="email" style={inputStyle} placeholder="john@example.com" onChange={handlePersonalChange} /></div>
                <div><label style={labelStyle}>Phone Number</label><input type="text" name="phone" style={inputStyle} placeholder="+91 9999999999" onChange={handlePersonalChange} /></div>
                <div><label style={labelStyle}>Location</label><input type="text" name="location" style={inputStyle} placeholder="Bengaluru, India" onChange={handlePersonalChange} /></div>
                <div><label style={labelStyle}>LinkedIn URL</label><input type="text" name="linkedin" style={inputStyle} placeholder="linkedin.com/in/username" onChange={handlePersonalChange} /></div>
                <div><label style={labelStyle}>GitHub URL</label><input type="text" name="github" style={inputStyle} placeholder="github.com/username" onChange={handlePersonalChange} /></div>
              </div>
            </div>

            {/* Form Box 2 */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>🛠 Technical Skills Matrix</h3>
              <label style={labelStyle}>Core Frameworks & Tools (Comma Separated)</label>
              <input type="text" placeholder="Python, React, Docker, AWS Cloud, SQL, Git..." value={skills} onChange={(e) => setSkills(e.target.value)} style={inputStyle} />
            </div>

            {/* Form Box 3 */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>💼 Professional Track Records</h3>
              {experiences.map((exp, index) => (
                <div key={index} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: index !== experiences.length - 1 ? '1px solid #334155' : 'none' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                    <div><label style={labelStyle}>Company Target</label><input type="text" placeholder="e.g. Google" value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Designated Role</label><input type="text" placeholder="e.g. Software Engineer" value={exp.role} onChange={(e) => updateExperience(index, 'role', e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Duration Framework</label><input type="text" placeholder="e.g. 2024 - Present" value={exp.dates} onChange={(e) => updateExperience(index, 'dates', e.target.value)} style={inputStyle} /></div>
                  </div>
                  <label style={labelStyle}>Core Achievement Logs (One per line)</label>
                  <textarea rows="3" placeholder="- Developed streaming pipelines lowering network overhead parameters by 15%&#10;- Led multi-team releases ensuring sprint timeline compliance factors" value={exp.bulletPoints} onChange={(e) => updateExperience(index, 'bulletPoints', e.target.value)} style={inputStyle} />
                </div>
              ))}
              <button onClick={addExperience} style={secondaryBtnStyle}>➕ Add Workplace Entry</button>
            </div>

            {/* Form Box 4 */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>🚀 Engineering Projects</h3>
              {projects.map((proj, index) => (
                <div key={index} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: index !== projects.length - 1 ? '1px solid #334155' : 'none' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                    <div><label style={labelStyle}>Project Designation</label><input type="text" placeholder="e.g. E-Commerce Engine" value={proj.name} onChange={(e) => updateProject(index, 'name', e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Technologies Used</label><input type="text" placeholder="e.g. Redis, NextJS, Node" value={proj.techStack} onChange={(e) => updateProject(index, 'techStack', e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Timeline (Optional)</label><input type="text" placeholder="e.g. Summer 2026" value={proj.timeline} onChange={(e) => updateProject(index, 'timeline', e.target.value)} style={inputStyle} /></div>
                  </div>
                  <label style={labelStyle}>Operational Descriptions (One per line)</label>
                  <textarea rows="3" placeholder="- Formulated custom caching algorithms dropping latency averages to 40ms" value={proj.description} onChange={(e) => updateProject(index, 'description', e.target.value)} style={inputStyle} />
                </div>
              ))}
              <button onClick={addProject} style={secondaryBtnStyle}>➕ Add Project Entry</button>
            </div>

            {/* Form Box 5 */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>🎓 Academic Credentials</h3>
              {education.map((edu, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={labelStyle}>Institution Name</label><input type="text" placeholder="e.g. IIT Madras" value={edu.school} onChange={(e) => updateEducation(index, 'school', e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Degree Target</label><input type="text" placeholder="e.g. B.Tech Computer Science" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Graduation Timeline</label><input type="text" placeholder="e.g. 2022 - 2026" value={edu.dates} onChange={(e) => updateEducation(index, 'dates', e.target.value)} style={inputStyle} /></div>
                </div>
              ))}
              <button onClick={addEducation} style={{ ...secondaryBtnStyle, marginTop: '8px' }}>➕ Add Academic Qualification</button>
            </div>

            {/* Direct Action Trigger */}
            <button onClick={generatePDF} style={{ ...primaryBtnStyle, background: '#22c55e', color: '#0f172a', padding: '16px', fontSize: '16px' }}>
              📥 Compile & Build PDF Artifact
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;