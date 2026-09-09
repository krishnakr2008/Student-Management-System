import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/dbService';
import { FeeRecord } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, Download, DollarSign, ShieldCheck, Printer } from 'lucide-react';

export const StudentFees: React.FC = () => {
  const { student, user } = useAuth();
  const { showToast } = useToast();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);

  useEffect(() => {
    fetchFees();
  }, [student]);

  const fetchFees = async () => {
    if (!student) return;
    setLoading(false);
    try {
      const records = await dbService.getStudentFees(student.id);
      setFees(records);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePayFee = async (feeId: string, totalAmount: number, currentPaid: number) => {
    const dueAmount = totalAmount - currentPaid;
    if (dueAmount <= 0) return;

    setIsProcessing(true);
    try {
      await dbService.payFee(feeId, dueAmount);
      showToast('Payment Successful!', `Successfully paid $${dueAmount.toLocaleString()} towards tuition fees.`, 'success');
      await fetchFees();
    } catch (e: any) {
      showToast('Payment Error', e.message || 'Payment processing failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-2 border border-blue-500/30">
            💳 Institutional Fee Ledger & Receipt Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Academic Fees & Financial Clearance
          </h1>
          <p className="text-xs text-blue-200 mt-1">
            Track tuition breakdowns, make online payments, and download verified digital fee receipts
          </p>
        </div>
      </div>

      {/* Fee Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Academic Fees</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">$50,000.00</h3>
            <span className="text-[10px] text-slate-400">Semester 5 (2025-2026)</span>
          </div>
          <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-600 dark:text-brand-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Paid Amount</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ${fees.reduce((acc, f) => acc + f.paid_amount, 0).toLocaleString()}
            </h3>
            <span className="text-[10px] text-emerald-500 font-semibold">Verified Ledger</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Pending Balance</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              ${fees.reduce((acc, f) => acc + (f.total_amount - f.paid_amount), 0).toLocaleString()}
            </h3>
            <span className="text-[10px] text-amber-500 font-semibold">Due by Sept 30, 2026</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Fee Ledger Roster */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Semester Fee Breakdown</h3>

        <div className="space-y-4">
          {fees.map(fee => {
            const due = fee.total_amount - fee.paid_amount;
            return (
              <div
                key={fee.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Semester {fee.semester} Fee - {fee.academic_year}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        fee.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : fee.status === 'partial'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {fee.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div>Tuition Fee: <strong className="text-slate-700 dark:text-slate-200">${fee.tuition_fee.toLocaleString()}</strong></div>
                    <div>Exam Fee: <strong className="text-slate-700 dark:text-slate-200">${fee.exam_fee.toLocaleString()}</strong></div>
                    <div>Library Fee: <strong className="text-slate-700 dark:text-slate-200">${fee.library_fee.toLocaleString()}</strong></div>
                  </div>

                  {fee.receipt_no && (
                    <p className="text-[11px] font-mono text-brand-600 dark:text-brand-400">
                      Receipt #: {fee.receipt_no} | Paid on {new Date(fee.paid_at || '').toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  {due > 0 ? (
                    <button
                      onClick={() => handlePayFee(fee.id, fee.total_amount, fee.paid_amount)}
                      disabled={isProcessing}
                      className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all"
                    >
                      {isProcessing ? 'Processing...' : `Pay $${due.toLocaleString()}`}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePrintReceipt(fee)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Receipt</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
