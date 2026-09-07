import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Certificate } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ShieldCheck, ShieldAlert, Check, X, ExternalLink } from 'lucide-react';

export const AdminCertificates: React.FC = () => {
  const { showToast } = useToast();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [actionType, setActionType] = useState<'verify' | 'reject'>('verify');
  const [remarks, setRemarks] = useState('');

  const loadCertificates = async () => {
    const data = await dbService.getCertificates();
    setCertificates(data);
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCert) return;

    try {
      await dbService.updateCertificateStatus(
        selectedCert.id,
        actionType === 'verify' ? 'verified' : 'rejected',
        remarks || (actionType === 'verify' ? 'Verified by Admin.' : 'Rejected due to insufficient proof.')
      );

      await loadCertificates();
      setSelectedCert(null);
      setRemarks('');
      showToast(
        actionType === 'verify' ? 'Certificate Verified' : 'Certificate Rejected',
        `Updated status for ${selectedCert.name}.`,
        actionType === 'verify' ? 'success' : 'warning'
      );
    } catch (err) {
      showToast('Error', 'Failed to update status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Certificate Verification Panel
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Audit external certifications uploaded by students, verify credentials, and approve/reject with remarks
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Student Uploaded Certificates Audit Queue</h3>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30">
            Pending Audit: {certificates.filter(c => c.status === 'pending').length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Certificate Name</th>
                <th className="px-6 py-3.5">Organization</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {certificates.map(cert => (
                <tr key={cert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                    {cert.student_name || 'Alex Johnson'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{cert.name}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{cert.organization}</td>
                  <td className="px-6 py-4">
                    <Badge variant="info">{cert.category}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={cert.status === 'verified' ? 'verified' : cert.status === 'rejected' ? 'rejected' : 'pending'}>
                      {cert.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCert(cert);
                          setActionType('verify');
                          setRemarks('Verified against issuing directory.');
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Verify
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCert(cert);
                          setActionType('reject');
                          setRemarks('Invalid or unreadable document uploaded.');
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
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
      </div>

      {/* Verify/Reject Modal */}
      {selectedCert && (
        <Modal
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          title={`${actionType === 'verify' ? 'Approve & Verify' : 'Reject'} Certificate`}
          subtitle={`Student: ${selectedCert.student_name} — ${selectedCert.name}`}
        >
          <form onSubmit={handleActionSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 text-xs">
              <p><strong>Organization:</strong> {selectedCert.organization}</p>
              <p><strong>Issue Date:</strong> {selectedCert.issue_date}</p>
              {selectedCert.credential_url && (
                <p>
                  <strong>Link:</strong>{' '}
                  <a href={selectedCert.credential_url} target="_blank" rel="noreferrer" className="text-brand-500 underline inline-flex items-center gap-1">
                    Verification Link <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Admin Remarks & Audit Note</label>
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
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs ${
                  actionType === 'verify' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                Confirm {actionType === 'verify' ? 'Verification' : 'Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
