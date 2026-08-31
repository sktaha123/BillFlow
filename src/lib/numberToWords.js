/**
 * Converts a numeric amount to Indian Currency Words format.
 * Example: 7500 -> "Seven Thousand Five Hundred Rupees Only"
 * Example: 3600 -> "Three Thousand Six Hundred Rupees Only"
 */
export function convertAmountToWords(amount) {
  if (!amount || isNaN(amount) || amount <= 0) {
    return 'Zero Rupees Only';
  }

  const rounded = Math.round(amount);

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n) {
    if (n < 20) return units[n];
    const digit1 = Math.floor(n / 10);
    const digit2 = n % 10;
    return tens[digit1] + (digit2 > 0 ? ' ' + units[digit2] : '');
  }

  function convertThreeDigits(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) {
      res += units[hundred] + ' Hundred';
    }
    if (rest > 0) {
      res += (res.length > 0 ? ' ' : '') + convertTwoDigits(rest);
    }
    return res;
  }

  const crore = Math.floor(rounded / 10000000);
  const lakh = Math.floor((rounded % 10000000) / 100000);
  const thousand = Math.floor((rounded % 100000) / 1000);
  const remainder = rounded % 1000;

  const parts = [];

  if (crore > 0) {
    parts.push(convertThreeDigits(crore) + ' Crore');
  }
  if (lakh > 0) {
    parts.push(convertThreeDigits(lakh) + ' Lakh');
  }
  if (thousand > 0) {
    parts.push(convertThreeDigits(thousand) + ' Thousand');
  }
  if (remainder > 0) {
    parts.push(convertThreeDigits(remainder));
  }

  const words = parts.join(' ').trim();
  return words ? `${words} Rupees Only` : 'Zero Rupees Only';
}
