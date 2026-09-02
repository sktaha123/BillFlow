import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/supabase';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/calculations';
import { Plus, Search, Eye } from 'lucide-react';

export const MyBillsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const loadBills = async () => {
      try {
        const [allBills, ay, sem] = await Promise.all([
          dataService.getBills(),
          dataService.getAcademicYears(),
          dataService.getSemesters(),
        ]);
        const myBills = allBills.filter((b) => b.faculty_id === user?.id);
        setBills(myBills);
        setAcademicYears(ay);
        setSemesters(sem);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadBills();
  }, [user]);

  const filteredBills = bills.filter((bill) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = bill.bill_reference_id?.toLowerCase().includes(q);
      const matchClass = bill.class?.name?.toLowerCase().includes(q);
      if (!matchId && !matchClass) return false;
    }
    if (yearFilter !== 'ALL' && bill.academic_year_id !== yearFilter) {
      return false;
    }
    if (semesterFilter !== 'ALL' && bill.semester_id !== semesterFilter) {
      return false;
    }
    if (statusFilter !== 'ALL' && bill.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Header - Clean title without top badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-normal text-slate-900 tracking-tight">My  Bills</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View, track, and print all your semester paper-setting remuneration claims.
          </p>
        </div>

        <button
          onClick={() => navigate('/faculty/create-bill')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Bill
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xs">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Search Bill ID
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search ID or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-50/70 text-slate-900 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Academic Year
          </label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50/70 text-slate-900 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all cursor-pointer"
          >
            <option value="ALL">All Academic Years</option>
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>
                {ay.year_label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Semester
          </label>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50/70 text-slate-900 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all cursor-pointer"
          >
            <option value="ALL">All Semesters</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                Semester {s.roman_label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50/70 text-slate-900 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_HOD">Pending HOD</option>
            <option value="PENDING_HEAD">Pending Head</option>
            <option value="FINALIZED">Finalized</option>
            <option value="REJECTED_BY_HOD">Rejected by HOD</option>
            <option value="REJECTED_BY_HEAD">Rejected by Head</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      {filteredBills.length === 0 ? (
        <EmptyState
          title="No Bills Found"
          description={bills.length === 0 ? "You haven't submitted any bills yet." : "No bills matched your filter criteria."}
          actionLabel={bills.length === 0 ? "Create New Bill" : undefined}
          onAction={bills.length === 0 ? () => navigate('/faculty/create-bill') : undefined}
        />
      ) : (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-xs text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Bill Reference</th>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Papers</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.map((bill) => (
                  <tr
                    key={bill.id}
                    onClick={() => navigate(`/bill/${bill.id}`)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                        {bill.bill_reference_id}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{bill.class?.name || 'TYCS'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      Semester {bill.semester?.roman_label}
                      <span className="text-[10px] text-slate-400 block">{bill.academic_year?.year_label}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {bill.items?.length || 0} {bill.items?.length === 1 ? 'Paper' : 'Papers'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {bill.submission_date ? new Date(bill.submission_date).toLocaleDateString('en-IN') : 'Draft'}
                    </td>
                    <td className="py-3.5 px-4">
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
  );
};
