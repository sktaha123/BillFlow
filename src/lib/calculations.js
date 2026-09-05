import { convertAmountToWords } from './numberToWords';

// ─── DEFAULT RATES ───────────────────────────────────────────────────────────
export const DEFAULT_RATES = {
  // Paper Setting
  paper_setting_rate:   400,
  translation_rate:     250,
  proof_checking_rate:  100,
  practical_ug_rate:    400,

  // Answer Book Assessment
  answer_book_ug_rate:       8,
  answer_book_pg_rate:       10,
  answer_book_msc_rate:      15,
  internal_assessment_rate:  4,

  // Practical Assessment
  practical_ug_assessment_rate: 25,
  practical_pg_assessment_rate: 30,

  // Online Examination (NEP)
  online_nep_see_rate:         7,
  online_nep_answer_key_rate:  2,
  online_nep_cia_rate:         4,
  online_nep_upload_rate:      150,
};

// ─── PAPER SETTING CALCULATIONS ──────────────────────────────────────────────

export function calculatePaperSettingCost(sets, rate = DEFAULT_RATES.paper_setting_rate) {
  return Math.max(0, Number(sets) || 0) * rate;
}

export function calculateTranslationCost(sets, rate = DEFAULT_RATES.translation_rate) {
  return Math.max(0, Number(sets) || 0) * rate;
}

export function calculateProofCheckingCost(papers, rate = DEFAULT_RATES.proof_checking_rate) {
  return Math.max(0, Number(papers) || 0) * rate;
}

export function calculateItemSubtotal(
  paperSets,
  settingRate = DEFAULT_RATES.paper_setting_rate,
  transSets   = 0,
  transRate   = DEFAULT_RATES.translation_rate,
  proofPapers = 0,
  proofRate   = DEFAULT_RATES.proof_checking_rate
) {
  const settingAmount     = calculatePaperSettingCost(paperSets, settingRate);
  const translationAmount = calculateTranslationCost(transSets, transRate);
  const proofAmount       = calculateProofCheckingCost(proofPapers, proofRate);
  const subtotal          = settingAmount + translationAmount + proofAmount;

  return { settingAmount, translationAmount, proofAmount, subtotal };
}

export function calculateBillCategoryTotals(items = []) {
  let totalSetting     = 0;
  let totalTranslation = 0;
  let totalProof       = 0;

  for (const item of items) {
    totalSetting     += Number(item.setting_amount)     || 0;
    totalTranslation += Number(item.translation_amount) || 0;
    totalProof       += Number(item.proof_amount)       || 0;
  }

  const grandTotal    = totalSetting + totalTranslation + totalProof;
  const amountInWords = convertAmountToWords(grandTotal);

  return { totalSetting, totalTranslation, totalProof, grandTotal, amountInWords };
}

// ─── ANSWER BOOK ASSESSMENT CALCULATIONS ─────────────────────────────────────

/**
 * Get the applicable semester-end rate based on academic level.
 * @param {'UG'|'PG'|'MSC'} level
 * @param {object} settings - system_settings row
 */
export function getAnswerBookSemEndRate(level, settings = DEFAULT_RATES) {
  if (level === 'MSC') return Number(settings.answer_book_msc_rate)  || DEFAULT_RATES.answer_book_msc_rate;
  if (level === 'PG')  return Number(settings.answer_book_pg_rate)   || DEFAULT_RATES.answer_book_pg_rate;
  return Number(settings.answer_book_ug_rate) || DEFAULT_RATES.answer_book_ug_rate; // UG default
}

/**
 * Calculate amounts for one Answer Book Assessment row.
 */
export function calculateAnswerBookItemSubtotal(
  semEndBooks,
  atktBooks,
  internalBooks,
  semEndRate,
  atktRate,
  internalRate
) {
  const semEndAmt    = Math.max(0, Number(semEndBooks)    || 0) * (Number(semEndRate)    || 0);
  const atktAmt      = Math.max(0, Number(atktBooks)      || 0) * (Number(atktRate)      || 0);
  const internalAmt  = Math.max(0, Number(internalBooks)  || 0) * (Number(internalRate)  || 0);
  const subtotal     = semEndAmt + atktAmt + internalAmt;
  return { semester_end_amount: semEndAmt, atkt_amount: atktAmt, internal_amount: internalAmt, subtotal };
}

// ─── PRACTICAL ASSESSMENT CALCULATIONS ───────────────────────────────────────

/**
 * Get the applicable practical rate based on level.
 * @param {'UG'|'PG'} level
 * @param {object} settings
 */
export function getPracticalRate(level, settings = DEFAULT_RATES) {
  if (level === 'PG') return Number(settings.practical_pg_assessment_rate) || DEFAULT_RATES.practical_pg_assessment_rate;
  return Number(settings.practical_ug_assessment_rate) || DEFAULT_RATES.practical_ug_assessment_rate;
}

/**
 * Calculate amounts for one Practical Assessment row.
 */
export function calculatePracticalItemSubtotal(practicalBooks, practicalRate) {
  const practicalAmount = Math.max(0, Number(practicalBooks) || 0) * (Number(practicalRate) || 0);
  return { practical_amount: practicalAmount, subtotal: practicalAmount };
}

// ─── ONLINE EXAMINATION (NEP) CALCULATIONS ────────────────────────────────────

/**
 * Calculate amounts for one Online Examination (NEP) row.
 */
export function calculateOnlineNepItemSubtotal(mcqCount, studentCount, seeRate, answerKeyRate, ciaRate, uploadRate) {
  const see_amount        = Math.max(0, Number(mcqCount)     || 0) * (Number(seeRate)       || 0);
  const answer_key_amount = Math.max(0, Number(mcqCount)     || 0) * (Number(answerKeyRate)  || 0);
  const cia_amount        = Math.max(0, Number(studentCount) || 0) * (Number(ciaRate)        || 0);
  const upload_amount     = Number(uploadRate) || 0;
  const subtotal          = see_amount + answer_key_amount + cia_amount + upload_amount;
  return { see_amount, answer_key_amount, cia_amount, upload_amount, subtotal };
}

// ─── GENERIC GRAND TOTAL (works for any item array with a subtotal field) ────

export function calculateGenericGrandTotal(items = []) {
  const grandTotal    = items.reduce((sum, it) => sum + (Number(it.subtotal) || 0), 0);
  const amountInWords = convertAmountToWords(grandTotal);
  return { grandTotal, amountInWords };
}

// ─── CURRENCY FORMATTER ───────────────────────────────────────────────────────

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style:                'currency',
    currency:             'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}
