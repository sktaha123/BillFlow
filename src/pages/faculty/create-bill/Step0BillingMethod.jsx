import React from 'react';
import { FileText, BookOpen, FlaskConical, Monitor, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

const BILLING_METHODS = [
  {
    id: 'PAPER_SETTING',
    label: 'Paper Setting',
    description: 'Remuneration for setting theory / practical examination papers.',
    icon: FileText,
  },
  {
    id: 'ANSWER_BOOK_ASSESSMENT',
    label: 'Assessment of Answer Books',
    description: 'Assessment remuneration for semester-end, ATKT, and internal answer books.',
    icon: BookOpen,
  },
  {
    id: 'PRACTICAL_ASSESSMENT',
    label: 'Assessment of Answer Practical Examination',
    description: 'Remuneration for assessing practical examination answer books.',
    icon: FlaskConical,
  },
  {
    id: 'ONLINE_EXAMINATION_NEP',
    label: 'Assessment for Online Examination (NEP)',
    description: 'Remuneration for SEE MCQ, Answer Key, CIA, and question paper upload.',
    icon: Monitor,
  },
];

export const Step0BillingMethod = ({ selectedMethod, onSelect, onNext, onCancel }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">

      {/* Heading */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Select Billing Method
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Choose the type of remuneration bill you wish to create.
        </p>
      </div>

      {/* Method Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BILLING_METHODS.map((method) => {
          const Icon       = method.icon;
          const isSelected = selectedMethod === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={clsx(
                'w-full text-left p-5 rounded-xl border transition-all cursor-pointer space-y-2.5',
                isSelected
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm scale-[1.01]'
                  : 'border-slate-200/80 bg-white/90 hover:border-slate-400 hover:bg-slate-50 text-slate-800'
              )}
            >
              <div className="flex items-center gap-3">
                <span className={clsx(
                  'flex items-center justify-center w-9 h-9 rounded-xl shrink-0',
                  isSelected ? 'bg-white/15' : 'bg-slate-100'
                )}>
                  <Icon className={clsx('w-4.5 h-4.5', isSelected ? 'text-white' : 'text-slate-600')} size={18} />
                </span>
                <span className={clsx('text-sm font-semibold leading-tight', isSelected ? 'text-white' : 'text-slate-900')}>
                  {method.label}
                </span>
              </div>
              <p className={clsx('text-xs leading-relaxed', isSelected ? 'text-slate-300' : 'text-slate-500')}>
                {method.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Cancel &amp; Return
        </button>

        <button
          disabled={!selectedMethod}
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
