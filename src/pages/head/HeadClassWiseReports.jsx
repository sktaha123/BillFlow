import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '@/lib/supabase';
import { OfficialBillDocument } from '@/components/official-bill/OfficialBillDocument';
import { downloadOfficialBillPdf } from '@/lib/pdfExport';
import {
  ChevronLeft,
  Download,
  Printer,
  Loader2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

const BILLING_METHODS = [
  { value: 'PAPER_SETTING',          label: 'Paper Setting' },
  { value: 'ANSWER_BOOK_ASSESSMENT', label: 'Answer Book Assessment' },
  { value: 'PRACTICAL_ASSESSMENT',   label: 'Practical Assessment' },
  { value: 'ONLINE_EXAMINATION_NEP', label: 'Online Examination (NEP)' },
];

export const HeadClassWiseReports = () => {
  const navigate = useNavigate();
  const docRef = useRef(null);

  // Filter state
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('PAPER_SETTING');

  // Report state
  const [reportData, setReportData] = useState(null);   // { bills, aggregatedItems, classInfo, grandTotal }
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  // Load classes on mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await dataService.getClasses();
        setClasses(data || []);
        if (data && data.length > 0) setSelectedClassId(data[0].id);
      } catch (e) {
        console.error(e);
      }
    };
    loadClasses();
  }, []);

  const handleGenerate = async () => {
    if (!selectedClassId || !selectedMethod) return;

    setIsGenerating(true);
    setReportData(null);
    setError('');

    try {
      const result = await dataService.getClassWiseFinalizedBills(selectedClassId, selectedMethod);
      setReportData(result);

      if (result.bills.length === 0) {
        setError(
          'No finalized bills found for this class and billing format. Only bills confirmed by the Head appear here.'
        );
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load report data. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!reportData) return;
    try {
      setIsDownloading(true);
      const className = (reportData.classInfo?.name || 'Class').replace(/\s+/g, '');
      const now = new Date();
      const day = now.getDate();
      const monthName = now.toLocaleString('en-US', { month: 'long' });
      const fileName = `${className}_Billing_${day}-${monthName}.pdf`;
      await downloadOfficialBillPdf(docRef.current, fileName);
    } catch (e) {
      console.error('PDF export failed', e);
      alert('Failed to generate PDF. Please use the Print button as an alternative.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Build a synthetic "bill" object for the document components
  const syntheticBill = reportData
    ? {
        billing_method:     selectedMethod,
        class:              reportData.classInfo,
        class_name:         reportData.classInfo?.name || '',
        semester:           reportData.bills[0]?.semester || {},
        academic_year:      reportData.bills[0]?.academic_year || {},
        month_year:         reportData.bills[0]?.month_year || '',
        department:         reportData.bills[0]?.department || reportData.bills[0]?.faculty?.department || 'Computer Science',
        hod_name:           reportData.bills.find(b => b?.hod_name)?.hod_name ||
                            reportData.bills.flatMap(b => b?.approvals || []).find(a => a?.action === 'APPROVED')?.user?.name ||
                            reportData.bills[0]?.hod_name ||
                            'Prof. Vinod Rajput',
        grand_total:        reportData.grandTotal,
        status:             'FINALIZED',
        // Approvals: we take the HEAD approval from any bill (all have the same head signature)
        approvals:          reportData.bills.flatMap((b) => b.approvals || []),
        // Items spread into each format key
        items:              reportData.aggregatedItems,
        answer_book_items:  reportData.aggregatedItems,
        practical_items:    reportData.aggregatedItems,
        online_items:       reportData.aggregatedItems,
      }
    : null;

  return (
    <div className="space-y-5 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* ── Action Bar ── */}
      <div className="no-print flex flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Class-Wise Bill Report</h2>
          <p className="text-xs text-slate-500">
            Aggregated view of all confirmed teacher bills for a class.
          </p>
        </div>

        <button
          onClick={() => navigate('/head')}
          className="no-print inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all cursor-pointer w-fit"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400" />
          Back
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="no-print bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">Select Report Parameters</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Class */}
          <div className="space-y-1.5">
            <label
              htmlFor="classSelect"
              className="block text-xs font-semibold text-slate-600 uppercase tracking-wide"
            >
              Class
            </label>
            <select
              id="classSelect"
              value={selectedClassId}
              onChange={(e) => { setSelectedClassId(e.target.value); setReportData(null); setError(''); }}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all cursor-pointer"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Billing Format */}
          <div className="space-y-1.5">
            <label
              htmlFor="methodSelect"
              className="block text-xs font-semibold text-slate-600 uppercase tracking-wide"
            >
              Billing Format
            </label>
            <select
              id="methodSelect"
              value={selectedMethod}
              onChange={(e) => { setSelectedMethod(e.target.value); setReportData(null); setError(''); }}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all cursor-pointer"
            >
              {BILLING_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
          <button
            id="generateReportBtn"
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !selectedClassId}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 shadow-2xs hover:shadow transition-all disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating…' : 'Generate Report'}
          </button>

          {reportData && reportData.bills.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
              >
                <Download className="w-4 h-4 text-slate-500" />
                {isDownloading ? 'Generating…' : 'Download PDF'}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-2xs hover:shadow active:scale-[0.99] transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </>
          )}
        </div>

        {/* Stats after generation */}
        {reportData && reportData.bills.length > 0 && (
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Teachers</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{reportData.bills.length}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Line Items</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{reportData.aggregatedItems.length}</p>
            </div>
            <div className="bg-slate-100/80 rounded-lg p-3 border border-slate-200/60">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Grand Total</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5 font-mono">₹{reportData.grandTotal}/-</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Error State ── */}
      {error && (
        <div className="no-print flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* ── Document Preview ── */}
      {syntheticBill && reportData && reportData.bills.length > 0 && (
        <div className="bill-canvas-wrapper no-print-wrapper bg-slate-100/70 rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto w-full">
          <div className="w-fit min-w-full p-2 sm:p-6 flex justify-center">
            <div className="w-[794px] shrink-0">
              <OfficialBillDocument
                ref={docRef}
                bill={syntheticBill}
                faculty={{}}
                classItem={reportData.classInfo || {}}
                semester={reportData.bills[0]?.semester || {}}
                academicYear={reportData.bills[0]?.academic_year || {}}
                items={reportData.aggregatedItems}
                approvals={syntheticBill.approvals}
                isClassWise={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
