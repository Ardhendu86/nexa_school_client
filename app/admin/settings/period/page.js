'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Plus,
  Search,
  Filter,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ChevronRight,
  Pencil,
  Trash2
} from 'lucide-react';
import { encryptId } from '@/lib/crypto';
import Pagination, { paginateData } from '@/components/Pagination';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function PeriodListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [periods, setPeriods] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState(null);

  // Inline delete state
  const [deletingPeriod, setDeletingPeriod] = useState(null);

  // Check URL notification query param
  useEffect(() => {
    const notify = searchParams.get('notify');
    if (notify === 'created') {
      showToast('Period created successfully!', 'success');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else if (notify === 'updated') {
      showToast('Period updated successfully!', 'success');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [searchParams]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Load periods from database
  const loadPeriods = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/periods`, { timeout: 8000 });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setPeriods(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching periods:', err.message);
      if (err.code === 'ERR_NETWORK' || !err.response) {
        showToast('Backend server is unreachable (port 5000). Please check if backend is running.', 'error');
      } else {
        showToast('Could not load periods from database server.', 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load shifts for filter dropdown
  const loadShifts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/shifts`, { timeout: 8000 });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setShifts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching shifts:', err.message);
    }
  };

  useEffect(() => {
    loadPeriods();
    loadShifts();
  }, []);

  // Perform delete from database
  const handleConfirmDelete = async () => {
    if (!deletingPeriod) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/periods/${deletingPeriod.id}`, { timeout: 8000 });
      setPeriods((prev) => prev.filter((p) => String(p.id) !== String(deletingPeriod.id)));
      showToast(`Period "${deletingPeriod.period_name}" deleted successfully.`, 'info');
    } catch (err) {
      console.error('Error deleting period:', err.message);
      showToast('Failed to delete period from database.', 'info');
    }

    setDeletingPeriod(null);
  };

  // Filter periods based on search and filters
  const filteredPeriods = useMemo(() => {
    return periods.filter((p) => {
      // Shift filter
      if (shiftFilter !== 'ALL' && String(p.shift_id) !== String(shiftFilter)) {
        return false;
      }

      // Status filter
      if (statusFilter === 'ACTIVE' && p.status === false) return false;
      if (statusFilter === 'INACTIVE' && p.status !== false) return false;

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const nameMatch = p.period_name?.toLowerCase().includes(term);
      const shiftMatch = p.shift_name?.toLowerCase().includes(term);
      const startMatch = p.start_time?.toLowerCase().includes(term);
      const endMatch = p.end_time?.toLowerCase().includes(term);
      return nameMatch || shiftMatch || startMatch || endMatch;
    });
  }, [periods, shiftFilter, statusFilter, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [shiftFilter, statusFilter, searchTerm]);

  const paginatedPeriods = paginateData(filteredPeriods, currentPage, pageSize);
  const activeCount = periods.filter((p) => p.status !== false).length;

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`w-full p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'info'
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === 'info' ? (
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            )}
            <span className="text-xs font-semibold">{toastMessage.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Inline Delete Confirmation */}
      {deletingPeriod && (
        <div className="w-full p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 rounded-lg shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Confirm Deletion of Period: <span className="underline">"{deletingPeriod.period_name}"</span>
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">
                This will delete the period timing ({deletingPeriod.start_time} - {deletingPeriod.end_time}).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:self-center">
            <button
              type="button"
              onClick={() => setDeletingPeriod(null)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              Yes, Delete Period
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-indigo-600 no-underline text-slate-500">
              Admin
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-500">Settings</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600 dark:text-indigo-400">Period</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-indigo-600" />
            <span>Period Settings & Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure periods, time slots, and schedule timings for each shift.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadPeriods}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition shadow-sm cursor-pointer"
            title="Refresh Periods"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/settings/period/create"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md transition no-underline"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Period</span>
          </Link>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Controls: Page Size, Filter, Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer font-medium"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Shift Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Shifts</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Status ({periods.length})</option>
                <option value="ACTIVE">Active ({activeCount})</option>
                <option value="INACTIVE">Inactive ({periods.length - activeCount})</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search periods..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 pl-6 w-14 font-semibold text-center">#</th>
                <th className="p-4 font-semibold">Period Name</th>
                <th className="p-4 font-semibold">Shift</th>
                <th className="p-4 font-semibold">Start Time</th>
                <th className="p-4 font-semibold">End Time</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 pr-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold">
                      <span className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading periods from database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedPeriods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    <Clock className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                      No periods found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {statusFilter !== 'ALL' || shiftFilter !== 'ALL' || searchTerm
                        ? 'No periods match your current filters.'
                        : 'Click "Add New Period" to create your first period.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedPeriods.map((period, index) => {
                  const serialNumber = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={period.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4 pl-6 text-center font-mono text-slate-400 text-[11px]">
                        {serialNumber}
                      </td>

                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        {period.period_name}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[11px]">
                          {period.shift_name || 'Shift'}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {period.start_time}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {period.end_time}
                        </span>
                      </td>

                      <td className="p-4">
                        {period.status !== false ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="p-4 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/settings/period/edit/${encryptId(period.id)}`}
                            title="Edit Period"
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition border border-indigo-200/60 dark:border-indigo-800/60"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeletingPeriod(period)}
                            title="Delete Period"
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition border border-rose-200/60 dark:border-rose-800/60 bg-transparent cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
        <Pagination
          currentPage={currentPage}
          totalItems={filteredPeriods.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default function AdminPeriodSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Periods...</div>}>
      <PeriodListingContent />
    </Suspense>
  );
}
