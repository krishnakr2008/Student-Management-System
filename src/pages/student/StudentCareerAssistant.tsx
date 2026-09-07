import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ALL_SKILLS, matchCareerTrack, calculateCareerReadinessScore } from '../../services/careerEngine';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  TrendingUp,
  CheckSquare,
} from 'lucide-react';

export const StudentCareerAssistant: React.FC = () => {
  const { student } = useAuth();
  const { showToast } = useToast();

  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Tailwind CSS', 'Git', 'SQL'
  ]);
  const [completedRoadmap, setCompletedRoadmap] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true });
  const [projectStatuses, setProjectStatuses] = useState<Record<string, string>>({});
  const [completedInterview, setCompletedInterview] = useState<Record<string, boolean>>({});
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const recommendation = matchCareerTrack(selectedSkills);
  const readiness = calculateCareerReadinessScore(
    selectedSkills.length,
    Object.values(projectStatuses).filter(s => s === 'Completed').length + 1,
    2,
    true,
    88,
    8.95
  );

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
      showToast('Skill Added', `Added ${skill} to your profile skills.`, 'info');
    }
  };

  const toggleRoadmapPhase = (phaseNum: number) => {
    setCompletedRoadmap(prev => ({
      ...prev,
      [phaseNum]: !prev[phaseNum],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-brand-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Rule-Based AI Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">AI Career Assistant 🤖</h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Intelligent career path matching, missing skill gap analysis, step-by-step 10-phase roadmaps, project recommendations, and interview prep.
          </p>
        </div>

        <div className="p-6 bg-slate-900/80 border border-brand-500/40 rounded-2xl text-center shrink-0 w-full md:w-56 space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-400">Target Match Score</span>
          <div className="text-4xl font-black text-amber-400">{recommendation.match_percentage}%</div>
          <p className="text-xs font-bold text-brand-300 truncate">{recommendation.role}</p>
        </div>
      </div>

      {/* Skills Selector Module */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Select Your Known Technologies & Skills</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click skills to dynamically re-calculate career recommendations</p>
          </div>
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
            {selectedSkills.length} Selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_SKILLS.map(skill => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {isSelected ? `✓ ${skill}` : `+ ${skill}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Career Analysis & Missing Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Matched Role: {recommendation.role}
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{recommendation.description}</p>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Matched Skills ({recommendation.matched_skills.length}):</span>
            <div className="flex flex-wrap gap-1.5">
              {recommendation.matched_skills.map(s => (
                <Badge key={s} variant="safe">{s}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
              Missing Skills Gap Analysis
            </h3>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            Acquire these missing target skills to reach a 100% career match score:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {recommendation.missing_skills.length > 0 ? (
              recommendation.missing_skills.map(s => (
                <Badge key={s} variant="warning">Missing: {s}</Badge>
              ))
            ) : (
              <Badge variant="safe">No missing skills detected! 100% Match!</Badge>
            )}
          </div>
        </div>
      </div>

      {/* 10-Phase Learning Roadmap */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-500" />
              <span>10-Phase Interactive Learning Roadmap ({recommendation.role})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Check off milestones as you complete each phase</p>
          </div>
        </div>

        <div className="space-y-3">
          {recommendation.roadmap_phases.map(phase => {
            const isDone = !!completedRoadmap[phase.phase];
            return (
              <div
                key={phase.phase}
                className={`p-4 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleRoadmapPhase(phase.phase)}
                      className={`mt-0.5 p-1 rounded-md transition-colors ${
                        isDone ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>

                    <div>
                      <h4 className={`text-xs font-bold ${isDone ? 'text-emerald-900 dark:text-emerald-200 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                        Phase {phase.phase}: {phase.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Topics: {phase.topics.join(' • ')}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    Milestone: {phase.milestone}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Projects */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-500" />
          <span>Recommended Career Portfolio Projects</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendation.suggested_projects.map(proj => (
            <div
              key={proj.id}
              className="p-5 border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Badge variant={proj.difficulty === 'Advanced' ? 'critical' : 'info'}>{proj.difficulty}</Badge>
                <select
                  value={projectStatuses[proj.id] || 'Planned'}
                  onChange={e => {
                    setProjectStatuses({ ...projectStatuses, [proj.id]: e.target.value });
                    showToast('Project Status', `Updated project status to ${e.target.value}`, 'success');
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{proj.name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{proj.description}</p>
              </div>

              <div className="pt-2 flex flex-wrap gap-1">
                {proj.technologies.map(t => (
                  <span key={t} className="px-2 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Interview Questions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <span>Technical Interview Preparation Q&A</span>
        </h3>

        <div className="space-y-3">
          {recommendation.interview_questions.map(q => {
            const isExpanded = expandedFaq === q.id;
            return (
              <div
                key={q.id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/40"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : q.id)}
                  className="w-full px-4 py-3 text-left font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{q.difficulty}</Badge>
                    <span>{q.question}</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p className="font-semibold text-brand-600 dark:text-brand-400 mb-1">Answer:</p>
                    {q.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
