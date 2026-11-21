'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';

/**
 * Custom React Hook for Role-Based Access Control (RBAC)
 * Supports granular permissions: view, create, edit, delete, manage
 * Includes hydration safety to prevent SSR/CSR mismatch warnings
 */
export function usePermission() {
  const user = useSelector(selectCurrentUser);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return useMemo(() => {
    // Before mounting (SSR & initial client hydration render),
    // default to showing standard menus to ensure SSR HTML and initial client HTML match 100%
    if (!isMounted) {
      return {
        user: null,
        role: '',
        roleName: '',
        permissions: [],
        isSuperAdmin: true,
        isMounted: false,
        hasPermission: () => true,
        can: () => true,
        hasAnyPermission: () => true,
        hasAllPermissions: () => true,
      };
    }

    // Attempt fallback from localStorage if Redux is rehydrating
    let activeUser = user;
    if (!activeUser && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        if (stored) activeUser = JSON.parse(stored);
      } catch (e) {
        activeUser = null;
      }
    }

    const roleCode = (activeUser?.role_code || activeUser?.role || '').toUpperCase();
    const permissions = Array.isArray(activeUser?.permissions) ? activeUser.permissions : [];

    // Super Admin or wildcard grants full unrestricted access
    const isSuperAdmin = roleCode === 'SUPER_ADMIN' || permissions.includes('*');

    /**
     * Check if user has a specific permission code (e.g., 'roles_create')
     */
    const hasPermission = (permissionCode) => {
      if (!permissionCode) return true;
      if (isSuperAdmin) return true;
      return permissions.includes(permissionCode);
    };

    /**
     * Check if user has permission for a module and action
     * e.g., can('roles', 'create') -> checks 'roles_create'
     */
    const can = (module, action) => {
      if (!module || !action) return false;
      if (isSuperAdmin) return true;
      const code = `${module.toLowerCase()}_${action.toLowerCase()}`;
      return permissions.includes(code) || permissions.includes(`${module.toLowerCase()}_manage`);
    };

    /**
     * Check if user has at least one of the provided permissions
     */
    const hasAnyPermission = (codes = []) => {
      if (isSuperAdmin) return true;
      if (!Array.isArray(codes) || codes.length === 0) return true;
      return codes.some((c) => permissions.includes(c));
    };

    /**
     * Check if user has all of the provided permissions
     */
    const hasAllPermissions = (codes = []) => {
      if (isSuperAdmin) return true;
      if (!Array.isArray(codes) || codes.length === 0) return true;
      return codes.every((c) => permissions.includes(c));
    };

    return {
      user: activeUser,
      role: roleCode,
      roleName: activeUser?.role_name || (roleCode === 'SUPER_ADMIN' ? 'Super Admin' : roleCode),
      permissions,
      isSuperAdmin,
      isMounted: true,
      hasPermission,
      can,
      hasAnyPermission,
      hasAllPermissions,
    };
  }, [user, isMounted]);
}

export default usePermission;
