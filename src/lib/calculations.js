import { convertAmountToWords } from './numberToWords';

export const DEFAULT_RATES = {
  paper_setting_rate: 400,
  translation_rate: 250,
  proof_checking_rate: 100,
  practical_ug_rate: 400,
};

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
  transSets = 0,
  transRate = DEFAULT_RATES.translation_rate,
  proofPapers = 0,
  proofRate = DEFAULT_RATES.proof_checking_rate
) {
  const settingAmount = calculatePaperSettingCost(paperSets, settingRate);
  const translationAmount = calculateTranslationCost(transSets, transRate);
  const proofAmount = calculateProofCheckingCost(proofPapers, proofRate);
  const subtotal = settingAmount + translationAmount + proofAmount;

  return {
    settingAmount,
    translationAmount,
    proofAmount,
    subtotal,
  };
}

export function calculateBillCategoryTotals(items = []) {
  let totalSetting = 0;
  let totalTranslation = 0;
  let totalProof = 0;

  for (const item of items) {
    totalSetting += Number(item.setting_amount) || 0;
    totalTranslation += Number(item.translation_amount) || 0;
    totalProof += Number(item.proof_amount) || 0;
  }

  const grandTotal = totalSetting + totalTranslation + totalProof;
  const amountInWords = convertAmountToWords(grandTotal);

  return {
    totalSetting,
    totalTranslation,
    totalProof,
    grandTotal,
    amountInWords,
  };
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}
