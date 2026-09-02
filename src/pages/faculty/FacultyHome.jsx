import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/supabase';
import { Plus, ArrowRight, FileText, CheckCircle2, Clock, Eye } from 'lucide-react';
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
        setRecentBills(facultyBills.slice(0, 5));
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
      
      {/* 1. HERO HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-3xl tracking-tight text-slate-900">
            <span className="font-normal text-slate-900">{getTimeGreeting()}, </span>
            <span className="font-semibold text-slate-900">{displayName}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your paper setting claims and track approval statuses.
          </p>
        </div>
        <button
          onClick={() => navigate('/faculty/create-bill')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
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
          <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wide">Department</span>
          <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">{user?.department || 'Computer Science'}</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wide">Academic Year</span>
          <span className="font-semibold text-slate-900 text-sm mt-0.5 block">2026–2027</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wide">Digital Signature</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {user?.signature_path ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Setup
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. RECENT BILLS TABLE WITH TOP HEADER ROW ONLY */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Recent Submissions</h3>
          </div>
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
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-xs text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Bill Reference</th>
                    <th className="py-3.5 px-4">Class &amp; Semester</th>
                    <th className="py-3.5 px-4">Academic Year</th>
                    <th className="py-3.5 px-4">Submission Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBills.map((bill) => (
                    <tr
                      key={bill.id}
                      onClick={() => navigate(`/bill/${bill.id}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-semibold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                          {bill.bill_reference_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {bill.class?.name} , Sem {bill.semester?.roman_label}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {bill.academic_year?.year_label}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {bill.submission_date ? new Date(bill.submission_date).toLocaleDateString('en-IN') : 'Draft'}
                      </td>
                      <td className="py-3.5 px-4 ">
                        <StatusBadge status={bill.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 text-sm">
                        {formatCurrency(bill.grand_total)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/bill/${bill.id}`);
                          }}
                          className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                          <span className="text-slate-500 group-hover:text-slate-900 transition-colors">View</span>
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
