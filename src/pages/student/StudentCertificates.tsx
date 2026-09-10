import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dbService } from '../../services/dbService';
import { Certificate } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Plus, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';

export const StudentCertificates: React.FC = () => {
  const { student } = useAuth();
  const { showToast } = useToast();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    issue_date: new Date().toISOString().split('T')[0],
    certificate_code: '',
    credential_url: '',
    category: 'Technical' as Certificate['category'],
    description: '',
    file_url: '',
  });

  const loadCertificates = async () => {
    setLoading(true);
    const studentId = student?.id || 'std-1';
    try {
      const data = await dbService.getCertificates(studentId);
      setCertificates(data);
    } catch (err: any) {
      showToast('Error Loading Certificates', err.message || 'Failed to fetch certificates.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, [student]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, file_url: reader.result as string }));
        showToast('Document Attached', 'Certificate file attached successfully.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.organization) {
      showToast('Validation Error', 'Certificate name and issuing organization are required.', 'error');
      return;
    }

    const studentId = student?.id || 'std-1';
    setIsSubmitting(true);
    try {
      await dbService.uploadCertificate({
        student_id: studentId,
        name: formData.name,
        organization: formData.organization,
        issue_date: formData.issue_date,
        certificate_code: formData.certificate_code,
        credential_url: formData.credential_url,
        category: formData.category,
        description: formData.description,
        file_url: formData.file_url || 'https://images.unsplash.com/photo-1589330694653-aded6fac0243?w=500',
      });

      await loadCertificates();
      setIsAddOpen(false);
      setFormData({
        name: '',
        organization: '',
        issue_date: new Date().toISOString().split('T')[0],
        certificate_code: '',
        credential_url: '',
        category: 'Technical',
        description: '',
        file_url: '',
      });
      showToast('Certificate Uploaded', 'Submitted for HOD verification. Status is currently PENDING.', 'success');
    } catch (err: any) {
      showToast('Database Error', err.message || 'Failed to submit certificate.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Certificate & Credential Portfolio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload external certifications, track institutional HOD verification status, and manage resume credentials
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Certificate</span>
        </button>
      </div>

      {/* Certificates Cards */}
      {loading ? (
        <div className="p-8 text-center text-xs font-bold text-slate-500">
          Loading certificate portfolio...
        </div>
      ) : certificates.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          No certificates uploaded yet. Click "Add New Certificate" to submit credentials for verification.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map(cert => (
            <div
              key={cert.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="info">{cert.category}</Badge>
                  <Badge
                    variant={cert.status === 'verified' ? 'verified' : cert.status === 'rejected' ? 'rejected' : 'pending'}
                  >
                    {cert.status === 'verified' ? '✓ Verified' : cert.status === 'rejected' ? '✕ Rejected' : '⏳ Pending Audit'}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{cert.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cert.organization}</p>
                </div>

                {cert.description && <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{cert.description}</p>}

                {cert.remarks && (
                  <div
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      cert.status === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-900 dark:text-rose-200 border border-rose-500/20'
                    }`}
                  >
                    <span className="font-bold flex items-center gap-1">
                      {cert.status === 'verified' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      HOD Verification Note:
                    </span>
                    <p>{cert.remarks}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Issued: {cert.issue_date}</span>
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>Verify Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Certificate Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Credential Certificate"
          subtitle="Submit certificate details for institutional audit and verification"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Certificate Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="AWS Certified Cloud Practitioner"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Issuing Organization</label>
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={e => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Amazon Web Services / Meta"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as Certificate['category'] })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="Technical">Technical</option>
                  <option value="Course">Course</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Internship">Internship</option>
                  <option value="Extracurricular">Extracurricular</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Issue Date</label>
                <input
                  type="date"
                  required
                  value={formData.issue_date}
                  onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Credential Verification Link</label>
                <input
                  type="url"
                  value={formData.credential_url}
                  onChange={e => setFormData({ ...formData, credential_url: e.target.value })}
                  placeholder="https://aws.amazon.com/verify/..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upload Certificate File / Image</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Uploading...' : 'Submit Certificate'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
