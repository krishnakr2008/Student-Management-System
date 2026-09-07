import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Assignment, AssignmentSubmission, Subject } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FileText, Plus, CheckCircle, MessageSquare, Award, Clock } from 'lucide-react';

export const TeacherAssignments: React.FC = () => {
  const { teacher } = useAuth();
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<AssignmentSubmission | null>(null);

  const [newAsgn, setNewAsgn] = useState({
    title: '',
    subject_id: '',
    description: '',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    max_marks: 50,
  });

  const [gradeData, setGradeData] = useState({
    grade: 45,
    remarks: '',
  });

  const loadData = async () => {
    const [asgnData, subData, subjData] = await Promise.all([
      dbService.getAssignments(),
      dbService.getSubmissions(),
      dbService.getSubjects(),
    ]);
    setAssignments(asgnData);
    setSubmissions(subData);
    setSubjects(subjData);
    if (subjData.length > 0) setNewAsgn(prev => ({ ...prev, subject_id: subjData[0].id }));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher || !newAsgn.title || !newAsgn.subject_id) return;

    const selectedSubj = subjects.find(s => s.id === newAsgn.subject_id);

    try {
      await dbService.createAssignment({
        title: newAsgn.title,
        subject_id: newAsgn.subject_id,
        subject_name: selectedSubj?.name || 'Subject',
        description: newAsgn.description,
        teacher_id: teacher.id,
        teacher_name: teacher.profile?.full_name || 'Faculty',
        due_date: newAsgn.due_date,
        max_marks: newAsgn.max_marks,
      });

      await loadData();
      setIsCreateOpen(false);
      setNewAsgn({
        title: '',
        subject_id: subjects[0]?.id || '',
        description: '',
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
        max_marks: 50,
      });
      showToast('Assignment Created', 'New assignment published to student portal.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to create assignment.', 'error');
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    try {
      await dbService.gradeSubmission(selectedSub.id, gradeData.grade, gradeData.remarks);
      await loadData();
      setSelectedSub(null);
      showToast('Submission Graded', 'Grade score and remarks feedback sent to student.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to grade submission.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Assignment Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish new coursework tasks, review digital submissions, and issue grades with feedback
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assignments.map(asgn => (
          <div
            key={asgn.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400">
                  {asgn.subject_name}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{asgn.title}</h3>
              </div>
              <Badge variant="info">Max: {asgn.max_marks}</Badge>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{asgn.description}</p>

            <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Due: {new Date(asgn.due_date).toLocaleDateString()}
              </span>
              <span className="font-semibold text-emerald-600">
                {submissions.filter(s => s.assignment_id === asgn.id).length} Submissions
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Submissions Evaluation Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Student Submissions to Grade</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Roll Number</th>
                <th className="px-6 py-3.5">Submission Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Grade</th>
                <th className="px-6 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{sub.student_name}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{sub.roll_number}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(sub.submission_date).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={sub.status === 'graded' ? 'graded' : 'submitted'}>{sub.status}</Badge>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-brand-600 dark:text-brand-400">
                    {sub.grade !== undefined ? `${sub.grade} Marks` : 'Un-graded'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setGradeData({ grade: sub.grade || 45, remarks: sub.remarks || '' });
                      }}
                      className="px-3 py-1 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-500"
                    >
                      {sub.status === 'graded' ? 'Re-grade' : 'Grade Submission'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Assignment Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Assignment"
          subtitle="Publish homework task to student portal"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assignment Title</label>
              <input
                type="text"
                required
                value={newAsgn.title}
                onChange={e => setNewAsgn({ ...newAsgn, title: e.target.value })}
                placeholder="AVL Tree Implementation"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                <select
                  value={newAsgn.subject_id}
                  onChange={e => setNewAsgn({ ...newAsgn, subject_id: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Max Marks</label>
                <input
                  type="number"
                  value={newAsgn.max_marks}
                  onChange={e => setNewAsgn({ ...newAsgn, max_marks: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Due Date & Time</label>
              <input
                type="datetime-local"
                required
                value={newAsgn.due_date}
                onChange={e => setNewAsgn({ ...newAsgn, due_date: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description & Instructions</label>
              <textarea
                rows={3}
                required
                value={newAsgn.description}
                onChange={e => setNewAsgn({ ...newAsgn, description: e.target.value })}
                placeholder="Detailed instructions for students..."
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-xs"
              >
                Publish Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Grade Submission Modal */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Grade Submission: ${selectedSub.student_name}`}
          subtitle={`Roll: ${selectedSub.roll_number}`}
        >
          <form onSubmit={handleGradeSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Marks Score</label>
              <input
                type="number"
                value={gradeData.grade}
                onChange={e => setGradeData({ ...gradeData, grade: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Evaluation Remarks & Feedback</label>
              <textarea
                rows={3}
                value={gradeData.remarks}
                onChange={e => setGradeData({ ...gradeData, remarks: e.target.value })}
                placeholder="Detailed feedback notes for the student..."
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs"
              >
                Submit Grade & Remarks
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
