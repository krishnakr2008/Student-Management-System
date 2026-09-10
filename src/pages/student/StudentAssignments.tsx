import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Assignment, AssignmentSubmission } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FileText, Clock, Upload, CheckCircle2, MessageSquare } from 'lucide-react';

export const StudentAssignments: React.FC = () => {
  const { student } = useAuth();
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedAsgn, setSelectedAsgn] = useState<Assignment | null>(null);
  const [submissionRemarks, setSubmissionRemarks] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    const studentId = student?.id || 'std-1';
    const [asgnData, subData] = await Promise.all([
      dbService.getAssignments(),
      dbService.getSubmissions(),
    ]);
    setAssignments(asgnData);
    setSubmissions(subData.filter(s => s.student_id === studentId));
  };

  useEffect(() => {
    loadData();
  }, [student]);

  const getStudentSubmission = (asgnId: string) => {
    return submissions.find(s => s.assignment_id === asgnId);
  };

  const handleOpenSubmitModal = (asgn: Assignment) => {
    setSelectedAsgn(asgn);
    const existing = getStudentSubmission(asgn.id);
    setSubmissionRemarks(existing?.remarks || '');
    setFileUrl(existing?.file_url || '');
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsgn) return;

    const studentId = student?.id || 'std-1';
    setIsSubmitting(true);
    try {
      await dbService.submitAssignment({
        assignment_id: selectedAsgn.id,
        student_id: studentId,
        file_url: fileUrl || 'https://storage.university.edu/submissions/student-work.pdf',
        remarks: submissionRemarks,
        status: 'submitted',
      });

      await loadData();
      setSelectedAsgn(null);
      showToast('Assignment Submitted', 'Your submission has been uploaded successfully.', 'success');
    } catch (err) {
      showToast('Submission Error', 'Failed to submit assignment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Course Assignments
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          View assigned coursework, submit digital files, and inspect teacher evaluation feedback
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assignments.map(asgn => {
          const sub = getStudentSubmission(asgn.id);
          const isGraded = sub?.status === 'graded';
          const isSubmitted = sub?.status === 'submitted' || isGraded;

          return (
            <div
              key={asgn.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">
                    {asgn.subject_name}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{asgn.title}</h3>
                </div>
                <Badge variant={isGraded ? 'graded' : isSubmitted ? 'submitted' : 'pending'}>
                  {isGraded ? `Graded (${sub.grade}/${asgn.max_marks})` : isSubmitted ? 'Submitted' : 'Pending'}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">{asgn.description}</p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Due: {new Date(asgn.due_date).toLocaleDateString()}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Max Marks: {asgn.max_marks}
                </span>
              </div>

              {sub?.remarks && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Faculty Remarks:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 italic">{sub.remarks}</p>
                </div>
              )}

              <button
                onClick={() => handleOpenSubmitModal(asgn)}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 ${
                  isSubmitted
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-xs'
                }`}
              >
                {isSubmitted ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Upload className="w-4 h-4" />}
                <span>{isSubmitted ? 'Update Submission' : 'Submit Assignment'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {selectedAsgn && (
        <Modal
          isOpen={!!selectedAsgn}
          onClose={() => setSelectedAsgn(null)}
          title={`Submit: ${selectedAsgn.title}`}
          subtitle={`Subject: ${selectedAsgn.subject_name}`}
        >
          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Submission File URL / Cloud Link</label>
              <input
                type="text"
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                placeholder="https://storage.university.edu/my-submission.pdf"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Submission Notes / Code Explanation</label>
              <textarea
                rows={4}
                value={submissionRemarks}
                onChange={e => setSubmissionRemarks(e.target.value)}
                placeholder="Brief summary of your completed work, implementation approach, or comments for faculty..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAsgn(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-xs"
              >
                {isSubmitting ? 'Submitting...' : 'Upload & Turn In'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
