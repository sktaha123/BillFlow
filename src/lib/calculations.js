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

// ─── FACULTY NAME FORMATTER ───────────────────────────────────────────────────

/**
 * Formats a faculty member's name to include only their first name
 * and the first letter of their second name / surname followed by a dot.
 * Strips salutations/prefixes (Prof., Dr., Mr., Mrs., Ms., Smt., Shri., Er., etc.).
 *
 * e.g., "Prof. Hemangi Adhiraj" -> "Hemangi A."
 *       "Prof. Vinod Rajput"    -> "Vinod R."
 *       "Prof. Esmita Gupta"    -> "Esmita G."
 *       "Taha Samad"            -> "Taha S."
 *
 * @param {string} fullName
 * @returns {string}
 */
export function formatFacultyShortName(fullName) {
  if (!fullName || typeof fullName !== 'string') return '';

  // Strip academic / courtesy titles
  let cleaned = fullName.trim();
  cleaned = cleaned.replace(/^(prof\.|prof|dr\.|dr|mr\.|mr|mrs\.|mrs|ms\.|ms|smt\.|smt|shri\.|shri|er\.|er)\s+/i, '').trim();
  cleaned = cleaned.replace(/^(prof\.|prof|dr\.|dr|mr\.|mr|mrs\.|mrs|ms\.|ms|smt\.|smt|shri\.|shri|er\.|er)\s+/i, '').trim();

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fullName.trim();
  if (parts.length === 1) return parts[0];

  const firstName = parts[0];

  // Pick second name (skipping single initials if present in middle, e.g. "Hemangi K. Adhiraj")
  let secondName = parts[1];
  if (parts.length > 2 && (parts[1].length <= 2 || parts[1].endsWith('.'))) {
    secondName = parts[2] || parts[1];
  }

  // Extract first letter of second name
  const lettersOnly = secondName.replace(/[^a-zA-Z]/g, '');
  const initial = lettersOnly.charAt(0).toUpperCase();

  if (!initial) {
    return firstName;
  }

  return `${firstName} ${initial}.`;
}

// ─── SUBJECT NAME WITH EXAM MODE FORMATTER ────────────────────────────────────

/**
 * Formats a subject name to always include the full examination mode in brackets
 * as a suffix (e.g. "(Theory)", "(Practical)").
 * Truncates long subject names with '..' from the ending if needed to preserve layout.
 *
 * e.g., "Blockchain Technology" + "THEORY" -> "Blockchain Tech..(Theory)"
 *       "Blockchain Technology" + "PRACTICAL" -> "Blockchain Tech..(Practical)"
 *
 * @param {string} subjectName
 * @param {string} mode - e.g. 'THEORY' | 'PRACTICAL' | 'ASSESSMENT' | 'ONLINE'
 * @param {number} maxSubjectLength - Maximum length for subject name portion before suffix
 * @returns {string}
 */
export function formatSubjectWithExamMode(subjectName, mode = 'THEORY', maxSubjectLength = 15) {
  if (!subjectName || typeof subjectName !== 'string') return '';

  // Standardize mode label (Theory, Practical, Assessment, Online)
  let modeLabel = 'Theory';
  const rawMode = String(mode || '').trim().toUpperCase();
  if (rawMode === 'PRACTICAL') {
    modeLabel = 'Practical';
  } else if (rawMode === 'ASSESSMENT') {
    modeLabel = 'Assessment';
  } else if (rawMode === 'OE' || rawMode === 'ONLINE' || rawMode === 'NEP') {
    modeLabel = 'Online';
  } else if (rawMode === 'THEORY') {
    modeLabel = 'Theory';
  } else if (mode && typeof mode === 'string' && mode.trim()) {
    const clean = mode.trim();
    modeLabel = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  }

  // Strip existing trailing bracketed mode if present to prevent "(Theory) (Theory)"
  let cleanSubject = subjectName.trim();
  cleanSubject = cleanSubject.replace(/\s*\((theory|practical|assessment|online|oe|nep|sem\s*end|atkt|internal)\)\s*$/i, '').trim();

  // If cleanSubject length exceeds maxSubjectLength, truncate and append '..'
  if (cleanSubject.length > maxSubjectLength) {
    cleanSubject = cleanSubject.slice(0, maxSubjectLength).trim() + '..';
  }

  return `${cleanSubject} (${modeLabel})`;
}

