import React, { useState, useRef } from 'react';
import { OfficialBillDocument } from '@/components/official-bill/OfficialBillDocument';
import { SignatureModal } from '@/components/signature/SignatureModal';
import { downloadOfficialBillPdf } from '@/lib/pdfExport';
import { ChevronLeft, Printer, Download, Send } from 'lucide-react';

export const OfficialBillPreview = ({
  draft,
  faculty,
  onSubmit,
  onBack,
  onSaveSignature,
  isSubmitting,
}) => {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const docRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadOfficialBillPdf(
        docRef.current || '#official-bill-document',
        `Official-Bill-Sem${draft.semester_label || 'VI'}.pdf`
      );
    } catch (err) {
      console.error('PDF export failed', err);
      alert('Failed to generate PDF. Please use the Print button as an alternative.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFormSubmit = () => {
    if (!faculty?.signature_path) {
      setIsSignatureModalOpen(true);
      return;
    }
    onSubmit();
  };

  const handleSignatureSaved = async (signatureDataUrl) => {
    await onSaveSignature(signatureDataUrl);
    setIsSignatureModalOpen(false);
    onSubmit();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Official Document Preview</h2>
          <p className="text-xs text-slate-500">
            Review the exact official B.K. Birla College format before final submission.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
            Back
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-slate-500" />
            {isDownloading ? 'Generating PDF…' : 'Download PDF'}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print
          </button>

          <button
            onClick={handleFormSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Submitting…</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Submit Bill
              </>
            )}
          </button>
        </div>
      </div>

      {/* Official Bill Document Canvas */}
      <div className="bg-slate-100/70 p-3 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex justify-center">
        <OfficialBillDocument
          ref={docRef}
          bill={{
            bill_reference_id: 'CS-2026-DRAFT',
            grand_total: draft.grand_total,
            amount_in_words: draft.amount_in_words,
            submission_date: new Date().toISOString(),
            status: 'DRAFT',
          }}
          faculty={faculty}
          classItem={{ name: draft.class_name || 'TYCS' }}
          semester={{
            roman_label: draft.semester_label,
            session_type: draft.session_type,
          }}
          academicYear={{ year_label: draft.academic_year_label }}
          items={draft.items}
          approvals={
            faculty?.signature_path
              ? [
                  {
                    action: 'SUBMITTED',
                    signature_snapshot_path: faculty.signature_path,
                    created_at: new Date().toISOString(),
                  },
                ]
              : []
          }
        />
      </div>

      {/* Signature Required Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSignatureSaved}
        title="Faculty Signature Required"
        description="An official bill cannot be submitted without your digital signature. Draw your signature now to complete your submission."
      />

    </div>
  );
};
