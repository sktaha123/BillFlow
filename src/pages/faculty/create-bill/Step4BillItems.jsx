import React from 'react';
import { Plus, Trash2, Edit3, ArrowRight, ChevronLeft, Layers } from 'lucide-react';
import { calculateBillCategoryTotals, formatCurrency } from '@/lib/calculations';

export const Step4BillItems = ({
  draft,
  onRemoveItem,
  onEditItem,
  onAddAnotherPaper,
  onNext,
  onBack,
}) => {
  const { totalSetting, totalTranslation, totalProof, grandTotal } = calculateBillCategoryTotals(draft.items);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Header - Clean title without top badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Bill Items &amp; Papers Summary
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Semester {draft.semester_label} • Academic Year {draft.academic_year_label}
          </p>
        </div>

        <button
          onClick={onAddAnotherPaper}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          Add Another Paper
        </button>
      </div>

      {/* Bill Items List Table */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-xs text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Sr</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-center">Sets</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {draft.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{draft.class_name || 'TYCS'}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900">{item.subject?.name || item.subject_name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.translation_sets > 0 ? `+ ${item.translation_sets} Translation ` : ''}
                      {item.proof_papers > 0 ? `+ ${item.proof_papers} Proof` : ''}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {item.paper_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                    {String(item.paper_sets || 0).padStart(2, '0')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(item.subtotal)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditItem(idx)}
                        title="Edit paper"
                        className="text-slate-400 hover:text-slate-900 transition-colors p-1.5 cursor-pointer rounded-lg hover:bg-slate-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(idx)}
                        disabled={draft.items.length <= 1}
                        title={draft.items.length <= 1 ? 'At least one paper is required' : 'Remove paper'}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors p-1.5 cursor-pointer rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Totals & Grand Total Summary Box */}
      <div className="bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 sm:p-7 space-y-5 shadow-2xs">
        

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Paper Setting</span>
            <span className="text-lg font-semibold font-mono text-slate-900 mt-1 block">{formatCurrency(totalSetting)}</span>
          </div>
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Translation</span>
            <span className="text-lg font-semibold font-mono text-slate-900 mt-1 block">{formatCurrency(totalTranslation)}</span>
          </div>
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Proof Checking</span>
            <span className="text-lg font-semibold font-mono text-slate-900 mt-1 block">{formatCurrency(totalProof)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Total Claim Amount</span>
          <span className="text-2xl font-bold font-mono text-slate-900">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer"
        >
          Review &amp; Verify Bill
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
