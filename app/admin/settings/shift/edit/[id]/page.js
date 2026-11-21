'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeft,
  Clock,
  Layers,
  Save,
  AlertCircle,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { decryptId } from '@/lib/crypto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Simple time converters for HTML time input <-> AM/PM display
const formatTimeTo24 = (timeStr) => {
  if (!timeStr) return '';
  const m12 = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const m = m12[2];
    const meridiem = m12[3].toUpperCase();
    if (meridiem === 'PM' && h < 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    return String(h).padStart(2, '0') + ':' + m;
  }
  return timeStr;
};

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

export default function EditShiftPage() {
  const router = useRouter();
  const params = useParams();
  const shiftId = params?.id;

  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    status: true,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Inline field validation errors and touched state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate a single field
  const validateField = (name, value) => {
    let errorMsg = '';
    const val = value !== undefined && value !== null ? String(value).trim() : '';

    if (name === 'name') {
      if (!val) {
        errorMsg = 'Shift name is required.';
      }
    } else if (name === 'start_time') {
      if (!val) {
        errorMsg = 'Start time is required.';
      }
    } else if (name === 'end_time') {
      if (!val) {
        errorMsg = 'End time is required.';
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
    const nameErr = validateField('name', formData.name);
    if (nameErr) newErrors.name = nameErr;

    const startErr = validateField('start_time', formData.start_time);
    if (startErr) newErrors.start_time = startErr;

    const endErr = validateField('end_time', formData.end_time);
    if (endErr) newErrors.end_time = endErr;

    setErrors(newErrors);
    setTouched({
      name: true,
      start_time: true,
      end_time: true,
      status: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  // Load shift data dynamically from backend API using encrypted ID
  useEffect(() => {
    if (!shiftId) return;

    const fetchShift = async () => {
      setLoading(true);
      setFormError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/shifts/${shiftId}`, { timeout: 4000 });
        if (res.data && res.data.data) {
          const shift = res.data.data;
          setFormData({
            name: shift.name || '',
            start_time: formatTimeTo24(shift.start_time || ''),
            end_time: formatTimeTo24(shift.end_time || ''),
            status: shift.status !== false,
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error fetching shift details from server:', err);
        setFormError('Failed to load shift details from database.');
      }

      setLoading(false);
    };

    fetchShift();
  }, [shiftId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const isValid = validateAll();
    if (!isValid) {
      return;
    }

    setSubmitting(true);

    const updatedData = {
      name: formData.name.trim(),
      start_time: formatTimeTo12(formData.start_time),
      end_time: formatTimeTo12(formData.end_time),
      status: Boolean(formData.status),
    };

    // Send update to backend API (server decrypts encrypted shiftId from URL)
    try {
      const res = await axios.put(`${API_BASE_URL}/api/admin/shifts/${shiftId}`, updatedData, { timeout: 4000 });
      if (res.data && res.data.success) {
        setSubmitting(false);
        router.push('/admin/settings/shift?notify=updated');
        return;
      }
    } catch (err) {
      console.error('Backend update error:', err);
      setFormError(
        err.response?.data?.message || 'Failed to update shift in database. Please check your backend connection.'
      );
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    router.push('/admin/settings/shift?notify=updated');
  };

  if (loading) {
    return (
      <div className="w-full p-12 text-center text-slate-500">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600" />
        <p className="text-xs font-semibold">Loading Shift Details...</p>
      </div>
    );
  }

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
            <Link href="/admin/settings/shift" className="hover:text-indigo-600 no-underline text-slate-500">
              Shift
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600 dark:text-indigo-400">Edit Shift</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-indigo-600" />
            <span>Edit Shift</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update operating hours and availability for this shift.
          </p>
        </div>

        <Link
          href="/admin/settings/shift"
          className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition no-underline w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Shifts</span>
        </Link>
      </div>

      {/* Form Error Banner */}
      {formError && (
        <div className="w-full p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{formError}</span>
        </div>
      )}

      {/* Full Page Card Form */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Edit Shift Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Modify schedule times or toggle active status.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Shift Name */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Shift Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. Morning Shift"
                className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-3 text-xs text-slate-900 dark:text-white transition ${
                  touched.name && errors.name
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                }`}
              />
              {touched.name && errors.name && (
                <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Start Time */}
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
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                  }`}
                />
              </div>
              {touched.start_time && errors.start_time && (
                <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.start_time}</span>
                </p>
              )}
            </div>

            {/* End Time */}
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
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                  }`}
                />
              </div>
              {touched.end_time && errors.end_time && (
                <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.end_time}</span>
                </p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Shift Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status ? 'ACTIVE' : 'INACTIVE'}
                onChange={(e) => handleChange('status', e.target.value === 'ACTIVE')}
                className="w-full md:w-72 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/admin/settings/shift"
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
              <span>{submitting ? 'Updating...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
