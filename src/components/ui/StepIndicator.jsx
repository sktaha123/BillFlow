import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

const STEPS = [
  { id: 1, name: 'Semester' },
  { id: 2, name: 'Subject' },
  { id: 3, name: 'Rates & Sets' },
  { id: 4, name: 'Items List' },
  { id: 5, name: 'Review & Submit' },
];

export const StepIndicator = ({ currentStep }) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between relative">
        
        {/* Background connecting bar */}
        <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-[1.5px] bg-slate-100 z-0" />

        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              {/* Step circle node */}
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200',
                  isCompleted
                    ? 'bg-slate-900 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-slate-900 text-white shadow-sm ring-4 ring-slate-100 scale-105'
                    : 'bg-white border border-slate-200 text-slate-400'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.id}
              </div>

              {/* Step label text */}
              <span
                className={clsx(
                  'text-[11px] mt-2 font-medium tracking-tight text-center hidden sm:block transition-colors',
                  isCurrent ? 'text-slate-900 font-semibold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                )}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
