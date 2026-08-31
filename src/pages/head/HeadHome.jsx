import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/supabase';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/calculations';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const HeadHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allBills = await dataService.getBills();
        setBills(allBills);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const pendingBills = bills.filter((b) => b.status === 'PENDING_HEAD');
  const finalizedBills = bills.filter((b) => b.status === 'FINALIZED');

  const pendingTotalValue = pendingBills.reduce((sum, b) => sum + (b.grand_total || 0), 0);
  const sanctionedTotalValue = finalizedBills.reduce((sum, b) => sum + (b.grand_total || 0), 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* 1. Header - Clean without top badge */}
      <div className="space-y-1.5">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Welcome, {user?.name || 'Prof. Esmita Gupta'} (Principal / Head)
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
          Executive authorization portal for final examination paper setting remuneration sanction and disbursement.
        </p>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        
        {/* Pending Card */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-7 flex flex-col justify-between space-y-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] hover:shadow-md transition-all">
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Final Sanctions Pending
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-semibold text-slate-900 tracking-tight">
                {pendingBills.length}
              </span>
              <span className="text-sm font-medium text-slate-600">
                {pendingBills.length === 1 ? 'Bill endorsed by HOD' : 'Bills endorsed by HOD'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Total pending sanction value: <strong className="text-slate-700 font-semibold">{formatCurrency(pendingTotalValue)}</strong>
            </p>
          </div>

          <button
            onClick={() => navigate('/head/pending')}
            className="w-full flex items-center justify-between px-5 py-3 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Review &amp; Sanction Bills</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Sanctioned Card */}
        <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-xl p-7 flex flex-col justify-between space-y-6 shadow-2xs">
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Sanctioned Value
            </span>
            <div className="text-3xl sm:text-4xl font-semibold font-mono text-slate-900 tracking-tight">
              {formatCurrency(sanctionedTotalValue)}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cumulative examination remuneration finalized and authorized for disbursement.
            </p>
          </div>

          <button
            onClick={() => navigate('/bills')}
            className="w-full flex items-center justify-between px-5 py-3 rounded-xl text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
          >
            <span>View All Department Bills</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

      </div>

      {/* 3. Finalized Bills Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Authorized Disbursals</h3>
          <button
            onClick={() => navigate('/bills')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {finalizedBills.length === 0 ? (
          <div className="py-10 text-center border border-slate-200/70 rounded-xl bg-white/60 text-slate-400 text-xs">
            No bills finalized yet.
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs divide-y divide-slate-100">
            {finalizedBills.slice(0, 4).map((b) => (
              <div
                key={b.id}
                onClick={() => navigate(`/bill/${b.id}`)}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-slate-900">{b.bill_reference_id}</span>
                      <span className="text-xs font-medium text-slate-700">{b.faculty?.name}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Semester {b.semester?.roman_label} • {b.class?.name || 'TYCS'} • {b.academic_year?.year_label}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-sm font-semibold text-slate-900 block">
                    {formatCurrency(b.grand_total)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {b.submission_date ? new Date(b.submission_date).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
