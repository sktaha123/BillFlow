import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '@/lib/supabase';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/calculations';
import { ChevronLeft, FileText, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export const BillDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-400 font-mono animate-pulse">Loading bill details…</div>;
  }

  if (!bill) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-900">Bill not found</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400" />
          Back
        </button>

        <button
          onClick={() => navigate(`/bill/${bill.id}/official`)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          View Official Bill Document
        </button>
      </div>

      {/* Meta Card */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 sm:p-7 space-y-5 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Examination Paper Setting Bill
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold font-mono text-slate-900 mt-1">{bill.bill_reference_id}</h1>
          </div>

          <div className="text-left sm:text-right">
            <StatusBadge status={bill.status} />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Submitted: {bill.submission_date ? new Date(bill.submission_date).toLocaleDateString() : 'Draft'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Faculty / Examiner</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">{bill.faculty?.name}</span>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">{bill.faculty?.department || 'Computer Science'}</span>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Class &amp; Semester</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{bill.class?.name || 'TYCS'} • Sem {bill.semester?.roman_label}</span>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Academic Year</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{bill.academic_year?.year_label}</span>
          </div>
        </div>
      </div>

      {/* Paper Items Table */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">
          Paper Sets Breakdown
        </h3>
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-xs text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Sr</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-center">Sets</th>
                  <th className="py-3.5 px-4 text-right">Setting</th>
                  <th className="py-3.5 px-4 text-right">Translation</th>
                  <th className="py-3.5 px-4 text-right">Proof</th>
                  <th className="py-3.5 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{item.subject?.name || item.subject_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {item.paper_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">{item.paper_sets}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(item.setting_amount)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(item.translation_amount)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(item.proof_amount)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Financial Total */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 space-y-2 shadow-2xs">
        <div className="flex justify-between items-center text-sm font-semibold text-slate-900">
          <span className="uppercase tracking-wide">Grand Total Remuneration</span>
          <span className="font-mono text-2xl font-bold">{formatCurrency(bill.grand_total)}</span>
        </div>
        {bill.amount_in_words && (
          <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-100">
            In Words: <strong className="text-slate-800 font-semibold">{bill.amount_in_words}</strong>
          </p>
        )}
      </div>

      {/* Approval Audit Trail */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 sm:p-7 space-y-4 shadow-2xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workflow Audit History &amp; Snapshots
        </h3>
        
        <div className="space-y-3 text-xs">
          {bill.approvals?.map((app, idx) => (
            <div key={app.id || idx} className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
              <div className="mt-0.5">
                {app.action === 'SUBMITTED' && <CheckCircle2 className="w-4 h-4 text-slate-800" />}
                {app.action === 'APPROVED' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                {app.action === 'FINALIZED' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {app.action === 'REJECTED' && <XCircle className="w-4 h-4 text-rose-600" />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    {app.action === 'SUBMITTED' && 'Submitted by Faculty'}
                    {app.action === 'APPROVED' && 'Endorsed by HOD'}
                    {app.action === 'FINALIZED' && 'Sanctioned by Principal'}
                    {app.action === 'REJECTED' && `Rejected by ${app.role}`}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(app.created_at).toLocaleString()}
                  </span>
                </div>

                {app.comment && <p className="text-slate-600 text-xs">{app.comment}</p>}
                <p className="text-[11px] text-slate-400 font-mono">By: {app.user_name || app.user?.name || app.role}</p>

                {app.signature_snapshot_path && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-medium">Digital Signature Snapshot:</span>
                    <img
                      src={app.signature_snapshot_path}
                      alt="Signature Snapshot"
                      className="h-8 max-w-[120px] object-contain filter contrast-125 bg-white p-1 border border-slate-200 rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
