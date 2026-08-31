import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/supabase';
import { Plus, ArrowRight, FileText, CheckCircle2, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/calculations';

export const FacultyHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentBills, setRecentBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const allBills = await dataService.getBills();
        const facultyBills = allBills.filter(b => b.faculty_id === user?.id);
        setRecentBills(facultyBills.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacultyData();
  }, [user]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name || 'Prof. Hemangi Adhiraj';

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* 1. HERO HEADER - Clean without top badge div */}
      <div className="space-y-1.5">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          {getTimeGreeting()}, {displayName}
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
          Manage, calculate, and submit semester paper-setting remuneration bills with digital signatures.
        </p>
      </div>

      {/* 2. PRIMARY ACTION BANNER */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-all">
        <div className="space-y-2 max-w-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Remuneration Workflow
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Create a new paper setting bill
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Select classes, add theory and practical paper sets with official college rates, and submit directly to HOD for verification.
          </p>
        </div>

        <button
          onClick={() => navigate('/faculty/create-bill')}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Start New Bill
        </button>
      </div>

      {/* 3. PROFILE METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wide">Faculty Name</span>
          <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">{user?.name || 'Prof. Hemangi Adhiraj'}</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wide">Employee ID</span>
          <span className="font-mono font-semibold text-slate-900 text-sm mt-0.5 block">{user?.employee_id || 'EMP-CS-104'}</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wide">Department</span>
          <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">{user?.department || 'Computer Science'}</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wide">Digital Signature</span>
          <div className="mt-0.5 flex items-center gap-1.5">
            {user?.signature_path ? (
              <span className="text-emerald-700 font-medium text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active
              </span>
            ) : (
              <span className="text-amber-700 font-medium text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Required
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. RECENT BILLS SECTION */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Recent Submissions</h3>
          <button
            onClick={() => navigate('/faculty/my-bills')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            View all bills <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentBills.length === 0 ? (
          <div className="py-12 text-center border border-slate-200/70 rounded-xl bg-white/60 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">No examination bills submitted yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Create your first bill to generate official remuneration claims.</p>
            <button
              onClick={() => navigate('/faculty/create-bill')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Bill
            </button>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs divide-y divide-slate-100">
            {recentBills.map((bill) => (
              <div
                key={bill.id}
                onClick={() => navigate(`/bill/${bill.id}`)}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-slate-200/70 text-slate-700 flex items-center justify-center transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-slate-900">{bill.bill_reference_id}</span>
                      <StatusBadge status={bill.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Semester {bill.semester?.roman_label} • {bill.class?.name || 'TYCS'} • {bill.academic_year?.year_label}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-sm font-semibold text-slate-900 block">
                    {formatCurrency(bill.grand_total)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {bill.submission_date ? new Date(bill.submission_date).toLocaleDateString() : 'Draft'}
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
