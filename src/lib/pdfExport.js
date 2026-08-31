import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Downloads the official bill document element as a crisp, print-quality PDF.
 * Targets ONLY the inner document element — not any outer wrapper divs.
 *
 * @param {HTMLElement|string} targetElement - DOM element or CSS selector of the bill document.
 * @param {string} fileName - Output PDF filename.
 */
export const downloadOfficialBillPdf = async (targetElement, fileName = 'Official-Bill.pdf') => {
  const element = typeof targetElement === 'string'
    ? document.querySelector(targetElement)
    : targetElement;

  if (!element) {
    console.error('Target document element not found for PDF export.');
    return;
  }

  // Temporarily force exact pixel dimensions for capture
  const originalStyle = element.style.cssText;
  element.style.width = '794px';       // Standard A4 width @ 96dpi
  element.style.maxWidth = '794px';
  element.style.margin = '0 auto';
  element.style.padding = '12px 16px';
  element.style.boxSizing = 'border-box';
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#000000';

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      imageTimeout: 15000,
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth  = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight();  // 297mm

    const margin       = 8; // 8mm margin
    const contentWidth = pdfWidth - margin * 2;           // 194mm

    const imgRatio      = canvas.height / canvas.width;
    const contentHeight = contentWidth * imgRatio;

    if (contentHeight <= pdfHeight - margin * 2) {
      // Single page
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight, '', 'FAST');
    } else {
      // Multi-page slicing
      const pageContentHeight = pdfHeight - margin * 2;
      const pixelsPerMm = canvas.width / contentWidth;
      const pageHeightPx = pageContentHeight * pixelsPerMm;
      let yPixel = 0;
      let firstPage = true;

      while (yPixel < canvas.height) {
        if (!firstPage) pdf.addPage();

        const sliceCanvas  = document.createElement('canvas');
        const sliceHeight  = Math.min(pageHeightPx, canvas.height - yPixel);
        sliceCanvas.width  = canvas.width;
        sliceCanvas.height = sliceHeight;

        const ctx = sliceCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(canvas, 0, -yPixel);

        const sliceData = sliceCanvas.toDataURL('image/png');
        const sliceMmH  = sliceHeight / pixelsPerMm;
        pdf.addImage(sliceData, 'PNG', margin, margin, contentWidth, sliceMmH, '', 'FAST');

        yPixel += sliceHeight;
        firstPage = false;
      }
    }

    pdf.save(fileName);
  } finally {
    element.style.cssText = originalStyle;
  }
};
