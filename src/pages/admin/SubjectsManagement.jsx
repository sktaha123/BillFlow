import React, { useState, useEffect, useRef } from 'react';
import { dataService } from '@/lib/supabase';
import {
  BookOpen,
  Edit2,
  Save,
  X,
  PlusCircle,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { clsx } from 'clsx';

export const SubjectsManagement = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // Add State
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Mobile action menu
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    dataService.getClasses().then(setClasses).catch(console.error);
  }, []);

  const loadSubjects = async (classId) => {
    if (!classId) {
      setSubjects([]);
      return;
    }

    setIsLoading(true);

    try {
      const data = await dataService.getSubjects(classId);
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects(selectedClass);
  }, [selectedClass]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const handleEditInit = (subject) => {
    setOpenMenuId(null);
    setEditingId(subject.id);
    setEditName(subject.name);
  };

  const handleEditSave = async (subjectId) => {
    if (!editName.trim()) return;

    try {
      await dataService.updateSubject(subjectId, editName.trim());

      setEditingId(null);
      setEditName('');

      await loadSubjects(selectedClass);
    } catch (err) {
      console.error(err);
      alert('Failed to update subject.');
    }
  };

  const handleDeleteSubject = async (subject) => {
    setOpenMenuId(null);

    if (
      window.confirm(
        `Are you sure you want to delete the subject "${subject.name}"? This action will hide it from future assignments, but existing bills will be preserved.`
      )
    ) {
      try {
        await dataService.deleteSubject(subject.id);
        await loadSubjects(selectedClass);
      } catch (err) {
        console.error(err);
        alert('Failed to delete subject.');
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!newSubjectName.trim() || !selectedClass) return;

    setIsAdding(true);

    try {
      await dataService.createSubject(
        selectedClass,
        newSubjectName.trim()
      );

      setNewSubjectName('');
      await loadSubjects(selectedClass);
    } catch (err) {
      console.error(err);
      alert('Failed to add subject.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white mx-auto max-w-xl rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Manage Subjects
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Select a class to view, edit, or add its subjects.
        </p>
      </div>

      <div className="p-5 md:p-6">
        <div className="max-w-md mb-8">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select Class
          </label>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all shadow-sm"
          >
            <option value="">-- Choose Class --</option>

            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <div className="space-y-6">

            {/* Subject List */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Current Subjects
                </span>

                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  {subjects.length} Total
                </span>
              </div>

              {isLoading ? (
                <div className="p-10 text-center text-sm text-slate-500 font-mono animate-pulse">
                  Loading subjects...
                </div>
              ) : subjects.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500 italic">
                  No subjects found for this class.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {subjects.map((s) => (
                    <li
                      key={s.id}
                      className="px-4 py-3 hover:bg-slate-50/50 transition-colors flex items-center justify-between group gap-3"
                    >
                      {editingId === s.id ? (
                        <div className="flex-1 flex items-center gap-3 min-w-0">
                          <input
                            autoFocus
                            value={editName}
                            onChange={(e) =>
                              setEditName(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEditSave(s.id);
                              }

                              if (e.key === 'Escape') {
                                setEditingId(null);
                                setEditName('');
                              }
                            }}
                            className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium text-slate-900"
                          />

                          <button
                            type="button"
                            onClick={() => handleEditSave(s.id)}
                            className="shrink-0 p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setEditName('');
                            }}
                            className="shrink-0 p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Subject Name */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-indigo-400" />

                            <span className="text-sm font-medium text-slate-800 break-words">
                              {s.name}
                            </span>
                          </div>

                          {/* DESKTOP ACTIONS */}
                          <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleEditInit(s)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit Subject Name"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSubject(s)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* MOBILE ACTION MENU */}
                          {/* MOBILE ACTION MENU */}
<div
  ref={openMenuId === s.id ? menuRef : null}
  className="relative md:hidden shrink-0"
>
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();

      setOpenMenuId((current) =>
        current === s.id ? null : s.id
      );
    }}
    className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors touch-manipulation"
    aria-label={`Actions for ${s.name}`}
    aria-expanded={openMenuId === s.id}
  >
    <MoreVertical className="w-5 h-5" />
  </button>

  {openMenuId === s.id && (
  <div
    className={clsx(
      "absolute right-0 z-[100] w-36 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden",
      subjects.length >= 2 &&
        subjects.slice(-2).some(
          (subject) => subject.id === s.id
        )
        ? "bottom-11"
        : "top-11"
    )}
  >
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleEditInit(s);
      }}
      className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
    >
      <Edit2 className="w-4 h-4 text-slate-500" />
      Edit
    </button>

    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteSubject(s);
      }}
      className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-colors text-left"
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </button>
  </div>
)}
</div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add New Subject */}
            <form
              onSubmit={handleAddSubmit}
              className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-5"
            >
              <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-4">
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                Add New Subject
              </h4>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter subject name..."
                  required
                  value={newSubjectName}
                  onChange={(e) =>
                    setNewSubjectName(e.target.value)
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white shadow-sm"
                />

                <button
                  type="submit"
                  disabled={
                    isAdding || !newSubjectName.trim()
                  }
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm hover:shadow"
                >
                  {isAdding ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </form>

          </div>
        )}
      </div>
    </div>
  );
};