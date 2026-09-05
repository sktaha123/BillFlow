import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRight, ChevronLeft, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import {
  calculateAnswerBookItemSubtotal,
  calculateGenericGrandTotal,
  getAnswerBookSemEndRate,
  formatCurrency,
  DEFAULT_RATES,
} from '@/lib/calculations';

const LEVELS = [
  { value: 'UG',  label: 'UG (₹8/book)' },
  { value: 'PG',  label: 'PG (₹10/book)' },
  { value: 'MSC', label: 'PG M.Sc. (₹15/book)' },
];

const emptyRow = (classId = '', subjectId = '', classOptions = [], subjectOptions = []) => ({
  _id:              Date.now() + Math.random(),
  class_id:         classId,
  class_name:       classOptions.find(c => c.id === classId)?.name || '',
  subject_id:       subjectId,
  subject_name:     subjectOptions.find(s => s.id === subjectId)?.name || '',
  level:            'UG',
  semester_end_books: 0,
  atkt_books:       0,
  internal_books:   0,
  semester_end_rate:  DEFAULT_RATES.answer_book_ug_rate,
  atkt_rate:          DEFAULT_RATES.answer_book_ug_rate,
  internal_rate:      DEFAULT_RATES.internal_assessment_rate,
  semester_end_amount: 0,
  atkt_amount:        0,
  internal_amount:    0,
  subtotal:           0,
});

export const AnswerBookForm = ({
  draft,
  setDraft,
  academicYears,
  semesters,
  classes,
  subjects,
  settings,
  faculty,
  onNext,
  onBack,
}) => {
  const [rows, setRows] = useState([emptyRow()]);
  const [errors, setErrors] = useState({});

  // Sync grand total into draft whenever rows change
  useEffect(() => {
    const { grandTotal, amountInWords } = calculateGenericGrandTotal(rows);
    setDraft(prev => ({
      ...prev,
      items:           rows,
      grand_total:     grandTotal,
      amount_in_words: amountInWords,
    }));
  }, [rows, setDraft]);

  // Recalculate a row when level or book counts change
  const recalcRow = (row) => {
    const semEndRate  = getAnswerBookSemEndRate(row.level, settings || DEFAULT_RATES);
    const internalRate = Number((settings || DEFAULT_RATES).internal_assessment_rate);
    const { semester_end_amount, atkt_amount, internal_amount, subtotal } =
      calculateAnswerBookItemSubtotal(
        row.semester_end_books,
        row.atkt_books,
        row.internal_books,
        semEndRate,
        semEndRate,
        internalRate
      );
    return {
      ...row,
      semester_end_rate:   semEndRate,
      atkt_rate:           semEndRate,
      internal_rate:       internalRate,
      semester_end_amount,
      atkt_amount,
      internal_amount,
      subtotal,
    };
  };

  const updateRow = (idx, field, value) => {
    setRows(prev => {
      const updated = prev.map((r, i) => {
        if (i !== idx) return r;
        const patched = { ...r, [field]: value };
        // Update class_name or subject_name helpers
        if (field === 'class_id')   patched.class_name   = classes.find(c => c.id === value)?.name || '';
        if (field === 'subject_id') patched.subject_name = subjects.find(s => s.id === value)?.name || '';
        return recalcRow(patched);
      });
      return updated;
    });
    setErrors(prev => { const e = { ...prev }; delete e[`${idx}_${field}`]; return e; });
  };

  const addRow = () => setRows(prev => [...prev, emptyRow()]);

  const removeRow = (idx) => {
    if (rows.length === 1) return;
    setRows(prev => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const errs = {};
    if (!draft.semester_id)      errs.semester_id      = 'Semester is required.';
    if (!draft.academic_year_id) errs.academic_year_id = 'Academic year is required.';

    rows.forEach((row, idx) => {
      if (!row.subject_id && !row.subject_name) errs[`${idx}_subject_id`] = 'Subject required';
      const total = Number(row.semester_end_books) + Number(row.atkt_books) + Number(row.internal_books);
      if (total <= 0) errs[`${idx}_books`] = 'Enter at least one answer book count';
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    onNext();
  };

  const inputCls = 'w-full px-3 py-2 bg-slate-50/70 text-slate-900 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all';
  const numCls   = 'w-full px-2 py-2 bg-slate-50/70 text-slate-900 border border-slate-200/80 rounded-xl text-xs text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all';
  const errCls   = 'border-rose-300 focus:ring-rose-200';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">

      {/* Heading */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Assessment of Answer Books
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Enter the class, subject, and answer book counts. Amounts are calculated automatically.
        </p>
      </div>

      {/* Bill Info */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 space-y-5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Academic Year */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">Academic Year</label>
            <select
              value={draft.academic_year_id}
              onChange={e => {
                const ay = academicYears.find(y => y.id === e.target.value);
                setDraft(prev => ({ ...prev, academic_year_id: e.target.value, academic_year_label: ay?.year_label || '' }));
              }}
              className={clsx(inputCls, errors.academic_year_id && errCls)}
            >
              {academicYears.map(ay => (
                <option key={ay.id} value={ay.id}>{ay.year_label}{ay.is_current ? ' (Current)' : ''}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">Semester</label>
            <div className="grid grid-cols-6 gap-1.5">
              {semesters.map(sem => {
                const isSelected = draft.semester_id === sem.id;
                return (
                  <button
                    key={sem.id}
                    type="button"
                    onClick={() => setDraft(prev => ({ ...prev, semester_id: sem.id, semester_label: sem.roman_label, session_type: sem.session_type }))}
                    className={clsx(
                      'h-12 rounded-xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer',
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                        : 'border-slate-200/80 bg-slate-50/60 hover:bg-white text-slate-800'
                    )}
                  >
                    <span className="text-xs font-semibold">{sem.roman_label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Month & Year */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">Month &amp; Year</label>
            <input
              type="text"
              placeholder="e.g. October 2026"
              value={draft.month_year || ''}
              onChange={e => setDraft(prev => ({ ...prev, month_year: e.target.value }))}
              className={inputCls}
            />
          </div>

          {/* HOD Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">Name of HOD</label>
            <input
              type="text"
              placeholder="e.g. Prof. Vinod Rajput"
              value={draft.hod_name || ''}
              onChange={e => setDraft(prev => ({ ...prev, hod_name: e.target.value }))}
              className={inputCls}
            />
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">Department</label>
            <input
              type="text"
              value={faculty?.department || 'Computer Science'}
              readOnly
              className={clsx(inputCls, 'bg-slate-100/60 cursor-default')}
            />
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Answer Book Rows</h3>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 w-8 text-center">#</th>
                <th className="py-3 px-3 min-w-[130px]">Class</th>
                <th className="py-3 px-3 min-w-[160px]">Subject / Course</th>
                <th className="py-3 px-3 min-w-[100px]">Level</th>
                <th className="py-3 px-3 text-center w-20">Sem End<br/>Books</th>
                <th className="py-3 px-3 text-center w-16">ATKT<br/>Books</th>
                <th className="py-3 px-3 text-center w-20">Internal<br/>Books</th>
                <th className="py-3 px-3 text-right">Sem End<br/>Amount</th>
                <th className="py-3 px-3 text-right">ATKT<br/>Amount</th>
                <th className="py-3 px-3 text-right">Internal<br/>Amount</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr key={row._id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>

                  {/* Class */}
                  <td className="py-2 px-3">
                    <select
                      value={row.class_id}
                      onChange={e => updateRow(idx, 'class_id', e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Select…</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>

                  {/* Subject */}
                  <td className="py-2 px-3">
                    <select
                      value={row.subject_id}
                      onChange={e => updateRow(idx, 'subject_id', e.target.value)}
                      className={clsx(inputCls, errors[`${idx}_subject_id`] && errCls)}
                    >
                      <option value="">Select…</option>
                      {(row.class_id ? subjects.filter(s => s.class_id === row.class_id) : subjects).map(s =>
                        <option key={s.id} value={s.id}>{s.name}</option>
                      )}
                    </select>
                    {errors[`${idx}_subject_id`] && (
                      <p className="text-rose-500 text-[10px] mt-0.5">{errors[`${idx}_subject_id`]}</p>
                    )}
                  </td>

                  {/* Level */}
                  <td className="py-2 px-3">
                    <select
                      value={row.level}
                      onChange={e => updateRow(idx, 'level', e.target.value)}
                      className={inputCls}
                    >
                      {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </td>

                  {/* Book Counts */}
                  <td className="py-2 px-3">
                    <input type="number" min="0" value={row.semester_end_books}
                      onChange={e => updateRow(idx, 'semester_end_books', Math.max(0, Number(e.target.value)))}
                      className={clsx(numCls, errors[`${idx}_books`] && errCls)} />
                  </td>
                  <td className="py-2 px-3">
                    <input type="number" min="0" value={row.atkt_books}
                      onChange={e => updateRow(idx, 'atkt_books', Math.max(0, Number(e.target.value)))}
                      className={numCls} />
                  </td>
                  <td className="py-2 px-3">
                    <input type="number" min="0" value={row.internal_books}
                      onChange={e => updateRow(idx, 'internal_books', Math.max(0, Number(e.target.value)))}
                      className={numCls} />
                  </td>

                  {/* Amounts */}
                  <td className="py-2 px-3 text-right font-mono text-slate-600 whitespace-nowrap">{row.semester_end_amount > 0 ? formatCurrency(row.semester_end_amount) : '—'}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600 whitespace-nowrap">{row.atkt_amount > 0 ? formatCurrency(row.atkt_amount) : '—'}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600 whitespace-nowrap">{row.internal_amount > 0 ? formatCurrency(row.internal_amount) : '—'}</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">{row.subtotal > 0 ? formatCurrency(row.subtotal) : '—'}</td>

                  {/* Remove */}
                  <td className="py-2 px-3 text-center">
                    <button type="button" onClick={() => removeRow(idx)} disabled={rows.length === 1}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Validation error */}
        {Object.keys(errors).some(k => k.includes('_books')) && (
          <p className="text-rose-500 text-xs px-5 py-2">Please enter at least one answer book count per row.</p>
        )}

        {/* Grand Total Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-4">
          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Grand Total</span>
          <span className="font-mono text-lg font-bold text-slate-900">{formatCurrency(draft.grand_total || 0)}</span>
        </div>
      </div>

      {/* Rate Info */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 flex items-start gap-2">
        <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>Rates — UG Semester End: ₹{(settings || DEFAULT_RATES).answer_book_ug_rate}/book &nbsp;|&nbsp;
          PG: ₹{(settings || DEFAULT_RATES).answer_book_pg_rate}/book &nbsp;|&nbsp;
          M.Sc.: ₹{(settings || DEFAULT_RATES).answer_book_msc_rate}/book &nbsp;|&nbsp;
          Internal Assessment: ₹{(settings || DEFAULT_RATES).internal_assessment_rate}/candidate
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={handleNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer">
          Review Bill <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
