import React, { useEffect, useState } from 'react';
import { dataService } from '@/lib/supabase';
import {
  BookOpen,
  Edit2,
  Save,
  X,
  PlusCircle,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';

export const SubjectsManagement = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Add state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Deactivate state
  const [deactivateCandidate, setDeactivateCandidate] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });

    window.setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await dataService.getClasses();
        setClasses(data || []);
      } catch (error) {
        console.error(error);
        showToast('error', 'Unable to load classes.');
      }
    };

    loadClasses();
  }, []);

  const loadSubjects = async (classId) => {
    if (!classId) {
      setSubjects([]);
      return;
    }

    setIsLoading(true);

    try {
      const data = await dataService.getSubjects(classId);
      setSubjects(data || []);
    } catch (error) {
      console.error(error);
      showToast('error', 'Unable to load subjects.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects(selectedClass);
  }, [selectedClass]);

  const handleEditInit = (subject) => {
    setEditingId(subject.id);
    setEditName(subject.name);
  };

  const handleEditCancel = () => {
    if (isSavingEdit) return;

    setEditingId(null);
    setEditName('');
  };

  const handleEditSave = async (subjectId) => {
    const trimmedName = editName.trim();

    if (!trimmedName) {
      showToast('error', 'Subject name cannot be empty.');
      return;
    }

    setIsSavingEdit(true);

    try {
      await dataService.updateSubject(subjectId, trimmedName);

      setEditingId(null);
      setEditName('');

      await loadSubjects(selectedClass);

      showToast('success', 'Subject updated successfully.');
    } catch (error) {
      console.error(error);
      showToast('error', 'Unable to update subject.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const openDeactivateModal = (subject) => {
    setDeactivateCandidate(subject);
  };

  const closeDeactivateModal = () => {
    if (isDeactivating) return;

    setDeactivateCandidate(null);
  };

  const handleDeactivateSubject = async () => {
    if (!deactivateCandidate) return;

    setIsDeactivating(true);

    try {
      await dataService.deleteSubject(deactivateCandidate.id);

      await loadSubjects(selectedClass);

      setDeactivateCandidate(null);

      showToast(
        'success',
        `${deactivateCandidate.name} was deactivated.`
      );
    } catch (error) {
      console.error(error);
      showToast('error', 'Unable to deactivate subject.');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleAddSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = newSubjectName.trim();

    if (!trimmedName) {
      showToast('error', 'Enter a subject name.');
      return;
    }

    if (!selectedClass) {
      showToast('error', 'Select a class first.');
      return;
    }

    setIsAdding(true);

    try {
      await dataService.createSubject(selectedClass, trimmedName);

      setNewSubjectName('');

      await loadSubjects(selectedClass);

      showToast('success', 'Subject added successfully.');
    } catch (error) {
      console.error(error);
      showToast('error', 'Unable to add subject.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto animate-in fade-in duration-200">
      {/* Toast */}
      {toast && (
        <div
          className={clsx(
            'fixed z-[100] top-4 right-4 left-4 sm:left-auto sm:w-auto',
            'flex items-center gap-3 px-4 py-3 rounded-xl',
            'border shadow-lg backdrop-blur-md',
            'animate-in slide-in-from-top-2 duration-200',
            toast.type === 'success'
              ? 'bg-white border-emerald-200 text-emerald-800'
              : 'bg-white border-rose-200 text-rose-800'
          )}
          role="status"
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}

          <span className="text-sm font-medium">
            {toast.message}
          </span>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 p-1 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Subjects
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Manage subjects available for faculty assignments.
            </p>
          </div>
        </div>
      </div>

      {/* Class selector */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 mb-5">
        <label
          htmlFor="subject-class"
          className="block text-sm font-semibold text-slate-800 mb-2"
        >
          Class
        </label>

        <select
          id="subject-class"
          value={selectedClass}
          onChange={(event) => setSelectedClass(event.target.value)}
          className="
            w-full
            px-4 py-3
            rounded-xl
            border border-slate-300
            bg-white
            text-sm text-slate-800
            outline-none
            transition-all
            focus:border-indigo-500
            focus:ring-4
            focus:ring-indigo-500/10
          "
        >
          <option value="">Choose a class</option>

          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))}
        </select>
      </section>

      {/* Empty state before class selection */}
      {!selectedClass && (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-slate-400" />
          </div>

          <h3 className="text-sm font-semibold text-slate-800">
            Select a class
          </h3>

          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Choose a class above to view and manage its subjects.
          </p>
        </div>
      )}

      {/* Selected class content */}
      {selectedClass && (
        <div className="space-y-5">
          {/* Subjects */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Current Subjects
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage subjects for the selected class.
                  </p>
                </div>

                <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
                  {subjects.length}{' '}
                  {subjects.length === 1 ? 'subject' : 'subjects'}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="p-10 flex flex-col items-center justify-center">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin mb-3" />

                <p className="text-sm text-slate-500">
                  Loading subjects...
                </p>
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-8 sm:p-10 text-center">
                <div className="w-11 h-11 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-slate-400" />
                </div>

                <h4 className="text-sm font-semibold text-slate-800">
                  No subjects yet
                </h4>

                <p className="text-sm text-slate-500 mt-1">
                  Add the first subject using the form below.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="p-4 sm:px-5 sm:py-4"
                  >
                    {editingId === subject.id ? (
                      /* EDIT MODE */
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Subject name
                          </label>

                          <input
                            autoFocus
                            type="text"
                            value={editName}
                            onChange={(event) =>
                              setEditName(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key === 'Enter' &&
                                !isSavingEdit
                              ) {
                                handleEditSave(subject.id);
                              }

                              if (event.key === 'Escape') {
                                handleEditCancel();
                              }
                            }}
                            className="
                              w-full
                              px-3.5 py-3
                              rounded-xl
                              border border-indigo-400
                              text-sm font-medium
                              text-slate-900
                              outline-none
                              ring-4 ring-indigo-500/10
                            "
                          />
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleEditCancel}
                            disabled={isSavingEdit}
                            className="
                              w-full sm:w-auto
                              inline-flex items-center justify-center gap-2
                              px-4 py-2.5
                              rounded-xl
                              border border-slate-200
                              text-sm font-semibold text-slate-600
                              hover:bg-slate-50
                              disabled:opacity-50
                              transition-colors
                            "
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditSave(subject.id)}
                            disabled={
                              isSavingEdit || !editName.trim()
                            }
                            className="
                              w-full sm:w-auto
                              inline-flex items-center justify-center gap-2
                              px-4 py-2.5
                              rounded-xl
                              bg-indigo-600
                              text-white
                              text-sm font-semibold
                              hover:bg-indigo-700
                              disabled:opacity-50
                              disabled:cursor-not-allowed
                              transition-colors
                            "
                          >
                            {isSavingEdit ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}

                            {isSavingEdit
                              ? 'Saving...'
                              : 'Save changes'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* NORMAL MODE */
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 break-words">
                              {subject.name}
                            </p>

                          </div>
                        </div>

                        {/* Actions are always visible */}
                        <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditInit(subject)}
                            className="
                              inline-flex items-center justify-center gap-2
                              px-2.5 py-2 cursor-pointer
                              rounded-xl
                              border border-slate-200
                              bg-white
                              text-xs font-semibold text-slate-700
                              hover:border-indigo-200
                              hover:bg-indigo-50
                              hover:text-indigo-700
                              active:bg-indigo-100
                              transition-colors
                              touch-manipulation
                            "
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openDeactivateModal(subject)
                            }
                            className="
                              inline-flex items-center justify-center gap-2
                              px-2.5 py-2 cursor-pointer
                              rounded-xl
                              border border-rose-200
                              bg-white
                              text-xs font-semibold text-rose-600
                              hover:bg-rose-50
                              active:bg-rose-100
                              transition-colors
                              touch-manipulation
                            "
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Add subject */}
          <section className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-white border border-indigo-100 flex items-center justify-center shrink-0">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-indigo-950">
                  Add subject
                </h3>

                <p className="text-xs text-indigo-800/70 mt-0.5">
                  Add a new subject to this class.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddSubmit}>
              <label
                htmlFor="new-subject"
                className="sr-only"
              >
                Subject name
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="new-subject"
                  type="text"
                  placeholder="Enter subject name"
                  value={newSubjectName}
                  onChange={(event) =>
                    setNewSubjectName(event.target.value)
                  }
                  disabled={isAdding}
                  className="
                    flex-1
                    min-w-0
                    px-4 py-3
                    rounded-xl
                    border border-indigo-200
                    bg-white
                    text-sm text-slate-900
                    placeholder:text-slate-400
                    outline-none
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-500/10
                    disabled:opacity-60
                  "
                />

                <button
                  type="submit"
                  disabled={
                    isAdding || !newSubjectName.trim()
                  }
                  className="
                    w-full sm:w-auto
                    inline-flex items-center justify-center gap-2
                    px-5 py-3
                    rounded-xl
                    bg-indigo-600
                    text-white
                    text-sm font-semibold
                    hover:bg-indigo-700
                    active:bg-indigo-800
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    transition-colors
                    touch-manipulation
                  "
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}

                  {isAdding ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Deactivate confirmation modal */}
      {deactivateCandidate && (
        <div
          className="
            fixed inset-0 z-[90]
            flex items-center justify-center
            p-4
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-subject-title"
        >
          <button
            type="button"
            aria-label="Close confirmation"
            disabled={isDeactivating}
            onClick={closeDeactivateModal}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          <div
            className="
              relative
              w-full max-w-md
              bg-white
              rounded-2xl
              shadow-2xl
              border border-slate-200
              overflow-hidden
              animate-in zoom-in-95 duration-150
            "
          >
            <div className="p-5 sm:p-6">
              <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>

              <h3
                id="deactivate-subject-title"
                className="text-lg font-bold text-slate-900"
              >
                Deactivate subject?
              </h3>

              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                You are about to deactivate{' '}
                <strong className="text-slate-900">
                  {deactivateCandidate.name}
                </strong>
                .
              </p>

              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />

                  <p className="text-xs text-slate-600 leading-relaxed">
                    This will hide the subject from future faculty
                    assignments. Existing bills will remain preserved.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeDeactivateModal}
                  disabled={isDeactivating}
                  className="
                    px-4 py-3
                    rounded-xl
                    border border-slate-200
                    text-sm font-semibold text-slate-700
                    hover:bg-slate-50
                    disabled:opacity-50
                    transition-colors
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeactivateSubject}
                  disabled={isDeactivating}
                  className="
                    inline-flex items-center justify-center gap-2
                    px-4 py-3
                    rounded-xl
                    bg-rose-600
                    text-white
                    text-sm font-semibold
                    hover:bg-rose-700
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  {isDeactivating && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}

                  {isDeactivating
                    ? 'Deactivating...'
                    : 'Deactivate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};