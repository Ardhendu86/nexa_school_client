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
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ChevronRight,
  Layers,
  Pencil,
  Trash2,
} from 'lucide-react';
import { encryptId } from '@/lib/crypto';
import Pagination, { paginateData } from '@/components/Pagination';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function ShiftListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState(null);

  // Inline delete confirmation state (no popup / modal)
  const [deletingShift, setDeletingShift] = useState(null);

  // Check URL notification query param
  useEffect(() => {
    const notify = searchParams.get('notify');
    if (notify === 'created') {
      showToast('Shift created successfully!', 'success');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else if (notify === 'updated') {
      showToast('Shift updated successfully!', 'success');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [searchParams]);

  // Load shifts dynamically from database (Model & Controller)
  const loadShifts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/shifts`, { timeout: 8000 });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setShifts(res.data.data);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Error fetching shifts from database:', err.message);
      if (err.code === 'ERR_NETWORK' || !err.response) {
        showToast('Backend server is unreachable (port 5000). Please check if backend is running.', 'error');
      } else {
        showToast('Could not load shifts from database server.', 'info');
      }
    }

    setShifts([]);
    setLoading(false);
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Perform delete from database without popup/modal
  const handleConfirmDelete = async () => {
    if (!deletingShift) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/shifts/${deletingShift.id}`, { timeout: 8000 });
      setShifts((prev) => prev.filter((s) => String(s.id) !== String(deletingShift.id)));
      showToast(`Shift "${deletingShift.name}" was successfully deleted.`, 'info');
    } catch (err) {
      console.error('Error deleting shift:', err.message);
      showToast('Failed to delete shift from database.', 'info');
    }

    setDeletingShift(null);
  };

  // Filter shifts based on search query and status filter
  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      // Status filter
      if (statusFilter === 'ACTIVE' && s.status === false) return false;
      if (statusFilter === 'INACTIVE' && s.status !== false) return false;

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const nameMatch = s.name?.toLowerCase().includes(term);
      const startMatch = s.start_time?.toLowerCase().includes(term);
      const endMatch = s.end_time?.toLowerCase().includes(term);
      return nameMatch || startMatch || endMatch;
    });
  }, [shifts, searchTerm, statusFilter]);

  // Reset to page 1 whenever search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Paginate shifts using the pagination helper
  const paginatedShifts = paginateData(filteredShifts, currentPage, pageSize);

  const activeCount = shifts.filter((s) => s.status !== false).length;

  const getShiftIcon = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('morn')) return <Sun className="h-4 w-4 text-amber-500" />;
    if (lower.includes('day') || lower.includes('afternoon')) return <Sunset className="h-4 w-4 text-orange-500" />;
    if (lower.includes('even') || lower.includes('night')) return <Moon className="h-4 w-4 text-indigo-500" />;
    return <Clock className="h-4 w-4 text-slate-500" />;
  };

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

      {/* Inline Delete Confirmation Banner (No Popup / Modal) */}
      {deletingShift && (
        <div className="w-full p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 rounded-lg shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Confirm Deletion of Shift: <span className="underline">"{deletingShift.name}"</span>
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">
                This will delete the shift and its operating hours ({deletingShift.start_time} - {deletingShift.end_time}).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:self-center">
            <button
              type="button"
              onClick={() => setDeletingShift(null)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              Yes, Delete Shift
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
            <span className="text-indigo-600 dark:text-indigo-400">Shift</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-indigo-600" />
            <span>Shift Settings & Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure institutional shifts with operating start and end times.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadShifts}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition shadow-sm cursor-pointer"
            title="Refresh Shifts"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {/* Full Page navigation for adding shift (No Modal) */}
          <Link
            href="/admin/settings/shift/create"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md transition no-underline"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Shift</span>
          </Link>
        </div>
      </div>

      {/* Clean Full-Width Table Container */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Top Controls: Show Entries, Status Filter, Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Entries per page"
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

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter shifts by status"
                className="bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Shifts ({shifts.length})</option>
                <option value="ACTIVE">Active ({activeCount})</option>
                <option value="INACTIVE">Inactive ({shifts.length - activeCount})</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search shifts..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Standard Table (5 Fields: Shift Name, Start Time, End Time, Status, Actions) */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 pl-6 w-14 font-semibold text-center">#</th>
                <th className="p-4 font-semibold">Shift Name</th>
                <th className="p-4 font-semibold">Start Time</th>
                <th className="p-4 font-semibold">End Time</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 pr-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold">
                      <span className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading shifts from database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedShifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    <Clock className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                      No shifts found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {statusFilter !== 'ALL' || searchTerm
                        ? 'No shifts match your search query or filter.'
                        : 'Click "Add New Shift" to create your first shift.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedShifts.map((shift, index) => {
                  const serialNumber = (currentPage - 1) * pageSize + index + 1;
                  return (
                  <tr
                    key={shift.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Serial Number */}
                    <td className="p-4 pl-6 text-center font-mono text-slate-400 text-[11px]">
                      {serialNumber}
                    </td>

                    {/* Shift Name */}
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                          {getShiftIcon(shift.name)}
                        </span>
                        <span>{shift.name}</span>
                      </div>
                    </td>

                    {/* Start Time */}
                    <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {shift.start_time}
                      </span>
                    </td>

                    {/* End Time */}
                    <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {shift.end_time}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {shift.status !== false ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Link with Encrypted ID */}
                        <Link
                          href={`/admin/settings/shift/edit/${encryptId(shift.id)}`}
                          title="Edit Shift"
                          aria-label={`Edit ${shift.name}`}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition border border-indigo-200/60 dark:border-indigo-800/60"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        {/* Delete Button with Inline Confirmation */}
                        <button
                          type="button"
                          onClick={() => setDeletingShift(shift)}
                          title="Delete Shift"
                          aria-label={`Delete ${shift.name}`}
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

        {/* Simple Pagination Helper Component */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredShifts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default function AdminShiftSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Shifts...</div>}>
      <ShiftListingContent />
    </Suspense>
  );
}
