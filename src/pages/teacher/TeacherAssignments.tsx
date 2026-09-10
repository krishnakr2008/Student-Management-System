import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Assignment, AssignmentSubmission, Subject } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Plus, Clock, ShieldAlert } from 'lucide-react';

export const TeacherAssignments: React.FC = () => {
  const { teacher } = useAuth();
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<AssignmentSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  const [newAsgn, setNewAsgn] = useState({
    title: '',
    subject_id: '',
    course_name: 'B.Tech CSE',
    semester: 5,
    section: 'A',
    assessment_type: 'Assignment',
    attachment_url: '',
    description: '',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    max_marks: 50,
  });

  const [gradeData, setGradeData] = useState({
    grade: 45,
    remarks: '',
  });

  const loadData = async () => {
    if (!teacher?.id) return;
    setLoading(true);

    const [asgnData, subData, assignedSubjects] = await Promise.all([
      dbService.getTeacherAssignments(teacher.id),
      dbService.getSubmissions(),
      dbService.getTeacherAssignedSubjects(teacher.id),
    ]);

    setAssignments(asgnData);
    setSubmissions(subData);
    setSubjects(assignedSubjects);

    if (assignedSubjects.length > 0 && !newAsgn.subject_id) {
      setNewAsgn(prev => ({ ...prev, subject_id: assignedSubjects[0].id }));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [teacher?.id]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher || !newAsgn.title || !newAsgn.subject_id) return;

    const selectedSubj = subjects.find(s => s.id === newAsgn.subject_id);

    try {
      await dbService.createAssignment({
        title: `[${newAsgn.assessment_type}] ${newAsgn.title}`,
        subject_id: newAsgn.subject_id,
        subject_name: selectedSubj?.name || 'Subject',
        semester: Number(newAsgn.semester),
        description: `[Course: ${newAsgn.course_name} | Sem ${newAsgn.semester} | Sec ${newAsgn.section}]\n${newAsgn.description}`,
        teacher_id: teacher.id,
        teacher_name: teacher.profile?.full_name || 'Faculty',
        due_date: newAsgn.due_date,
        attachment_url: newAsgn.attachment_url || undefined,
        max_marks: newAsgn.max_marks,
      });

      await loadData();
      setIsCreateOpen(false);
      setNewAsgn({
        title: '',
        subject_id: subjects[0]?.id || '',
        course_name: 'B.Tech CSE',
        semester: 5,
        section: 'A',
        assessment_type: 'Assignment',
        attachment_url: '',
        description: '',
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
        max_marks: 50,
      });
      showToast('Assessment Published', 'New assessment task assigned successfully to student portal.', 'success');
    } catch (err: any) {
      showToast('Database Error', err?.message || 'Failed to create assessment.', 'error');
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

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-slate-500">
        Loading assignments and submissions...
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="p-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">No Subjects Assigned</h3>
        <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto">
          You are currently not assigned to any subject. You cannot create assignments until HOD assigns subjects to you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Coursework & Assignments
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md">
              Faculty Access
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish coursework for your assigned subjects ({subjects.map(s => s.code).join(', ')})
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-2"
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
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
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
                  <td className="px-6 py-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                    {sub.grade !== undefined ? `${sub.grade} Marks` : 'Un-graded'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setGradeData({ grade: sub.grade || 45, remarks: sub.remarks || '' });
                      }}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500"
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
          title="Create New Assessment & Assignment"
          subtitle="Assign coursework, project, or assessment task to student portal"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Course</label>
                <select
                  value={newAsgn.course_name}
                  onChange={e => setNewAsgn({ ...newAsgn, course_name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  <option value="B.Tech CSE">B.Tech CSE</option>
                  <option value="B.Tech IT">B.Tech IT</option>
                  <option value="B.Tech ECE">B.Tech ECE</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Semester</label>
                <select
                  value={newAsgn.semester}
                  onChange={e => setNewAsgn({ ...newAsgn, semester: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Section</label>
                <select
                  value={newAsgn.section}
                  onChange={e => setNewAsgn({ ...newAsgn, section: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="All">All Sections</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Subject (Assigned Only)</label>
                <select
                  value={newAsgn.subject_id}
                  onChange={e => setNewAsgn({ ...newAsgn, subject_id: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Assessment Type</label>
                <select
                  value={newAsgn.assessment_type}
                  onChange={e => setNewAsgn({ ...newAsgn, assessment_type: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  <option value="Assignment">Homework Assignment</option>
                  <option value="Assessment">Mid-Term Assessment</option>
                  <option value="Quiz">Quick Quiz</option>
                  <option value="Practical">Lab Practical</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Assessment Title</label>
              <input
                type="text"
                required
                value={newAsgn.title}
                onChange={e => setNewAsgn({ ...newAsgn, title: e.target.value })}
                placeholder="AVL Tree Implementation & Complexity Analysis"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Max Marks</label>
                <input
                  type="number"
                  value={newAsgn.max_marks}
                  onChange={e => setNewAsgn({ ...newAsgn, max_marks: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Due Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newAsgn.due_date}
                  onChange={e => setNewAsgn({ ...newAsgn, due_date: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Attachment / File Document Link (Optional)</label>
              <input
                type="url"
                value={newAsgn.attachment_url}
                onChange={e => setNewAsgn({ ...newAsgn, attachment_url: e.target.value })}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Description & Submission Instructions</label>
              <textarea
                rows={3}
                required
                value={newAsgn.description}
                onChange={e => setNewAsgn({ ...newAsgn, description: e.target.value })}
                placeholder="Detailed instructions for student class..."
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium resize-none"
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
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs"
              >
                Assign Assessment
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
