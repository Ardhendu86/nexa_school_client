'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeft,
  Layers,
  Save,
  AlertCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { decryptId } from '@/lib/crypto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function EditSectionPage() {
  const router = useRouter();
  const params = useParams();
  const encryptedId = params?.id;

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionId, setSectionId] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    class_id: '',
    section_name: '',
    capacity: '',
    note: '',
    sort_order: '',
    status: '1',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch classes and section data
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Resolve raw or encrypted ID
        const resolvedId = decryptId(encryptedId) || encryptedId;
        setSectionId(resolvedId);

        // Fetch classes and section details concurrently
        const [classesRes, sectionRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/classes`, { timeout: 4000 }),
          axios.get(`${API_BASE_URL}/api/admin/sections/${encryptedId}`, { timeout: 4000 })
        ]);

        if (classesRes.data && classesRes.data.success && Array.isArray(classesRes.data.data)) {
          setClasses(classesRes.data.data);
        }

        if (sectionRes.data && sectionRes.data.success && sectionRes.data.data) {
          const sec = sectionRes.data.data;
          setFormData({
            class_id: String(sec.class_id || ''),
            section_name: sec.section_name || '',
            capacity: String(sec.capacity !== undefined && sec.capacity !== null ? sec.capacity : ''),
            note: sec.note || '',
            sort_order: String(sec.sort_order !== undefined && sec.sort_order !== null ? sec.sort_order : '0'),
            status: sec.status ? '1' : '2',
          });
        }
      } catch (err) {
        console.error('Error fetching section details:', err);
        setFormError('Failed to load section data from database.');
      } finally {
        setLoading(false);
      }
    };

    if (encryptedId) {
      initData();
    }
  }, [encryptedId]);

  // Validate a single field
  const validateField = (name, value) => {
    let errorMsg = '';
    const val = value !== undefined && value !== null ? String(value).trim() : '';

    if (name === 'class_id') {
      if (!val) {
        errorMsg = 'Class is required.';
      }
    } else if (name === 'section_name') {
      if (!val) {
        errorMsg = 'Section Name is required.';
      }
    } else if (name === 'capacity') {
      if (!val) {
        errorMsg = 'Capacity is required.';
      } else if (isNaN(val) || parseInt(val, 10) < 0) {
        errorMsg = 'Capacity must be a valid number.';
      }
    } else if (name === 'note') {
      if (!val) {
        errorMsg = 'Note is required.';
      }
    } else if (name === 'sort_order') {
      if (!val) {
        errorMsg = 'Sort Order is required.';
      } else if (isNaN(val)) {
        errorMsg = 'Sort Order must be a number.';
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

  // Real-time check if section name already exists for selected class (excluding current)
  const checkSection = async () => {
    if (!formData.class_id || !formData.section_name.trim()) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/sections/check`, {
        params: {
          class_id: formData.class_id,
          section_name: formData.section_name.trim(),
          exclude_id: encryptedId
        },
        timeout: 3000
      });
      if (res.data && res.data.exists) {
        setErrors((prev) => ({
          ...prev,
          section_name: 'This section name already exists in the selected class.'
        }));
      }
    } catch (err) {
      // Ignore check network error
    }
  };

  const validateAll = () => {
    const newErrors = {};

    const classError = validateField('class_id', formData.class_id);
    if (classError) newErrors.class_id = classError;

    const nameError = validateField('section_name', formData.section_name);
    if (nameError) newErrors.section_name = nameError;

    const capError = validateField('capacity', formData.capacity);
    if (capError) newErrors.capacity = capError;

    const noteError = validateField('note', formData.note);
    if (noteError) newErrors.note = noteError;

    const sortError = validateField('sort_order', formData.sort_order);
    if (sortError) newErrors.sort_order = sortError;

    const statusError = validateField('status', formData.status);
    if (statusError) newErrors.status = statusError;

    setErrors(newErrors);
    setTouched({
      class_id: true,
      section_name: true,
      capacity: true,
      note: true,
      sort_order: true,
      status: true,
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
      class_id: parseInt(formData.class_id, 10),
      section_name: formData.section_name.trim(),
      capacity: parseInt(formData.capacity, 10),
      note: formData.note.trim(),
      sort_order: parseInt(formData.sort_order, 10),
      status: formData.status === '1',
    };

    try {
      const res = await axios.put(`${API_BASE_URL}/api/admin/sections/${encryptedId}`, payload, { timeout: 4000 });
      if (res.data && res.data.success) {
        router.push('/admin/settings/section?notify=updated');
        return;
      }
    } catch (err) {
      console.error('Update section error:', err);
      setFormError(
        err.response?.data?.message || 'Failed to update section in database. Please check your backend connection.'
      );
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="w-full p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        <span className="text-xs font-semibold">Loading section details...</span>
      </div>
    );
  }

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
            <Link href="/admin/settings/section" className="hover:text-indigo-600 no-underline text-slate-500">
              Section
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600 dark:text-indigo-400">Edit Section</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-indigo-600" />
            <span>Edit Section</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Modify class grouping, capacity, notes, or active status.
          </p>
        </div>

        <Link
          href="/admin/settings/section"
          className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition no-underline w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sections</span>
        </Link>
      </div>

      {/* Global Form Error Banner */}
      {formError && (
        <div className="w-full p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{formError}</span>
        </div>
      )}

      {/* Section Card Form */}
      <div className="card bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="card-header bg-light bg-slate-50/80 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="d-flex align-items-center">
            <h4 className="text-dark text-base font-bold text-slate-900 dark:text-white m-0">Section</h4>
          </div>
        </div>

        <div className="card-body p-6 pb-1">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row row-cols-md-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Class Dropdown */}
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Class <span className="text-danger text-rose-500">*</span>
                  </label>
                  <select
                    name="class_id"
                    id="class_id"
                    value={formData.class_id}
                    onChange={(e) => {
                      handleChange('class_id', e.target.value);
                      setTimeout(checkSection, 50);
                    }}
                    onBlur={() => handleBlur('class_id')}
                    required
                    className={`form-control select w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition cursor-pointer ${
                      touched.class_id && errors.class_id
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                    }`}
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.class_name || cls.name}
                      </option>
                    ))}
                  </select>
                  {touched.class_id && errors.class_id && (
                    <div className="text-danger text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.class_id}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Name Input */}
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Section Name <span className="text-danger text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition ${
                      touched.section_name && errors.section_name
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                    }`}
                    name="section_name"
                    id="section_name"
                    value={formData.section_name}
                    placeholder="e.g. A, B, Rose"
                    required
                    onChange={(e) => {
                      handleChange('section_name', e.target.value);
                      setTimeout(checkSection, 250);
                    }}
                    onBlur={() => handleBlur('section_name')}
                  />
                  {touched.section_name && errors.section_name && (
                    <div
                      id="section_name_error"
                      className="text-danger text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.section_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Capacity Input */}
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Capacity <span className="text-danger text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={`form-control w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition ${
                      touched.capacity && errors.capacity
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                    }`}
                    name="capacity"
                    id="capacity"
                    value={formData.capacity}
                    placeholder="e.g. 40"
                    required
                    onChange={(e) => handleChange('capacity', e.target.value)}
                    onBlur={() => handleBlur('capacity')}
                  />
                  {touched.capacity && errors.capacity && (
                    <div className="text-danger text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.capacity}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Input */}
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Note <span className="text-danger text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition ${
                      touched.note && errors.note
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                    }`}
                    name="note"
                    id="note"
                    value={formData.note}
                    placeholder="Note or description"
                    required
                    onChange={(e) => handleChange('note', e.target.value)}
                    onBlur={() => handleBlur('note')}
                  />
                  {touched.note && errors.note && (
                    <div className="text-danger text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sort Order Input */}
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Sort Order <span className="text-danger text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={`form-control w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition ${
                      touched.sort_order && errors.sort_order
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                    }`}
                    name="sort_order"
                    id="sort_order"
                    value={formData.sort_order}
                    placeholder="e.g. 1, 2, 3"
                    required
                    onChange={(e) => handleChange('sort_order', e.target.value)}
                    onBlur={() => handleBlur('sort_order')}
                  />
                  {touched.sort_order && errors.sort_order && (
                    <div className="text-danger text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.sort_order}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Select */}
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status <span className="text-danger text-rose-500">*</span>
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    required
                    onChange={(e) => handleChange('status', e.target.value)}
                    onBlur={() => handleBlur('status')}
                    className={`form-control select w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition cursor-pointer ${
                      touched.status && errors.status
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                    }`}
                  >
                    <option value="1">Active</option>
                    <option value="2">Inactive</option>
                  </select>
                  {touched.status && errors.status && (
                    <div className="text-danger text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.status}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="text-end mb-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
              <button
                type="button"
                onClick={() => router.push('/admin/settings/section')}
                className="btn btn-light me-3 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold border-0 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submitBtn"
                disabled={submitting}
                className="btn btn-primary px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 border-0 transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
