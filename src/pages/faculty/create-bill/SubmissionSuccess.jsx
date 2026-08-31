import React from 'react';
import { Check, Eye, Home } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

export const SubmissionSuccess = ({
  submittedBill,
  onViewBill,
  onReturnHome,
}) => {
  return (
    <div className="max-w-md mx-auto py-10 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Check icon with glowing ring */}
      <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto shadow-md ring-8 ring-slate-100">
        <Check className="w-8 h-8 stroke-[2.5]" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Bill Submitted Successfully
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
          Your remuneration claim and digital signature snapshot have been queued for HOD endorsement.
        </p>
      </div>

      {/* Bill summary card */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 text-left text-xs space-y-3 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wide">Reference ID</span>
          <span className="font-mono font-semibold text-sm text-slate-900">{submittedBill?.bill_reference_id}</span>
        </div>

        <div className="flex justify-between items-center text-slate-600">
          <span>Semester</span>
          <span className="font-semibold text-slate-900">Semester {submittedBill?.semester?.roman_label}</span>
        </div>

        <div className="flex justify-between items-center text-slate-600">
          <span>Class / Branch</span>
          <span className="font-semibold text-slate-900">{submittedBill?.class?.name || 'TYCS'}</span>
        </div>

        <div className="flex justify-between items-center text-slate-600">
          <span>Total Remuneration</span>
          <span className="font-mono font-semibold text-slate-900 text-sm">{formatCurrency(submittedBill?.grand_total)}</span>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="text-slate-500">Status</span>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/80">
            Pending HOD Approval
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onReturnHome}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
        >
          <Home className="w-4 h-4 text-slate-400" />
          Return to Dashboard
        </button>

        <button
          onClick={() => onViewBill(submittedBill?.id)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          View Submitted Bill
        </button>
      </div>

    </div>
  );
};
