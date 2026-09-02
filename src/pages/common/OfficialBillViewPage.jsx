import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '@/lib/supabase';
import { OfficialBillDocument } from '@/components/official-bill/OfficialBillDocument';
import { downloadOfficialBillPdf } from '@/lib/pdfExport';
import { ChevronLeft, Printer, Download } from 'lucide-react';

export const OfficialBillViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const docRef = useRef(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const found = await dataService.getBillById(id);
        setBill(found);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBill();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!bill) return;
    try {
      setIsDownloading(true);
      await downloadOfficialBillPdf(
        docRef.current,
        `Official-Bill-${bill.bill_reference_id || id}.pdf`
      );
    } catch (err) {
      console.error('PDF export failed', err);
      alert('Failed to generate PDF. Please use the Print button as an alternative.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 font-mono animate-pulse">
        Loading official bill document…
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-900">Bill not found</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto animate-in fade-in duration-200">

      {/* ── Top Action Bar — hidden during print via .no-print class ── */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Official Bill Document</h2>
          <p className="text-xs text-slate-500">
            Reference: <strong className="font-mono text-slate-800">{bill.bill_reference_id}</strong>
            &nbsp;• B.K. Birla College Examination Form
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
            Back
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-slate-500" />
            {isDownloading ? 'Generating…' : 'Download PDF'}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/*
        ── Official Document ──
        NOTE: Do NOT wrap in no-print-wrapper or any display:none container.
        The .print-area class on OfficialBillDocument makes it visible during print.
        The action bar above has .no-print so it's hidden; this div renders cleanly.
      */}
      <div className="bg-slate-100/70 p-2 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto w-full flex justify-center">
        <div className="min-w-[680px] flex justify-center mx-auto">
          <OfficialBillDocument
            ref={docRef}
            bill={bill}
            faculty={bill.faculty}
            classItem={bill.class}
            semester={bill.semester}
            academicYear={bill.academic_year}
            items={bill.items || []}
            approvals={bill.approvals || []}
          />
        </div>
      </div>

    </div>
  );
};
