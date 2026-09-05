import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/supabase';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { SignatureModal } from '@/components/signature/SignatureModal';
import { formatCurrency } from '@/lib/calculations';
import { 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Award 
} from 'lucide-react';

const METHOD_LABELS = {
  PAPER_SETTING: 'Paper Setting',
  ANSWER_BOOK_ASSESSMENT: 'Answer Book / Moderation',
  PRACTICAL_ASSESSMENT: 'Practical Assessment',
  ONLINE_EXAMINATION_NEP: 'Online Examination (NEP)',
};

export const HeadBillReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateSignature } = useAuth();

  const [bill, setBill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const found = await dataService.getBillById(id);
        setBill(found);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBill();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 font-mono animate-pulse">
        Loading bill details…
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-900">Bill not found</p>
        <button
          onClick={() => navigate('/head/pending')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
        >
          Back to Pending Sanctions
        </button>
      </div>
    );
  }

  const method = bill.billing_method || 'PAPER_SETTING';
  const facultyApproval = bill.approvals?.find((a) => a.action === 'SUBMITTED');
  const hodApproval     = bill.approvals?.find((a) => a.action === 'APPROVED');

  const facultySignature = facultyApproval?.signature_snapshot_path || bill.faculty?.signature_path;
  const hodSignature     = hodApproval?.signature_snapshot_path;

  const handleFinalize = async () => {
    if (!user?.signature_path) {
      setIsSignatureModalOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      await dataService.processHeadAction(bill.id, user, 'FINALIZE');
      navigate(`/head/approved-success/${bill.id}`);
    } catch (err) {
      alert(err.message || 'Failed to finalize bill.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignatureSavedAndFinalize = async (signatureDataUrl) => {
    await updateSignature(signatureDataUrl);
    setIsSignatureModalOpen(false);
    setIsProcessing(true);
    try {
      await dataService.processHeadAction(bill.id, { ...user, signature_path: signatureDataUrl }, 'FINALIZE');
      navigate(`/head/approved-success/${bill.id}`);
    } catch (err) {
      alert(err.message || 'Failed to finalize bill.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejecting this bill.');
      return;
    }

    setIsProcessing(true);
    try {
      await dataService.processHeadAction(bill.id, user, 'REJECT', rejectionReason);
      setIsRejectModalOpen(false);
      navigate('/head/pending');
    } catch (err) {
      alert(err.message || 'Failed to reject bill.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/head/pending')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400" />
          Back to Pending Sanctions
        </button>

        <button
          onClick={() => navigate(`/bill/${bill.id}/official`)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          View Official Document Form
        </button>
      </div>

      {/* Bill Header Meta Card */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 sm:p-7 space-y-5 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                {METHOD_LABELS[method] || method}
              </span>
              {bill.month_year && (
                <span className="text-xs font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                  Exam Period: <strong>{bill.month_year}</strong>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold font-mono text-slate-900">{bill.bill_reference_id}</h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Pending Principal Sanction
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5">
              HOD Verified on {hodApproval ? new Date(hodApproval.created_at).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Faculty / Examiner</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">{bill.faculty?.name}</span>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">{bill.faculty?.department || 'Computer Science'}</span>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Class &amp; Semester</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
              {bill.class?.name ? `${bill.class.name} • ` : ''}Sem {bill.semester?.roman_label || bill.semester?.semester_number}
            </span>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Academic Year</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{bill.academic_year?.year_label}</span>
          </div>
        </div>
      </div>

      {/* Item Breakdown Table */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">
          Bill Items Breakdown
        </h3>
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            {method === 'ANSWER_BOOK_ASSESSMENT' && (
              <table className="w-full min-w-[580px] text-xs text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">Sr</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4 text-center">Level</th>
                    <th className="py-3.5 px-4 text-center">Sem End Books</th>
                    <th className="py-3.5 px-4 text-center">ATKT Books</th>
                    <th className="py-3.5 px-4 text-center">Internal Books</th>
                    <th className="py-3.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(bill.answer_book_items && bill.answer_book_items.length > 0 ? bill.answer_book_items : (bill.items || [])).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{item.subject?.name || item.subject_name}</td>
                      <td className="py-3.5 px-4 text-center font-semibold">{item.level || item.academic_level || 'UG'}</td>
                      <td className="py-3.5 px-4 text-center font-mono">{item.semester_end_books || 0}</td>
                      <td className="py-3.5 px-4 text-center font-mono">{item.atkt_books || 0}</td>
                      <td className="py-3.5 px-4 text-center font-mono">{item.internal_books || 0}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {method === 'PRACTICAL_ASSESSMENT' && (
              <table className="w-full min-w-[580px] text-xs text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">Sr</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4 text-center">Level</th>
                    <th className="py-3.5 px-4 text-center">Candidates</th>
                    <th className="py-3.5 px-4 text-right">Rate / Student</th>
                    <th className="py-3.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(bill.practical_items && bill.practical_items.length > 0 ? bill.practical_items : (bill.items || [])).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{item.subject?.name || item.subject_name}</td>
                      <td className="py-3.5 px-4 text-center font-semibold">{item.level || item.academic_level || 'UG'}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium">{item.practical_books || 0}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(item.practical_rate || 25)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {method === 'ONLINE_EXAMINATION_NEP' && (
              <table className="w-full min-w-[580px] text-xs text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">Sr</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4 text-center">Class</th>
                    <th className="py-3.5 px-4 text-center">MCQs</th>
                    <th className="py-3.5 px-4 text-center">Students</th>
                    <th className="py-3.5 px-4 text-right">Upload Fee</th>
                    <th className="py-3.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(bill.online_items && bill.online_items.length > 0 ? bill.online_items : (bill.items || [])).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{item.subject?.name || item.subject_name}</td>
                      <td className="py-3.5 px-4 text-center">{item.class?.name || item.class_name || bill.class?.name || '—'}</td>
                      <td className="py-3.5 px-4 text-center font-mono">{item.mcq_count || 0}</td>
                      <td className="py-3.5 px-4 text-center font-mono">{item.student_count || 0}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(item.upload_amount)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {method === 'PAPER_SETTING' && (
              <table className="w-full min-w-[580px] text-xs text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">Sr</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4 text-center">Sets</th>
                    <th className="py-3.5 px-4 text-right">Setting</th>
                    <th className="py-3.5 px-4 text-right">Translation</th>
                    <th className="py-3.5 px-4 text-right">Proof</th>
                    <th className="py-3.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bill.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{item.subject?.name || item.subject_name}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {item.paper_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">{item.paper_sets}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(item.setting_amount)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(item.translation_amount)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(item.proof_amount)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Two Signatures Audit Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">
          Attached Digital Endorsements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Faculty Signature */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-5 space-y-3 shadow-2xs">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-800">1. Faculty Examiner</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Signed
              </span>
            </div>
            <div className="h-24 border border-dashed border-slate-200 rounded-xl bg-slate-50/60 flex items-center justify-center p-2">
              {facultySignature && (
                <img
                  src={facultySignature}
                  alt="Faculty Signature"
                  className="max-h-16 max-w-full object-contain filter contrast-125"
                />
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">{bill.faculty?.name}</p>
          </div>

          {/* HOD Signature */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-5 space-y-3 shadow-2xs">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-800">2. Head of Department</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Endorsed
              </span>
            </div>
            <div className="h-24 border border-dashed border-slate-200 rounded-xl bg-slate-50/60 flex items-center justify-center p-2">
              {hodSignature && (
                <img
                  src={hodSignature}
                  alt="HOD Signature"
                  className="max-h-16 max-w-full object-contain filter contrast-125"
                />
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {hodApproval?.user?.name || hodApproval?.user_name || 'Prof. Vinod Rajput'} (HOD Computer Science)
            </p>
          </div>

        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 space-y-3 shadow-2xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Disbursement Authorization
        </h3>
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <span>Total Sanction Amount Payable</span>
            <span className="font-mono text-2xl font-bold">{formatCurrency(bill.grand_total)}</span>
          </div>
          {bill.amount_in_words && (
            <div className="pt-2 text-[11px] bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 mt-2">
              <span className="font-medium text-slate-400 uppercase tracking-wide block text-[10px]">In Words</span>
              <span className="font-semibold text-slate-800 text-xs mt-0.5 block italic">{bill.amount_in_words}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
        <button
          onClick={() => setIsRejectModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-rose-600 bg-rose-50/60 border border-rose-200/80 hover:bg-rose-100/60 transition-all cursor-pointer"
        >
          <XCircle className="w-4 h-4" />
          Reject Bill
        </button>

        <button
          onClick={handleFinalize}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
        >
          {isProcessing ? (
            <span className="animate-pulse">Sanctioning…</span>
          ) : (
            <>
              <Award className="w-4 h-4" />
              Finalize &amp; Sanction Disbursal
            </>
          )}
        </button>
      </div>

      {/* Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Bill"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Please specify why Bill <strong className="font-mono text-slate-900">{bill.bill_reference_id}</strong> is being rejected.
          </p>

          <Textarea
            label="Rejection Reason"
            placeholder="e.g. Discrepancy in calculations or documentation."
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-60"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      {/* Head Signature Guard Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSignatureSavedAndFinalize}
        title="Principal Signature Required"
        description="To finalize and sanction this bill, you must provide your Principal / Director signature."
      />

    </div>
  );
};
