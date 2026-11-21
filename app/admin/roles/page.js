'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  ShieldCheck,
  ShieldAlert,
  Plus,
  Search,
  Key,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Users,
  Lock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import usePermission from '@/hooks/usePermission';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminRolesPage() {
  const { hasPermission, can, isSuperAdmin } = usePermission();

  const canView = isSuperAdmin || hasPermission('roles_view');
  const canCreate = isSuperAdmin || can('roles', 'create');
  const canEdit = isSuperAdmin || can('roles', 'edit');
  const canDelete = isSuperAdmin || can('roles', 'delete');
  const canManagePermissions = isSuperAdmin || hasPermission('permissions_view');

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete State
  const [deletingRole, setDeletingRole] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/roles`, { timeout: 8000 });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setRoles(res.data.data);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      showToast('Failed to load user roles from database', 'error');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        (role.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && role.status) ||
        (statusFilter === 'INACTIVE' && !role.status);
      return matchesSearch && matchesStatus;
    });
  }, [roles, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = roles.length;
    const active = roles.filter((r) => r.status).length;
    const system = roles.filter((r) => r.is_system).length;
    const custom = total - system;
    return { total, active, system, custom };
  }, [roles]);

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      status: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name || '',
      code: role.code || '',
      description: role.description || '',
      status: role.status !== false,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    if (!editingRole) {
      const autoCode = newName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_');
      setFormData((prev) => ({ ...prev, name: newName, code: autoCode }));
    } else {
      setFormData((prev) => ({ ...prev, name: newName }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Role Name is required');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingRole) {
        const res = await axios.put(
          `${API_BASE_URL}/api/admin/roles/${editingRole.id}`,
          formData,
          { timeout: 8000 }
        );
        if (res.data?.success) {
          showToast(`Role '${formData.name}' updated successfully!`, 'success');
          setIsModalOpen(false);
          fetchRoles();
        } else {
          setFormError(res.data?.message || 'Failed to update role');
        }
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/admin/roles`, formData, {
          timeout: 8000,
        });
        if (res.data?.success) {
          showToast(`Role '${formData.name}' created successfully!`, 'success');
          setIsModalOpen(false);
          fetchRoles();
        } else {
          setFormError(res.data?.message || 'Failed to create role');
        }
      }
    } catch (err) {
      console.error('Error saving role:', err);
      setFormError(err.response?.data?.message || 'Server error occurred while saving role');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    setIsDeleting(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/admin/roles/${deletingRole.id}`, {
        timeout: 8000,
      });
      if (res.data?.success) {
        showToast(`Role '${deletingRole.name}' deleted successfully!`, 'success');
        setDeletingRole(null);
        fetchRoles();
      } else {
        showToast(res.data?.message || 'Failed to delete role', 'error');
      }
    } catch (err) {
      console.error('Error deleting role:', err);
      showToast(err.response?.data?.message || 'Failed to delete role from server', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canView) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/50">
        <ShieldAlert className="h-12 w-12 mx-auto text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1">
          You do not have permission to view User Roles. Please contact your system administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-top-2 ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              User Role Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2aa89c]/10 text-[#2aa89c] border border-[#2aa89c]/20">
              RBAC v2
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Define system roles and configure fine-grained permissions for staff and administrators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRoles}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Refresh Roles"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canCreate && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2aa89c] hover:bg-[#238c82] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Roles
            </span>
            <ShieldCheck className="h-4 w-4 text-[#2aa89c]" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Active Roles
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{stats.active}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              System Protected
            </span>
            <Lock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{stats.system}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Custom Roles
            </span>
            <Sparkles className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-2">{stats.custom}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roles by name or code..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2aa89c]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 whitespace-nowrap">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2aa89c]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Role Cards / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-[#2aa89c] mb-2" />
            <p className="text-xs font-semibold">Loading roles from database...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShieldAlert className="h-10 w-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Roles Found</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm ? 'Try adjusting your search criteria' : 'Click "Create New Role" to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Role Details</th>
                  <th className="p-4">Role Code</th>
                  <th className="p-4">Assigned Users</th>
                  <th className="p-4">Permissions</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{role.name}</span>
                        {role.is_system && (
                          <span title="System Role (Protected)">
                            <Lock className="h-3.5 w-3.5 text-amber-500 inline" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {role.description || 'No description provided.'}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {role.code}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-semibold">{role.user_count || 0}</span>
                        <span className="text-[10px] text-slate-400">users</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5 text-[#2aa89c]" />
                        <span className="font-bold text-[#2aa89c]">{role.permission_count || 0}</span>
                        <span className="text-[10px] text-slate-400">granted</span>
                      </div>
                    </td>

                    <td className="p-4">
                      {role.is_system ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          System
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          Custom
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {role.status ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canManagePermissions && (
                          <Link
                            href={`/admin/permissions?roleId=${role.id}`}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                            title="Configure Permissions"
                          >
                            <Key className="h-4 w-4" />
                          </Link>
                        )}

                        {canEdit && (
                          <button
                            onClick={() => openEditModal(role)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                            title="Edit Role"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}

                        {canDelete && !role.is_system && (
                          <button
                            onClick={() => setDeletingRole(role)}
                            disabled={parseInt(role.user_count, 10) > 0}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              parseInt(role.user_count, 10) > 0
                                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                            }`}
                            title={
                              parseInt(role.user_count, 10) > 0
                                ? 'Cannot delete role with assigned users'
                                : 'Delete Role'
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-50 dark:bg-rose-950/50">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete User Role</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete the role{' '}
              <strong className="text-slate-900 dark:text-white font-bold">{deletingRole.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRole(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Delete Role</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in-50">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#2aa89c]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New User Role'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g., Academic Supervisor, Librarian, Accountant"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2aa89c]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role Code / Identifier <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
                    }))
                  }
                  disabled={Boolean(editingRole?.is_system)}
                  placeholder="e.g., ACADEMIC_SUPERVISOR"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2aa89c] disabled:opacity-60"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Uppercase unique code used by system permission gates.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Briefly describe the operational responsibilities of this role..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2aa89c]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="role_status"
                  checked={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.checked }))}
                  className="rounded border-slate-300 text-[#2aa89c] focus:ring-[#2aa89c] h-4 w-4"
                />
                <label htmlFor="role_status" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Active (Staff can be assigned to this role)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#2aa89c] hover:bg-[#238c82] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {formSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingRole ? 'Update Role' : 'Create Role'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
