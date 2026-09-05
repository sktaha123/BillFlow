import React from 'react';
import { Plus, Trash2, Edit3, ArrowRight, ChevronLeft } from 'lucide-react';
import { calculateBillCategoryTotals, calculateGenericGrandTotal, formatCurrency } from '@/lib/calculations';

export const Step4BillItems = ({
  draft,
  billingMethod,
  onRemoveItem,
  onEditItem,
  onAddAnotherPaper,
  onNext,
  onBack,
}) => {
  const method = billingMethod || draft.billing_method || 'PAPER_SETTING';

  let grandTotal = 0;
  let categoryTotals = null;

  if (method === 'PAPER_SETTING') {
    categoryTotals = calculateBillCategoryTotals(draft.items);
    grandTotal = categoryTotals.grandTotal;
  } else {
    const generic = calculateGenericGrandTotal(draft.items);
    grandTotal = generic.grandTotal;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Step 4: Bill Items Summary
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
          Add Another Subject
        </button>
      </div>

      {/* Bill Items List Table — Billing Method Specific */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          {method === 'ANSWER_BOOK_ASSESSMENT' && (
            <table className="w-full min-w-[580px] text-xs text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Sr</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4 text-center">Level</th>
                  <th className="py-3.5 px-4 text-center">Sem End</th>
                  <th className="py-3.5 px-4 text-center">ATKT</th>
                  <th className="py-3.5 px-4 text-center">Internal</th>
                  <th className="py-3.5 px-4 text-right">Subtotal</th>
                  <th className="py-3.5 px-4 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {draft.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{item.class_name || draft.class_name || 'SYCS'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{item.subject?.name || item.subject_name}</td>
                    <td className="py-3.5 px-4 text-center font-semibold">{item.academic_level || 'UG'}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{item.semester_end_books || 0}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{item.atkt_books || 0}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{item.internal_books || 0}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(item.subtotal)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" onClick={() => onEditItem(idx)} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => onRemoveItem(idx)} disabled={draft.items.length <= 1} className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-20 rounded-lg hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
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
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4 text-center">Level</th>
                  <th className="py-3.5 px-4 text-center">Candidates</th>
                  <th className="py-3.5 px-4 text-right">Subtotal</th>
                  <th className="py-3.5 px-4 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {draft.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{item.class_name || draft.class_name || 'SYCS'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{item.subject?.name || item.subject_name}</td>
                    <td className="py-3.5 px-4 text-center font-semibold">{item.academic_level || 'UG'}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium">{item.practical_books || 0}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(item.subtotal)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" onClick={() => onEditItem(idx)} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => onRemoveItem(idx)} disabled={draft.items.length <= 1} className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-20 rounded-lg hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
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
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4 text-center">MCQs (SEE)</th>
                  <th className="py-3.5 px-4 text-center">Students (CIA)</th>
                  <th className="py-3.5 px-4 text-right">Upload Fee</th>
                  <th className="py-3.5 px-4 text-right">Subtotal</th>
                  <th className="py-3.5 px-4 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {draft.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{item.class_name || draft.class_name || 'FYCS'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{item.subject?.name || item.subject_name}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{item.mcq_count || 0}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{item.student_count || 0}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(item.upload_amount || 150)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(item.subtotal)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" onClick={() => onEditItem(idx)} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => onRemoveItem(idx)} disabled={draft.items.length <= 1} className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-20 rounded-lg hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
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
                        <button type="button" onClick={() => onEditItem(idx)} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => onRemoveItem(idx)} disabled={draft.items.length <= 1} className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-20 rounded-lg hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Category Totals & Grand Total Summary Box */}
      <div className="bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 sm:p-7 space-y-5 shadow-2xs">
        {method === 'PAPER_SETTING' && categoryTotals && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Paper Setting</span>
              <span className="text-lg font-semibold font-mono text-slate-900 mt-1 block">{formatCurrency(categoryTotals.totalSetting)}</span>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Translation</span>
              <span className="text-lg font-semibold font-mono text-slate-900 mt-1 block">{formatCurrency(categoryTotals.totalTranslation)}</span>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Proof Checking</span>
              <span className="text-lg font-semibold font-mono text-slate-900 mt-1 block">{formatCurrency(categoryTotals.totalProof)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
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
