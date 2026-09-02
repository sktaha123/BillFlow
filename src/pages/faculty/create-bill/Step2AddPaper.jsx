import React from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { ArrowRight, ChevronLeft, BookOpen, Code2 } from 'lucide-react';
import { clsx } from 'clsx';

export const Step2AddPaper = ({
  currentItem,
  setCurrentItem,
  subjects,
  hasExistingItems = false,
  onCancelToAddMore,
  onNext,
  onBack,
}) => {
  const handleSubjectChange = (e) => {
    const subId = e.target.value;
    const subObj = subjects.find((s) => s.id === subId);
    setCurrentItem((prev) => ({
      ...prev,
      subject_id: subId,
      subject_name: subObj?.name || '',
      subject: subObj,
    }));
  };

  const handleTypeSelect = (type) => {
    setCurrentItem((prev) => ({
      ...prev,
      paper_type: type,
    }));
  };

  const isValid = Boolean(currentItem.subject_id && currentItem.paper_type);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Add Paper Details
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Specify the subject course and examination mode.
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 sm:p-7 space-y-5 shadow-2xs">
        
        {/* Subject Selection */}
        <div className="space-y-1.5">
          <Select
            label="Subject / Course Name"
            value={currentItem.subject_id}
            onChange={handleSubjectChange}
            options={[
              { value: '', label: 'Select Course Subject' },
              ...subjects.map((s) => ({
                value: s.id,
                label: s.name,
              })),
            ]}
          />
        </div>

        {/* Number of Students */}
        <div className="space-y-1.5">
          <Input
            label="No. of Students Enrolled (Optional)"
            type="number"
            min={0}
            placeholder="e.g. 60"
            value={currentItem.student_count || ''}
            onChange={(e) =>
              setCurrentItem((prev) => ({ ...prev, student_count: e.target.value }))
            }
          />
        </div>

        {/* Examination Type Selector */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
            Examination Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeSelect('THEORY')}
              className={clsx(
                'p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer',
                currentItem.paper_type === 'THEORY'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 text-slate-900'
              )}
            >
              <div className={clsx('p-2 rounded-lg shrink-0', currentItem.paper_type === 'THEORY' ? 'bg-white/20 text-white' : 'bg-white text-slate-700 shadow-2xs')}>
                <BookOpen className="w-4 h-4" />
                
              </div>
             
                <p className="text-sm font-semibold self-center tracking-tight">Theory Paper</p>
               
              
            </button>

            <button
              type="button"
              onClick={() => handleTypeSelect('PRACTICAL')}
              className={clsx(
                'p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer',
                currentItem.paper_type === 'PRACTICAL'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 text-slate-900'
              )}
            >
              <div className={clsx('p-2 rounded-lg shrink-0', currentItem.paper_type === 'PRACTICAL' ? 'bg-white/20 text-white' : 'bg-white text-slate-700 shadow-2xs')}>
                <Code2 className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold self-center tracking-tight">Practical Paper</p>
            </button>
          </div>
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

        <div className="flex items-center gap-2.5">
          {hasExistingItems && (
            <button
              type="button"
              onClick={onCancelToAddMore}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
            >
              Cancel &amp; Continue with Added Items
            </button>
          )}

          <button
            disabled={!isValid}
            onClick={onNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            Continue to Rates
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
