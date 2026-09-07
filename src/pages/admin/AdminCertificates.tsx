import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Certificate } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Check, X, ExternalLink, ShieldCheck } from 'lucide-react';

export const AdminCertificates: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [actionType, setActionType] = useState<'verify' | 'reject'>('verify');
  const [remarks, setRemarks] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const data = await dbService.getCertificates();
      setCertificates(data);
    } catch (err: any) {
      showToast('Error Loading Certificates', err.message || 'Failed to fetch certificate queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCert) return;

    setIsSubmitting(true);
    try {
      const targetStatus = actionType === 'verify' ? 'verified' : 'rejected';
      const finalRemarks = remarks || (actionType === 'verify' ? 'Verified against official institutional criteria.' : 'Document proof insufficient or unverified.');

      await dbService.updateCertificateStatus(
        selectedCert.id,
        targetStatus,
        finalRemarks,
        user?.id || 'admin-user'
      );

      await loadCertificates();
      setSelectedCert(null);
      setRemarks('');
      showToast(
        actionType === 'verify' ? 'Certificate Verified' : 'Certificate Rejected',
        `Updated status for ${selectedCert.name} to ${targetStatus.toUpperCase()}.`,
        actionType === 'verify' ? 'success' : 'warning'
      );
    } catch (err: any) {
      showToast('Database Error', err.message || 'Failed to update certificate verification status.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCerts = certificates.filter(c => {
    if (activeTab === 'pending') return c.status === 'pending';
    if (activeTab === 'verified') return c.status === 'verified';
    if (activeTab === 'rejected') return c.status === 'rejected';
    return true;
  });

  const pendingCount = certificates.filter(c => c.status === 'pending').length;
  const verifiedCount = certificates.filter(c => c.status === 'verified').length;
  const rejectedCount = certificates.filter(c => c.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Certificate Audit & Verification Panel
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-md">
              HOD / Admin Authority
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit student-submitted credentials, inspect external links, and approve/reject with permanent audit remarks
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'all'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Queue ({certificates.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Pending Audit ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'verified'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Verified ({verifiedCount})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Verification Audit Queue</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">Records: {filteredCerts.length}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500">
            Loading certificate verification records...
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No certificate records found for the active tab.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Certificate Name</th>
                  <th className="px-6 py-3.5">Issuing Body</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Audit Remarks</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredCerts.map(cert => (
                  <tr key={cert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                      {cert.student_name || 'Student'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div>
                        <span>{cert.name}</span>
                        {cert.credential_url && (
                          <a
                            href={cert.credential_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <span>Verify URL</span> <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{cert.organization}</td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{cert.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={cert.status === 'verified' ? 'verified' : cert.status === 'rejected' ? 'rejected' : 'pending'}>
                        {cert.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-slate-500 max-w-xs truncate">
                      {cert.remarks || 'No remarks recorded.'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCert(cert);
                            setActionType('verify');
                            setRemarks('Verified against issuing directory and proof document.');
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCert(cert);
                            setActionType('reject');
                            setRemarks('Invalid URL or unreadable document uploaded.');
                          }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verify/Reject Modal */}
      {selectedCert && (
        <Modal
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          title={`${actionType === 'verify' ? 'Approve & Verify' : 'Reject'} Certificate`}
          subtitle={`Student: ${selectedCert.student_name || 'Student'} — ${selectedCert.name}`}
        >
          <form onSubmit={handleActionSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 text-xs">
              <p><strong>Organization:</strong> {selectedCert.organization}</p>
              <p><strong>Issue Date:</strong> {selectedCert.issue_date}</p>
              {selectedCert.credential_url && (
                <p>
                  <strong>Credential Link:</strong>{' '}
                  <a href={selectedCert.credential_url} target="_blank" rel="noreferrer" className="text-purple-600 underline inline-flex items-center gap-1 font-bold">
                    Open Document <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Admin Remarks & Verification Feedback</label>
              <textarea
                rows={3}
                required
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2 ${
                  actionType === 'verify' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {isSubmitting ? 'Updating Database...' : `Confirm ${actionType === 'verify' ? 'Verification' : 'Rejection'}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
