import React, { useState } from 'react';
import { Eye, Edit3, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { SignatureModal } from '@/components/signature/SignatureModal';

const BILLING_METHOD_LABELS = {
  ANSWER_BOOK_ASSESSMENT: 'Assessment of Answer Books',
  PRACTICAL_ASSESSMENT:   'Assessment of Answer Practical Examination',
  ONLINE_EXAMINATION_NEP: 'Assessment for Online Examination (NEP)',
};

// Render the correct items summary based on billing method
const ItemsSummary = ({ billingMethod, items }) => {
  if (!items || items.length === 0) {
    return <p className="text-xs text-slate-400 py-3">No items added.</p>;
  }

  if (billingMethod === 'ANSWER_BOOK_ASSESSMENT') {
    return (
      <div className="divide-y divide-slate-100 text-xs">
        {items.map((it, idx) => (
          <div key={it._id || idx} className="py-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900 text-sm">{it.subject_name || 'Subject'}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {it.class_name && <span>{it.class_name} &nbsp;•&nbsp; </span>}
                Level: {it.level}&nbsp;
                {Number(it.semester_end_books) > 0 && `| Sem End: ${it.semester_end_books} `}
                {Number(it.atkt_books) > 0 && `| ATKT: ${it.atkt_books} `}
                {Number(it.internal_books) > 0 && `| Internal: ${it.internal_books}`}
              </p>
            </div>
            <span className="font-mono font-semibold text-slate-900 text-sm shrink-0">{formatCurrency(it.subtotal)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (billingMethod === 'PRACTICAL_ASSESSMENT') {
    return (
      <div className="divide-y divide-slate-100 text-xs">
        {items.map((it, idx) => (
          <div key={it._id || idx} className="py-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900 text-sm">{it.subject_name || 'Subject'}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Level: {it.level} &nbsp;•&nbsp;
                {it.practical_books} Practical Books @ ₹{it.practical_rate}
              </p>
            </div>
            <span className="font-mono font-semibold text-slate-900 text-sm shrink-0">{formatCurrency(it.subtotal)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (billingMethod === 'ONLINE_EXAMINATION_NEP') {
    return (
      <div className="divide-y divide-slate-100 text-xs">
        {items.map((it, idx) => (
          <div key={it._id || idx} className="py-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900 text-sm">{it.subject_name || 'Subject'}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {it.class_name && <span>{it.class_name} &nbsp;•&nbsp; </span>}
                MCQ: {it.mcq_count} &nbsp;•&nbsp; Students: {it.student_count}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                SEE {formatCurrency(it.see_amount)} + Key {formatCurrency(it.answer_key_amount)} + CIA {formatCurrency(it.cia_amount)} + Upload {formatCurrency(it.upload_amount)}
              </p>
            </div>
            <span className="font-mono font-semibold text-slate-900 text-sm shrink-0">{formatCurrency(it.subtotal)}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export const NewMethodReview = ({
  draft,
  billingMethod,
  faculty,
  onEditBill,
  onContinueToPreview,
  onSaveSignature,
}) => {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const handleProceed = () => {
    if (!faculty?.signature_path) {
      setIsSignatureModalOpen(true);
      return;
    }
    onContinueToPreview();
  };

  const handleSignatureSaved = async (signatureDataUrl) => {
    if (onSaveSignature) await onSaveSignature(signatureDataUrl);
    setIsSignatureModalOpen(false);
    onContinueToPreview();
  };

  const methodLabel = BILLING_METHOD_LABELS[billingMethod] || billingMethod;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">

      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Review &amp; Verify Bill
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Please verify all information before generating the official document preview.
        </p>
      </div>

      {/* Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5 text-xs">
        <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">Digital Verification Notice</p>
          <p className="text-slate-500 leading-relaxed">
            Upon confirmation, your immutable digital signature snapshot will be attached and forwarded to the Head of Department.
          </p>
        </div>
      </div>

      {/* Bill Info */}
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
          {draft.month_year && (
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Month &amp; Year</span>
              <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{draft.month_year}</span>
            </div>
          )}
          {draft.hod_name && (
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">HOD</span>
              <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">{draft.hod_name}</span>
            </div>
          )}
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60 col-span-2 sm:col-span-2">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Billing Method</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{methodLabel}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Bill Items ({draft.items?.length || 0})
          </h3>
          <button onClick={onEditBill}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
        <ItemsSummary billingMethod={billingMethod} items={draft.items || []} />
      </div>

      {/* Total */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 space-y-3 shadow-2xs">
        <div className="flex justify-between pt-1 text-base font-semibold text-slate-900">
          <span>Grand Total Payable</span>
          <span className="font-mono text-xl font-bold">{formatCurrency(draft.grand_total || 0)}</span>
        </div>
        {draft.amount_in_words && (
          <p className="text-[11px] text-slate-500 italic border-t border-slate-100 pt-3">{draft.amount_in_words}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onEditBill}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
          <Edit3 className="w-4 h-4" /> Edit Items
        </button>
        <button onClick={handleProceed}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer">
          Proceed to Official Bill Preview
          <Eye className="w-4 h-4" />
        </button>
      </div>

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSignatureSaved}
        title="Faculty Signature Registration"
        description="Please register your official digital signature snapshot. It will be attached to your bill and official submission."
      />
    </div>
  );
};
