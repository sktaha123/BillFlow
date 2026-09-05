import React, { useState } from 'react';
import { Eye, Edit3, ShieldCheck } from 'lucide-react';
import { calculateBillCategoryTotals, calculateGenericGrandTotal, formatCurrency } from '@/lib/calculations';
import { SignatureModal } from '@/components/signature/SignatureModal';

const METHOD_LABELS = {
  PAPER_SETTING: 'Paper Setting',
  ANSWER_BOOK_ASSESSMENT: 'Answer Book / Moderation',
  PRACTICAL_ASSESSMENT: 'Practical Assessment',
  ONLINE_EXAMINATION_NEP: 'Online Examination (NEP)',
};

export const Step5ReviewBill = ({
  draft,
  faculty,
  onEditBill,
  onContinueToPreview,
  onSaveSignature,
  onBack,
}) => {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const method = draft.billing_method || 'PAPER_SETTING';

  let grandTotal = 0;
  let categoryTotals = null;

  if (method === 'PAPER_SETTING') {
    categoryTotals = calculateBillCategoryTotals(draft.items);
    grandTotal = categoryTotals.grandTotal;
  } else {
    const generic = calculateGenericGrandTotal(draft.items);
    grandTotal = generic.grandTotal;
  }

  const handleProceed = () => {
    if (!faculty?.signature_path) {
      setIsSignatureModalOpen(true);
      return;
    }
    onContinueToPreview();
  };

  const handleSignatureSaved = async (signatureDataUrl) => {
    if (onSaveSignature) {
      await onSaveSignature(signatureDataUrl);
    }
    setIsSignatureModalOpen(false);
    onContinueToPreview();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Step 5: Review &amp; Verify Bill
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Please verify all information and remuneration amounts before generating the official document preview.
        </p>
      </div>

      {/* Verification Notice Card */}
      

      {/* 1. Bill Information Block */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-2xs">
        

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Faculty Name</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">{faculty?.name}</span>
          </div>
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">{faculty?.department || 'Computer Science'}</span>
          </div>
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Academic Year</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{draft.academic_year_label}</span>
          </div>
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Semester</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block">Semester {draft.semester_label}</span>
          </div>
        </div>
      </div>

      {/* 2. Items Summary */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Subject Items ({draft.items.length})
          </h3>
          <button
            onClick={onEditBill}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {draft.items.map((it, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 text-sm">{it.subject?.name || it.subject_name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {method === 'ANSWER_BOOK_ASSESSMENT' && `Level: ${it.academic_level || 'UG'} , Sem End: ${it.semester_end_books || 0} , ATKT: ${it.atkt_books || 0} , Int: ${it.internal_books || 0}`}
                  {method === 'PRACTICAL_ASSESSMENT' && `Level: ${it.academic_level || 'UG'} ,  Candidates: ${it.practical_books || 0}`}
                  {method === 'ONLINE_EXAMINATION_NEP' && `Class: ${it.class_name || 'FYCS'} ,  MCQs: ${it.mcq_count || 0} • Students: ${it.student_count || 0}`}
                  {method === 'PAPER_SETTING' && `${it.paper_type} ,  ${it.paper_sets} Sets ${it.translation_sets > 0 ? `• ${it.translation_sets} Trans` : ''} ${it.proof_papers > 0 ? `• ${it.proof_papers} Proof` : ''}`}
                </p>
              </div>
              <span className="font-mono font-semibold text-slate-900 text-sm">{formatCurrency(it.subtotal)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Cost Summary & Total */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-2xs">
        <div className="space-y-2 text-xs text-slate-600">
          {method === 'PAPER_SETTING' && categoryTotals && (
            <>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Paper Setting Total</span>
                <span className="font-mono font-medium text-slate-900">{formatCurrency(categoryTotals.totalSetting)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Translation Total</span>
                <span className="font-mono font-medium text-slate-900">{formatCurrency(categoryTotals.totalTranslation)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Proof Checking Total</span>
                <span className="font-mono font-medium text-slate-900">{formatCurrency(categoryTotals.totalProof)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between pt-3 text-base font-semibold text-slate-900">
            <span>Grand Total Remuneration</span>
            <span className="font-mono text-xl font-bold">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onEditBill}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          Edit Items
        </button>

        <button
          onClick={handleProceed}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer"
        >
          Proceed to Official Bill Preview
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Signature Required Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSignatureSaved}
        title="Faculty Signature Registration"
        description="Please register your official digital signature snapshot. Once registered, it will be automatically attached to your bill preview and official submissions."
      />

    </div>
  );
};
