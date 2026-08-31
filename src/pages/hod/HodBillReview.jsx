import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/supabase';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { SignatureModal } from '@/components/signature/SignatureModal';
import { calculateBillCategoryTotals, formatCurrency } from '@/lib/calculations';
import { 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ShieldCheck,
  Building2 
} from 'lucide-react';

export const HodBillReview = () => {
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
          onClick={() => navigate('/hod/pending')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
        >
          Back to Pending Bills
        </button>
      </div>
    );
  }

  const { totalSetting, totalTranslation, totalProof, grandTotal } = calculateBillCategoryTotals(bill.items || []);

  const facultyApproval = bill.approvals?.find((a) => a.action === 'SUBMITTED');
  const facultySignature = facultyApproval?.signature_snapshot_path || bill.faculty?.signature_path;

  const handleApprove = async () => {
    if (!user?.signature_path) {
      setIsSignatureModalOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      await dataService.processHODAction(bill.id, user, 'APPROVE');
      navigate(`/hod/approved-success/${bill.id}`);
    } catch (err) {
      alert(err.message || 'Failed to approve bill.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignatureSavedAndApprove = async (signatureDataUrl) => {
    await updateSignature(signatureDataUrl);
    setIsSignatureModalOpen(false);
    setIsProcessing(true);
    try {
      await dataService.processHODAction(bill.id, { ...user, signature_path: signatureDataUrl }, 'APPROVE');
      navigate(`/hod/approved-success/${bill.id}`);
    } catch (err) {
      alert(err.message || 'Failed to approve bill.');
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
      await dataService.processHODAction(bill.id, user, 'REJECT', rejectionReason);
      setIsRejectModalOpen(false);
      navigate('/hod/pending');
    } catch (err) {
      alert(err.message || 'Failed to reject bill.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/hod/pending')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400" />
          Back to Pending Bills
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
            <h1 className="text-2xl sm:text-3xl font-semibold font-mono text-slate-900">{bill.bill_reference_id}</h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Pending HOD Verification
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Submitted on {bill.submission_date ? new Date(bill.submission_date).toLocaleDateString() : '—'}
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
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{bill.class?.name || 'TYCS'} • Sem {bill.semester?.roman_label}</span>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Academic Year</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{bill.academic_year?.year_label}</span>
          </div>
        </div>
      </div>

      {/* Paper Items Table */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">
          Paper Sets Breakdown
        </h3>
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
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
          </div>
        </div>
      </div>

      {/* Cost Summary & Faculty Signature Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Cost Summary */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-2xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Claim Calculation
          </h3>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Paper Setting</span>
              <span className="font-mono font-medium text-slate-900">{formatCurrency(totalSetting)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Translation</span>
              <span className="font-mono font-medium text-slate-900">{formatCurrency(totalTranslation)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Proof Checking</span>
              <span className="font-mono font-medium text-slate-900">{formatCurrency(totalProof)}</span>
            </div>
            <div className="flex justify-between pt-3 text-base font-semibold text-slate-900">
              <span>Grand Total</span>
              <span className="font-mono text-xl font-bold">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Faculty Digital Signature Verification */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 space-y-3 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Faculty Digital Signature
            </h3>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Digitally Verified
            </span>
          </div>

          <div className="h-28 border border-dashed border-slate-200 rounded-xl bg-slate-50/60 flex items-center justify-center p-3">
            {facultySignature ? (
              <img
                src={facultySignature}
                alt="Faculty Signature Snapshot"
                className="max-h-20 max-w-full object-contain filter contrast-125"
              />
            ) : (
              <span className="text-xs text-slate-400 font-mono">No Signature Recorded</span>
            )}
          </div>

          <div className="text-left text-xs text-slate-500">
            <p className="font-semibold text-slate-900">{bill.faculty?.name}</p>
            <p className="text-[11px] text-slate-400">Paper Setter / Examiner</p>
          </div>
        </div>

      </div>

      {/* Action Footer (Approve / Reject) */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
        <button
          onClick={() => setIsRejectModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-rose-600 bg-rose-50/60 border border-rose-200/80 hover:bg-rose-100/60 transition-all cursor-pointer"
        >
          <XCircle className="w-4 h-4" />
          Reject Bill
        </button>

        <button
          onClick={handleApprove}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
        >
          {isProcessing ? (
            <span className="animate-pulse">Endorsing…</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Endorse &amp; Forward to Head
            </>
          )}
        </button>
      </div>

      {/* Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Paper Setting Bill"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Please provide a specific reason for rejecting Bill <strong className="font-mono text-slate-900">{bill.bill_reference_id}</strong>. The faculty will be notified to correct and resubmit.
          </p>

          <Textarea
            label="Rejection Reason"
            placeholder="e.g. Number of sets for DAA needs to be 4 instead of 2."
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

      {/* HOD Signature Guard Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSignatureSavedAndApprove}
        title="HOD Signature Required"
        description="To approve and forward this bill to the Head/Principal, you must provide your HOD signature."
      />

    </div>
  );
};
