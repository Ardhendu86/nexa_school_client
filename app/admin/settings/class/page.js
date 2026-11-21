'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ChevronRight,
  Pencil,
  Trash2,
  Layers,
  GraduationCap
} from 'lucide-react';
import { encryptId } from '@/lib/crypto';
import Pagination, { paginateData } from '@/components/Pagination';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function ClassListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [classes, setClasses] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState(null);

  // Inline delete confirmation state (no popup / modal)
  const [deletingClass, setDeletingClass] = useState(null);

  // Check URL notification query param
  useEffect(() => {
    const notify = searchParams.get('notify');
    if (notify === 'created') {
      showToast('Class created successfully!', 'success');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else if (notify === 'updated') {
      showToast('Class updated successfully!', 'success');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [searchParams]);

  // Load classes from database
  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/classes`, { timeout: 4000 });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setClasses(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err.message);
      showToast('Could not load classes from database.', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Load shifts for filter dropdown
  const loadShifts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/shifts`, { timeout: 4000 });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setShifts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching shifts for filter:', err.message);
    }
  };

  useEffect(() => {
    loadClasses();
    loadShifts();
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Perform delete from database
  const handleConfirmDelete = async () => {
    if (!deletingClass) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/classes/${deletingClass.id}`, { timeout: 4000 });
      setClasses((prev) => prev.filter((c) => String(c.id) !== String(deletingClass.id)));
      showToast(`Class "${deletingClass.class_name || deletingClass.name}" was successfully deleted.`, 'info');
    } catch (err) {
      console.error('Error deleting class:', err.message);
      showToast('Failed to delete class from database.', 'info');
    }

    setDeletingClass(null);
  };

  // Filter classes based on search query, shift filter, and status filter
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      // Status filter
      if (statusFilter === 'ACTIVE' && c.status === false) return false;
      if (statusFilter === 'INACTIVE' && c.status !== false) return false;

      // Shift filter
      if (shiftFilter !== 'ALL') {
        if (String(c.shift_id) !== String(shiftFilter)) return false;
      }

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const nameMatch = (c.class_name || c.name || '').toLowerCase().includes(term);
      const shiftMatch = (c.shift_name || '').toLowerCase().includes(term);
      const sortMatch = String(c.sort_order || '').includes(term);
      return nameMatch || shiftMatch || sortMatch;
    });
  }, [classes, searchTerm, shiftFilter, statusFilter]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, shiftFilter, statusFilter, pageSize]);

  // Paginated subset
  const paginatedClasses = useMemo(() => {
    return paginateData(filteredClasses, currentPage, pageSize);
  }, [filteredClasses, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{toastMessage.message}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Inline Delete Confirmation Bar (no popup) */}
      {deletingClass && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs text-rose-900 dark:text-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>
              Are you sure you want to delete class{' '}
              <strong>"{deletingClass.class_name || deletingClass.name}"</strong>? This operation cannot be undone.
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setDeletingClass(null)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-500 shadow-sm transition cursor-pointer"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-indigo-600 no-underline text-slate-500">
              Admin
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-500">Settings</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600 dark:text-indigo-400">Class</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <span>Class Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure academic classes with respect to shifts, sort order, and operational status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadClasses}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
            title="Refresh classes from database"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <Link
            href="/admin/settings/class/create"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md hover:shadow transition no-underline cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Class</span>
          </Link>
        </div>
      </div>


      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search class name, shift, sort order..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto self-end md:self-auto flex-wrap">
          {/* Shift Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Shift:</span>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="ALL">All Shifts</option>
              {shifts.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Page Size Select */}
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* Classes Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 w-16">#</th>
                <th className="p-4">Class Name</th>
                <th className="p-4">Shift</th>
                <th className="p-4">Sort Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                      <span>Loading classes from database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">No classes found</p>
                      <p className="text-xs text-slate-400">
                        {searchTerm || statusFilter !== 'ALL' || shiftFilter !== 'ALL'
                          ? 'Try adjusting your search or filter parameters.'
                          : 'Get started by creating your first class with shift.'}
                      </p>
                      <Link
                        href="/admin/settings/class/create"
                        className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition no-underline"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Class</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClasses.map((item, index) => {
                  const sNo = (currentPage - 1) * pageSize + index + 1;
                  const isActive = item.status !== false;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
                    >
                      <td className="p-4 font-mono text-slate-400 text-[11px]">{sNo}</td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-indigo-600 shrink-0" />
                          <span>{item.class_name || item.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {item.shift_name ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                            <Layers className="h-3 w-3" />
                            <span>{item.shift_name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                          {item.sort_order !== undefined ? item.sort_order : 0}
                        </span>
                      </td>
                      <td className="p-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/admin/settings/class/edit/${encryptId(item.id)}`}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Edit class"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeletingClass(item)}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                            title="Delete class"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredClasses.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredClasses.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </div>
  );
}

export default function ClassListingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          Loading Class Management...
        </div>
      }
    >
      <ClassListingContent />
    </Suspense>
  );
}
