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

  // --- Standalone Auditor States ---
  const [auditFile, setAuditFile] = useState(null);
  const [auditText, setAuditText] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);

  // --- Advanced Resume Builder States ---
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '', email: '', phone: '', location: '', github: '', linkedin: ''
  });
  const [skills, setSkills] = useState('');
  const [experiences, setExperiences] = useState([{ company: '', role: '', dates: '', bulletPoints: '' }]);
  const [education, setEducation] = useState([{ school: '', degree: '', dates: '' }]);
  const [projects, setProjects] = useState([{ name: '', description: '', techStack: '', timeline: '' }]);
  
  const [customSectionTitle, setCustomSectionTitle] = useState('');
  const [customSectionContent, setCustomSectionContent] = useState('');
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

  const validateAllFields = () => {
    if (!personalInfo.fullName.trim() || !personalInfo.email.trim() || 
        !personalInfo.phone.trim() || !personalInfo.location.trim() || 
        !personalInfo.github.trim() || !personalInfo.linkedin.trim()) {
      return "Missing Information: Please completely fill out all fields in the 'Personal Information' card.";
    }
    if (!skills.trim()) {
      return "Missing Information: Please list your technical competencies inside the Skills Matrix input.";
    }
    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];
      const hasAnyValue = exp.company.trim() || exp.role.trim() || exp.dates.trim() || exp.bulletPoints.trim();
      if (hasAnyValue) {
        if (!exp.company.trim() || !exp.role.trim() || !exp.dates.trim() || !exp.bulletPoints.trim()) {
          return `Incomplete Workplace Entry: Card #${i + 1} has empty slots.`;
        }
      }
    }
    for (let i = 0; i < projects.length; i++) {
      const proj = projects[i];
      if (!proj.name.trim() || !proj.techStack.trim() || !proj.timeline.trim() || !proj.description.trim()) {
        return `Missing Information: Project Entry #${i + 1} has empty slots.`;
      }
    }
    for (let i = 0; i < education.length; i++) {
      const edu = education[i];
      if (!edu.school.trim() || !edu.degree.trim() || !edu.dates.trim()) {
        return `Missing Information: Education Qualification Card #${i + 1} requires absolute completion.`;
      }
    }
    if (customSectionContent.trim() && !customSectionTitle.trim()) {
      return "Missing Section Title: You added bullet points to your custom section but forgot to write a Title header!";
    }
    return null;
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

  // --- Run Standalone Compliance Audit ---
  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (auditLoading) return;
    setAuditLoading(true);
    setError('');
    setAuditResult(null);

    const formDataPayload = new FormData();
    if (auditFile) {
      formDataPayload.append('resume_file', auditFile);
    } else {
      formDataPayload.append('resume', auditText);
    }

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';
      const response = await fetch(`${backendUrl}/api/audit-standalone`, { method: 'POST', body: formDataPayload });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Audit failure occurred.');
      setAuditResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAuditLoading(false);
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
    if (loading) return;
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
      const backendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';
      const response = await fetch(`${backendUrl}/api/analyze`, { method: 'POST', body: formDataPayload });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Base Style Configurations (Non-layout specific properties kept intact)
  const cardStyle = { background: '#1e293b', padding: '32px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '24px' };
  const inputStyle = { padding: '12px 16px', borderRadius: '8px', border: '1px solid #475569', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none', background: '#0f172a', color: '#ffffff', marginBottom: '12px' };
  const primaryBtnStyle = { padding: '12px 24px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', width: '100%' };
  const labelStyle = { display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '6px', color: '#cbd5e1' };
  const secondaryBtnStyle = { padding: '12px 24px', background: '#1e293b', color: '#ffffff', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };
  const backBtnStyle = { padding: '10px 20px', background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' };

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 my-10 font-sans text-slate-50">
      
      {/* 🚀 LANDING VIEW */}
      {currentView === 'landing' && (
        <div className="text-center py-10 px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">AI Career Intelligence Suite</h1>
          <p className="text-slate-400 text-sm md:text-base mb-12 max-w-[600px] mx-auto shelf-height leading-relaxed">Optimize your professional footprint with layout engines and structural compliance scoring metrics.</p>
          
          {/* Responsive Layout Columns: Stack on mobile, grid row layout on laptops */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1050px] mx-auto">
            
            {/* CARD 1: JD MATCH SCANNER */}
            <div onClick={() => setCurrentView('ats')} style={cardStyle} className="cursor-pointer text-center transition-all duration-300 hover:border-sky-400 hover:-translate-y-1">
              <div className="w-full h-[100px] flex justify-center items-center mb-4">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none"><rect x="3" y="2" width="18" height="20" rx="2" stroke="#38bdf8" strokeWidth="1.5" fill="#0f172a"/><circle cx="17" cy="18" r="4" fill="#38bdf8"/><path d="M16 17L17 18L19 16" stroke="#0f172a" strokeWidth="1.5"/></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">JD Match Target Scanner</h3>
              <p className="text-xs text-slate-400">Grade profile keywords against a designated target job description or role title tracker parameters.</p>
            </div>

            {/* CARD 2: STANDALONE ATS AUDITOR */}
            <div onClick={() => setCurrentView('standalone-audit')} style={cardStyle} className="cursor-pointer text-center transition-all duration-300 hover:border-yellow-500 hover:-translate-y-1">
              <div className="w-full h-[100px] flex justify-center items-center mb-4">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#eab308" strokeWidth="1.5" fill="#0f172a"/><path d="M9 12L11 14L15 10" stroke="#eab308" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Standalone ATS Auditor</h3>
              <p className="text-xs text-slate-400">Audit structural integrity, metric tracking density, layout rules, and font hazard flags without a JD block.</p>
            </div>

            {/* CARD 3: CANVAS BLUEPRINT BUILDER */}
            <div onClick={() => setCurrentView('builder')} style={cardStyle} className="cursor-pointer text-center transition-all duration-300 hover:border-green-400 hover:-translate-y-1">
              <div className="w-full h-[100px] flex justify-center items-center mb-4">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none"><path d="M3 20H21" stroke="#475569" strokeWidth="1.5"/><path d="M5 16L9 11L14 13L19 6" stroke="#4ade80" strokeWidth="2"/></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Custom Resume Maker</h3>
              <p className="text-xs text-slate-400">Input your history entries into a structurally calibrated clean blueprint sheet with dynamic layout previews.</p>
            </div>

          </div>
        </div>
      )}

      {/* 📊 FEATURE CARD 1: JD SCORED SCANNER */}
      {currentView === 'ats' && (
        <div className="w-full max-w-[900px] mx-auto">
          <button onClick={() => setCurrentView('landing')} style={backBtnStyle}>⟨ Back to Dashboard</button>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-white">ATS Score Diagnostics</h2>
          
          <div style={cardStyle}>
            <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>Target Company Name (Optional)</label>
                <input type="text" placeholder="e.g. TATA Elxsi, Adobe, Google" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Upload Resume (PDF)</label>
                  <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files[0])} style={inputStyle} className="pt-2" />
                  {!resumeFile && <textarea rows="4" style={inputStyle} placeholder="Or paste raw resume text..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} />}
                </div>

                <div>
                  <label style={labelStyle}>Upload Job Description (PDF)</label>
                  <input type="file" accept=".pdf" onChange={(e) => setJdFile(e.target.files[0])} style={inputStyle} className="pt-2" />
                  {!jdFile && <textarea rows="4" style={inputStyle} placeholder="Or paste job criteria text..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />}
                </div>
              </div>
              <button type="submit" disabled={loading} style={primaryBtnStyle} className="hover:bg-sky-300 transition-colors disabled:opacity-50">
                {loading ? 'Analyzing Matrix...' : 'Run Diagnostics Matrix'}
              </button>
            </form>
          </div>

          {error && <p className="text-red-500 mt-4">⚠️ {error}</p>}

          {result && (
            <div style={cardStyle} className="mt-8">
              <h3 className="text-center text-xl md:text-2xl font-extrabold mb-6">📊 Advanced ATS Scanner Diagnostics</h3>
              <div className="w-full h-[160px] flex justify-center mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="80%" innerRadius="85%" outerRadius="115%" barSize={14} data={[{ name: 'Max', value: 100, fill: '#334155' }, { name: 'Score', value: parseFloat(result.ats_score), fill: '#38bdf8' }]} startAngle={180} endAngle={0}>
                    <RadialBar clockWise={true} dataKey="value" cornerRadius={8} />
                    <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '28px', fontParagraph: '800', fill: '#ffffff' }}>{result.ats_score}%</text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="mb-6 padding p-5 bg-slate-900 rounded-xl border border-slate-700">
                <h4 className="mb-3 text-sky-400 font-bold">💡 AI Actionable Project Blueprints</h4>
                <ul className="list-disc pl-5 text-slate-300 text-sm leading-relaxed space-y-2">
                  {result.recommended_skills?.map((tip, idx) => <li key={idx}>{tip}</li>)}
                </ul>
              </div>
              <div className="mb-6 padding p-5 bg-slate-900 rounded-xl border border-slate-700">
                <h4 className="mb-3 text-yellow-500 font-bold">🏢 Targeted Corporate Intelligence Matrix</h4>
                <ul className="list-disc pl-5 text-slate-300 text-sm leading-relaxed space-y-2">
                  {result.company_insights?.map((insight, idx) => <li key={idx}>{insight}</li>)}
                </ul>
              </div>
              <div className="mb-6 padding p-5 bg-slate-900 rounded-xl border border-slate-700">
                <h4 className="mb-3 text-green-400 font-bold">✨ ATS Formatting Blueprint Rules</h4>
                <ul className="list-disc pl-5 text-slate-300 text-sm leading-relaxed space-y-2">
                  {result.formatting_rules?.map((rule, idx) => <li key={idx}>{rule}</li>)}
                </ul>
              </div>
              <h4 className="text-slate-300 mb-3 font-semibold">🔍 Targeted Missing Industry Terminology Badges</h4>
              <div className="flex flex-wrap gap-2">
                {result.missing_keywords?.map((word, idx) => <span key={idx} className="px-[14px] py-[6px] bg-slate-800 text-slate-400 rounded-full text-xs border border-slate-700">{word}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🛡️ FEATURE CARD 2: STANDALONE ATS COMPLIANCE AUDITOR */}
      {currentView === 'standalone-audit' && (
        <div className="w-full max-w-[900px] mx-auto">
          <button 
            onClick={() => { setAuditResult(null); setError(''); setCurrentView('landing'); }} 
            style={backBtnStyle} 
          >
            ⟨ Back to Dashboard
          </button>
          
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-white">Universal ATS Compliance Audit</h2>
          
          <div style={cardStyle}>
            <form onSubmit={handleAuditSubmit} className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>Upload Resume Artifact (PDF)</label>
                <input type="file" accept=".pdf" onChange={(e) => setAuditFile(e.target.files[0])} style={inputStyle} className="pt-2" />
                {!auditFile && <textarea rows="6" style={inputStyle} placeholder="Or paste plain resume text blocks here for compliance auditing..." value={auditText} onChange={(e) => setAuditText(e.target.value)} />}
              </div>
              <button type="submit" disabled={auditLoading} style={{ ...primaryBtnStyle, background: '#eab308', color: '#0f172a' }} className="hover:opacity-90 transition-opacity disabled:opacity-50">
                {auditLoading ? 'Auditing Structural Nodes...' : 'Audit Document Compliance'}
              </button>
            </form>
          </div>

          {error && <p className="text-red-500 mt-4">⚠️ {error}</p>}

          {auditResult && (
            <div style={cardStyle} className="mt-8">
              <h3 className="text-center text-xl md:text-2xl font-extrabold mb-6">🛡️ Structural Compliance Analysis</h3>
              
              <div className="w-full h-[160px] flex justify-center mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="80%" innerRadius="85%" outerRadius="115%" barSize={14} data={[{ name: 'Max', value: 100, fill: '#334155' }, { name: 'Score', value: auditResult.structural_score, fill: '#eab308' }]} startAngle={180} endAngle={0}>
                    <RadialBar clockWise={true} dataKey="value" cornerRadius={8} />
                    <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '28px', fontParagraph: '800', fill: '#ffffff' }}>{auditResult.structural_score}%</text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              <div className="mb-6 p-5 bg-slate-900 rounded-xl border border-yellow-500">
                <h4 className="mb-3 text-yellow-500 font-bold text-sm md:text-base">💡 Local AI Blueprint Diagnostics</h4>
                <ul className="list-disc pl-5 text-slate-300 text-sm leading-relaxed space-y-2">
                  {auditResult.ai_recommendations?.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
              </div>

              <div className="mb-6 p-5 bg-red-950/40 rounded-xl border border-red-800">
                <h4 className="mb-3 text-red-400 font-bold">⚠️ Found Compliance Deficits</h4>
                <ul className="list-disc pl-5 text-red-200 text-sm leading-relaxed space-y-1">
                  {auditResult.critiques?.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>

              <div className="p-5 bg-green-950/40 rounded-xl border border-green-800">
                <h4 className="mb-3 text-green-400 font-bold">✨ Verified Formatting Strengths</h4>
                <ul className="list-disc pl-5 text-green-200 text-sm leading-relaxed space-y-1">
                  {auditResult.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>

            </div>
          )}
        </div>
      )}

      {/* 📝 FEATURE CARD 3: THE STEPPED CANVAS RESUME MAKER */}
      {currentView === 'builder' && (
        <div className="w-full">
          <button onClick={() => { window.scrollTo(0,0); if (isPreviewMode) setIsPreviewMode(false); else setCurrentView('landing'); }} style={backBtnStyle}>
            {isPreviewMode ? '⟨ Return to Form Editor' : '⟨ Back to Dashboard'}
          </button>

          {validationError && <div className="p-4 bg-red-500 text-white rounded-lg font-semibold mb-6">⚠️ {validationError}</div>}

          {!isPreviewMode ? (
            <div className="flex flex-col gap-6 w-full max-w-[800px] mx-auto">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white m-0">Resume Blueprint Configurator</h2>
              
              <div style={cardStyle}>
                <h3 className="m-0 mb-5 text-lg font-bold">👤 Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label style={labelStyle}>Full Name</label><input type="text" name="fullName" value={personalInfo.fullName} style={inputStyle} placeholder="John Doe" onChange={handlePersonalChange} /></div>
                  <div><label style={labelStyle}>Email Address</label><input type="email" name="email" value={personalInfo.email} style={inputStyle} placeholder="john@example.com" onChange={handlePersonalChange} /></div>
                  <div><label style={labelStyle}>Phone Number</label><input type="text" name="phone" value={personalInfo.phone} style={inputStyle} placeholder="+91 9999999999" onChange={handlePersonalChange} /></div>
                  <div><label style={labelStyle}>Location</label><input type="text" name="location" value={personalInfo.location} style={inputStyle} placeholder="Bengaluru, India" onChange={handlePersonalChange} /></div>
                  <div><label style={labelStyle}>LinkedIn URL</label><input type="text" name="linkedin" value={personalInfo.linkedin} style={inputStyle} placeholder="linkedin.com/in/username" onChange={handlePersonalChange} /></div>
                  <div><label style={labelStyle}>GitHub URL</label><input type="text" name="github" value={personalInfo.github} style={inputStyle} placeholder="github.com/username" onChange={handlePersonalChange} /></div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 className="m-0 mb-4 text-lg font-bold">🛠 Technical Skills Matrix</h3>
                <input type="text" placeholder="Python, React, Docker..." value={skills} onChange={(e) => setSkills(e.target.value)} style={inputStyle} />
              </div>

              <div style={cardStyle}>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="m-0 text-lg font-bold">💼 Professional Track Records</h3>
                  <span className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full">Optional Section</span>
                </div>
                {experiences.map((exp, index) => (
                  <div key={index} className={`mb-6 pb-6 ${index !== experiences.length - 1 ? 'border-b border-slate-700' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div><input type="text" placeholder="Company" value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} style={inputStyle} /></div>
                      <div><input type="text" placeholder="Role" value={exp.role} onChange={(e) => updateExperience(index, 'role', e.target.value)} style={inputStyle} /></div>
                      <div><input type="text" placeholder="Dates" value={exp.dates} onChange={(e) => updateExperience(index, 'dates', e.target.value)} style={inputStyle} /></div>
                    </div>
                    <textarea rows="3" placeholder="- Developed streaming pipelines..." value={exp.bulletPoints} onChange={(e) => updateExperience(index, 'bulletPoints', e.target.value)} style={inputStyle} />
                  </div>
                ))}
                <button onClick={addExperience} style={secondaryBtnStyle}>➕ Add Workplace Entry</button>
              </div>

              <div style={cardStyle}>
                <h3 className="m-0 mb-5 text-lg font-bold">🚀 Engineering Projects</h3>
                {projects.map((proj, index) => (
                  <div key={index} className={`mb-6 pb-6 ${index !== projects.length - 1 ? 'border-b border-slate-700' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div><input type="text" placeholder="Project Title" value={proj.name} onChange={(e) => updateProject(index, 'name', e.target.value)} style={inputStyle} /></div>
                      <div><input type="text" placeholder="Tech Stack" value={proj.techStack} onChange={(e) => updateProject(index, 'techStack', e.target.value)} style={inputStyle} /></div>
                      <div><input type="text" placeholder="Timeline" value={proj.timeline} onChange={(e) => updateProject(index, 'timeline', e.target.value)} style={inputStyle} /></div>
                    </div>
                    <textarea rows="3" placeholder="- Formulated custom caching algorithms..." value={proj.description} onChange={(e) => updateProject(index, 'description', e.target.value)} style={inputStyle} />
                  </div>
                ))}
                <button onClick={addProject} style={secondaryBtnStyle}>➕ Add Project Entry</button>
              </div>

              <div style={cardStyle}>
                <h3 className="m-0 mb-5 text-lg font-bold">🎓 Academic Credentials</h3>
                {education.map((edu, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div><input type="text" placeholder="Institution" value={edu.school} onChange={(e) => updateEducation(index, 'school', e.target.value)} style={inputStyle} /></div>
                    <div><input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} style={inputStyle} /></div>
                    <div><input type="text" placeholder="Graduation Year" value={edu.dates} onChange={(e) => updateEducation(index, 'dates', e.target.value)} style={inputStyle} /></div>
                  </div>
                ))}
                <button onClick={addEducation} style={secondaryBtnStyle} className="mt-2">➕ Add Academic Qualification</button>
              </div>

              <div style={cardStyle}>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="m-0 text-lg font-bold">✨ Custom Section Builder</h3>
                  <span className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full">Optional Section</span>
                </div>
                <input type="text" placeholder="e.g., Certifications, Key Achievements" value={customSectionTitle} onChange={(e) => setCustomSectionTitle(e.target.value)} style={inputStyle} />
                <textarea rows="4" placeholder="- Certified Azure Cloud Practitioner (2026)" value={customSectionContent} onChange={(e) => setCustomSectionContent(e.target.value)} style={inputStyle} />
              </div>

              <button onClick={handleProceedToPreview} style={{ ...primaryBtnStyle, background: '#4ade80', color: '#0f172a', padding: '16px', fontSize: '16px' }} className="hover:opacity-95 font-bold transition-opacity">
                🔍 Proceed to Layout Preview Document
              </button>
            </div>
          ) : (
            /* PHASE B: SHEET PREVIEW PREPARATION MAP CANVAS */
            <div className="w-full max-w-[800px] mx-auto flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setIsPreviewMode(false)} style={secondaryBtnStyle} className="flex-1">✏️ Return and Edit Fields</button>
                <button onClick={generatePDF} style={{ ...primaryBtnStyle, background: '#22c55e', color: '#0f172a' }} className="flex-1 hover:opacity-90 font-bold transition-opacity">📥 Download Clean PDF Artifact</button>
              </div>

              {/* Document Sheet Area - Forced horizontal scroll wrapper for extremely small viewports to maintain formatting ratio */}
              <div className="w-full overflow-x-auto bg-slate-800 p-2 rounded-xl border border-slate-700">
                <div className="bg-white text-slate-800 rounded-lg p-8 md:p-12 min-h-[750px] font-sans w-[750px] md:w-full mx-auto">
                  <div className="text-center mb-5">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 uppercase tracking-wide">{personalInfo.fullName}</div>
                    <div className="text-[10px] text-slate-600 mt-1.5 break-words">{[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join('   |   ')}</div>
                    <div className="text-[9px] text-slate-500 mt-1 break-words">{[personalInfo.linkedin, personalInfo.github].filter(Boolean).join('   •   ')}</div>
                  </div>

                  <div className="mb-4">
                    <div className="text-[11px] font-bold border-b border-slate-300 pb-0.5 text-slate-900 uppercase tracking-wider">Technical Skills</div>
                    <div className="text-[10px] mt-1.5 text-slate-700"><strong>Core Frameworks & Tools:</strong> {skills}</div>
                  </div>

                  {experiences.some(exp => exp.company.trim() && exp.role.trim()) && (
                    <div className="mb-4">
                      <div className="text-[11px] font-bold border-b border-slate-300 pb-0.5 text-slate-900 uppercase tracking-wider">Professional Experience</div>
                      {experiences.map((exp, i) => (exp.company.trim() || exp.role.trim()) && (
                        <div key={i} className="mt-2">
                          <div className="flex text-[10.5px] font-bold"><span>{exp.role}</span><span className="font-normal ml-auto text-[9.5px] text-slate-600">{exp.company} | {exp.dates}</span></div>
                          <div className="text-[9.5px] mt-1 text-slate-600 white-space-pre-line pl-2">{exp.bulletPoints.split('\n').map(line => line.trim() ? `• ${line.replace(/^-\s*/, '')}` : '').filter(Boolean).join('\n')}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="text-[11px] font-bold border-b border-slate-300 pb-0.5 text-slate-900 uppercase tracking-wider">Engineering Projects</div>
                    {projects.map((proj, i) => (
                      <div key={i} className="mt-2">
                        <div className="flex text-[10.5px] font-bold"><span>{proj.name}</span><span className="font-normal ml-auto text-[9.5px] text-slate-600">{proj.timeline}</span></div>
                        <div className="text-[9px] italic text-slate-500">Tech Stack: {proj.techStack}</div>
                        <div className="text-[9.5px] mt-1 text-slate-600 white-space-pre-line pl-2">{proj.description.split('\n').map(line => line.trim() ? `• ${line.replace(/^-\s*/, '')}` : '').filter(Boolean).join('\n')}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <div className="text-[11px] font-bold border-b border-slate-300 pb-0.5 text-slate-900 uppercase tracking-wider">Education</div>
                    {education.map((edu, i) => (
                      <div key={i} className="flex text-[10.5px] mt-1.5"><strong>{edu.degree}</strong><span className="ml-auto text-[9.5px] text-slate-600">{edu.school} | {edu.dates}</span></div>
                    ))}
                  </div>

                  {customSectionTitle.trim() && customSectionContent.trim() && (
                    <div>
                      <div className="text-[11px] font-bold border-b border-slate-300 pb-0.5 text-slate-900 uppercase tracking-wider">{customSectionTitle}</div>
                      <div className="text-[9.5px] mt-1.5 text-slate-600 white-space-pre-line pl-2">{customSectionContent.split('\n').map(line => line.trim() ? `• ${line.replace(/^-\s*/, '')}` : '').filter(Boolean).join('\n')}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;