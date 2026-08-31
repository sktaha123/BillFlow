import React from 'react';
import { Eye, Edit3, ShieldCheck } from 'lucide-react';
import { calculateBillCategoryTotals, formatCurrency } from '@/lib/calculations';

export const Step5ReviewBill = ({
  draft,
  faculty,
  onEditBill,
  onContinueToPreview,
  onBack,
}) => {
  const { totalSetting, totalTranslation, totalProof, grandTotal, amountInWords } = calculateBillCategoryTotals(draft.items);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Review &amp; Verify Bill
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Please verify all information and remuneration amounts before generating the official document preview.
        </p>
      </div>

      {/* Verification notice card */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5 text-xs">
        <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">Digital Verification Notice</p>
          <p className="text-slate-500 leading-relaxed">
            Upon confirmation, your immutable digital signature snapshot will be attached and forwarded directly to the Head of Department.
          </p>
        </div>
      </div>

      {/* 1. Bill Information Block */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-2xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Faculty &amp; Period Details
        </h3>
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

      {/* 2. Paper Items Summary */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Paper Courses ({draft.items.length})
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
                  {it.paper_type} • {it.paper_sets} Sets
                  {it.translation_sets > 0 ? ` • ${it.translation_sets} Translation` : ''}
                  {it.proof_papers > 0 ? ` • ${it.proof_papers} Proof` : ''}
                </p>
              </div>
              <span className="font-mono font-semibold text-slate-900 text-sm">{formatCurrency(it.subtotal)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Cost Breakdown & Amount in Words */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-2xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Remuneration Calculation Summary
        </h3>
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Paper Setting Total</span>
            <span className="font-mono font-medium text-slate-900">{formatCurrency(totalSetting)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Translation Total</span>
            <span className="font-mono font-medium text-slate-900">{formatCurrency(totalTranslation)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Proof Checking Total</span>
            <span className="font-mono font-medium text-slate-900">{formatCurrency(totalProof)}</span>
          </div>
          
          <div className="flex justify-between pt-3 text-base font-semibold text-slate-900">
            <span>Grand Total Payable</span>
            <span className="font-mono text-xl font-bold">{formatCurrency(grandTotal)}</span>
          </div>

          <div className="pt-2 text-[11px] bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 mt-2">
            <span className="font-medium text-slate-400 uppercase tracking-wide block text-[10px]">Amount in Words</span>
            <span className="font-semibold text-slate-800 text-xs mt-0.5 block italic">{amountInWords}</span>
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
          onClick={onContinueToPreview}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer"
        >
          Proceed to Official Bill Preview
          <Eye className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
