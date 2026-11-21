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
  Trash2
} from 'lucide-react';
import { encryptId } from '@/lib/crypto';
import Pagination, { paginateData } from '@/components/Pagination';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function DaysListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState(null);

  // Inline delete confirmation state (no popup / modal)
  const [deletingDay, setDeletingDay] = useState(null);

  // Check URL notification query param
  useEffect(() => {
    const notify = searchParams.get('notify');
    if (notify === 'created') {
      showToast('Day created successfully!', 'success');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else if (notify === 'updated') {
      showToast('Day updated successfully!', 'success');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [searchParams]);

  // Load days from database
  const loadDays = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/days`, { timeout: 4000 });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setDays(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching days:', err.message);
      showToast('Could not load days from database.', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDays();
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Perform delete from database
  const handleConfirmDelete = async () => {
    if (!deletingDay) return;

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/admin/days/${deletingDay.id}`,
        { timeout: 4000 }
      );
      if (res.data && res.data.success) {
        showToast(`Day "${deletingDay.day_name}" deleted successfully!`, 'success');
        setDeletingDay(null);
        loadDays();
        return;
      }
    } catch (err) {
      console.error('Error deleting day:', err);
      showToast(err.response?.data?.message || 'Failed to delete day from database.', 'error');
    }

    setDeletingDay(null);
  };

  // Filtered & Search Results
  const filteredDays = useMemo(() => {
    if (!Array.isArray(days)) return [];
    return days.filter((d) => {
      const matchesSearch =
        searchTerm === '' ||
        (d.day_name && d.day_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && d.status === true) ||
        (statusFilter === 'INACTIVE' && d.status === false);

      return matchesSearch && matchesStatus;
    });
  }, [days, searchTerm, statusFilter]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pageSize]);

  // Paginated Data
  const paginatedDays = useMemo(() => {
    return paginateData(filteredDays, currentPage, pageSize);
  }, [filteredDays, currentPage, pageSize]);

  return (
    <div className="w-full space-y-6">
      {/* Notification Banner */}
      {toastMessage && (
        <div
          className={`w-full p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
              : toastMessage.type === 'info'
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === 'error' ? (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            ) : toastMessage.type === 'info' ? (
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            )}
            <span className="text-xs font-semibold">{toastMessage.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer border-0 bg-transparent p-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-indigo-600 no-underline text-slate-500">
              Admin
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-500">Settings</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600 dark:text-indigo-400">Days</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="h-6 w-6 text-indigo-600" />
            <span>Days Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage operational days and teaching schedules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadDays}
            disabled={loading}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Reload from database"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <Link
            href="/admin/settings/days/create"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition no-underline"
          >
            <Plus className="h-4 w-4" />
            <span>Add Day</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search days by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer p-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer border-0 bg-transparent p-0"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Inline Delete Confirmation Banner */}
      {deletingDay && (
        <div className="w-full p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-100 rounded-2xl text-xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Are you sure you want to delete day "{deletingDay.day_name}"?</span>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 m-0 mt-0.5">
                This will permanently remove this day from the database.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setDeletingDay(null)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 text-xs font-semibold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer transition border-0"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      )}

      {/* Days Table */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 w-16">#</th>
                <th className="py-3.5 px-4">Day Name</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Loading days from database...</span>
                  </td>
                </tr>
              ) : paginatedDays.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300 text-xs mb-1">
                      No days found
                    </p>
                    <p className="text-[11px] text-slate-400 mb-3">
                      {searchTerm || statusFilter !== 'ALL'
                        ? 'Try clearing your active filters to see all days.'
                        : 'Get started by creating your first day.'}
                    </p>
                    {searchTerm || statusFilter !== 'ALL' ? (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('ALL');
                        }}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition border-0 cursor-pointer"
                      >
                        Clear filters
                      </button>
                    ) : (
                      <Link
                        href="/admin/settings/days/create"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition no-underline"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Day</span>
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedDays.map((item, index) => {
                  const serialNumber = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {serialNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-lg">
                            <Calendar className="h-3.5 w-3.5" />
                          </span>
                          <span>{item.day_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {item.status ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/settings/days/edit/${encryptId(item.id)}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition"
                            title="Edit day"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeletingDay(item)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition border-0 bg-transparent cursor-pointer"
                            title="Delete day"
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

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredDays.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

export default function DaysListingPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full p-12 text-center text-slate-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-xs font-semibold">Loading Days...</p>
        </div>
      }
    >
      <DaysListingContent />
    </Suspense>
  );
}
