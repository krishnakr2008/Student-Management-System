import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { ResumeData } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  FileText,
  Download,
  Printer,
  Plus,
  Trash2,
  Save,
  Sparkles,
  Layout,
  User,
  GraduationCap,
  Briefcase,
  Award,
  Code,
} from 'lucide-react';

export const StudentResumeBuilder: React.FC = () => {
  const { student } = useAuth();
  const { showToast } = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'skills' | 'projects' | 'experience' | 'certs'>('personal');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      const studentId = student?.id || 'std-1';
      const data = await dbService.getStudentResume(studentId);
      setResume(data);
    };
    fetchResume();
  }, [student]);

  const handleSaveResume = async () => {
    if (!resume) return;
    try {
      await dbService.saveStudentResume(resume);
      showToast('Resume Saved', 'Your resume template has been updated.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to save resume.', 'error');
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;
    setIsGeneratingPdf(true);
    showToast('Generating PDF', 'Preparing your high-resolution PDF resume...', 'info');

    try {
      const element = resumeRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${resume?.full_name.replace(/\s+/g, '_')}_Resume.pdf`);

      showToast('PDF Downloaded', 'Your resume PDF has been saved!', 'success');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      showToast('PDF Error', 'Failed to render PDF resume.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!resume) return <div className="p-8"><LoadingSkeleton count={3} type="card" /></div>;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Professional Resume Builder
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build, customize templates, and download a real PDF resume with single-click rendering
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveResume}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Rendering PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Editor & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multi-Step Editor Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Template Selector & Section Tabs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Layout className="w-3.5 h-3.5" /> Template Design
              </span>
              <select
                value={resume.template_id}
                onChange={e => setResume({ ...resume, template_id: e.target.value as any })}
                className="px-3 py-1 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="modern">Modern Tech</option>
                <option value="minimalist">Minimalist Clean</option>
                <option value="academic">Academic Classic</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('personal')}
                className={`py-1.5 rounded-lg transition-all ${activeTab === 'personal' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-500'}`}
              >
                Personal
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`py-1.5 rounded-lg transition-all ${activeTab === 'education' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-500'}`}
              >
                Education
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`py-1.5 rounded-lg transition-all ${activeTab === 'skills' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-500'}`}
              >
                Skills
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-1.5 rounded-lg transition-all ${activeTab === 'projects' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-500'}`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('experience')}
                className={`py-1.5 rounded-lg transition-all ${activeTab === 'experience' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-500'}`}
              >
                Internship
              </button>
              <button
                onClick={() => setActiveTab('certs')}
                className={`py-1.5 rounded-lg transition-all ${activeTab === 'certs' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' : 'text-slate-500'}`}
              >
                Certificates
              </button>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 max-h-[70vh] overflow-y-auto">
            {activeTab === 'personal' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Contact & Summary</h3>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">Full Name</label>
                  <input
                    type="text"
                    value={resume.full_name}
                    onChange={e => setResume({ ...resume, full_name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Email</label>
                    <input
                      type="email"
                      value={resume.email}
                      onChange={e => setResume({ ...resume, email: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Phone</label>
                    <input
                      type="text"
                      value={resume.phone}
                      onChange={e => setResume({ ...resume, phone: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Location</label>
                    <input
                      type="text"
                      value={resume.location}
                      onChange={e => setResume({ ...resume, location: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">GitHub</label>
                    <input
                      type="text"
                      value={resume.github || ''}
                      onChange={e => setResume({ ...resume, github: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">Professional Summary</label>
                  <textarea
                    rows={4}
                    value={resume.summary}
                    onChange={e => setResume({ ...resume, summary: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Education Details</h3>
                {resume.education.map((edu, idx) => (
                  <div key={edu.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <input
                      type="text"
                      placeholder="Degree (B.Tech Computer Science)"
                      value={edu.degree}
                      onChange={e => {
                        const updated = [...resume.education];
                        updated[idx].degree = e.target.value;
                        setResume({ ...resume, education: updated });
                      }}
                      className="w-full px-3 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="University Name"
                      value={edu.university}
                      onChange={e => {
                        const updated = [...resume.education];
                        updated[idx].university = e.target.value;
                        setResume({ ...resume, education: updated });
                      }}
                      className="w-full px-3 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Projects</h3>
                  <button
                    onClick={() => {
                      const newProj = {
                        id: `proj-${Date.now()}`,
                        name: 'New Project Title',
                        description: 'Project description details...',
                        technologies: ['React', 'TypeScript'],
                      };
                      setResume({ ...resume, projects: [...resume.projects, newProj] });
                    }}
                    className="text-xs text-brand-600 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                {resume.projects.map((proj, idx) => (
                  <div key={proj.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={proj.name}
                        onChange={e => {
                          const updated = [...resume.projects];
                          updated[idx].name = e.target.value;
                          setResume({ ...resume, projects: updated });
                        }}
                        className="w-full font-bold px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                      <button
                        onClick={() => {
                          const updated = resume.projects.filter((_, i) => i !== idx);
                          setResume({ ...resume, projects: updated });
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={e => {
                        const updated = [...resume.projects];
                        updated[idx].description = e.target.value;
                        setResume({ ...resume, projects: updated });
                      }}
                      className="w-full px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg resize-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Printable Resume Canvas (7 Cols) */}
        <div className="lg:col-span-7 overflow-x-auto">
          <div
            ref={resumeRef}
            className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-10 shadow-2xl rounded-xl mx-auto space-y-6 font-sans border border-slate-200 text-xs"
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            {/* Resume Header */}
            <div className="border-b-2 border-slate-900 pb-4">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">{resume.full_name}</h1>
              <p className="text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-3 font-medium">
                <span>{resume.email}</span>
                <span>•</span>
                <span>{resume.phone}</span>
                <span>•</span>
                <span>{resume.location}</span>
              </p>
              <div className="mt-1 flex gap-3 text-[10px] text-brand-700 font-semibold">
                {resume.linkedin && <span>LinkedIn: {resume.linkedin}</span>}
                {resume.github && <span>GitHub: {resume.github}</span>}
              </div>
            </div>

            {/* Summary */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-[11px] text-slate-700 leading-relaxed">{resume.summary}</p>
            </div>

            {/* Education */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Education
              </h2>
              {resume.education.map(edu => (
                <div key={edu.id} className="flex justify-between items-start my-1.5">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">{edu.degree}</h3>
                    <p className="text-[11px] text-slate-600">{edu.university}</p>
                  </div>
                  <div className="text-right text-[11px]">
                    <span className="font-bold text-slate-800">{edu.start_year} - {edu.end_year}</span>
                    <p className="text-slate-500 font-semibold">{edu.grade}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Technical Skills */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Technical Skills
              </h2>
              <div className="space-y-1 text-[11px]">
                {resume.skills.map(sk => (
                  <p key={sk.id}>
                    <strong className="text-slate-900">{sk.category}:</strong> {sk.items.join(', ')}
                  </p>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Key Projects
              </h2>
              {resume.projects.map(proj => (
                <div key={proj.id} className="mb-3 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 text-xs">{proj.name}</h3>
                    <span className="text-[10px] text-slate-500 font-medium">{proj.technologies.join(' • ')}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>

            {/* Internships */}
            {resume.internships.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  Internship Experience
                </h2>
                {resume.internships.map(exp => (
                  <div key={exp.id} className="mb-2">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-900 text-xs">{exp.role} — {exp.organization}</h3>
                      <span className="text-[10px] text-slate-500 font-semibold">{exp.duration}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-0.5">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
