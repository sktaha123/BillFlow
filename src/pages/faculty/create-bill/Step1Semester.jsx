import React from 'react';
import { Select } from '@/components/ui/Select';
import { ArrowRight, ChevronLeft, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

export const Step1Semester = ({
  draft,
  setDraft,
  academicYears,
  semesters,
  classes = [],
  onNext,
  onCancel,
}) => {
  const handleSemesterSelect = (sem) => {
    setDraft((prev) => ({
      ...prev,
      semester_id: sem.id,
      semester_label: sem.roman_label,
      session_type: sem.session_type,
    }));
  };

  const handleYearChange = (e) => {
    const selectedYear = academicYears.find((y) => y.id === e.target.value);
    setDraft((prev) => ({
      ...prev,
      academic_year_id: e.target.value,
      academic_year_label: selectedYear?.year_label,
    }));
  };

  const handleClassChange = (e) => {
    const selectedClass = classes.find((c) => c.id === e.target.value);
    setDraft((prev) => ({
      ...prev,
      class_id: e.target.value,
      class_name: selectedClass?.name || '',
    }));
  };

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentCalendarYear = new Date().getFullYear();
  const YEARS = [
    currentCalendarYear - 2,
    currentCalendarYear - 1,
    currentCalendarYear,
    currentCalendarYear + 1,
    currentCalendarYear + 2
  ].map(String);

  const parts = (draft.month_year || '').trim().split(/\s+/);
  const selectedMonth = MONTHS.find((m) => m.toLowerCase() === parts[0]?.toLowerCase()) || MONTHS[new Date().getMonth()];
  const selectedYear  = parts[1] || String(currentCalendarYear);

  const handleMonthChange = (e) => {
    setDraft((prev) => ({
      ...prev,
      month_year: `${e.target.value} ${selectedYear}`,
    }));
  };

  const handleYearSelectChange = (e) => {
    setDraft((prev) => ({
      ...prev,
      month_year: `${selectedMonth} ${e.target.value}`,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Step Heading */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Select Examination Period
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Choose the academic year, class, and semester for this paper-setting remuneration bill.
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 sm:p-7 space-y-6 shadow-2xs">
        
        {/* Academic Year Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
            Academic Year
          </label>
          <Select
            value={draft.academic_year_id}
            onChange={handleYearChange}
            options={academicYears.map((ay) => ({
              value: ay.id,
              label: ay.year_label + (ay.is_current ? ' (Current Academic Year)' : ''),
            }))}
          />
        </div>

        {/* Class Selector (Below Academic Year) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
            Class
          </label>
          <Select
            value={draft.class_id}
            onChange={handleClassChange}
            options={classes.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.department})`,
            }))}
          />
        </div>

        {/* Semesters Selector Grid (I to VI) */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
            Semester
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {semesters.map((sem) => {
              const isSelected = draft.semester_id === sem.id;
              return (
                <button
                  key={sem.id}
                  type="button"
                  onClick={() => handleSemesterSelect(sem)}
                  className={clsx(
                    'h-16 rounded-xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer',
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-xs scale-[1.02]'
                      : 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 text-slate-800'
                  )}
                >
                  <span className="text-base font-semibold">{sem.roman_label}</span>
                  <span className={clsx('text-[10px] mt-0.5', isSelected ? 'text-slate-300' : 'text-slate-400')}>
                    Sem
                  </span>
                </button>
              );
            })}
          </div>

          
        </div>

        {/* Month & Year Select Dropdowns */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
            Month &amp; Year of Examination
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Select
                value={selectedMonth}
                onChange={handleMonthChange}
                options={MONTHS.map((m) => ({ value: m, label: m }))}
              />
            </div>
            <div>
              <Select
                value={selectedYear}
                onChange={handleYearSelectChange}
                options={YEARS.map((y) => ({ value: y, label: y }))}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Cancel &amp; Return
        </button>

        <button
          disabled={!draft.semester_id}
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
        >
          Continue to Subject
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
