'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ChevronRight,
  Pencil,
  Trash2,
  Check
} from 'lucide-react';
import { encryptId } from '@/lib/crypto';
import Pagination, { paginateData } from '@/components/Pagination';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function AcademicYearListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState(null);

  // Inline delete confirmation state
  const [deletingYear, setDeletingYear] = useState(null);

  // Check URL notification query param
  useEffect(() => {
    const notify = searchParams.get('notify');
    if (notify === 'created') {
      showToast('Academic year created successfully!', 'success');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else if (notify === 'updated') {
      showToast('Academic year updated successfully!', 'success');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [searchParams]);

  // Load academic years from database
  const loadYears = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/academic-years`, { timeout: 8000 });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setYears(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching academic years:', err.message);
      if (err.code === 'ERR_NETWORK' || !err.response) {
        showToast('Backend server is unreachable (port 5000). Please check if backend is running.', 'error');
      } else {
        showToast('Could not load academic years from database.', 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYears();
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Perform delete from database
  const handleConfirmDelete = async () => {
    if (!deletingYear) return;

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/admin/academic-years/${deletingYear.id}`,
        { timeout: 8000 }
      );
      if (res.data && res.data.success) {
        showToast(`Academic Year "${deletingYear.academic_year}" deleted successfully!`, 'success');
        setDeletingYear(null);
        loadYears();
        return;
      }
    } catch (err) {
      console.error('Error deleting academic year:', err);
      showToast(err.response?.data?.message || 'Failed to delete academic year from database.', 'error');
    }

    setDeletingYear(null);
  };

  // Filter years based on search and status
  const filteredYears = useMemo(() => {
    return years.filter((item) => {
      // Status filter
      if (statusFilter === 'ACTIVE' && item.status === false) return false;
      if (statusFilter === 'INACTIVE' && item.status !== false) return false;

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const yearMatch = item.academic_year?.toLowerCase().includes(term);
      const startMatch = item.start_date?.toLowerCase().includes(term);
      const endMatch = item.end_date?.toLowerCase().includes(term);
      return yearMatch || startMatch || endMatch;
    });
  }, [years, statusFilter, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  // Paginated records
  const paginatedYears = useMemo(() => {
    return paginateData(filteredYears, currentPage, pageSize);
  }, [filteredYears, currentPage, pageSize]);

  const activeCount = years.filter((y) => y.status !== false).length;

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 duration-200 border ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900'
              : toastMessage.type === 'info'
              ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-900'
              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : toastMessage.type === 'info' ? (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage.message}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breadcrumbs & Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-indigo-600 no-underline text-slate-500">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-500">Settings</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600 dark:text-indigo-400">Academic Year</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="h-6 w-6 text-indigo-600" />
            <span>Academic Year</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic sessions, date spans, and set the active institutional year.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/settings/academic-year/create"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition no-underline cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Academic Year</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="w-full p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search academic year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Status ({years.length})</option>
            <option value="ACTIVE">Active ({activeCount})</option>
            <option value="INACTIVE">Inactive ({years.length - activeCount})</option>
          </select>
        </div>
      </div>

      {/* Inline Delete Confirmation Alert */}
      {deletingYear && (
        <div className="w-full p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between gap-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-200 font-medium">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>
              Are you sure you want to delete academic year <strong>"{deletingYear.academic_year}"</strong>?
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setDeletingYear(null)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      )}

      {/* Data Table Card */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4 text-center">Is Current</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                      <span>Loading academic years...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedYears.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <p className="font-semibold text-slate-600 dark:text-slate-300 mb-0">
                        No academic years found
                      </p>
                      <p className="text-xs text-slate-400 mb-0">
                        {searchTerm || statusFilter !== 'ALL'
                          ? 'No academic years match your current filters.'
                          : 'Get started by creating your first academic year.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedYears.map((item, idx) => {
                  const itemIndex = (currentPage - 1) * pageSize + idx + 1;
                  const isCurrent = item.is_current === true || item.is_current === 'true' || item.is_current === 1;
                  const isActive = item.status !== false;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                        {itemIndex}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {item.academic_year}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        {item.start_date || 'â€”'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        {item.end_date || 'â€”'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <Check className="h-3 w-3" />
                            Current
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">â€”</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/settings/academic-year/edit/${encryptId(item.id)}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Edit Academic Year"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeletingYear(item)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                            title="Delete Academic Year"
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Pagination
            totalItems={filteredYears.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function AcademicYearPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full p-12 text-center text-slate-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-xs font-semibold">Loading Academic Years...</p>
        </div>
      }
    >
      <AcademicYearListingContent />
    </Suspense>
  );
}
