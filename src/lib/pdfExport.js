/**
 * Triggers the browser's native print-to-PDF flow for the official bill.
 * 
 * Strategy: We have implemented strict A4 physical dimensions (210mm x 297mm) 
 * and `@page` rules in CSS. The browser's native print engine provides the most 
 * reliable, crisp, true-vector PDF rendering available on the client-side.
 * 
 * @param {HTMLElement|string} targetElement - Ignored in native print, kept for API compatibility.
 * @param {string} fileName - Ignored in native print, kept for API compatibility.
 */
export const downloadOfficialBillPdf = async (targetElement, fileName = 'Official-Bill.pdf') => {
  // We recommend using setTimeout to ensure any UI states (like loading spinners) 
  // can settle before the blocking print dialog appears.
  setTimeout(() => {
    // Optionally, if we needed to inject the filename as the document title:
    const originalTitle = document.title;
    document.title = fileName.replace('.pdf', '');
    
    window.print();
    
    // Restore title
    document.title = originalTitle;
  }, 100);
};

