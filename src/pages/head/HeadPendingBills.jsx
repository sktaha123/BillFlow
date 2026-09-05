import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '@/lib/supabase';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/calculations';
import { Search, ArrowRight, Clock } from 'lucide-react';

export const HeadPendingBills = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allBills, ay, sem] = await Promise.all([
          dataService.getBills(),
          dataService.getAcademicYears(),
          dataService.getSemesters(),
        ]);
        setBills(allBills.filter((b) => b.status === 'PENDING_HEAD'));
        setAcademicYears(ay);
        setSemesters(sem);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredBills = bills.filter((b) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = b.bill_reference_id?.toLowerCase().includes(q);
      const matchFaculty = b.faculty?.name?.toLowerCase().includes(q);
      if (!matchId && !matchFaculty) return false;
    }
    if (yearFilter !== 'ALL' && b.academic_year_id !== yearFilter) {
      return false;
    }
    if (semesterFilter !== 'ALL' && b.semester_id !== semesterFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Header - Clean title without top badge */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Pending Sanctions</h1>
      
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xs">
        <div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search faculty or bill ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-50/70 text-slate-900 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        <div>
          
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
      </div>

      {/* Subtitle Counter */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
        
        <span>{filteredBills.length} {filteredBills.length === 1 ? 'bill awaiting' : 'bills awaiting'}</span>
      </div>

      {/* Table */}
      {filteredBills.length === 0 ? (
        <EmptyState
          title="No Pending Sanctions"
          description={bills.length === 0 ? "All verified claims have been sanctioned." : "No bills matched your filter criteria."}
        />
      ) : (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-xs text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Bill Reference</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Faculty</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">HOD Endorsed</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.map((b) => {
                  const hodApproval = b.approvals?.find((a) => a.action === 'APPROVED');
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{b.bill_reference_id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{b.class?.name || 'TYCS'}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{b.faculty?.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">Semester {b.semester?.roman_label}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(b.grand_total)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">
                        {hodApproval ? new Date(hodApproval.created_at).toLocaleDateString() : 'Yes'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/head/review/${b.id}`)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-2xs hover:shadow transition-all cursor-pointer"
                        >
                          Review
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
