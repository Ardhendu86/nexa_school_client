'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeft,
  BookOpen,
  AlertCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CreateSubjectPage() {
  const router = useRouter();

  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [formData, setFormData] = useState({
    class_id: '',
    subject_name: '',
    sort_order: '1',
    status: '1',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Load classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/classes`, { timeout: 8000 });
        if (res.data?.success && Array.isArray(res.data.data)) {
          setClasses(res.data.data);
          if (res.data.data.length > 0) {
            setFormData((prev) => ({ ...prev, class_id: String(res.data.data[0].id) }));
          }
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  const validateField = (name, value) => {
    let errorMsg = '';
    const val = value !== undefined && value !== null ? String(value).trim() : '';

    if (name === 'class_id') {
      if (!val) {
        errorMsg = 'Please select a class.';
      }
    } else if (name === 'subject_name') {
      if (!val) {
        errorMsg = 'Subject name is required.';
      }
    } else if (name === 'sort_order') {
      if (!val) {
        errorMsg = 'Sort order is required.';
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
    const classError = validateField('class_id', formData.class_id);
    if (classError) newErrors.class_id = classError;

    const nameError = validateField('subject_name', formData.subject_name);
    if (nameError) newErrors.subject_name = nameError;

    const sortError = validateField('sort_order', formData.sort_order);
    if (sortError) newErrors.sort_order = sortError;

    setErrors(newErrors);
    setTouched({
      class_id: true,
      subject_name: true,
      sort_order: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const isValid = validateAll();
    if (!isValid) return;

    setSubmitting(true);

    const payload = {
      class_id: formData.class_id,
      subject_name: formData.subject_name.trim(),
      sort_order: parseInt(formData.sort_order, 10) || 0,
      status: formData.status === '1',
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/subjects`, payload, {
        timeout: 8000,
      });

      if (res.data?.success) {
        router.push('/admin/settings/subject?notify=created');
        return;
      }
    } catch (err) {
      console.error('Create subject error:', err);
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setFormError('Backend server is unreachable (port 5000). Please check if backend is running.');
      } else {
        setFormError(err.response?.data?.message || 'Failed to save subject to database.');
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
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-500">Settings</span>
            <ChevronRight className="h-3 w-3" />
            <Link
              href="/admin/settings/subject"
              className="hover:text-indigo-600 no-underline text-slate-500"
            >
              Subject
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600 dark:text-indigo-400">Add Subject</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <span>Add Subject</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create an academic subject and allocate it to a target class.
          </p>
        </div>

        <Link
          href="/admin/settings/subject"
          className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition no-underline w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Subjects</span>
        </Link>
      </div>

      {/* Global Form Error Banner */}
      {formError && (
        <div className="w-full p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{formError}</span>
        </div>
      )}

      {/* Subject Card Form */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="bg-slate-50/80 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="text-base font-bold text-slate-900 dark:text-white m-0">Subject</h4>
        </div>

        {/* Card Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Class Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="class_id">
                  Class Name <span className="text-rose-500">*</span>
                </label>
                <select
                  name="class_id"
                  id="class_id"
                  value={formData.class_id}
                  onChange={(e) => handleChange('class_id', e.target.value)}
                  onBlur={() => handleBlur('class_id')}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition cursor-pointer ${
                    touched.class_id && errors.class_id
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                  }`}
                  required
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.class_name}
                    </option>
                  ))}
                </select>
                {touched.class_id && errors.class_id && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.class_id}</span>
                  </p>
                )}
              </div>

              {/* Subject Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="subject_name">
                  Subject Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject_name"
                  id="subject_name"
                  value={formData.subject_name}
                  onChange={(e) => handleChange('subject_name', e.target.value)}
                  onBlur={() => handleBlur('subject_name')}
                  placeholder="e.g. Mathematics, English"
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition ${
                    touched.subject_name && errors.subject_name
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                  }`}
                  required
                />
                {touched.subject_name && errors.subject_name && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.subject_name}</span>
                  </p>
                )}
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="sort_order">
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
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition ${
                    touched.sort_order && errors.sort_order
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                  }`}
                  required
                />
                {touched.sort_order && errors.sort_order && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.sort_order}</span>
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="status">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition cursor-pointer"
                  required
                >
                  <option value="1">Active</option>
                  <option value="2">Inactive</option>
                </select>
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
                <span>Submit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
