'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeft,
  BookOpen,
  Save,
  AlertCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AddClassPage() {
  const router = useRouter();

  // Dynamic Shifts from database
  const [shifts, setShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(true);

  const [formData, setFormData] = useState({
    shift_id: '',
    class_name: '',
    sort_order: '',
    status: '1', // 1: Active, 2: Inactive
  });

  // Inline field validation errors and touched state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch available shifts dynamically from database
  useEffect(() => {
    const fetchShifts = async () => {
      setLoadingShifts(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/shifts`, { timeout: 4000 });
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setShifts(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching shifts:', err);
      } finally {
        setLoadingShifts(false);
      }
    };

    fetchShifts();
  }, []);

  // Validate a single field
  const validateField = (name, value) => {
    let errorMsg = '';
    const val = value !== undefined && value !== null ? String(value).trim() : '';

    if (name === 'shift_id') {
      if (!val) {
        errorMsg = 'Shift is required. Please select a shift.';
      }
    } else if (name === 'class_name') {
      if (!val) {
        errorMsg = 'Class name is required.';
      }
    } else if (name === 'sort_order') {
      if (val === '') {
        errorMsg = 'Sort order is required.';
      } else if (isNaN(val)) {
        errorMsg = 'Sort order must be a valid number.';
      }
    } else if (name === 'status') {
      if (!val) {
        errorMsg = 'Status is required.';
      }
    }

    setErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) {
        next[name] = errorMsg;
      } else {
        delete next[name];
      }
      return next;
    });

    return errorMsg;
  };

  // Handle field blur
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  // Handle field change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
    if (touched[field]) {
      validateField(field, value);
    }
  };

  // Validate all fields
  const validateAll = () => {
    const newErrors = {};
    const shiftError = validateField('shift_id', formData.shift_id);
    if (shiftError) newErrors.shift_id = shiftError;

    const classError = validateField('class_name', formData.class_name);
    if (classError) newErrors.class_name = classError;

    const sortError = validateField('sort_order', formData.sort_order);
    if (sortError) newErrors.sort_order = sortError;

    const statusError = validateField('status', formData.status);
    if (statusError) newErrors.status = statusError;

    setErrors(newErrors);
    setTouched({
      shift_id: true,
      class_name: true,
      sort_order: true,
      status: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const isValid = validateAll();
    if (!isValid) {
      return;
    }

    setSubmitting(true);

    const payload = {
      shift_id: parseInt(formData.shift_id, 10),
      class_name: formData.class_name.trim(),
      sort_order: parseInt(formData.sort_order, 10),
      status: formData.status === '1',
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/classes`, payload, { timeout: 4000 });
      if (res.data && res.data.success) {
        router.push('/admin/settings/class?notify=created');
        return;
      }
    } catch (err) {
      console.error('Create class error:', err);
      setFormError(
        err.response?.data?.message || 'Failed to save class to database. Please check your backend connection.'
      );
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    router.push('/admin/settings/class?notify=created');
  };

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb & Top Bar */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-indigo-600 no-underline text-slate-500">
              Admin
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-500">Settings</span>
            <ChevronRight className="h-3 w-3" />
            <Link href="/admin/settings/class" className="hover:text-indigo-600 no-underline text-slate-500">
              Class
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600 dark:text-indigo-400">Add Class</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <span>Add New Class</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure class settings with respect to academic shift.
          </p>
        </div>

        <Link
          href="/admin/settings/class"
          className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition no-underline w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Classes</span>
        </Link>
      </div>

      {/* Global Form Error Banner (if API fails) */}
      {formError && (
        <div className="w-full p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{formError}</span>
        </div>
      )}

      {/* Card Form */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="bg-slate-50/80 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="text-base font-bold text-slate-900 dark:text-white m-0">Class</h4>
        </div>

        {/* Card Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Shift */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Shift <span className="text-rose-500">*</span>
                </label>
                {loadingShifts ? (
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    <span>Loading shifts...</span>
                  </div>
                ) : (
                  <>
                    <select
                      name="shift_id"
                      id="shift_id"
                      value={formData.shift_id}
                      onChange={(e) => handleChange('shift_id', e.target.value)}
                      onBlur={() => handleBlur('shift_id')}
                      className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition cursor-pointer ${
                        touched.shift_id && errors.shift_id
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                          : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                      }`}
                    >
                      <option value="">Select Shift</option>
                      {shifts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.start_time ? `(${s.start_time} - ${s.end_time})` : ''}
                        </option>
                      ))}
                    </select>
                    {touched.shift_id && errors.shift_id && (
                      <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.shift_id}</span>
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Class Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Class Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="class_name"
                  id="class_name"
                  value={formData.class_name}
                  onChange={(e) => handleChange('class_name', e.target.value)}
                  onBlur={() => handleBlur('class_name')}
                  placeholder="e.g. Class 1, Grade 10"
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition ${
                    touched.class_name && errors.class_name
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                  }`}
                />
                {touched.class_name && errors.class_name && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.class_name}</span>
                  </p>
                )}
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Sort Order <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="sort_order"
                  id="sort_order"
                  value={formData.sort_order}
                  onChange={(e) => handleChange('sort_order', e.target.value)}
                  onBlur={() => handleBlur('sort_order')}
                  placeholder="e.g. 1"
                  min="0"
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition ${
                    touched.sort_order && errors.sort_order
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                  }`}
                />
                {touched.sort_order && errors.sort_order && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.sort_order}</span>
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  onBlur={() => handleBlur('status')}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition cursor-pointer ${
                    touched.status && errors.status
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                  }`}
                >
                  <option value="1">Active</option>
                  <option value="2">Inactive</option>
                </select>
                {touched.status && errors.status && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.status}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-slate-50/50 dark:bg-slate-800/40 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? 'Saving...' : 'Submit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
