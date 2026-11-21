'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeft,
  Calendar,
  Save,
  AlertCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AddDayPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    day_name: '',
    status: '1', // 1: Active, 2: Inactive
  });

  // Inline field validation errors and touched state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Validate a single field
  const validateField = (name, value) => {
    let errorMsg = '';
    const val = value !== undefined && value !== null ? String(value).trim() : '';

    if (name === 'day_name') {
      if (!val) {
        errorMsg = 'Day name is required.';
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
    const nameError = validateField('day_name', formData.day_name);
    if (nameError) newErrors.day_name = nameError;

    const statusError = validateField('status', formData.status);
    if (statusError) newErrors.status = statusError;

    setErrors(newErrors);
    setTouched({
      day_name: true,
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
      day_name: formData.day_name.trim(),
      status: formData.status === '1',
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/days`, payload, { timeout: 4000 });
      if (res.data && res.data.success) {
        router.push('/admin/settings/days?notify=created');
        return;
      }
    } catch (err) {
      console.error('Create day error:', err);
      setFormError(
        err.response?.data?.message || 'Failed to save day to database. Please check your backend connection.'
      );
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    router.push('/admin/settings/days?notify=created');
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
            <Link href="/admin/settings/days" className="hover:text-indigo-600 no-underline text-slate-500">
              Days
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600 dark:text-indigo-400">Add Day</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="h-6 w-6 text-indigo-600" />
            <span>Add New Day</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure working and instructional days for academic schedules.
          </p>
        </div>

        <Link
          href="/admin/settings/days"
          className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition no-underline w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Days</span>
        </Link>
      </div>

      {/* Global Form Error Banner */}
      {formError && (
        <div className="w-full p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{formError}</span>
        </div>
      )}

      {/* Card Form matching the exact layout */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="bg-slate-50/80 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="text-base font-bold text-slate-900 dark:text-white m-0">Days</h4>
        </div>

        {/* Card Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Day Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Day Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="day_name"
                  id="day_name"
                  value={formData.day_name}
                  onChange={(e) => handleChange('day_name', e.target.value)}
                  onBlur={() => handleBlur('day_name')}
                  placeholder="Day Name"
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition ${
                    touched.day_name && errors.day_name
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                  }`}
                />
                {touched.day_name && errors.day_name && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.day_name}</span>
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
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

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
