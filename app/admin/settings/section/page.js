'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Plus,
  Search,
  Filter,
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

function SectionListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toastMessage, setToastMessage] = useState(null);

  // Inline delete confirmation state (no modal / popup)
  const [deletingSection, setDeletingSection] = useState(null);

  // Check URL notification query param
  useEffect(() => {
    const notify = searchParams.get('notify');
    if (notify === 'created') {
      showToast('Section created successfully!', 'success');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else if (notify === 'updated') {
      showToast('Section updated successfully!', 'success');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [searchParams]);

  // Load sections from database
  const loadSections = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/sections`, { timeout: 4000 });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setSections(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching sections:', err.message);
      showToast('Could not load sections from database.', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Load classes for filter dropdown
  const loadClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/classes`, { timeout: 4000 });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setClasses(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err.message);
    }
  };

  useEffect(() => {
    loadSections();
    loadClasses();
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Perform delete from database
  const handleConfirmDelete = async () => {
    if (!deletingSection) return;

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/admin/sections/${deletingSection.id}`,
        { timeout: 4000 }
      );
      if (res.data && res.data.success) {
        showToast(`Section "${deletingSection.section_name}" deleted successfully!`, 'success');
        setDeletingSection(null);
        loadSections();
        return;
      }
    } catch (err) {
      console.error('Error deleting section:', err);
      showToast(err.response?.data?.message || 'Failed to delete section from database.', 'error');
    }

    setDeletingSection(null);
  };

  // Filtered & Search Results
  const filteredSections = useMemo(() => {
    if (!Array.isArray(sections)) return [];
    return sections.filter((s) => {
      const nameMatch =
        searchTerm === '' ||
        (s.section_name && s.section_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.class_name && s.class_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.note && s.note.toLowerCase().includes(searchTerm.toLowerCase()));

      const classMatch =
        classFilter === 'ALL' || String(s.class_id) === String(classFilter);

      const statusMatch =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && s.status === true) ||
        (statusFilter === 'INACTIVE' && s.status === false);

      return nameMatch && classMatch && statusMatch;
    });
  }, [sections, searchTerm, classFilter, statusFilter]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, classFilter, statusFilter, pageSize]);

  // Paginated Data
  const paginatedSections = useMemo(() => {
    return paginateData(filteredSections, currentPage, pageSize);
  }, [filteredSections, currentPage, pageSize]);

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
            <span className="text-indigo-600 dark:text-indigo-400">Section</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-indigo-600" />
            <span>Section Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic classroom sections, capacities, and notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadSections}
            disabled={loading}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Reload from database"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <Link
            href="/admin/settings/section/create"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition no-underline"
          >
            <Plus className="h-4 w-4" />
            <span>Add Section</span>
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
            placeholder="Search section, class, note..."
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
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Class:</span>
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name || cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
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

          {/* Clear Filters */}
          {(searchTerm || classFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setClassFilter('ALL');
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
      {deletingSection && (
        <div className="w-full p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 rounded-lg shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900 dark:text-rose-100 m-0">
                Confirm Deleting Section: "{deletingSection.section_name}"?
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-300 m-0 mt-0.5">
                Class: {deletingSection.class_name || 'N/A'}. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setDeletingSection(null)}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 shadow-sm transition cursor-pointer border-0"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      )}

      {/* Sections Table Card */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-14 text-center">#</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Section Name</th>
                <th className="py-3.5 px-4 text-center">Capacity</th>
                <th className="py-3.5 px-4 text-center">Sort Order</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    <span>Loading sections from database...</span>
                  </td>
                </tr>
              ) : filteredSections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Layers className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      No sections found
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {searchTerm || classFilter !== 'ALL' || statusFilter !== 'ALL'
                        ? 'Try adjusting your filters or search terms.'
                        : 'Get started by creating your first academic section.'}
                    </p>
                  </td>
                </tr>
              ) : (
                Array.isArray(paginatedSections) &&
                paginatedSections.map((section, index) => {
                  const serialNumber = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={section.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {serialNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {section.class_name || <span className="text-slate-400">Unassigned</span>}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                        {section.section_name}
                      </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                      {section.capacity || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                      {section.sort_order ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                          section.status
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {section.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/settings/section/edit/${encryptId(section.id)}`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition"
                          title="Edit Section"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeletingSection(section)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition border-0 bg-transparent cursor-pointer"
                          title="Delete Section"
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
            totalItems={filteredSections.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

export default function SectionListingPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full p-12 text-center text-slate-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
          <span>Loading Sections...</span>
        </div>
      }
    >
      <SectionListingContent />
    </Suspense>
  );
}
