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
  const [jdFile, setJdFile] = useState(null); 
  const [companyName, setCompanyName] = useState(''); 
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
  
  // NEW: Dynamic Custom Section States (Optional Section Builder)
  const [customSectionTitle, setCustomSectionTitle] = useState('');
  const [customSectionContent, setCustomSectionContent] = useState('');

  // UI Flow Control States
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [validationError, setValidationError] = useState('');

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

  // --- Comprehensive Validation Engine ---
  const validateAllFields = () => {
    // 1. Check basic header info (Mandatory)
    if (!personalInfo.fullName.trim() || !personalInfo.email.trim() || 
        !personalInfo.phone.trim() || !personalInfo.location.trim() || 
        !personalInfo.github.trim() || !personalInfo.linkedin.trim()) {
      return "Missing Information: Please completely fill out all fields in the 'Personal Information' card.";
    }

    // 2. Check technical stack matrix input (Mandatory)
    if (!skills.trim()) {
      return "Missing Information: Please list your technical competencies inside the Skills Matrix input.";
    }

    // 3. Validate workplace items ONLY if the user filled something out (Now completely non-mandatory)
    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];
      const hasAnyValue = exp.company.trim() || exp.role.trim() || exp.dates.trim() || exp.bulletPoints.trim();
      
      if (hasAnyValue) {
        if (!exp.company.trim() || !exp.role.trim() || !exp.dates.trim() || !exp.bulletPoints.trim()) {
          return `Incomplete Workplace Entry: Card #${i + 1} has empty slots. Fill out Company, Role, Dates, and Achievement Bullet Logs completely, or leave the card entirely blank.`;
        }
      }
    }

    // 4. Validate engineering project card blocks (Mandatory)
    for (let i = 0; i < projects.length; i++) {
      const proj = projects[i];
      if (!proj.name.trim() || !proj.techStack.trim() || !proj.timeline.trim() || !proj.description.trim()) {
        return `Missing Information: Project Entry #${i + 1} has empty slots. Fill out Title, Tech Stack, Timeline, and Descriptions completely.`;
      }
    }

    // 5. Validate academic tracking rows (Mandatory)
    for (let i = 0; i < education.length; i++) {
      const edu = education[i];
      if (!edu.school.trim() || !edu.degree.trim() || !edu.dates.trim()) {
        return `Missing Information: Education Qualification Card #${i + 1} requires absolute completion (Institution, Degree, and Timeline fields).`;
      }
    }

    // 6. Dynamic Custom Section (Optional): If content is written, make sure header is present
    if (customSectionContent.trim() && !customSectionTitle.trim()) {
      return "Missing Section Title: You added bullet points to your custom section but forgot to write a Title header!";
    }

    return null; // Passes verification checks perfectly
  };

  const handleProceedToPreview = () => {
    const fieldError = validateAllFields();
    if (fieldError) {
      setValidationError(fieldError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setValidationError('');
      setIsPreviewMode(true);
    }
  };

  // --- ATS-Compliant PDF Compiler Engine ---
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
    doc.text(personalInfo.fullName, 4.25, y, { align: 'center' });
    
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

    // Mapped safely only if at least one operational workplace string exists
    const validExperiences = experiences.filter(exp => exp.company.trim() && exp.role.trim());
    if (validExperiences.length > 0) {
      addSectionHeader('Professional Experience');
      validExperiences.forEach((exp) => {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(45, 55, 72);
        doc.text(exp.role, margin, y);
        
        doc.setFont('Helvetica', 'normal');
        doc.text(`${exp.company}  |  ${exp.dates}`, 8.5 - margin, y, { align: 'right' });
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

    if (projects.length > 0) {
      addSectionHeader('Projects');
      projects.forEach((proj) => {
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

    if (education.length > 0) {
      addSectionHeader('Education');
      education.forEach((edu) => {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(edu.degree, margin, y);
        doc.setFont('Helvetica', 'normal');
        doc.text(`${edu.school}  |  ${edu.dates}`, 8.5 - margin, y, { align: 'right' });
        y += 0.22;
      });
    }

    // Dynamic Custom Area rendering in PDF output
    if (customSectionTitle.trim() && customSectionContent.trim()) {
      addSectionHeader(customSectionTitle);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(45, 55, 72);

      const lines = customSectionContent.split('\n');
      lines.forEach((line) => {
        if (!line.trim()) return;
        const cleanLine = line.startsWith('-') ? line.substring(1).trim() : line.trim();
        const splitLine = doc.splitTextToSize(`•  ${cleanLine}`, 6.8);
        doc.text(splitLine, margin + 0.15, y);
        y += splitLine.length * 0.18;
      });
    }

    const fileName = `${personalInfo.fullName.replace(/\s+/g, '_')}_Built_Resume.pdf`;
    doc.save(fileName);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const formDataPayload = new FormData();
    formDataPayload.append('company_name', companyName);
    
    if (resumeFile) {
      formDataPayload.append('resume_file', resumeFile);
    } else {
      formDataPayload.append('resume', resumeText);
    }

    if (jdFile) {
      formDataPayload.append('jd_file', jdFile);
    } else {
      formDataPayload.append('job_description', jobDescription);
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

  // Styles Setup
  const containerStyle = { maxWidth: '1000px', margin: '40px auto', padding: '0 24px', fontFamily: '"Inter", -apple-system, sans-serif', color: '#f8fafc' };
  const cardStyle = { background: '#1e293b', padding: '32px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '4px' };
  const inputStyle = { padding: '12px 16px', borderRadius: '8px', border: '1px solid #475569', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s', background: '#0f172a', color: '#ffffff', marginBottom: '12px' };
  const primaryBtnStyle = { padding: '12px 24px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'background 0.2s' };
  const labelStyle = { display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '6px', color: '#cbd5e1' };
  
  const backBtnStyle = { 
    padding: '10px 20px', 
    background: '#1e293b', 
    color: '#38bdf8', 
    border: '1px solid #334155', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '600', 
    fontSize: '14px',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '32px'
  };

  const secondaryBtnStyle = { padding: '12px 24px', background: '#1e293b', color: '#ffffff', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };

  return (
    <div style={containerStyle}>
      
      {/* 🚀 LANDING VIEW */}
      {currentView === 'landing' && (
        <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '16px', color: '#ffffff' }}>AI Career Intelligence Suite</h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '56px', maxWidth: '600px', margin: '0 auto 56px', lineHeight: '1.6' }}>Optimize your professional footprint with automated grading algorithms and single-page layout generation engines.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', maxWidth: '780px', margin: '0 auto' }}>
            <div onClick={() => setCurrentView('ats')} style={{ ...cardStyle, cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ width: '100%', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="2" width="18" height="20" rx="2" stroke="#38bdf8" strokeWidth="1.5" fill="#0f172a" fillOpacity="0.5"/>
                  <line x1="7" y1="7" x2="13" y2="7" stroke="#38bdf8" strokeWidth="2"/>
                  <circle cx="17" cy="18" r="4" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5"/>
                  <path d="M16 17L17 18L19 16" stroke="#0f172a" strokeWidth="1.5"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>ATS Score Checker</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Scan your application files against any job posting description instantly to surface gaps.</p>
            </div>
            <div onClick={() => setCurrentView('builder')} style={{ ...cardStyle, cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4ade80'; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ width: '100%', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none">
                  <path d="M3 20H21" stroke="#475569" strokeWidth="1.5"/>
                  <path d="M5 16L9 11L14 13L19 6" stroke="#4ade80" strokeWidth="2"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Custom Resume Maker</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Input your milestone histories inside a structurally calibrated, clean canvas structure.</p>
            </div>
          </div>
        </div>
      )}

      {/* 📊 ATS SCANNER VIEW */}
      {currentView === 'ats' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button 
            onClick={() => setCurrentView('landing')} 
            style={backBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.background = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.background = '#1e293b'; }}
          >
            ⟨ Back to Dashboard
          </button>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px', color: '#ffffff' }}>ATS Score Diagnostics</h2>
          
          <div style={cardStyle}>
            <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Target Company Name (Optional)</label>
                <input type="text" placeholder="e.g. TATA Elxsi, Adobe, Google" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={labelStyle}>Upload Resume (PDF)</label>
                  <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files[0])} style={{ ...inputStyle, padding: '10px' }} />
                  {!resumeFile && <textarea rows="4" style={inputStyle} placeholder="Or paste raw resume text content..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} />}
                </div>

                <div>
                  <label style={labelStyle}>Upload Job Description (PDF)</label>
                  <input type="file" accept=".pdf" onChange={(e) => setJdFile(e.target.files[0])} style={{ ...inputStyle, padding: '10px' }} />
                  {!jdFile && <textarea rows="4" style={inputStyle} placeholder="Or paste job criteria text / title..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />}
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, marginTop: '12px' }}>
                {loading ? 'Analyzing Alignment Metrics...' : 'Run Diagnostics Matrix'}
              </button>
            </form>
          </div>

          {error && <p style={{ color: '#ef4444', fontWeight: '500', marginTop: '16px' }}>⚠️ {error}</p>}

          {result && (
            <div style={{ ...cardStyle, marginTop: '32px' }}>
              <h3 style={{ margin: '0 0 24px 0', textAlign: 'center', fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>📊 Advanced ATS Scanner Diagnostics</h3>
              
              <div style={{ width: '100%', height: 160, display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <ResponsiveContainer width="40%" height="100%">
                  <RadialBarChart cx="50%" cy="80%" innerRadius="85%" outerRadius="115%" barSize={14} data={[{ name: 'Max', value: 100, fill: '#334155' }, { name: 'Score', value: parseFloat(result.ats_score), fill: '#38bdf8' }]} startAngle={180} endAngle={0}>
                    <RadialBar clockWise={true} dataKey="value" cornerRadius={8} />
                    <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '28px', fontWeight: '800', fill: '#ffffff' }}>{result.ats_score}%</text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ marginBottom: '24px', padding: '20px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontWeight: '700', fontSize: '15px' }}>💡 AI Actionable Project Blueprints</h4>
                <ul style={{ paddingLeft: '20px', margin: '0', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7' }}>
                  {result.recommended_skills?.map((tip, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{tip}</li>)}
                </ul>
              </div>

              <div style={{ marginBottom: '24px', padding: '20px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#eab308', fontWeight: '700', fontSize: '15px' }}>🏢 Targeted Corporate Intelligence Matrix</h4>
                <ul style={{ paddingLeft: '20px', margin: '0', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7' }}>
                  {result.company_insights?.map((insight, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{insight}</li>)}
                </ul>
              </div>

              <div style={{ marginBottom: '24px', padding: '20px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#4ade80', fontWeight: '700', fontSize: '15px' }}>✨ ATS Formatting Blueprint Rules</h4>
                <ul style={{ paddingLeft: '20px', margin: '0', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7' }}>
                  {result.formatting_rules?.map((rule, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{rule}</li>)}
                </ul>
              </div>

              <h4 style={{ color: '#cbd5e1', margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700' }}>🔍 Targeted Missing Industry Terminology Badges</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.missing_keywords?.map((word, idx) => (
                  <span key={idx} style={{ padding: '6px 14px', background: '#1e293b', color: '#94a3b8', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid #334155 1px solid #334155' }}>{word}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 📝 RESUME BUILDER PANEL */}
      {currentView === 'builder' && (
        <div>
          <button 
            onClick={() => {
              if (isPreviewMode) {
                setIsPreviewMode(false);
              } else {
                setCurrentView('landing');
              }
            }} 
            style={backBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.background = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.background = '#1e293b'; }}
          >
            {isPreviewMode ? '⟨ Return to Form Editor' : '⟨ Back to Dashboard'}
          </button>

          {validationError && (
            <div style={{ padding: '16px', background: '#ef4444', color: '#ffffff', borderRadius: '8px', fontWeight: '600', fontSize: '14px', marginBottom: '24px', border: '1px solid #b91c1c' }}>
              ⚠️ {validationError}
            </div>
          )}

          {!isPreviewMode ? (
            /* PHASE A: FORM INPUT SYSTEM */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: 0 }}>Resume Blueprint Configurator</h2>
              
              {/* Personal Details */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>👤 Personal Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label style={labelStyle}>Full Name</label><input type="text" name="fullName" value={personalInfo.fullName} style={inputStyle} placeholder="John Doe" onChange={handlePersonalChange} /></div>
                  <div><label style={labelStyle}>Email Address</label><input type="email" name="email" value={personalInfo.email} style={inputStyle} placeholder="john@example.com" onChange={handlePersonalChange} /></div>
                  <div><label style={labelStyle}>Phone Number</label><input type="text" name="phone" value={personalInfo.phone} style={inputStyle} placeholder="+91 9999999999" onChange={handlePersonalChange} /></div>
                  <div><label style={labelStyle}>Location</label><input type="text" name="location" value={personalInfo.location} style={inputStyle} placeholder="Bengaluru, India" onChange={handlePersonalChange} /></div>
                  <div><label style={labelStyle}>LinkedIn URL</label><input type="text" name="linkedin" value={personalInfo.linkedin} style={inputStyle} placeholder="linkedin.com/in/username" onChange={handlePersonalChange} /></div>
                  <div><label style={labelStyle}>GitHub URL</label><input type="text" name="github" value={personalInfo.github} style={inputStyle} placeholder="github.com/username" onChange={handlePersonalChange} /></div>
                </div>
              </div>

              {/* Skills Matrix */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>🛠 Technical Skills Matrix</h3>
                <label style={labelStyle}>Core Frameworks & Tools (Comma Separated)</label>
                <input type="text" placeholder="Python, React, Docker..." value={skills} onChange={(e) => setSkills(e.target.value)} style={inputStyle} />
              </div>

              {/* Work Experience (FULLY OPTIONAL / NON-MANDATORY) */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>💼 Professional Track Records</h3>
                  <span style={{ fontSize: '12px', color: '#94a3b8', background: '#334155', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>Optional Section</span>
                </div>
                {experiences.map((exp, index) => (
                  <div key={index} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: index !== experiences.length - 1 ? '1px solid #334155' : 'none' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                      <div><label style={labelStyle}>Company Target</label><input type="text" placeholder="e.g. Google" value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Designated Role</label><input type="text" placeholder="e.g. Software Engineer" value={exp.role} onChange={(e) => updateExperience(index, 'role', e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Duration Framework</label><input type="text" placeholder="e.g. 2024 - Present" value={exp.dates} onChange={(e) => updateExperience(index, 'dates', e.target.value)} style={inputStyle} /></div>
                    </div>
                    <label style={labelStyle}>Core Achievement Logs (One per line)</label>
                    <textarea rows="3" placeholder="- Developed streaming pipelines..." value={exp.bulletPoints} onChange={(e) => updateExperience(index, 'bulletPoints', e.target.value)} style={inputStyle} />
                  </div>
                ))}
                <button onClick={addExperience} style={secondaryBtnStyle}>➕ Add Workplace Entry</button>
              </div>

              {/* Projects Card */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>🚀 Engineering Projects</h3>
                {projects.map((proj, index) => (
                  <div key={index} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: index !== projects.length - 1 ? '1px solid #334155' : 'none' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                      <div><label style={labelStyle}>Project Designation</label><input type="text" placeholder="e.g. E-Commerce Engine" value={proj.name} onChange={(e) => updateProject(index, 'name', e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Technologies Used</label><input type="text" placeholder="e.g. Redis, NextJS" value={proj.techStack} onChange={(e) => updateProject(index, 'techStack', e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Timeline (Optional)</label><input type="text" placeholder="e.g. Summer 2026" value={proj.timeline} onChange={(e) => updateProject(index, 'timeline', e.target.value)} style={inputStyle} /></div>
                    </div>
                    <label style={labelStyle}>Operational Descriptions (One per line)</label>
                    <textarea rows="3" placeholder="- Formulated custom caching algorithms..." value={proj.description} onChange={(e) => updateProject(index, 'description', e.target.value)} style={inputStyle} />
                  </div>
                ))}
                <button onClick={addProject} style={secondaryBtnStyle}>➕ Add Project Entry</button>
              </div>

              {/* Education Card */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>🎓 Academic Credentials</h3>
                {education.map((edu, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div><label style={labelStyle}>Institution Name</label><input type="text" placeholder="e.g. IIT" value={edu.school} onChange={(e) => updateEducation(index, 'school', e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Degree Target</label><input type="text" placeholder="e.g. B.Tech" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Graduation Timeline</label><input type="text" placeholder="e.g. 2022 - 2026" value={edu.dates} onChange={(e) => updateEducation(index, 'dates', e.target.value)} style={inputStyle} /></div>
                  </div>
                ))}
                <button onClick={addEducation} style={{ ...secondaryBtnStyle, marginTop: '8px' }}>➕ Add Academic Qualification</button>
              </div>

              {/* NEW SECTION: EXCLUSIVE CUSTOM USER-DEFINED GRID SECTION (NON-MANDATORY) */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>✨ Custom Section Builder</h3>
                  <span style={{ fontSize: '12px', color: '#94a3b8', background: '#334155', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>Optional Section</span>
                </div>
                <div>
                  <label style={labelStyle}>Section Header / Title</label>
                  <input type="text" placeholder="e.g., Certifications, Key Achievements, Extracurriculars" value={customSectionTitle} onChange={(e) => setCustomSectionTitle(e.target.value)} style={inputStyle} />
                  
                  <label style={labelStyle}>Content Logs (One entry per line)</label>
                  <textarea rows="4" placeholder="- Certified Azure Cloud Practitioner (2026)&#10;- Winner of State Level Coding Olympiad Hackathon" value={customSectionContent} onChange={(e) => setCustomSectionContent(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {/* Trigger Button */}
              <button onClick={handleProceedToPreview} style={{ ...primaryBtnStyle, padding: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                🔍 Proceed to Layout Preview Document
              </button>
            </div>
          ) : (
            /* PHASE B: FULL PAGE REAL-TIME TEMPLATE PREVIEW CANVAS */
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => setIsPreviewMode(false)} style={{ ...secondaryBtnStyle, flex: 1 }}>
                  ✏️ Return and Edit Fields
                </button>
                <button onClick={generatePDF} style={{ ...primaryBtnStyle, background: '#22c55e', color: '#0f172a', flex: 1, fontWeight: '700', boxShadow: '0 4px 14px rgb(34 197 94 / 0.3)' }}>
                  📥 Download Clean PDF Artifact
                </button>
              </div>

              {/* THE WHITE CHRONOLOGICAL PAPER SHEET PREVIEW */}
              <div style={{ background: '#ffffff', color: '#1e293b', borderRadius: '8px', padding: '44px 40px', minHeight: '750px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.3)', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                
                {/* Contact Header Block */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a202c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{personalInfo.fullName}</div>
                  <div style={{ fontSize: '10px', color: '#4a5568', marginTop: '6px', fontWeight: '500' }}>
                    {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join('   |   ')}
                  </div>
                  <div style={{ fontSize: '9px', color: '#718096', marginTop: '4px' }}>
                    {[personalInfo.linkedin, personalInfo.github].filter(Boolean).join('   •   ')}
                  </div>
                </div>

                {/* Technical Competencies Block */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e0', paddingBottom: '2px', color: '#1a202c', textTransform: 'uppercase' }}>Technical Skills</div>
                  <div style={{ fontSize: '10px', marginTop: '6px', color: '#2d3748', lineHeight: '1.5' }}>
                    <strong>Core Frameworks & Stack Tools:</strong> {skills}
                  </div>
                </div>

                {/* Work Track Block (Conditionally Renders Only If Filled Out) */}
                {experiences.some(exp => exp.company.trim() && exp.role.trim()) && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e0', paddingBottom: '2px', color: '#1a202c', textTransform: 'uppercase' }}>Professional Experience</div>
                    {experiences.map((exp, i) => (exp.company.trim() || exp.role.trim()) && (
                      <div key={i} style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', fontSize: '10.5px', fontWeight: 'bold', color: '#2d3748' }}>
                          <span>{exp.role}</span>
                          <span style={{ fontWeight: 'normal', color: '#4a5568', marginLeft: 'auto', fontSize: '9.5px' }}>{exp.company} | {exp.dates}</span>
                        </div>
                        <div style={{ fontSize: '9.5px', marginTop: '4px', color: '#4a5568', whiteSpace: 'pre-line', paddingLeft: '8px', lineHeight: '1.5' }}>
                          {exp.bulletPoints.split('\n').map(line => line.trim() ? `• ${line.replace(/^-\s*/, '')}` : '').filter(Boolean).join('\n')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects Canvas Block */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e0', paddingBottom: '2px', color: '#1a202c', textTransform: 'uppercase' }}>Engineering Projects</div>
                  {projects.map((proj, i) => (
                    <div key={i} style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', fontSize: '10.5px', fontWeight: 'bold', color: '#2d3748' }}>
                        <span>{proj.name}</span>
                        <span style={{ fontWeight: 'normal', color: '#4a5568', marginLeft: 'auto', fontSize: '9.5px' }}>{proj.timeline}</span>
                      </div>
                      <div style={{ fontSize: '9px', fontStyle: 'italic', color: '#718096', marginTop: '2px' }}>Tech Stack: {proj.techStack}</div>
                      <div style={{ fontSize: '9.5px', marginTop: '4px', color: '#4a5568', whiteSpace: 'pre-line', paddingLeft: '8px', lineHeight: '1.5' }}>
                        {proj.description.split('\n').map(line => line.trim() ? `• ${line.replace(/^-\s*/, '')}` : '').filter(Boolean).join('\n')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Academics Canvas Block */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e0', paddingBottom: '2px', color: '#1a202c', textTransform: 'uppercase' }}>Education</div>
                  {education.map((edu, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', fontSize: '10.5px', marginTop: '6px', color: '#2d3748' }}>
                      <span style={{ fontWeight: 'bold' }}>{edu.degree}</span>
                      <span style={{ color: '#4a5568', marginLeft: 'auto', fontSize: '9.5px' }}>{edu.school} | {edu.dates}</span>
                    </div>
                  ))}
                </div>

                {/* DYNAMIC CUSTOM USER SECTION PREVIEW (Conditionally Renders Only If Filled Out) */}
                {customSectionTitle.trim() && customSectionContent.trim() && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e0', paddingBottom: '2px', color: '#1a202c', textTransform: 'uppercase' }}>{customSectionTitle}</div>
                    <div style={{ fontSize: '9.5px', marginTop: '6px', color: '#4a5568', whiteSpace: 'pre-line', paddingLeft: '8px', lineHeight: '1.5' }}>
                      {customSectionContent.split('\n').map(line => line.trim() ? `• ${line.replace(/^-\s*/, '')}` : '').filter(Boolean).join('\n')}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;