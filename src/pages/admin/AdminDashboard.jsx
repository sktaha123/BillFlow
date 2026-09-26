import React, { useEffect, useMemo, useState } from 'react';
import { dataService } from '@/lib/supabase';
import {
  Users,
  UserPlus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Search,
  FileText,
  Edit,
  BookOpen,
  UserCheck,
  X,
  Loader2,
  KeyRound,
  GraduationCap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { SubjectsManagement } from './SubjectsManagement';

export const AdminDashboard = () => {
  const [profiles, setProfiles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('FACULTY');

  // Faculty expansion
  const [expandedId, setExpandedId] = useState(null);

  // Add faculty
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'FACULTY',
    department: 'Computer Science',
  });

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Edit faculty subjects
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCandidate, setEditCandidate] = useState(null);
  const [selectedEditClass, setSelectedEditClass] = useState('');
  const [editSubjects, setEditSubjects] = useState([]);
  const [selectedEditSubjects, setSelectedEditSubjects] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Deactivate faculty
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reactivate
  const [isReactivating, setIsReactivating] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });

    window.setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  /* -------------------------------------------------------
     LOAD DATA
  ------------------------------------------------------- */

  const fetchProfiles = async () => {
    setIsLoading(true);

    try {
      const data =
        await dataService.getAllProfilesWithAssignments();

      setProfiles(data || []);
    } catch (error) {
      console.error(error);
      showToast('error', 'Unable to load faculty directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const [classData] = await Promise.all([
          dataService.getClasses(),
          fetchProfiles(),
        ]);

        setClasses(classData || []);
      } catch (error) {
        console.error(error);
      }
    };

    initialize();
  }, []);

  /* -------------------------------------------------------
     SUBJECT LOADING FOR ADD FACULTY
  ------------------------------------------------------- */

  useEffect(() => {
    const loadSubjects = async () => {
      if (!selectedClass) {
        setSubjects([]);
        return;
      }

      try {
        const data =
          await dataService.getSubjects(selectedClass);

        setSubjects(data || []);
      } catch (error) {
        console.error(error);
        setSubjects([]);
        showToast('error', 'Unable to load subjects.');
      }
    };

    loadSubjects();
  }, [selectedClass]);

  /* -------------------------------------------------------
     SUBJECT LOADING FOR EDIT FACULTY
  ------------------------------------------------------- */

  useEffect(() => {
    const loadEditSubjects = async () => {
      if (!selectedEditClass) {
        setEditSubjects([]);
        return;
      }

      try {
        const data =
          await dataService.getSubjects(selectedEditClass);

        setEditSubjects(data || []);
      } catch (error) {
        console.error(error);
        setEditSubjects([]);
        showToast('error', 'Unable to load subjects.');
      }
    };

    loadEditSubjects();
  }, [selectedEditClass]);

  /* -------------------------------------------------------
     FILTER
  ------------------------------------------------------- */

  const filteredProfiles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return profiles;

    return profiles.filter((profile) => {
      return (
        profile.name?.toLowerCase().includes(query) ||
        profile.username?.toLowerCase().includes(query) ||
        profile.role?.toLowerCase().includes(query)
      );
    });
  }, [profiles, searchTerm]);

  /* -------------------------------------------------------
     HELPERS
  ------------------------------------------------------- */

  const getAssignmentsByClass = (profile) => {
    const classMap = {};

    (profile.assignments || []).forEach((assignment) => {
      const className = assignment.subject?.class?.name;

      if (!className) return;

      if (!classMap[className]) {
        classMap[className] = [];
      }

      classMap[className].push(assignment.subject);
    });

    return classMap;
  };

  const getAssignmentCount = (profile) => {
    return (profile.assignments || []).length;
  };

  const toggleExpand = (id) => {
    setExpandedId((current) =>
      current === id ? null : id
    );
  };

  /* -------------------------------------------------------
     ADD FACULTY
  ------------------------------------------------------- */

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects((current) =>
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId]
    );
  };

  const resetAddForm = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'FACULTY',
      department: 'Computer Science',
    });

    setSelectedClass('');
    setSelectedSubjects([]);
  };

  const closeAddModal = () => {
    if (isSubmitting) return;

    setIsAddModalOpen(false);
    resetAddForm();
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.username.trim() ||
      !formData.password.trim()
    ) {
      showToast(
        'error',
        'Please complete all required account fields.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await dataService.createFacultyProfile(
        formData,
        selectedSubjects
      );

      setIsAddModalOpen(false);
      resetAddForm();

      await fetchProfiles();

      showToast(
        'success',
        'Faculty account created successfully.'
      );
    } catch (error) {
      console.error(error);

      showToast(
        'error',
        'Unable to create account. The username may already exist.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -------------------------------------------------------
     EDIT SUBJECTS
  ------------------------------------------------------- */

  const openEditModal = (profile) => {
    const assignments = profile.assignments || [];

    const existingSubjectIds = assignments.map(
      (assignment) => assignment.subject.id
    );

    const firstAssignment = assignments[0];

    const firstClassId =
      firstAssignment?.subject?.class?.id || '';

    setEditCandidate(profile);
    setSelectedEditSubjects(existingSubjectIds);
    setSelectedEditClass(firstClassId);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (isUpdating) return;

    setIsEditModalOpen(false);
    setEditCandidate(null);
    setSelectedEditClass('');
    setEditSubjects([]);
    setSelectedEditSubjects([]);
  };

  const handleEditSubjectToggle = (subjectId) => {
    setSelectedEditSubjects((current) =>
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId]
    );
  };

  const handleUpdateSubjectsSubmit = async (event) => {
    event.preventDefault();

    if (!editCandidate) return;

    setIsUpdating(true);

    try {
      await dataService.updateFacultyAssignments(
        editCandidate.id,
        selectedEditSubjects
      );

      await fetchProfiles();

      closeEditModal();

      showToast(
        'success',
        'Faculty subjects updated successfully.'
      );
    } catch (error) {
      console.error(error);

      showToast(
        'error',
        'Unable to update faculty subjects.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  /* -------------------------------------------------------
     DEACTIVATE FACULTY
  ------------------------------------------------------- */

  const openDeleteModal = (profile) => {
    setDeleteCandidate(profile);
    setDeleteStep(1);
    setDeleteConfirmName('');
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;

    setDeleteCandidate(null);
    setDeleteStep(1);
    setDeleteConfirmName('');
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;

    if (deleteConfirmName !== deleteCandidate.name) {
      return;
    }

    setIsDeleting(true);

    try {
      await dataService.softDeleteProfile(
        deleteCandidate.id
      );

      await fetchProfiles();

      showToast(
        'success',
        `${deleteCandidate.name}'s account was deactivated.`
      );

      closeDeleteModal();
    } catch (error) {
      console.error(error);

      showToast(
        'error',
        'Unable to deactivate faculty account.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /* -------------------------------------------------------
     REACTIVATE FACULTY
  ------------------------------------------------------- */

  const handleReactivate = async (profile) => {
    const confirmed = window.confirm(
      `Reactivate ${profile.name}'s account?`
    );

    if (!confirmed) return;

    setIsReactivating(profile.id);

    try {
      await dataService.reactivateProfile(profile.id);

      await fetchProfiles();

      showToast(
        'success',
        `${profile.name}'s account was reactivated.`
      );
    } catch (error) {
      console.error(error);

      showToast(
        'error',
        'Unable to reactivate account.'
      );
    } finally {
      setIsReactivating(null);
    }
  };

  /* -------------------------------------------------------
     ROLE BADGE
  ------------------------------------------------------- */

  const roleBadge = (role) => {
    if (role === 'HOD') {
      return 'bg-amber-50 text-amber-700 border-amber-100';
    }

    if (role === 'HEAD') {
      return 'bg-rose-50 text-rose-700 border-rose-100';
    }

    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="relative max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* ---------------------------------------------------
          TOAST
      --------------------------------------------------- */}

      {toast && (
        <div
          className={clsx(
            'fixed z-[100] top-4 right-4 left-4 sm:left-auto sm:w-auto',
            'flex items-center gap-3 px-4 py-3 rounded-xl',
            'bg-white border shadow-lg',
            toast.type === 'success'
              ? 'border-emerald-200 text-emerald-800'
              : 'border-rose-200 text-rose-800'
          )}
          role="status"
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}

          <span className="text-sm font-medium">
            {toast.message}
          </span>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 p-1 rounded-md hover:bg-slate-100"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* ---------------------------------------------------
          TOP NAVIGATION
      --------------------------------------------------- */}

      <div className="flex justify-center mb-6">
        <div className="inline-flex w-full sm:w-auto p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('FACULTY')}
            className={clsx(
              'flex-1 sm:flex-none inline-flex items-center justify-center gap-2',
              'px-5 py-2.5 rounded-lg text-sm font-semibold',
              'transition-all',
              activeTab === 'FACULTY'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <Users className="w-4 h-4" />
            Faculty
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SUBJECTS')}
            className={clsx(
              'flex-1 sm:flex-none inline-flex items-center justify-center gap-2',
              'px-5 py-2.5 rounded-lg text-sm font-semibold',
              'transition-all',
              activeTab === 'SUBJECTS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <BookOpen className="w-4 h-4" />
            Subjects
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------
          SUBJECTS
      --------------------------------------------------- */}

      {activeTab === 'SUBJECTS' ? (
        <SubjectsManagement />
      ) : (
        <div className="space-y-5">
          {/* Header */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>

                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Faculty
                  </h1>

                  <p className="text-sm text-slate-500 mt-1">
                    Create and manage faculty accounts and
                    subject assignments.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="
                  w-full sm:w-auto
                  inline-flex items-center justify-center gap-2
                  px-4 py-3
                  rounded-xl
                  bg-indigo-600
                  text-white
                  text-sm font-semibold
                  hover:bg-indigo-700
                  active:bg-indigo-800
                  shadow-sm
                  transition-colors
                  touch-manipulation
                "
              >
                <UserPlus className="w-4 h-4" />
                Add Faculty
              </button>
            </div>
          </section>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="search"
              placeholder="Search faculty by name, username, or role..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              className="
                w-full
                pl-11 pr-4 py-3
                rounded-xl
                border border-slate-200
                bg-white
                text-sm text-slate-800
                placeholder:text-slate-400
                outline-none
                shadow-sm
                focus:border-indigo-400
                focus:ring-4
                focus:ring-indigo-500/10
              "
            />
          </div>

          {/* Count */}
          {!isLoading && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">
                {filteredProfiles.length}{' '}
                {filteredProfiles.length === 1
                  ? 'faculty member'
                  : 'faculty members'}
              </p>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* -------------------------------------------------
              LOADING
          ------------------------------------------------- */}

          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-3" />

              <p className="text-sm text-slate-500">
                Loading faculty directory...
              </p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            /* EMPTY */
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-slate-400" />
              </div>

              <h3 className="text-sm font-semibold text-slate-800">
                No faculty found
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {searchTerm
                  ? 'Try a different search.'
                  : 'Create your first faculty account.'}
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="w-10 px-4 py-3" />

                        <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Faculty
                        </th>

                        <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Role
                        </th>

                        <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Username
                        </th>

                        <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Subjects
                        </th>

                        <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Status
                        </th>

                        <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredProfiles.map((profile) => {
                        const isExpanded =
                          expandedId === profile.id;

                        const isActive =
                          profile.is_active !== false;

                        const assignmentsByClass =
                          getAssignmentsByClass(profile);

                        return (
                          <React.Fragment key={profile.id}>
                            <tr
                              className={clsx(
                                'transition-colors',
                                isActive
                                  ? 'hover:bg-slate-50/70'
                                  : 'bg-rose-50/30'
                              )}
                            >
                              <td className="px-4 py-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleExpand(profile.id)
                                  }
                                  className="
                                    w-8 h-8
                                    inline-flex items-center justify-center
                                    rounded-lg
                                    text-slate-400
                                    hover:bg-slate-100
                                    hover:text-slate-700
                                    transition-colors
                                  "
                                  aria-label={
                                    isExpanded
                                      ? 'Collapse details'
                                      : 'Show details'
                                  }
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              </td>

                              <td className="px-4 py-4">
                                <p className="text-sm font-semibold text-slate-900">
                                  {profile.name}
                                </p>

                                <p className="text-xs text-slate-400 mt-0.5">
                                  {profile.department}
                                </p>
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={clsx(
                                    'inline-flex px-2.5 py-1 rounded-lg border',
                                    'text-[10px] font-bold tracking-wide',
                                    roleBadge(profile.role)
                                  )}
                                >
                                  {profile.role}
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                <span className="text-sm text-slate-700 font-mono">
                                  {profile.username}
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                  {getAssignmentCount(profile)}
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                {isActive ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-100 text-xs font-semibold text-rose-700">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Inactive
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex justify-end gap-2">
                                  {isActive ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openEditModal(profile)
                                        }
                                        className="
                                          inline-flex items-center gap-1.5
                                          px-3 py-2
                                          rounded-lg 
                                          border border-slate-200
                                          text-xs font-semibold text-slate-700
                                          hover:bg-indigo-50
                                          hover:border-indigo-200
                                          hover:text-indigo-700
                                          transition-colors
                                        "
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                        Edit
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          openDeleteModal(profile)
                                        }
                                        className="
                                          inline-flex items-center gap-1.5
                                          px-3 py-2
                                          rounded-lg
                                          border border-rose-200
                                          text-xs font-semibold text-rose-600
                                          hover:bg-rose-50
                                          transition-colors
                                        "
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Deactivate
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleReactivate(profile)
                                      }
                                      disabled={
                                        isReactivating ===
                                        profile.id
                                      }
                                      className="
                                        inline-flex items-center gap-1.5
                                        px-3 py-2
                                        rounded-lg
                                        border border-emerald-200
                                        text-xs font-semibold text-emerald-700
                                        hover:bg-emerald-50
                                        disabled:opacity-50
                                      "
                                    >
                                      {isReactivating ===
                                      profile.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <UserCheck className="w-3.5 h-3.5" />
                                      )}

                                      Reactivate
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr
                                className={clsx(
                                  'bg-slate-50/70',
                                  !isActive && 'opacity-70'
                                )}
                              >
                                <td
                                  colSpan={7}
                                  className="px-8 py-5"
                                >
                                  <FacultyDetails
                                    profile={profile}
                                    assignmentsByClass={
                                      assignmentsByClass
                                    }
                                    isActive={isActive}
                                    onEdit={() =>
                                      openEditModal(profile)
                                    }
                                    onDeactivate={() =>
                                      openDeleteModal(profile)
                                    }
                                    onReactivate={() =>
                                      handleReactivate(profile)
                                    }
                                    isReactivating={
                                      isReactivating ===
                                      profile.id
                                    }
                                  />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* =================================================
                  MOBILE / TABLET CARDS
              ================================================= */}

              <div className="lg:hidden space-y-3">
                {filteredProfiles.map((profile) => {
                  const isExpanded =
                    expandedId === profile.id;

                  const isActive =
                    profile.is_active !== false;

                  const assignmentsByClass =
                    getAssignmentsByClass(profile);

                  return (
                    <div
                      key={profile.id}
                      className={clsx(
                        'bg-white border rounded-2xl shadow-sm overflow-hidden',
                        isActive
                          ? 'border-slate-200'
                          : 'border-rose-200 bg-rose-50/20'
                      )}
                    >
                      {/* Card header */}
                      <button
                        type="button"
                        onClick={() =>
                          toggleExpand(profile.id)
                        }
                        className="w-full text-left p-4 sm:p-5 touch-manipulation"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-indigo-600" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="text-sm font-bold text-slate-900 truncate">
                                  {profile.name}
                                </h3>

                                <p className="text-xs text-slate-400 mt-0.5">
                                  {profile.department}
                                </p>
                              </div>

                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <span
                                className={clsx(
                                  'inline-flex px-2 py-1 rounded-md border',
                                  'text-[10px] font-bold',
                                  roleBadge(profile.role)
                                )}
                              >
                                {profile.role}
                              </span>

                              {isActive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] font-semibold text-emerald-700">
                                  <CheckCircle className="w-3 h-3" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 border border-rose-100 text-[10px] font-semibold text-rose-700">
                                  <AlertCircle className="w-3 h-3" />
                                  Inactive
                                </span>
                              )}

                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-600">
                                <BookOpen className="w-3 h-3" />
                                {getAssignmentCount(profile)} subjects
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Expanded mobile details */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 p-4 sm:p-5">
                          <FacultyDetails
                            profile={profile}
                            assignmentsByClass={
                              assignmentsByClass
                            }
                            isActive={isActive}
                            onEdit={() =>
                              openEditModal(profile)
                            }
                            onDeactivate={() =>
                              openDeleteModal(profile)
                            }
                            onReactivate={() =>
                              handleReactivate(profile)
                            }
                            isReactivating={
                              isReactivating === profile.id
                            }
                            mobile
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* =====================================================
          ADD FACULTY MODAL
      ===================================================== */}

      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center pt-20 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-faculty-title"
        >
          <button
            type="button"
            disabled={isSubmitting}
            onClick={closeAddModal}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            aria-label="Close"
          />

          <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95  duration-150">
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div>
                <h2
                  id="add-faculty-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Create Faculty Account
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Add account details and assign subjects.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={isSubmitting}
                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              className="overflow-y-auto"
            >
              <div className="p-5 sm:p-6 space-y-7">
                {/* Account details */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      Account details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Full name"
                      required
                      value={formData.name}
                      placeholder="e.g. John Doe"
                      onChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          name: value,
                        }))
                      }
                    />

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Role
                      </label>

                      <select
                        value={formData.role}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            role: event.target.value,
                          }))
                        }
                        className="
                          w-full
                          px-3.5 py-3
                          rounded-xl
                          border border-slate-200
                          bg-white
                          text-sm
                          outline-none
                          focus:border-indigo-500
                          focus:ring-4
                          focus:ring-indigo-500/10
                        "
                      >
                        <option value="FACULTY">
                          FACULTY
                        </option>

                        <option value="HOD">HOD</option>

                        <option value="HEAD">HEAD</option>
                      </select>
                    </div>

                    <Field
                      label="Username"
                      required
                      value={formData.username}
                      placeholder="e.g. john@2026"
                      mono
                      onChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          username: value,
                        }))
                      }
                    />

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Password
                      </label>

                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                        <input
                          required
                          type="password"
                          value={formData.password}
                          placeholder="Enter password"
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              password: event.target.value,
                            }))
                          }
                          className="
                            w-full
                            pl-10 pr-3.5 py-3
                            rounded-xl
                            border border-slate-200
                            text-sm
                            outline-none
                            focus:border-indigo-500
                            focus:ring-4
                            focus:ring-indigo-500/10
                          "
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Assignment */}
                <section className="border-t border-slate-100 pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Assign subjects
                      </h3>

                      <p className="text-xs text-slate-500 mt-0.5">
                        Optional. Choose a class and select the
                        subjects this faculty member can manage.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Class
                      </label>

                      <select
                        value={selectedClass}
                        onChange={(event) => {
                          setSelectedClass(
                            event.target.value
                          );
                          setSelectedSubjects([]);
                        }}
                        className="
                          w-full
                          px-3.5 py-3
                          rounded-xl
                          border border-slate-200
                          bg-white
                          text-sm
                          outline-none
                          focus:border-indigo-500
                          focus:ring-4
                          focus:ring-indigo-500/10
                        "
                      >
                        <option value="">
                          No class selected
                        </option>

                        {classes.map((classItem) => (
                          <option
                            key={classItem.id}
                            value={classItem.id}
                          >
                            {classItem.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedClass && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            Subjects
                          </span>

                          <span className="text-xs font-semibold text-indigo-600">
                            {selectedSubjects.length} selected
                          </span>
                        </div>

                        {subjects.length === 0 ? (
                          <div className="p-6 text-center">
                            <p className="text-xs text-slate-500">
                              No subjects found for this class.
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {subjects.map((subject) => {
                              const selected =
                                selectedSubjects.includes(
                                  subject.id
                                );

                              return (
                                <label
                                  key={subject.id}
                                  className="
                                    flex items-center gap-3
                                    p-3.5
                                    cursor-pointer
                                    hover:bg-slate-50
                                    active:bg-slate-100
                                    transition-colors
                                    touch-manipulation
                                  "
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() =>
                                      handleSubjectToggle(
                                        subject.id
                                      )
                                    }
                                    className="
                                      w-5 h-5
                                      rounded-md
                                      border-slate-300
                                      text-indigo-600
                                      focus:ring-indigo-500
                                    "
                                  />

                                  <span className="text-sm font-medium text-slate-700">
                                    {subject.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 px-5 sm:px-6 py-4 border-t border-slate-200 bg-white flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={isSubmitting}
                  className="
                    w-full sm:w-auto
                    px-4 py-3
                    rounded-xl
                    border border-slate-200
                    text-sm font-semibold text-slate-600
                    hover:bg-slate-50
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    w-full sm:w-auto
                    inline-flex items-center justify-center gap-2
                    px-5 py-3
                    rounded-xl
                    bg-indigo-600
                    text-white
                    text-sm font-semibold
                    hover:bg-indigo-700
                    disabled:opacity-50
                  "
                >
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}

                  {isSubmitting
                    ? 'Creating...'
                    : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT SUBJECTS MODAL
      ===================================================== */}

      {isEditModalOpen && editCandidate && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 pt-20"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-subjects-title"
        >
          <button
            type="button"
            disabled={isUpdating}
            onClick={closeEditModal}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            aria-label="Close"
          />

          <div className="relative
    w-full
    max-w-2xl
    max-h-[calc(100dvh-108px)]
    bg-white
    rounded-2xl
    shadow-2xl
    border border-slate-200
    overflow-hidden
    flex flex-col
    animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="min-w-0">
                <h2
                  id="edit-subjects-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Edit subjects
                </h2>

                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {editCandidate.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={isUpdating}
                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-700"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateSubjectsSubmit}
              className="overflow-y-auto"
            >
              <div className="p-5 sm:p-6 space-y-5">
                {/* Class */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Class
                  </label>

                  <select
                    value={selectedEditClass}
                    onChange={(event) => {
                      const classId =
                        event.target.value;

                      setSelectedEditClass(classId);

                      /*
                       * Keep existing selections only if
                       * they belong to the selected class.
                       */
                      if (!classId) {
                        return;
                      }

                      const classSubjectIds =
                        subjects
                          .filter(
                            (subject) =>
                              subject.class_id === classId ||
                              subject.class?.id === classId
                          )
                          .map((subject) => subject.id);

                      setSelectedEditSubjects(
                        (current) =>
                          current.filter((id) =>
                            classSubjectIds.includes(id)
                          )
                      );
                    }}
                    className="
                      w-full
                      px-3.5 py-3
                      rounded-xl
                      border border-slate-200
                      bg-white
                      text-sm
                      outline-none
                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-500/10
                    "
                  >
                    <option value="">
                      Choose a class
                    </option>

                    {classes.map((classItem) => (
                      <option
                        key={classItem.id}
                        value={classItem.id}
                      >
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subjects */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Assigned subjects
                      </p>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Select the subjects this faculty member
                        should manage.
                      </p>
                    </div>

                    <span className="shrink-0 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {selectedEditSubjects.length} selected
                    </span>
                  </div>

                  {!selectedEditClass ? (
                    <div className="p-8 text-center">
                      <BookOpen className="w-6 h-6 text-slate-300 mx-auto mb-2" />

                      <p className="text-sm text-slate-500">
                        Choose a class to manage subjects.
                      </p>
                    </div>
                  ) : editSubjects.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-slate-500">
                        No subjects found for this class.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {editSubjects.map((subject) => {
                        const selected =
                          selectedEditSubjects.includes(
                            subject.id
                          );

                        return (
                          <label
                            key={subject.id}
                            className="
                              flex items-center gap-3
                              p-3.5
                              cursor-pointer
                              hover:bg-slate-50
                              active:bg-slate-100
                              touch-manipulation
                            "
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                handleEditSubjectToggle(
                                  subject.id
                                )
                              }
                              className="
                                w-5 h-5
                                rounded-md
                                border-slate-300
                                text-indigo-600
                                focus:ring-indigo-500
                              "
                            />

                            <span
                              className={clsx(
                                'text-sm font-medium',
                                selected
                                  ? 'text-slate-900'
                                  : 'text-slate-600'
                              )}
                            >
                              {subject.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Current selections */}
                {selectedEditSubjects.length > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-indigo-600" />

                      <p className="text-xs font-bold text-indigo-900">
                        {selectedEditSubjects.length} subject
                        {selectedEditSubjects.length !== 1
                          ? 's'
                          : ''}{' '}
                        selected
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedEditSubjects.map((id) => {
                        const fromCurrentList =
                          editSubjects.find(
                            (subject) =>
                              subject.id === id
                          );

                        const fromAssignments =
                          editCandidate.assignments?.find(
                            (assignment) =>
                              assignment.subject?.id === id
                          )?.subject;

                        const subject =
                          fromCurrentList ||
                          fromAssignments;

                        if (!subject) return null;

                        return (
                          <span
                            key={id}
                            className="
                              inline-flex items-center
                              px-2.5 py-1.5
                              rounded-lg
                              bg-white
                              border border-indigo-200
                              text-xs font-medium text-slate-700
                            "
                          >
                            {subject.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 px-5 sm:px-6 py-4 border-t border-slate-200 bg-white flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isUpdating}
                  className="
                    w-full sm:w-auto
                    px-4 py-3
                    rounded-xl
                    border border-slate-200
                    text-sm font-semibold text-slate-600
                    hover:bg-slate-50
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="
                    w-full sm:w-auto
                    inline-flex items-center justify-center gap-2
                    px-5 py-3
                    rounded-xl
                    bg-indigo-600
                    text-white
                    text-sm font-semibold
                    hover:bg-indigo-700
                    disabled:opacity-50
                  "
                >
                  {isUpdating && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}

                  {isUpdating
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          DEACTIVATE FACULTY MODAL
      ===================================================== */}

      {deleteCandidate && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-faculty-title"
        >
          <button
            type="button"
            disabled={isDeleting}
            onClick={closeDeleteModal}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            aria-label="Close"
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 sm:p-6">
              <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>

              {deleteStep === 1 ? (
                <>
                  <h2
                    id="deactivate-faculty-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    Deactivate faculty account?
                  </h2>

                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    This will prevent{' '}
                    <strong className="text-slate-900">
                      {deleteCandidate.name}
                    </strong>{' '}
                    from logging in.
                  </p>

                  <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Historical bills and records will remain
                      preserved.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      className="
                        px-4 py-3
                        rounded-xl
                        border border-slate-200
                        text-sm font-semibold text-slate-700
                        hover:bg-slate-50
                      "
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteStep(2)}
                      className="
                        px-4 py-3
                        rounded-xl
                        bg-rose-600
                        text-white
                        text-sm font-semibold
                        hover:bg-rose-700
                      "
                    >
                      Continue
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-slate-900">
                    Confirm deactivation
                  </h2>

                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Type the faculty member's full name to
                    confirm this action.
                  </p>

                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Type:
                    </label>

                    <div className="mb-2 px-3 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-800 select-none">
                      {deleteCandidate.name}
                    </div>

                    <input
                      autoFocus
                      type="text"
                      value={deleteConfirmName}
                      onChange={(event) =>
                        setDeleteConfirmName(
                          event.target.value
                        )
                      }
                      placeholder="Type the name exactly"
                      autoComplete="off"
                      className="
                        w-full
                        px-3.5 py-3
                        rounded-xl
                        border border-slate-300
                        text-sm
                        outline-none
                        focus:border-rose-500
                        focus:ring-4
                        focus:ring-rose-500/10
                      "
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteStep(1);
                        setDeleteConfirmName('');
                      }}
                      disabled={isDeleting}
                      className="
                        px-4 py-3
                        rounded-xl
                        border border-slate-200
                        text-sm font-semibold text-slate-700
                        hover:bg-slate-50
                        disabled:opacity-50
                      "
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={
                        isDeleting ||
                        deleteConfirmName !==
                          deleteCandidate.name
                      }
                      className="
                        inline-flex items-center justify-center gap-2
                        px-4 py-3
                        rounded-xl
                        bg-rose-600
                        text-white
                        text-sm font-semibold
                        hover:bg-rose-700
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                      "
                    >
                      {isDeleting && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}

                      {isDeleting
                        ? 'Deactivating...'
                        : 'Deactivate'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===========================================================
   FACULTY DETAILS
=========================================================== */

const FacultyDetails = ({
  profile,
  assignmentsByClass,
  isActive,
  onEdit,
  onDeactivate,
  onReactivate,
  isReactivating,
  mobile = false,
}) => {
  return (
    <div className="space-y-5">
      {/* Account information */}
      <div
        className={clsx(
          'grid gap-3',
          mobile
            ? 'grid-cols-1'
            : 'grid-cols-1 md:grid-cols-3'
        )}
      >
        

        
      </div>

      {/* Assigned subjects */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">

            <h4 className="text-sm font-bold text-slate-800">
              Assigned Subjects
            </h4>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {profile.assignments?.length || 0} total
          </span>
        </div>

        {Object.keys(assignmentsByClass).length === 0 ? (
          <div className="p-4 rounded-xl bg-white border border-dashed border-slate-300">
            <p className="text-sm text-slate-500">
              No subjects assigned.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Object.entries(assignmentsByClass).map(
              ([className, subjectList]) => (
                <div
                  key={className}
                  className="p-4 rounded-xl bg-white border border-slate-200"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                      {className}
                    </span>

                    <span className="text-[10px] font-semibold text-slate-400">
                      {subjectList.length}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {subjectList.map((subject) => (
                      <li
                        key={subject.id}
                        className="flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />

                        <span className="text-xs text-slate-600 leading-relaxed">
                          {subject.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 border-slate-200">
        {isActive ? (
          <div className="grid grid-cols-1  sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="
                inline-flex items-center justify-center gap-2
                px-4 py-3
                rounded-xl
                bg-indigo-600
                text-white
                 md:hidden
                text-sm font-semibold
                hover:bg-indigo-700
                active:bg-indigo-800
                transition-colors
              "
            >
              <Edit className="w-4 h-4" />
              Edit Subjects
            </button>

            <button
              type="button"
              onClick={onDeactivate}
              className="
                inline-flex items-center justify-center gap-2
                px-4 py-3
                rounded-xl
                border border-rose-200
                text-rose-600
                text-sm font-semibold
                hover:bg-rose-50
                active:bg-rose-100
                md:hidden
                transition-colors
              "
            >
              <Trash2 className="w-4 h-4" />
              Deactivate Account
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onReactivate}
            disabled={isReactivating}
            className="
              w-full
              inline-flex items-center justify-center gap-2
              px-4 py-3
              rounded-xl
              bg-emerald-600
              text-white
              text-sm font-semibold
              hover:bg-emerald-700
              disabled:opacity-50
              transition-colors
            "
          >
            {isReactivating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}

            {isReactivating
              ? 'Reactivating...'
              : 'Reactivate Account'}
          </button>
        )}
      </div>
    </div>
  );
};

/* ===========================================================
   FIELD COMPONENT
=========================================================== */

const Field = ({
  label,
  required = false,
  value,
  placeholder,
  onChange,
  mono = false,
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}

        {required && (
          <span className="text-rose-500 ml-1">*</span>
        )}
      </label>

      <input
        required={required}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={clsx(
          'w-full px-3.5 py-3 rounded-xl',
          'border border-slate-200',
          'text-sm text-slate-900',
          'placeholder:text-slate-400',
          'outline-none',
          'focus:border-indigo-500',
          'focus:ring-4',
          'focus:ring-indigo-500/10',
          mono && 'font-mono'
        )}
      />
    </div>
  );
};