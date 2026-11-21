'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
  Key,
  ShieldCheck,
  ShieldAlert,
  Save,
  CheckSquare,
  Square,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Layers,
  ChevronDown,
} from 'lucide-react';
import usePermission from '@/hooks/usePermission';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ACTION_LABELS = {
  view: { label: 'View', color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50 border-sky-200' },
  create: { label: 'Create', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200' },
  edit: { label: 'Edit', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200' },
  delete: { label: 'Delete', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200' },
  manage: { label: 'Manage', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200' },
};

function PermissionsContent() {
  const searchParams = useSearchParams();
  const urlRoleId = searchParams.get('roleId');

  const { hasPermission, can, isSuperAdmin } = usePermission();
  const canView = isSuperAdmin || hasPermission('permissions_view');
  const canEdit = isSuperAdmin || can('permissions', 'edit') || can('permissions', 'manage');

  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [modules, setModules] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [assignedIds, setAssignedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch all roles and module permission registry
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [rolesRes, permsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/roles`, { timeout: 8000 }),
          axios.get(`${API_BASE_URL}/api/admin/permissions`, { timeout: 8000 }),
        ]);

        const fetchedRoles = rolesRes.data?.data || [];
        setRoles(fetchedRoles);

        if (permsRes.data?.success) {
          setModules(permsRes.data.modules || []);
          setAllPermissions(permsRes.data.permissions || []);
        }

        // Determine initially selected role
        if (fetchedRoles.length > 0) {
          if (urlRoleId) {
            const found = fetchedRoles.find((r) => String(r.id) === String(urlRoleId));
            setSelectedRoleId(found ? found.id : fetchedRoles[0].id);
          } else {
            setSelectedRoleId(fetchedRoles[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading RBAC permissions:', err);
        showToast('Failed to load roles and permissions registry', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [urlRoleId]);

  // 2. Fetch assigned permissions whenever selectedRoleId changes
  useEffect(() => {
    if (!selectedRoleId) return;

    async function loadRolePermissions() {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/admin/permissions/role/${selectedRoleId}`,
          { timeout: 8000 }
        );
        if (res.data?.success) {
          const ids = res.data.assignedPermissionIds || [];
          setAssignedIds(new Set(ids));
        }
      } catch (err) {
        console.error('Error fetching assigned permissions for role:', err);
        showToast('Could not fetch permissions for selected role', 'error');
      }
    }
    loadRolePermissions();
  }, [selectedRoleId]);

  const selectedRole = useMemo(() => {
    return roles.find((r) => String(r.id) === String(selectedRoleId)) || null;
  }, [roles, selectedRoleId]);

  const isSuperAdminRole = selectedRole?.code === 'SUPER_ADMIN';

  // Toggle single permission checkbox
  const togglePermission = (permId) => {
    if (isSuperAdminRole) return;
    setAssignedIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  // Toggle all permissions for a specific module
  const toggleModulePermissions = (modulePerms) => {
    if (isSuperAdminRole) return;
    const modulePermIds = modulePerms.map((p) => p.id);
    const allAssigned = modulePermIds.every((id) => assignedIds.has(id));

    setAssignedIds((prev) => {
      const next = new Set(prev);
      if (allAssigned) {
        modulePermIds.forEach((id) => next.delete(id));
      } else {
        modulePermIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Select all permissions globally
  const handleSelectAll = () => {
    if (isSuperAdminRole) return;
    const allIds = allPermissions.map((p) => p.id);
    setAssignedIds(new Set(allIds));
  };

  // Deselect all permissions globally
  const handleDeselectAll = () => {
    if (isSuperAdminRole) return;
    setAssignedIds(new Set());
  };

  // Save permissions to database
  const handleSave = async () => {
    if (!selectedRoleId) return;
    if (isSuperAdminRole) {
      showToast('Super Admin role has permanent full access by design', 'info');
      return;
    }

    setSaving(true);
    try {
      const permissionIdsArray = Array.from(assignedIds);
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/permissions/role/${selectedRoleId}`,
        { permissionIds: permissionIdsArray },
        { timeout: 8000 }
      );

      if (res.data?.success) {
        showToast(
          `Permissions updated successfully! (${permissionIdsArray.length} granted)`,
          'success'
        );
        // Refresh roles to update permission count badge
        const rolesRes = await axios.get(`${API_BASE_URL}/api/admin/roles`, { timeout: 8000 });
        if (rolesRes.data?.data) setRoles(rolesRes.data.data);
      } else {
        showToast(res.data?.message || 'Failed to save permissions', 'error');
      }
    } catch (err) {
      console.error('Error saving permissions:', err);
      showToast(err.response?.data?.message || 'Server error while saving permissions', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filter modules by search term
  const filteredModules = useMemo(() => {
    if (!searchTerm.trim()) return modules;
    const lower = searchTerm.toLowerCase();
    return modules.filter(
      (m) =>
        m.module_name.toLowerCase().includes(lower) ||
        m.module.toLowerCase().includes(lower) ||
        m.permissions.some((p) => p.description.toLowerCase().includes(lower))
    );
  }, [modules, searchTerm]);

  if (!canView) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/50">
        <ShieldAlert className="h-12 w-12 mx-auto text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1">
          You do not have permission to view or manage role permissions.
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
              : toast.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
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
              Role Permission Matrix
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2aa89c]/10 text-[#2aa89c] border border-[#2aa89c]/20">
              Module-Wise Access
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Grant or revoke granular module access (View, Create, Edit, Delete, Manage) for each user role.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSave}
            disabled={saving || isSuperAdminRole}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              isSuperAdminRole
                ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                : 'bg-[#2aa89c] hover:bg-[#238c82] text-white cursor-pointer'
            }`}
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Permissions'}</span>
          </button>
        )}
      </div>

      {/* Role Selection & Overview Panel */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Select Target Role:
            </label>
            <div className="relative">
              <select
                value={selectedRoleId || ''}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="text-xs font-bold px-4 py-2 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2aa89c] cursor-pointer appearance-none min-w-[220px]"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {selectedRole && (
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <span className="font-semibold text-slate-500">Selected Role:</span>
              <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {selectedRole.code}
              </span>
              {selectedRole.is_system ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> System Role
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Custom Role
                </span>
              )}
              <span className="text-slate-400">|</span>
              <span className="font-bold text-[#2aa89c]">
                {isSuperAdminRole ? allPermissions.length : assignedIds.size} of {allPermissions.length}
              </span>
              <span className="text-slate-400">Permissions Active</span>
            </div>
          )}
        </div>

        {/* Super Admin Notice Banner */}
        {isSuperAdminRole && (
          <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3">
            <Lock className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              <strong>Super Admin Role:</strong> This role has full unrestricted bypass privileges across all current and future system modules. Permissions are automatically granted and protected.
            </span>
          </div>
        )}

        {/* Action Controls & Search Filter */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter modules or actions..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2aa89c]"
            />
          </div>

          {!isSuperAdminRole && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                <span>Select All</span>
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Square className="h-3.5 w-3.5 text-slate-400" />
                <span>Deselect All</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-[#2aa89c] mb-2" />
            <p className="text-xs font-semibold">Loading permission matrix...</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShieldAlert className="h-10 w-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Modules Found</p>
            <p className="text-xs text-slate-500 mt-1">Try searching with a different keyword.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 w-1/4">System Module</th>
                  <th className="p-4 text-center">View</th>
                  <th className="p-4 text-center">Create</th>
                  <th className="p-4 text-center">Edit</th>
                  <th className="p-4 text-center">Delete</th>
                  <th className="p-4 text-center">Manage</th>
                  <th className="p-4 text-center">Module Quick Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredModules.map((mod) => {
                  const viewPerm = mod.permissions.find((p) => p.action === 'view');
                  const createPerm = mod.permissions.find((p) => p.action === 'create');
                  const editPerm = mod.permissions.find((p) => p.action === 'edit');
                  const deletePerm = mod.permissions.find((p) => p.action === 'delete');
                  const managePerm = mod.permissions.find((p) => p.action === 'manage');

                  const modulePermIds = mod.permissions.map((p) => p.id);
                  const isAllModuleChecked =
                    isSuperAdminRole || modulePermIds.every((id) => assignedIds.has(id));
                  const isSomeModuleChecked =
                    !isAllModuleChecked && modulePermIds.some((id) => assignedIds.has(id));

                  const renderCheckbox = (perm) => {
                    if (!perm) {
                      return <span className="text-slate-300 dark:text-slate-700">—</span>;
                    }

                    const isChecked = isSuperAdminRole || assignedIds.has(perm.id);

                    return (
                      <label
                        className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors ${
                          isSuperAdminRole
                            ? 'cursor-not-allowed opacity-80'
                            : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={`${perm.description} (${perm.code})`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.id)}
                          disabled={isSuperAdminRole}
                          className="rounded border-slate-300 text-[#2aa89c] focus:ring-[#2aa89c] h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </label>
                    );
                  };

                  return (
                    <tr
                      key={mod.module}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Layers className="h-4 w-4 text-[#2aa89c] shrink-0" />
                          <span>{mod.module_name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 ml-6">
                          module: {mod.module}
                        </span>
                      </td>

                      <td className="p-4 text-center">{renderCheckbox(viewPerm)}</td>
                      <td className="p-4 text-center">{renderCheckbox(createPerm)}</td>
                      <td className="p-4 text-center">{renderCheckbox(editPerm)}</td>
                      <td className="p-4 text-center">{renderCheckbox(deletePerm)}</td>
                      <td className="p-4 text-center">{renderCheckbox(managePerm)}</td>

                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleModulePermissions(mod.permissions)}
                          disabled={isSuperAdminRole}
                          className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                            isSuperAdminRole
                              ? 'text-slate-400 cursor-not-allowed'
                              : isAllModuleChecked
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 cursor-pointer'
                          }`}
                        >
                          {isAllModuleChecked ? 'Revoke All' : 'Grant All'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Save Bar on Scroll (Mobile / Desktop convenience) */}
      {canEdit && !isSuperAdminRole && (
        <div className="sticky bottom-4 z-40 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Unsaved configuration for:</span>
            <strong className="text-slate-900 dark:text-white font-bold">
              {selectedRole?.name}
            </strong>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50">
              {assignedIds.size} granted
            </span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#2aa89c] hover:bg-[#238c82] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminPermissionsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="h-8 w-8 mx-auto animate-spin text-[#2aa89c] mb-2" />
          <p className="text-xs font-semibold">Loading Role Permissions Module...</p>
        </div>
      }
    >
      <PermissionsContent />
    </Suspense>
  );
}
