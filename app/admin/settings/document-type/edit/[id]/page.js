'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Loader2
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function EditDocumentTypePage() {
  const router = useRouter();
  const params = useParams();
  const typeId = params?.id;

  const [formData, setFormData] = useState({
    document_type_name: '',
    status: '1',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!typeId) return;

    const fetchTypeData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/document-types/${typeId}`, {
          timeout: 8000,
        });

        if (res.data?.success && res.data.data) {
          const item = res.data.data;
          setFormData({
            document_type_name: item.document_type_name || '',
            status: item.status !== false ? '1' : '2',
          });
        }
      } catch (err) {
        console.error('Error loading document type:', err);
        if (err.code === 'ERR_NETWORK' || !err.response) {
          setFormError('Backend server is unreachable (port 5000). Please check if backend is running.');
        } else {
          setFormError('Failed to load document type details from server.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTypeData();
  }, [typeId]);

  const validateField = (name, value) => {
    let errorMsg = '';
    const val = value !== undefined && value !== null ? String(value).trim() : '';

    if (name === 'document_type_name') {
      if (!val) {
        errorMsg = 'Document type name is required.';
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
    const nameError = validateField('document_type_name', formData.document_type_name);
    if (nameError) newErrors.document_type_name = nameError;

    setErrors(newErrors);
    setTouched({
      document_type_name: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const isValid = validateAll();
    if (!isValid) return;

    setSubmitting(true);

    const updatedData = {
      document_type_name: formData.document_type_name.trim(),
      status: formData.status === '1',
    };

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/admin/document-types/${typeId}`,
        updatedData,
        { timeout: 8000 }
      );

      if (res.data?.success) {
        router.push('/admin/settings/document-type?notify=updated');
        return;
      }
    } catch (err) {
      console.error('Update document type error:', err);
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setFormError('Backend server is unreachable (port 5000). Please check if backend is running.');
      } else {
        setFormError(err.response?.data?.message || 'Failed to update document type.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-12 text-center text-slate-500">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600" />
        <p className="text-xs font-semibold">Loading Document Type Details...</p>
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
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-500">Settings</span>
            <ChevronRight className="h-3 w-3" />
            <Link
              href="/admin/settings/document-type"
              className="hover:text-indigo-600 no-underline text-slate-500"
            >
              Document Type
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600 dark:text-indigo-400">Edit Document Type</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-indigo-600" />
            <span>Edit Document Type</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update document type information and verification status.
          </p>
        </div>

        <Link
          href="/admin/settings/document-type"
          className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition no-underline w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Document Types</span>
        </Link>
      </div>

      {/* Global Form Error Banner */}
      {formError && (
        <div className="w-full p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{formError}</span>
        </div>
      )}

      {/* Document Type Card Form */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="bg-slate-50/80 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="text-base font-bold text-slate-900 dark:text-white m-0">Document Type</h4>
        </div>

        {/* Card Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Type Name */}
              <div>
                <label
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  htmlFor="document_type_name"
                >
                  Document Type Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="document_type_name"
                  id="document_type_name"
                  value={formData.document_type_name}
                  onChange={(e) => handleChange('document_type_name', e.target.value)}
                  onBlur={() => handleBlur('document_type_name')}
                  placeholder="e.g. Birth Certificate, Transfer Certificate"
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg p-2.5 text-xs text-slate-900 dark:text-white transition ${
                    touched.document_type_name && errors.document_type_name
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900'
                  }`}
                  required
                />
                {touched.document_type_name && errors.document_type_name && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.document_type_name}</span>
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  htmlFor="status"
                >
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
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
