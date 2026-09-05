import React, { useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { ArrowRight, ChevronLeft, Plus } from 'lucide-react';
import {
  calculateItemSubtotal,
  calculateAnswerBookItemSubtotal,
  calculatePracticalItemSubtotal,
  calculateOnlineNepItemSubtotal,
  getAnswerBookSemEndRate,
  getPracticalRate,
  formatCurrency,
} from '@/lib/calculations';

export const Step3PaperDetails = ({
  currentItem,
  setCurrentItem,
  settings,
  billingMethod,
  onAddMore,
  onContinue,
  onBack,
}) => {
  const method = billingMethod || 'PAPER_SETTING';

  // ─── PAPER SETTING CALCULATIONS ───
  const settingRate = settings?.paper_setting_rate || 400;
  const translationRate = settings?.translation_rate || 250;
  const proofRate = settings?.proof_checking_rate || 100;

  // ─── ANSWER BOOK CALCULATIONS ───
  const level = currentItem.academic_level || 'UG';
  const semEndRate = getAnswerBookSemEndRate(level, settings);
  const atktRate = semEndRate;
  const intRate = Number(settings?.internal_assessment_rate) || 4;

  // ─── PRACTICAL CALCULATIONS ───
  const practicalRate = getPracticalRate(level, settings);

  // ─── ONLINE NEP CALCULATIONS ───
  const seeRate = Number(settings?.online_nep_see_rate) || 7;
  const answerKeyRate = Number(settings?.online_nep_answer_key_rate) || 2;
  const ciaRate = Number(settings?.online_nep_cia_rate) || 4;
  const uploadRate = Number(settings?.online_nep_upload_rate) || 150;

  // Auto recalculate subtotal on any field change
  useEffect(() => {
    if (method === 'ANSWER_BOOK_ASSESSMENT') {
      const semEndBooks = Number(currentItem.semester_end_books) || 0;
      const atktBooks = Number(currentItem.atkt_books) || 0;
      const intBooks = Number(currentItem.internal_books) || 0;

      const calc = calculateAnswerBookItemSubtotal(semEndBooks, atktBooks, intBooks, semEndRate, atktRate, intRate);

      setCurrentItem((prev) => ({
        ...prev,
        semester_end_rate: semEndRate,
        atkt_rate: atktRate,
        internal_rate: intRate,
        semester_end_amount: calc.semester_end_amount,
        atkt_amount: calc.atkt_amount,
        internal_amount: calc.internal_amount,
        subtotal: calc.subtotal,
      }));
    } else if (method === 'PRACTICAL_ASSESSMENT') {
      const practicalBooks = Number(currentItem.practical_books) || 0;
      const calc = calculatePracticalItemSubtotal(practicalBooks, practicalRate);

      setCurrentItem((prev) => ({
        ...prev,
        practical_rate: practicalRate,
        practical_amount: calc.practical_amount,
        subtotal: calc.subtotal,
      }));
    } else if (method === 'ONLINE_EXAMINATION_NEP') {
      const mcqCount = Number(currentItem.mcq_count) || 0;
      const studentCount = Number(currentItem.student_count) || 0;
      const calc = calculateOnlineNepItemSubtotal(mcqCount, studentCount, seeRate, answerKeyRate, ciaRate, uploadRate);

      setCurrentItem((prev) => ({
        ...prev,
        see_rate: seeRate,
        answer_key_rate: answerKeyRate,
        cia_rate: ciaRate,
        upload_rate: uploadRate,
        see_amount: calc.see_amount,
        answer_key_amount: calc.answer_key_amount,
        cia_amount: calc.cia_amount,
        upload_amount: calc.upload_amount,
        subtotal: calc.subtotal,
      }));
    } else {
      // PAPER SETTING
      const calc = calculateItemSubtotal(
        currentItem.paper_sets,
        settingRate,
        currentItem.translation_sets,
        translationRate,
        currentItem.proof_papers,
        proofRate
      );

      setCurrentItem((prev) => ({
        ...prev,
        setting_rate: settingRate,
        setting_amount: calc.settingAmount,
        translation_rate: translationRate,
        translation_amount: calc.translationAmount,
        proof_rate: proofRate,
        proof_amount: calc.proofAmount,
        subtotal: calc.subtotal,
      }));
    }
  }, [
    method,
    level,
    currentItem.paper_sets,
    currentItem.translation_sets,
    currentItem.proof_papers,
    currentItem.semester_end_books,
    currentItem.atkt_books,
    currentItem.internal_books,
    currentItem.practical_books,
    currentItem.mcq_count,
    currentItem.student_count,
    settingRate,
    translationRate,
    proofRate,
    semEndRate,
    practicalRate,
    seeRate,
    answerKeyRate,
    ciaRate,
    uploadRate,
  ]);

  const isValid = method === 'ANSWER_BOOK_ASSESSMENT'
    ? (Number(currentItem.semester_end_books) > 0 || Number(currentItem.atkt_books) > 0 || Number(currentItem.internal_books) > 0)
    : method === 'PRACTICAL_ASSESSMENT'
    ? Number(currentItem.practical_books) > 0
    : method === 'ONLINE_EXAMINATION_NEP'
    ? (Number(currentItem.mcq_count) > 0 || Number(currentItem.student_count) > 0)
    : Number(currentItem.paper_sets) > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Step Heading */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Step 3: Item Quantities &amp; Details
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Enter examination quantities and parameters for <strong className="text-slate-700">{currentItem.subject_name || 'Subject'}</strong>.
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 sm:p-7 space-y-5 shadow-2xs">
        
        {/* ─── 1. MODERATION / ANSWER BOOK ASSESSMENT FIELDS ─── */}
        {method === 'ANSWER_BOOK_ASSESSMENT' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Level</label>
              <select
                value={currentItem.academic_level || 'UG'}
                onChange={(e) => setCurrentItem((prev) => ({ ...prev, academic_level: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
              >
                <option value="UG">UG (Undergraduate) — ₹8/book</option>
                <option value="PG">PG (Postgraduate) — ₹10/book</option>
                <option value="MSC">M.Sc. — ₹15/book</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Semester End Books"
                type="number"
                min={0}
                placeholder="0"
                value={currentItem.semester_end_books || ''}
                onChange={(e) => setCurrentItem((prev) => ({ ...prev, semester_end_books: Math.max(0, parseInt(e.target.value) || 0) }))}
                helperText={`Rate: ₹${semEndRate}/book`}
              />

              <Input
                label="ATKT Books"
                type="number"
                min={0}
                placeholder="0"
                value={currentItem.atkt_books || ''}
                onChange={(e) => setCurrentItem((prev) => ({ ...prev, atkt_books: Math.max(0, parseInt(e.target.value) || 0) }))}
                helperText={`Rate: ₹${atktRate}/book`}
              />

              <Input
                label="Internal Ass. Books"
                type="number"
                min={0}
                placeholder="0"
                value={currentItem.internal_books || ''}
                onChange={(e) => setCurrentItem((prev) => ({ ...prev, internal_books: Math.max(0, parseInt(e.target.value) || 0) }))}
                helperText={`Rate: ₹${intRate}/book`}
              />
            </div>
          </>
        )}

        {/* ─── 2. PRACTICAL ASSESSMENT FIELDS ─── */}
        {method === 'PRACTICAL_ASSESSMENT' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Level</label>
              <select
                value={currentItem.academic_level || 'UG'}
                onChange={(e) => setCurrentItem((prev) => ({ ...prev, academic_level: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
              >
                <option value="UG">UG (Undergraduate) — ₹25/student</option>
                <option value="PG">PG (Postgraduate) — ₹30/student</option>
              </select>
            </div>

            <Input
              label="No. of Candidates Examined (Practical Books)"
              type="number"
              min={1}
              placeholder="e.g. 81"
              value={currentItem.practical_books || ''}
              onChange={(e) => setCurrentItem((prev) => ({ ...prev, practical_books: Math.max(0, parseInt(e.target.value) || 0) }))}
              helperText={`Official college rate: ₹${practicalRate} per candidate`}
            />
          </>
        )}

        {/* ─── 3. ONLINE EXAMINATION NEP FIELDS ─── */}
        {method === 'ONLINE_EXAMINATION_NEP' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="SEE (No. of MCQs)"
                type="number"
                min={0}
                placeholder="e.g. 30"
                value={currentItem.mcq_count || ''}
                onChange={(e) => setCurrentItem((prev) => ({ ...prev, mcq_count: Math.max(0, parseInt(e.target.value) || 0) }))}
                helperText={`Rates: SEE = ₹${seeRate}/MCQ, Answer Key = ₹${answerKeyRate}/MCQ`}
              />

              <Input
                label="CIA (No. of Students)"
                type="number"
                min={0}
                placeholder="e.g. 84"
                value={currentItem.student_count || ''}
                onChange={(e) => setCurrentItem((prev) => ({ ...prev, student_count: Math.max(0, parseInt(e.target.value) || 0) }))}
                helperText={`Rate: CIA = ₹${ciaRate}/student`}
              />
            </div>
          </>
        )}

        {/* ─── 4. PAPER SETTING FIELDS ─── */}
        {method === 'PAPER_SETTING' && (
          <>
            <Input
              label="Number of Paper Sets (Required)"
              type="number"
              min={1}
              value={currentItem.paper_sets || ''}
              onChange={(e) => setCurrentItem((prev) => ({ ...prev, paper_sets: Math.max(0, parseInt(e.target.value) || 0) }))}
              helperText={`Official rate: ${formatCurrency(settingRate)} per set`}
            />

            <Input
              label="Translation Sets (Optional)"
              type="number"
              min={0}
              placeholder="0"
              value={currentItem.translation_sets || ''}
              onChange={(e) => setCurrentItem((prev) => ({ ...prev, translation_sets: Math.max(0, parseInt(e.target.value) || 0) }))}
              helperText={`Official rate: ${formatCurrency(translationRate)} per translated set`}
            />

            <Input
              label="Proof Checking Papers (Optional)"
              type="number"
              min={0}
              placeholder="0"
              value={currentItem.proof_papers || ''}
              onChange={(e) => setCurrentItem((prev) => ({ ...prev, proof_papers: Math.max(0, parseInt(e.target.value) || 0) }))}
              helperText={`Official rate: ${formatCurrency(proofRate)} per paper`}
            />
          </>
        )}

        {/* COST SUMMARY BREAKDOWN BOX */}
        <div className="border border-slate-200/90 rounded-xl p-4 sm:p-5 bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">Item Calculation Breakdown</span>
            <span className="font-mono text-slate-500 font-medium">Rate Formula</span>
          </div>

          <div className="space-y-2 text-xs">
            {method === 'ANSWER_BOOK_ASSESSMENT' && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Sem End ({currentItem.semester_end_books || 0} × ₹{semEndRate})</span>
                  <span className="font-mono text-slate-900">{formatCurrency(currentItem.semester_end_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ATKT ({currentItem.atkt_books || 0} × ₹{atktRate})</span>
                  <span className="font-mono text-slate-900">{formatCurrency(currentItem.atkt_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Internal ({currentItem.internal_books || 0} × ₹{intRate})</span>
                  <span className="font-mono text-slate-900">{formatCurrency(currentItem.internal_amount || 0)}</span>
                </div>
              </>
            )}

            {method === 'PRACTICAL_ASSESSMENT' && (
              <div className="flex justify-between text-slate-600">
                <span>Practical Assessment ({currentItem.practical_books || 0} × ₹{practicalRate})</span>
                <span className="font-mono text-slate-900">{formatCurrency(currentItem.practical_amount || 0)}</span>
              </div>
            )}

            {method === 'ONLINE_EXAMINATION_NEP' && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>SEE MCQs ({currentItem.mcq_count || 0} × ₹{seeRate})</span>
                  <span className="font-mono text-slate-900">{formatCurrency(currentItem.see_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Answer Key ({currentItem.mcq_count || 0} × ₹{answerKeyRate})</span>
                  <span className="font-mono text-slate-900">{formatCurrency(currentItem.answer_key_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CIA ({currentItem.student_count || 0} × ₹{ciaRate})</span>
                  <span className="font-mono text-slate-900">{formatCurrency(currentItem.cia_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Uploading Question Paper</span>
                  <span className="font-mono text-slate-900">{formatCurrency(uploadRate)}</span>
                </div>
              </>
            )}

            {method === 'PAPER_SETTING' && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Paper Setting ({currentItem.paper_sets || 0} × {formatCurrency(settingRate)})</span>
                  <span className="font-mono text-slate-900">{formatCurrency(currentItem.setting_amount || 0)}</span>
                </div>
                {Number(currentItem.translation_sets) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Translation ({currentItem.translation_sets} × {formatCurrency(translationRate)})</span>
                    <span className="font-mono text-slate-900">{formatCurrency(currentItem.translation_amount || 0)}</span>
                  </div>
                )}
                {Number(currentItem.proof_papers) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Proof Checking ({currentItem.proof_papers} × {formatCurrency(proofRate)})</span>
                    <span className="font-mono text-slate-900">{formatCurrency(currentItem.proof_amount || 0)}</span>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between pt-2.5 border-t border-slate-200 text-sm font-semibold text-slate-900">
              <span>Item Subtotal</span>
              <span className="font-mono">{formatCurrency(currentItem.subtotal || 0)}</span>
            </div>
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
          <button
            disabled={!isValid}
            onClick={onAddMore}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Add Another Subject
          </button>

          <button
            disabled={!isValid}
            onClick={onContinue}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            Review Items List
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
