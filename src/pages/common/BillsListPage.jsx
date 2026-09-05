import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/supabase';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/calculations';
import { Search, Eye, Plus } from 'lucide-react';

const METHOD_SHORT_LABELS = {
  PAPER_SETTING: 'Paper Setting',
  ANSWER_BOOK_ASSESSMENT: 'Answer Book',
  PRACTICAL_ASSESSMENT: 'Practical',
  ONLINE_EXAMINATION_NEP: 'Online (NEP)',
};

export const BillsListPage = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [teacherFilter, setTeacherFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [allBills, profs, ay, sem, cls] = await Promise.all([
          dataService.getBills(),
          dataService.getProfiles(),
          dataService.getAcademicYears(),
          dataService.getSemesters(),
          dataService.getClasses(),
        ]);
        setBills(allBills);
        setProfiles(profs);
        setAcademicYears(ay);
        setSemesters(sem);
        setClasses(cls);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  const filteredBills = bills.filter((bill) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = bill.bill_reference_id?.toLowerCase().includes(q);
      const matchFaculty = bill.faculty?.name?.toLowerCase().includes(q);
      if (!matchId && !matchFaculty) return false;
    }
    if (methodFilter !== 'ALL' && bill.billing_method !== methodFilter) {
      return false;
    }
    if (classFilter !== 'ALL' && bill.class_id !== classFilter) {
      return false;
    }
    if (teacherFilter !== 'ALL' && bill.faculty_id !== teacherFilter) {
      return false;
    }
    if (semesterFilter !== 'ALL' && bill.semester_id !== semesterFilter) {
      return false;
    }
    if (statusFilter !== 'ALL' && bill.status !== statusFilter) {
      return false;
    }
    if (yearFilter !== 'ALL' && bill.academic_year_id !== yearFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Department  Bills</h1>
          
        </div>

        {role === 'FACULTY' && (
          <button
            onClick={() => navigate('/faculty/create-bill')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Create New Bill
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 p-4 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xs">
        <div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="ID or Faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-50/70 text-slate-900 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        <div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50/70 text-slate-900 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all cursor-pointer"
          >
            <option value="ALL">All Billing Methods</option>
            <option value="PAPER_SETTING">Paper Setting</option>
            <option value="ANSWER_BOOK_ASSESSMENT">Answer Book / Moderation</option>
            <option value="PRACTICAL_ASSESSMENT">Practical Assessment</option>
            <option value="ONLINE_EXAMINATION_NEP">Online Exam (NEP)</option>
          </select>
        </div>

        <div>
          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50/70 text-slate-900 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all cursor-pointer"
          >
            <option value="ALL">All Faculty</option>
            {profiles
              .filter((p) => p.role === 'FACULTY')
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50/70 text-slate-900 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all cursor-pointer"
          >
            <option value="ALL">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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

        <div>
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

      {/* Table */}
      {filteredBills.length === 0 ? (
        <EmptyState
          title="No Bills Found"
          description={bills.length === 0 ? "No examination bills have been created yet." : "No bills matched your filter criteria."}
        />
      ) : (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Bill Reference</th>
                  <th className="py-3.5 px-4">Billing Method</th>
                  <th className="py-3.5 px-4">Faculty</th>
                  <th className="py-3.5 px-4">Class &amp; Sem</th>
                  <th className="py-3.5 px-4">Academic Year</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.map((bill) => (
                  <tr key={bill.id}
                   onClick={() => navigate(`/bill/${bill.id}`)}
                  className="hover:bg-slate-50/70 cursor-pointer group transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{bill.bill_reference_id}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5  text-[10px] font-medium  tracking-wider  text-slate-700 ">
                        {METHOD_SHORT_LABELS[bill.billing_method] || 'Paper Setting'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{bill.faculty?.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {bill.class?.name ? `${bill.class.name} ,  ` : ''}Sem {bill.semester?.roman_label || bill.semester?.semester_number}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{bill.academic_year?.year_label}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={bill.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 text-sm">
                      {formatCurrency(bill.grand_total)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/bill/${bill.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 group-hover:text-black transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-black" />
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
  );
};
