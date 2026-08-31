import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/supabase';
import { Clock, CheckCircle2, FileText, ArrowRight, Eye } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/calculations';

export const HeadHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingBills, setPendingBills] = useState([]);
  const [finalizedBills, setFinalizedBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeadData = async () => {
      try {
        const allBills = await dataService.getBills();
        setPendingBills(allBills.filter((b) => b.status === 'PENDING_HEAD'));
        setFinalizedBills(allBills.filter((b) => b.status === 'FINALIZED'));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeadData();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* 1. Header */}
      <div className="space-y-1.5">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Executive Overview
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
          Final sanction, official college seal authorization, and remuneration disbursement portal.
        </p>
      </div>

      {/* 2. Action Card */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-all">
        <div className="space-y-2 max-w-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Sanction &amp; Approval
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2.5">
            {pendingBills.length > 0 ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{pendingBills.length} {pendingBills.length === 1 ? 'bill requires' : 'bills require'} executive sanction</span>
              </>
            ) : (
              'All verified bills are finalized'
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {pendingBills.length > 0
              ? 'Review HOD endorsements, verify final remuneration amounts, and apply your Principal signature to sanction payment.'
              : 'There are no pending HOD-endorsed paper setting bills awaiting sanction at this time.'}
          </p>
        </div>

        {pendingBills.length > 0 && (
          <button
            onClick={() => navigate('/head/pending')}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer w-full sm:w-auto"
          >
            Review Claims ({pendingBills.length})
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wide">Principal / Head</span>
          <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">{user?.name || 'Prof. Esmita Gupta'}</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wide">Institution</span>
          <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">B.K. Birla College</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wide">Pending Sanction</span>
          <span className="font-semibold text-emerald-600 text-sm mt-0.5 block font-mono">{pendingBills.length} Bills</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wide">Total Sanctioned</span>
          <span className="font-semibold text-slate-900 text-sm mt-0.5 block font-mono">{finalizedBills.length} Bills</span>
        </div>
      </div>

      {/* 4. RECENT SANCTIONED ACTIVITY TABLE WITH TOP HEADER ROW */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Recently Sanctioned Claims</h3>
            <p className="text-xs text-slate-400 mt-0.5">Approved examination bills with official seal</p>
          </div>
          <button
            onClick={() => navigate('/bills')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            View all bills <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {finalizedBills.length === 0 ? (
          <div className="py-10 text-center border border-slate-200/70 rounded-xl bg-white/60 text-slate-400 text-xs">
            No bills finalized yet.
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-xs text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Bill Reference</th>
                    <th className="py-3.5 px-4">Faculty / Examiner</th>
                    <th className="py-3.5 px-4">Class &amp; Semester</th>
                    <th className="py-3.5 px-4">Academic Year</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {finalizedBills.slice(0, 5).map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => navigate(`/bill/${b.id}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {b.bill_reference_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {b.faculty?.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {b.class?.name || 'TYCS'} • Sem {b.semester?.roman_label}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {b.academic_year?.year_label}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 text-sm">
                        {formatCurrency(b.grand_total)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/bill/${b.id}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
