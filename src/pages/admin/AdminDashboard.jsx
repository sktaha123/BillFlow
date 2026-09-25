import React, { useState, useEffect } from 'react';
import { dataService } from '@/lib/supabase';
import { 
  Users, UserPlus, Trash2, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Search, FileText, Edit, BookOpen, UserCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { SubjectsManagement } from './SubjectsManagement';

export const AdminDashboard = () => {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI State
  const [activeTab, setActiveTab] = useState('FACULTY'); // 'FACULTY' | 'SUBJECTS'
  const [expandedId, setExpandedId] = useState(null);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleteStep, setDeleteStep] = useState(1);
  
  // Edit Subjects State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCandidate, setEditCandidate] = useState(null);
  const [selectedEditSubjects, setSelectedEditSubjects] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', username: '', password: '', role: 'FACULTY', department: 'Computer Science'
  });
  
  // Subject Assignments for new faculty
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getAllProfilesWithAssignments();
      setProfiles(data);
    } catch (e) {
      console.error(e);
      alert('Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
    
    // Load classes for the add form
    dataService.getClasses().then(setClasses).catch(console.error);
  }, []);

  // Fetch subjects when a class is selected
  useEffect(() => {
    if (selectedClass) {
      dataService.getSubjects(selectedClass).then(setSubjects).catch(console.error);
    } else {
      setSubjects([]);
    }
  }, [selectedClass]);

  const handleToggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleEditSubjectToggle = (subjectId) => {
    setSelectedEditSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const openEditModal = (profile) => {
    setEditCandidate(profile);
    const existingSubjectIds = (profile.assignments || []).map(a => a.subject.id);
    setSelectedEditSubjects(existingSubjectIds);
    // Reset selected class in edit modal to show all initially or require choosing a class
    setSelectedClass('');
    setIsEditModalOpen(true);
  };

  const handleUpdateSubjectsSubmit = async (e) => {
    e.preventDefault();
    if (!editCandidate) return;
    
    setIsUpdating(true);
    try {
      await dataService.updateFacultyAssignments(editCandidate.id, selectedEditSubjects);
      setIsEditModalOpen(false);
      setEditCandidate(null);
      await fetchProfiles();
    } catch (err) {
      console.error(err);
      alert('Failed to update subjects.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) return;

    setIsSubmitting(true);
    try {
      await dataService.createFacultyProfile(formData, selectedSubjects);
      setIsAddModalOpen(false);
      
      // Reset form
      setFormData({ name: '', username: '', password: '', role: 'FACULTY', department: 'Computer Science' });
      setSelectedClass('');
      setSelectedSubjects([]);
      
      await fetchProfiles();
    } catch (err) {
      console.error(err);
      alert('Failed to create user. Username might already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmName !== deleteCandidate.name) return;
    
    setIsDeleting(true);
    try {
      await dataService.softDeleteProfile(deleteCandidate.id);
      setDeleteCandidate(null);
      setDeleteStep(1);
      setDeleteConfirmName('');
      await fetchProfiles();
    } catch (err) {
      console.error(err);
      alert('Failed to deactivate user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReactivate = async (profile) => {
    if (window.confirm(`Are you sure you want to reactivate the account for ${profile.name}? They will be able to log in again.`)) {
      try {
        await dataService.reactivateProfile(profile.id);
        await fetchProfiles();
      } catch (err) {
        console.error(err);
        alert('Failed to reactivate user.');
      }
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm w-fit mx-auto mb-8">
        <button
          onClick={() => setActiveTab('FACULTY')}
          className={clsx(
            "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
            activeTab === 'FACULTY' 
              ? "bg-indigo-600 text-white shadow-sm" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          <Users className="w-4 h-4" />
          Faculty
        </button>
        <button
          onClick={() => setActiveTab('SUBJECTS')}
          className={clsx(
            "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
            activeTab === 'SUBJECTS' 
              ? "bg-indigo-600 text-white shadow-sm" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Subjects
        </button>
      </div>

      {activeTab === 'SUBJECTS' ? (
        <SubjectsManagement />
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Faculty Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, manage, and assign classes to faculty members.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow active:scale-[0.99] transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Add Faculty
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input 
          type="text"
          placeholder="Search by name or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 focus:border-indigo-400 focus:ring focus:ring-indigo-200/50 outline-none transition-all"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-slate-500 font-mono animate-pulse">
            Loading directory...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-8"></th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Password</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      No matching faculty found.
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((p) => {
                    const isExpanded = expandedId === p.id;
                    const isActive = p.is_active !== false;

                    // Group assignments by class
                    const classMap = {};
                    (p.assignments || []).forEach(a => {
                      if (a.subject?.class?.name) {
                        const cName = a.subject.class.name;
                        if (!classMap[cName]) classMap[cName] = [];
                        classMap[cName].push(a.subject.name);
                      }
                    });

                    return (
                      <React.Fragment key={p.id}>
                        <tr 
                          className={clsx(
                            "group transition-colors", 
                            !isActive ? "bg-rose-50/30" : "hover:bg-slate-50/50"
                          )}
                        >
                          <td className="px-4 py-3">
                            <button 
                              onClick={() => handleToggleExpand(p.id)}
                              className="p-1 rounded-md hover:bg-slate-200 text-slate-400 transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.department}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={clsx(
                              "inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wide",
                              p.role === 'HOD' ? 'bg-amber-100 text-amber-800' :
                              p.role === 'HEAD' ? 'bg-rose-100 text-rose-800' :
                              'bg-slate-100 text-slate-700'
                            )}>
                              {p.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 font-mono">
                            {p.username}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 font-mono">
                            {p.password}
                          </td>
                          <td className="px-4 py-3">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                <CheckCircle className="w-3 h-3" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                                <AlertCircle className="w-3 h-3" /> Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isActive ? (
                              <button
                                onClick={() => {
                                  setDeleteCandidate(p);
                                  setDeleteStep(1);
                                  setDeleteConfirmName('');
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Deactivate Faculty"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(p)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Reactivate Faculty"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Expandable Details Row */}
                        {isExpanded && (
                          <tr className={clsx(
                            "bg-slate-50/50 border-b border-slate-100",
                            !isActive && "opacity-60"
                          )}>
                            <td colSpan={7} className="px-10 py-4">
                              <div className="p-4 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    Assigned Subjects
                                  </h4>
                                  {isActive && (
                                    <button
                                      onClick={() => openEditModal(p)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                      Edit Subjects
                                    </button>
                                  )}
                                </div>
                                
                                {Object.keys(classMap).length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">No subjects assigned.</p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(classMap).map(([cName, subList]) => (
                                      <div key={cName} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                        <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide mb-2">{cName}</div>
                                        <ul className="space-y-1">
                                          {subList.map((s, i) => (
                                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                              <span className="mt-1 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                              <span className="leading-tight">{s}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================
          ADD FACULTY MODAL
          ========================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pt-20 p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Create New Faculty Account</h3>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input 
                    required 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. John Doe"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="FACULTY">FACULTY</option>
                    <option value="HOD">HOD</option>
                    <option value="HEAD">HEAD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username</label>
                  <input 
                    required 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                    placeholder="e.g. john@2026"
                    value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <input 
                    required 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                    placeholder="e.g. john@2026"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Assign Subjects (Optional)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Class</label>
                    <select 
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-500"
                      value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                    >
                      <option value="">-- Choose Class --</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Available Subjects</label>
                    <div className="h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-1">
                      {!selectedClass ? (
                        <p className="text-xs text-slate-400 text-center py-10">Select a class first</p>
                      ) : subjects.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-10">No subjects found for class</p>
                      ) : (
                        subjects.map(s => (
                          <label key={s.id} className="flex items-start gap-2.5 p-2 hover:bg-white rounded cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                              checked={selectedSubjects.includes(s.id)}
                              onChange={() => handleSubjectToggle(s.id)}
                            />
                            <span className="text-xs text-slate-700 leading-tight">{s.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {selectedSubjects.length > 0 && (
                  <div className="mt-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                    <p className="text-xs font-semibold text-indigo-800 mb-1.5">Selected Subjects to Assign:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSubjects.map(id => {
                        const sub = subjects.find(s => s.id === id);
                        return sub ? (
                          <span key={id} className="inline-flex items-center px-2 py-1 rounded bg-white border border-indigo-200 text-[10px] font-medium text-slate-700 shadow-2xs">
                            {sub.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          STRICT DELETE MODAL (2-STEP)
          ========================================= */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              
              {deleteStep === 1 ? (
                // STEP 1
                <>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Faculty Account</h3>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    Do you want to delete the faculty account for <strong className="text-slate-900">{deleteCandidate.name}</strong>?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => { setDeleteCandidate(null); setDeleteStep(1); }}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      No, Cancel
                    </button>
                    <button
                      onClick={() => setDeleteStep(2)}
                      className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm"
                    >
                      Yes, Continue
                    </button>
                  </div>
                </>
              ) : (
                // STEP 2
                <>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Final Confirmation</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    This will prevent them from logging in. <br/><br/>
                    <span className="text-emerald-700 font-medium">Their historical bills will be preserved and remain visible to the HOD.</span>
                  </p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Please type <span className="font-bold text-slate-900 select-none bg-slate-200 px-1 rounded">{deleteCandidate.name}</span> to confirm.
                    </label>
                    <input
                      type="text"
                      placeholder="Type name here..."
                      value={deleteConfirmName}
                      onChange={(e) => setDeleteConfirmName(e.target.value)}
                      onPaste={(e) => {
                        e.preventDefault();
                        alert("Copy-pasting is disabled for security. Please type the name manually.");
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                      autoComplete="off"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => { setDeleteCandidate(null); setDeleteStep(1); setDeleteConfirmName(''); }}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting || deleteConfirmName !== deleteCandidate.name}
                      className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          EDIT SUBJECTS MODAL
          ========================================= */}
      {isEditModalOpen && editCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isUpdating && setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">
                Edit Subjects for <span className="text-indigo-600">{editCandidate.name}</span>
              </h3>
            </div>
            
            <form onSubmit={handleUpdateSubjectsSubmit} className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Class Filter</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-500"
                    value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                  >
                    <option value="">-- Choose Class --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Available Subjects</label>
                  <div className="h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-1">
                    {!selectedClass ? (
                      <p className="text-xs text-slate-400 text-center py-10">Select a class first</p>
                    ) : subjects.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-10">No subjects found for class</p>
                    ) : (
                      subjects.map(s => (
                        <label key={s.id} className="flex items-start gap-2.5 p-2 hover:bg-white rounded cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                            checked={selectedEditSubjects.includes(s.id)}
                            onChange={() => handleEditSubjectToggle(s.id)}
                          />
                          <span className="text-xs text-slate-700 leading-tight">{s.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {selectedEditSubjects.length > 0 && (
                <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-800 mb-3 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> 
                    Currently Selected ({selectedEditSubjects.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* For display, we might not have the subject name if they didn't select the class, but we can look it up from the candidate's existing assignments if available */}
                    {selectedEditSubjects.map(id => {
                      const sub = subjects.find(s => s.id === id) || (editCandidate.assignments.find(a => a.subject.id === id)?.subject);
                      return sub ? (
                        <span key={id} className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-[11px] font-medium text-slate-700 shadow-2xs">
                          {sub.name} {sub.class ? `(${sub.class.name})` : ''}
                        </span>
                      ) : (
                        <span key={id} className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-500 shadow-2xs italic">
                          Subject ID: {id.slice(0,8)}...
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        </div>
      )}

    </div>
  );
};
