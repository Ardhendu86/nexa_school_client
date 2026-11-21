'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeft,
  Clock,
  Layers,
  Save,
  AlertCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper to convert time to 12-hour AM/PM format
const formatTimeTo12 = (timeStr) => {
  if (!timeStr) return '';
  if (/AM|PM/i.test(timeStr)) return timeStr;
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
};

export default function AddPeriodPage() {
  const router = useRouter();

  // Dynamic Shifts from backend
  const [shifts, setShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(true);

  const [formData, setFormData] = useState({
    shift_id: '',
    period_name: '',
    start_time: '',
    end_time: '',
    status: '1', // 1: Active, 2: Inactive
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch shifts from backend API
  useEffect(() => {
    const fetchShifts = async () => {
      setLoadingShifts(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/shifts`, { timeout: 8000 });
        if (res.data?.success && Array.isArray(res.data.data)) {
          setShifts(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching shifts:', err);
        setShifts([
          { id: 1, name: 'Morning', start_time: '08:00 AM', end_time: '12:30 PM' },
          { id: 6, name: 'Day', start_time: '01:00 PM', end_time: '05:30 PM' },
        ]);
      } finally {
        setLoadingShifts(false);
      }
    };

    fetchShifts();
  }, []);

  // When selecting shift, do NOT auto-fill start/end times
  const handleShiftChange = (shiftId) => {
    setFormData((prev) => ({
      ...prev,
      shift_id: shiftId,
    }));

    if (errors.shift_id) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.shift_id;
        return next;
      });
    }
  };

  // Field validation
  const validateField = (name, value) => {
    let errorMsg = '';
    const val = value !== undefined && value !== null ? String(value).trim() : '';

    if (name === 'shift_id') {
      if (!val) errorMsg = 'Shift is required.';
    } else if (name === 'period_name') {
      if (!val) errorMsg = 'Period name is required.';
    } else if (name === 'start_time') {
      if (!val) errorMsg = 'Start time is required.';
    } else if (name === 'end_time') {
      if (!val) errorMsg = 'End time is required.';
    }

    setErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) next[name] = errorMsg;
      else delete next[name];
      return next;
    });

    return errorMsg;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const validateAll = () => {
    const newErrors = {};
    ['shift_id', 'period_name', 'start_time', 'end_time'].forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    setTouched({
      shift_id: true,
      period_name: true,
      start_time: true,
      end_time: true,
      status: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateAll()) {
      return;
    }

    setSubmitting(true);

    const payload = {
      shift_id: parseInt(formData.shift_id, 10),
      period_name: formData.period_name.trim(),
      start_time: formatTimeTo12(formData.start_time),
      end_time: formatTimeTo12(formData.end_time),
      status: formData.status === '1',
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/periods`, payload, { timeout: 8000 });
      if (res.data?.success) {
        router.push('/admin/settings/period?notify=created');
        return;
      }
    } catch (err) {
      console.error('Create period error:', err);
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setFormError('Backend server is unreachable (port 5000). Please check if backend is running.');
      } else {
        setFormError(err.response?.data?.message || 'Failed to save period to database.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
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
            <Link href="/admin/settings/period" className="hover:text-indigo-600 no-underline text-slate-500">
              Period
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600 dark:text-indigo-400">Add Period</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-indigo-600" />
            <span>Add New Period</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure periods and class timing slots for academic shifts.
          </p>
        </div>

        <Link
          href="/admin/settings/period"
          className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition no-underline w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Periods</span>
        </Link>
      </div>

      {/* Form Error Banner */}
      {formError && (
        <div className="w-full p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{formError}</span>
        </div>
      )}

      {/* Card Form */}
      <div className="card bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Card Header */}
        <div className="card-header bg-slate-50 dark:bg-slate-800/60 p-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0">Period</h4>
        </div>

        {/* Card Body */}
        <div className="card-body p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 text-xs">
              {/* 1. Shift */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Shift <span className="text-rose-500">*</span>
                </label>
                {loadingShifts ? (
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    <select
                      name="shift_id"
                      id="shift_id"
                      value={formData.shift_id}
                      onChange={(e) => handleShiftChange(e.target.value)}
                      onBlur={() => handleBlur('shift_id')}
                      className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition cursor-pointer ${
                        touched.shift_id && errors.shift_id
                          ? 'border-rose-500 focus:border-rose-500 bg-rose-50/20'
                          : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                      }`}
                    >
                      <option value="">Select</option>
                      {shifts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.start_time ? `(${s.start_time} - ${s.end_time})` : ''}
                        </option>
                      ))}
                    </select>
                    {touched.shift_id && errors.shift_id && (
                      <p className="text-rose-600 text-xs font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.shift_id}</span>
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* 2. Period Name */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Period Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="period_name"
                  id="period_name"
                  value={formData.period_name}
                  onChange={(e) => handleChange('period_name', e.target.value)}
                  onBlur={() => handleBlur('period_name')}
                  placeholder="Period Name"
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition ${
                    touched.period_name && errors.period_name
                      ? 'border-rose-500 focus:border-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                  }`}
                />
                {touched.period_name && errors.period_name && (
                  <p className="text-rose-600 text-xs font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.period_name}</span>
                  </p>
                )}
              </div>

              {/* 3. Start Time */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="time"
                    name="start_time"
                    id="start_time"
                    value={formData.start_time}
                    onChange={(e) => handleChange('start_time', e.target.value)}
                    onBlur={() => handleBlur('start_time')}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono transition cursor-pointer ${
                      touched.start_time && errors.start_time
                        ? 'border-rose-500 focus:border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                    }`}
                  />
                </div>
                {touched.start_time && errors.start_time && (
                  <p className="text-rose-600 text-xs font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.start_time}</span>
                  </p>
                )}
              </div>

              {/* 4. End Time */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  End Time <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="time"
                    name="end_time"
                    id="end_time"
                    value={formData.end_time}
                    onChange={(e) => handleChange('end_time', e.target.value)}
                    onBlur={() => handleBlur('end_time')}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono transition cursor-pointer ${
                      touched.end_time && errors.end_time
                        ? 'border-rose-500 focus:border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                    }`}
                  />
                </div>
                {touched.end_time && errors.end_time && (
                  <p className="text-rose-600 text-xs font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.end_time}</span>
                  </p>
                )}
              </div>

              {/* 5. Status */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition cursor-pointer"
                >
                  <option value="1">Active</option>
                  <option value="2">Inactive</option>
                </select>
              </div>
            </div>

            {/* Action Buttons: Cancel & Submit */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/admin/settings/period"
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold transition no-underline"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{submitting ? 'Submitting...' : 'Submit'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
