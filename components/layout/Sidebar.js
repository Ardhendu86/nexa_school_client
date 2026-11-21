'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectSidebarOpen,
  selectMobileSidebarOpen,
  closeMobileSidebar,
} from '@/store/slices/sidebarSlice';
import { logout } from '@/store/slices/authSlice';
import usePermission from '@/hooks/usePermission';

export default function Sidebar({
  portalType = 'admin',
  isOpen: propIsOpen,
  onClose: propOnClose,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const { hasPermission, isSuperAdmin } = usePermission();

  const canViewRoles = hasPermission('roles_view');
  const canViewUsers = hasPermission('users_view');
  const canViewPermissions = hasPermission('permissions_view');
  const canViewAuditLogs = hasPermission('audit_logs_view');
  const showPermissionSection = isSuperAdmin || canViewRoles || canViewUsers || canViewPermissions || canViewAuditLogs;

  const canViewShifts = hasPermission('shifts_view');
  const canViewClasses = hasPermission('classes_view');
  const canViewSections = hasPermission('sections_view');
  const canViewDays = hasPermission('days_view');
  const canViewPeriods = hasPermission('periods_view');
  const canViewAcademicYears = hasPermission('academic_years_view');
  const canViewDocumentTypes = hasPermission('document_types_view');
  const canViewSubjects = hasPermission('subjects_view');
  const canViewAssignmentTypes = hasPermission('assignment_types_view');
  const showSettingsSection = isSuperAdmin || canViewShifts || canViewClasses || canViewSections || canViewDays || canViewPeriods || canViewAcademicYears || canViewDocumentTypes || canViewSubjects || canViewAssignmentTypes;

  const isDesktopOpen = useSelector(selectSidebarOpen);
  const isMobileOpenRedux = useSelector(selectMobileSidebarOpen);

  const isMobileOpen = propIsOpen !== undefined ? propIsOpen : isMobileOpenRedux;
  const handleClose = propOnClose || (() => dispatch(closeMobileSidebar()));

  // Accordion state: initialize based on active route
  const [activeDropdown, setActiveDropdown] = useState(() => {
    if (pathname.startsWith('/admin/settings')) return 'settings';
    if (pathname.startsWith('/admin/permissions') || pathname.startsWith('/admin/roles') || pathname.startsWith('/admin/users') || pathname.startsWith('/admin/audit-logs')) return 'permission';
    if (pathname.startsWith('/teacher/classes') || pathname.startsWith('/teacher/subjects') || pathname.startsWith('/teacher/students') || pathname.startsWith('/teacher/attendance') || pathname.startsWith('/teacher/routine')) return 'classroom';
    if (pathname.startsWith('/teacher/marks') || pathname.startsWith('/teacher/assignments') || pathname.startsWith('/teacher/materials') || pathname.startsWith('/teacher/notices')) return 'academics';
    if (pathname.startsWith('/student/routine') || pathname.startsWith('/student/attendance') || pathname.startsWith('/student/assignments') || pathname.startsWith('/student/materials')) return 'studies';
    if (pathname.startsWith('/student/results') || pathname.startsWith('/student/fees') || pathname.startsWith('/student/notices') || pathname.startsWith('/student/profile')) return 'records';
    return null;
  });

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleLogout = () => {
    handleClose();
    dispatch(logout());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    router.push('/login');
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`sidebar-backdrop ${isMobileOpen ? 'show' : ''}`}
        onClick={handleClose}
      ></div>

      <aside
        className={`admin-sidebar ${isMobileOpen ? 'active' : ''} ${
          !isDesktopOpen ? 'collapsed' : ''
        }`}
        id="sidebar"
      >
        {/* Mobile Header with close button */}
        <div className="sidebar-close-btn lg:hidden flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <span className="h-6 w-6 rounded bg-[#2aa89c] text-white flex items-center justify-center text-xs font-bold">
              NE
            </span>
            <span>Nexaweb Education</span>
          </span>
          <button
            type="button"
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer bg-transparent border-0"
            onClick={handleClose}
            aria-label="Close sidebar"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="sidebar-stack">
          {/* ===================== ADMIN SIDEBAR ===================== */}
          {portalType === 'admin' && (
            <>
              {/* Direct Dashboard Link */}
              <div className="sidebar-section">
                <Link
                  className={`sidebar-main-btn ${
                    pathname === '/admin' ? 'active' : ''
                  }`}
                  href="/admin"
                  onClick={handleClose}
                >
                  <span className="sidebar-main-icon">
                    <i className="fa-solid fa-house"></i>
                  </span>
                  <span className="sidebar-main-title">Dashboard</span>
                </Link>
                {/* Collapsed Tooltip */}
                <div className="sidebar-flyout sidebar-tooltip">
                  <span>Dashboard</span>
                </div>
              </div>


              {/* Settings Dropdown */}
              {showSettingsSection && (
                <div className="sidebar-section">
                  <button
                    className="sidebar-main-btn"
                    type="button"
                    onClick={() => toggleDropdown('settings')}
                    data-bs-toggle="collapse"
                    data-bs-target="#sidebar-settings"
                    aria-expanded={activeDropdown === 'settings' ? 'true' : 'false'}
                    aria-controls="sidebar-settings"
                  >
                    <span className="sidebar-main-icon">
                      <i className="fa-solid fa-gear"></i>
                    </span>
                    <span className="sidebar-main-title">Settings</span>
                    <i
                      className="fa-solid fa-chevron-down sidebar-main-arrow"
                      style={{
                        transform: activeDropdown === 'settings'
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    ></i>
                  </button>

                  {/* Collapsed Hover Flyout */}
                  <div className="sidebar-flyout">
                    <div className="sidebar-flyout-title">
                      <i className="fa-solid fa-gear"></i>
                      <span>Settings</span>
                    </div>
                    <div className="sidebar-flyout-links">
                      {canViewAcademicYears && (
                        <Link
                          className={`sidebar-flyout-link ${pathname.startsWith('/admin/settings/academic-year') ? 'active' : ''}`}
                          href="/admin/settings/academic-year"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Academic Year
                        </Link>
                      )}
                      {canViewShifts && (
                        <Link
                          className={`sidebar-flyout-link ${pathname.startsWith('/admin/settings/shift') ? 'active' : ''}`}
                          href="/admin/settings/shift"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Shift
                        </Link>
                      )}
                      {canViewClasses && (
                        <Link
                          className={`sidebar-flyout-link ${pathname.startsWith('/admin/settings/class') ? 'active' : ''}`}
                          href="/admin/settings/class"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Class
                        </Link>
                      )}
                      {canViewSections && (
                        <Link
                          className={`sidebar-flyout-link ${pathname.startsWith('/admin/settings/section') ? 'active' : ''}`}
                          href="/admin/settings/section"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Section
                        </Link>
                      )}
                      {canViewSubjects && (
                        <Link
                          className={`sidebar-flyout-link ${pathname.startsWith('/admin/settings/subject') ? 'active' : ''}`}
                          href="/admin/settings/subject"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Subject
                        </Link>
                      )}
                      {canViewDays && (
                        <Link
                          className={`sidebar-flyout-link ${pathname.startsWith('/admin/settings/days') ? 'active' : ''}`}
                          href="/admin/settings/days"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Days
                        </Link>
                      )}
                      {canViewPeriods && (
                        <Link
                          className={`sidebar-flyout-link ${pathname.startsWith('/admin/settings/period') ? 'active' : ''}`}
                          href="/admin/settings/period"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Periods
                        </Link>
                      )}
                      {canViewDocumentTypes && (
                        <Link
                          className={`sidebar-flyout-link ${pathname.startsWith('/admin/settings/document-type') ? 'active' : ''}`}
                          href="/admin/settings/document-type"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Document Type
                        </Link>
                      )}
                      {canViewAssignmentTypes && (
                        <Link
                          className={`sidebar-flyout-link ${pathname.startsWith('/admin/settings/assignment-type') ? 'active' : ''}`}
                          href="/admin/settings/assignment-type"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Assignment Type
                        </Link>
                      )}
                    </div>
                  </div>

                  <div
                    className={`sidebar-collapse collapse ${activeDropdown === 'settings' ? 'show' : ''}`}
                    id="sidebar-settings"
                    style={{
                      display: activeDropdown === 'settings' ? 'block' : 'none',
                      visibility: 'visible',
                      opacity: 1,
                    }}
                  >
                    <div className="sidebar-submenu" style={{ visibility: 'visible', opacity: 1 }}>
                      {canViewAcademicYears && (
                        <Link
                          className={`sidebar-submenu-link ${
                            pathname.startsWith('/admin/settings/academic-year') ? 'active' : ''
                          }`}
                          href="/admin/settings/academic-year"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Academic Year
                        </Link>
                      )}
                      {canViewShifts && (
                        <Link
                          className={`sidebar-submenu-link ${
                            pathname.startsWith('/admin/settings/shift') ? 'active' : ''
                          }`}
                          href="/admin/settings/shift"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Shift
                        </Link>
                      )}
                      {canViewClasses && (
                        <Link
                          className={`sidebar-submenu-link ${
                            pathname.startsWith('/admin/settings/class') ? 'active' : ''
                          }`}
                          href="/admin/settings/class"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Class
                        </Link>
                      )}
                      {canViewSections && (
                        <Link
                          className={`sidebar-submenu-link ${
                            pathname.startsWith('/admin/settings/section') ? 'active' : ''
                          }`}
                          href="/admin/settings/section"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Section
                        </Link>
                      )}
                      {canViewSubjects && (
                        <Link
                          className={`sidebar-submenu-link ${
                            pathname.startsWith('/admin/settings/subject') ? 'active' : ''
                          }`}
                          href="/admin/settings/subject"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Subject
                        </Link>
                      )}
                      {canViewDays && (
                        <Link
                          className={`sidebar-submenu-link ${
                            pathname.startsWith('/admin/settings/days') ? 'active' : ''
                          }`}
                          href="/admin/settings/days"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Days
                        </Link>
                      )}
                      {canViewPeriods && (
                        <Link
                          className={`sidebar-submenu-link ${
                            pathname.startsWith('/admin/settings/period') ? 'active' : ''
                          }`}
                          href="/admin/settings/period"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Periods
                        </Link>
                      )}
                      {canViewDocumentTypes && (
                        <Link
                          className={`sidebar-submenu-link ${
                            pathname.startsWith('/admin/settings/document-type') ? 'active' : ''
                          }`}
                          href="/admin/settings/document-type"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Document Type
                        </Link>
                      )}
                      {canViewAssignmentTypes && (
                        <Link
                          className={`sidebar-submenu-link ${
                            pathname.startsWith('/admin/settings/assignment-type') ? 'active' : ''
                          }`}
                          href="/admin/settings/assignment-type"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Assignment Type
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Permission Dropdown */}
              {showPermissionSection && (
                <div className="sidebar-section">
                  <button
                    className="sidebar-main-btn"
                    type="button"
                    onClick={() => toggleDropdown('permission')}
                    data-bs-toggle="collapse"
                    data-bs-target="#sidebar-permission"
                    aria-expanded={activeDropdown === 'permission' ? 'true' : 'false'}
                    aria-controls="sidebar-permission"
                  >
                    <span className="sidebar-main-icon">
                      <i className="fa-solid fa-user-shield"></i>
                    </span>
                    <span className="sidebar-main-title">Permission</span>
                    <i
                      className="fa-solid fa-chevron-down sidebar-main-arrow"
                      style={{
                        transform: activeDropdown === 'permission'
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    ></i>
                  </button>

                  {/* Collapsed Hover Flyout */}
                  <div className="sidebar-flyout">
                    <div className="sidebar-flyout-title">
                      <i className="fa-solid fa-user-shield"></i>
                      <span>Permission</span>
                    </div>
                    <div className="sidebar-flyout-links">
                      {canViewRoles && (
                        <Link
                          className={`sidebar-flyout-link ${pathname === '/admin/roles' ? 'active' : ''}`}
                          href="/admin/roles"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Roles
                        </Link>
                      )}
                      {canViewUsers && (
                        <Link
                          className={`sidebar-flyout-link ${pathname === '/admin/users' ? 'active' : ''}`}
                          href="/admin/users"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Users
                        </Link>
                      )}
                      {canViewPermissions && (
                        <Link
                          className={`sidebar-flyout-link ${pathname === '/admin/permissions' ? 'active' : ''}`}
                          href="/admin/permissions"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Permission
                        </Link>
                      )}
                      {canViewAuditLogs && (
                        <Link
                          className={`sidebar-flyout-link ${pathname === '/admin/audit-logs' ? 'active' : ''}`}
                          href="/admin/audit-logs"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Audit Logs
                        </Link>
                      )}
                    </div>
                  </div>

                  <div
                    className={`sidebar-collapse collapse ${activeDropdown === 'permission' ? 'show' : ''}`}
                    id="sidebar-permission"
                    style={{
                      display: activeDropdown === 'permission' ? 'block' : 'none',
                      visibility: 'visible',
                      opacity: 1,
                    }}
                  >
                    <div className="sidebar-submenu" style={{ visibility: 'visible', opacity: 1 }}>
                      {canViewRoles && (
                        <Link
                          className={`sidebar-submenu-link ${
                            pathname === '/admin/roles' ? 'active' : ''
                          }`}
                          href="/admin/roles"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Roles
                        </Link>
                      )}
                      {canViewUsers && (
                        <Link
                          className={`sidebar-submenu-link ${
                            pathname === '/admin/users' ? 'active' : ''
                          }`}
                          href="/admin/users"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Users
                        </Link>
                      )}
                      {canViewPermissions && (
                        <Link
                          className={`sidebar-submenu-link ${
                            pathname === '/admin/permissions' ? 'active' : ''
                          }`}
                          href="/admin/permissions"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Permission
                        </Link>
                      )}
                      {canViewAuditLogs && (
                        <Link
                          className={`sidebar-submenu-link ${
                            pathname === '/admin/audit-logs' ? 'active' : ''
                          }`}
                          href="/admin/audit-logs"
                          onClick={handleClose}
                        >
                          <span className="sidebar-submenu-dot"></span>
                          Audit Logs
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===================== TEACHER SIDEBAR ===================== */}
          {portalType === 'teacher' && (
            <>
              {/* Direct Dashboard Link */}
              <div className="sidebar-section">
                <Link
                  className={`sidebar-main-btn ${
                    pathname === '/teacher' ? 'active' : ''
                  }`}
                  href="/teacher"
                  onClick={handleClose}
                >
                  <span className="sidebar-main-icon">
                    <i className="fa-solid fa-house"></i>
                  </span>
                  <span className="sidebar-main-title">Dashboard</span>
                </Link>
                {/* Collapsed Tooltip */}
                <div className="sidebar-flyout sidebar-tooltip">
                  <span>Dashboard</span>
                </div>
              </div>

              {/* Classroom Dropdown */}
              <div className="sidebar-section">
                <button
                  className="sidebar-main-btn"
                  type="button"
                  onClick={() => toggleDropdown('classroom')}
                  data-bs-toggle="collapse"
                  data-bs-target="#sidebar-classroom"
                  aria-expanded={activeDropdown === 'classroom' ? 'true' : 'false'}
                  aria-controls="sidebar-classroom"
                >
                  <span className="sidebar-main-icon">
                    <i className="fa-solid fa-chalkboard-user"></i>
                  </span>
                  <span className="sidebar-main-title">Classroom</span>
                  <i
                    className="fa-solid fa-chevron-down sidebar-main-arrow"
                    style={{
                      transform: activeDropdown === 'classroom'
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  ></i>
                </button>

                {/* Collapsed Hover Flyout */}
                <div className="sidebar-flyout">
                  <div className="sidebar-flyout-title">
                    <i className="fa-solid fa-chalkboard-user"></i>
                    <span>Classroom</span>
                  </div>
                  <div className="sidebar-flyout-links">
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/teacher/classes' ? 'active' : ''}`}
                      href="/teacher/classes"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      My Classes
                    </Link>
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/teacher/subjects' ? 'active' : ''}`}
                      href="/teacher/subjects"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Subjects
                    </Link>
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/teacher/students' ? 'active' : ''}`}
                      href="/teacher/students"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Students
                    </Link>
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/teacher/attendance' ? 'active' : ''}`}
                      href="/teacher/attendance"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Attendance
                    </Link>
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/teacher/routine' ? 'active' : ''}`}
                      href="/teacher/routine"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Class Routine
                    </Link>
                  </div>
                </div>

                <div
                  className={`sidebar-collapse collapse ${activeDropdown === 'classroom' ? 'show' : ''}`}
                  id="sidebar-classroom"
                  style={{
                    display: activeDropdown === 'classroom' ? 'block' : 'none',
                    visibility: 'visible',
                    opacity: 1,
                  }}
                >
                  <div className="sidebar-submenu" style={{ visibility: 'visible', opacity: 1 }}>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/teacher/classes' ? 'active' : ''
                      }`}
                      href="/teacher/classes"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      My Classes
                    </Link>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/teacher/subjects' ? 'active' : ''
                      }`}
                      href="/teacher/subjects"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Subjects
                    </Link>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/teacher/students' ? 'active' : ''
                      }`}
                      href="/teacher/students"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Students
                    </Link>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/teacher/attendance' ? 'active' : ''
                      }`}
                      href="/teacher/attendance"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Attendance
                    </Link>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/teacher/routine' ? 'active' : ''
                      }`}
                      href="/teacher/routine"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Class Routine
                    </Link>
                  </div>
                </div>
              </div>

              {/* Academics Dropdown */}
              <div className="sidebar-section">
                <button
                  className="sidebar-main-btn"
                  type="button"
                  onClick={() => toggleDropdown('academics')}
                  data-bs-toggle="collapse"
                  data-bs-target="#sidebar-academics"
                  aria-expanded={activeDropdown === 'academics' ? 'true' : 'false'}
                  aria-controls="sidebar-academics"
                >
                  <span className="sidebar-main-icon">
                    <i className="fa-solid fa-book-open-reader"></i>
                  </span>
                  <span className="sidebar-main-title">Academics</span>
                  <i
                    className="fa-solid fa-chevron-down sidebar-main-arrow"
                    style={{
                      transform: activeDropdown === 'academics'
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  ></i>
                </button>

                {/* Collapsed Hover Flyout */}
                <div className="sidebar-flyout">
                  <div className="sidebar-flyout-title">
                    <i className="fa-solid fa-book-open-reader"></i>
                    <span>Academics</span>
                  </div>
                  <div className="sidebar-flyout-links">
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/teacher/marks' ? 'active' : ''}`}
                      href="/teacher/marks"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Marks Entry
                    </Link>
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/teacher/assignments' ? 'active' : ''}`}
                      href="/teacher/assignments"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Assignments
                    </Link>
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/teacher/materials' ? 'active' : ''}`}
                      href="/teacher/materials"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Study Materials
                    </Link>
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/teacher/notices' ? 'active' : ''}`}
                      href="/teacher/notices"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Notices
                    </Link>
                  </div>
                </div>

                <div
                  className={`sidebar-collapse collapse ${activeDropdown === 'academics' ? 'show' : ''}`}
                  id="sidebar-academics"
                  style={{
                    display: activeDropdown === 'academics' ? 'block' : 'none',
                    visibility: 'visible',
                    opacity: 1,
                  }}
                >
                  <div className="sidebar-submenu" style={{ visibility: 'visible', opacity: 1 }}>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/teacher/marks' ? 'active' : ''
                      }`}
                      href="/teacher/marks"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Marks Entry
                    </Link>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/teacher/assignments' ? 'active' : ''
                      }`}
                      href="/teacher/assignments"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Assignments
                    </Link>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/teacher/materials' ? 'active' : ''
                      }`}
                      href="/teacher/materials"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Study Materials
                    </Link>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/teacher/notices' ? 'active' : ''
                      }`}
                      href="/teacher/notices"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Notices
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===================== STUDENT SIDEBAR ===================== */}
          {portalType === 'student' && (
            <>
              {/* Direct Dashboard Link */}
              <div className="sidebar-section">
                <Link
                  className={`sidebar-main-btn ${
                    pathname === '/student' ? 'active' : ''
                  }`}
                  href="/student"
                  onClick={handleClose}
                >
                  <span className="sidebar-main-icon">
                    <i className="fa-solid fa-house"></i>
                  </span>
                  <span className="sidebar-main-title">Dashboard</span>
                </Link>
                {/* Collapsed Tooltip */}
                <div className="sidebar-flyout sidebar-tooltip">
                  <span>Dashboard</span>
                </div>
              </div>

              {/* My Academics Dropdown */}
              <div className="sidebar-section">
                <button
                  className="sidebar-main-btn"
                  type="button"
                  onClick={() => toggleDropdown('my-academics')}
                  data-bs-toggle="collapse"
                  data-bs-target="#sidebar-my-academics"
                  aria-expanded={activeDropdown === 'my-academics' ? 'true' : 'false'}
                  aria-controls="sidebar-my-academics"
                >
                  <span className="sidebar-main-icon">
                    <i className="fa-solid fa-graduation-cap"></i>
                  </span>
                  <span className="sidebar-main-title">My Academics</span>
                  <i
                    className="fa-solid fa-chevron-down sidebar-main-arrow"
                    style={{
                      transform: activeDropdown === 'my-academics'
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  ></i>
                </button>

                {/* Collapsed Hover Flyout */}
                <div className="sidebar-flyout">
                  <div className="sidebar-flyout-title">
                    <i className="fa-solid fa-graduation-cap"></i>
                    <span>My Academics</span>
                  </div>
                  <div className="sidebar-flyout-links">
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/student/profile' ? 'active' : ''}`}
                      href="/student/profile"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Profile
                    </Link>
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/student/attendance' ? 'active' : ''}`}
                      href="/student/attendance"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Attendance
                    </Link>
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/student/routine' ? 'active' : ''}`}
                      href="/student/routine"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Routine
                    </Link>
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/student/assignments' ? 'active' : ''}`}
                      href="/student/assignments"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Assignments
                    </Link>
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/student/materials' ? 'active' : ''}`}
                      href="/student/materials"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Study Materials
                    </Link>
                  </div>
                </div>

                <div
                  className={`sidebar-collapse collapse ${
                    activeDropdown === 'my-academics' ? 'show' : ''
                  }`}
                  id="sidebar-my-academics"
                  style={{
                    display: activeDropdown === 'my-academics' ? 'block' : 'none',
                    visibility: 'visible',
                    opacity: 1,
                  }}
                >
                  <div className="sidebar-submenu" style={{ visibility: 'visible', opacity: 1 }}>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/student/profile' ? 'active' : ''
                      }`}
                      href="/student/profile"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Profile
                    </Link>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/student/attendance' ? 'active' : ''
                      }`}
                      href="/student/attendance"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Attendance
                    </Link>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/student/routine' ? 'active' : ''
                      }`}
                      href="/student/routine"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Routine
                    </Link>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/student/assignments' ? 'active' : ''
                      }`}
                      href="/student/assignments"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Assignments
                    </Link>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/student/materials' ? 'active' : ''
                      }`}
                      href="/student/materials"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Study Materials
                    </Link>
                  </div>
                </div>
              </div>

              {/* Records & Fees Dropdown */}
              <div className="sidebar-section">
                <button
                  className="sidebar-main-btn"
                  type="button"
                  onClick={() => toggleDropdown('records')}
                  data-bs-toggle="collapse"
                  data-bs-target="#sidebar-records"
                  aria-expanded={activeDropdown === 'records' ? 'true' : 'false'}
                  aria-controls="sidebar-records"
                >
                  <span className="sidebar-main-icon">
                    <i className="fa-solid fa-award"></i>
                  </span>
                  <span className="sidebar-main-title">Records & Fees</span>
                  <i
                    className="fa-solid fa-chevron-down sidebar-main-arrow"
                    style={{
                      transform: activeDropdown === 'records'
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  ></i>
                </button>

                {/* Collapsed Hover Flyout */}
                <div className="sidebar-flyout">
                  <div className="sidebar-flyout-title">
                    <i className="fa-solid fa-award"></i>
                    <span>Records & Fees</span>
                  </div>
                  <div className="sidebar-flyout-links">
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/student/results' ? 'active' : ''}`}
                      href="/student/results"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      My Results
                    </Link>
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/student/fees' ? 'active' : ''}`}
                      href="/student/fees"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Fee Payments
                    </Link>
                    <Link
                      className={`sidebar-flyout-link ${pathname === '/student/notices' ? 'active' : ''}`}
                      href="/student/notices"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Notices
                    </Link>
                  </div>
                </div>

                <div
                  className={`sidebar-collapse collapse ${activeDropdown === 'records' ? 'show' : ''}`}
                  id="sidebar-records"
                  style={{
                    display: activeDropdown === 'records' ? 'block' : 'none',
                    visibility: 'visible',
                    opacity: 1,
                  }}
                >
                  <div className="sidebar-submenu" style={{ visibility: 'visible', opacity: 1 }}>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/student/results' ? 'active' : ''
                      }`}
                      href="/student/results"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      My Results
                    </Link>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/student/fees' ? 'active' : ''
                      }`}
                      href="/student/fees"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Fee Payments
                    </Link>
                    <Link
                      className={`sidebar-submenu-link ${
                        pathname === '/student/notices' ? 'active' : ''
                      }`}
                      href="/student/notices"
                      onClick={handleClose}
                    >
                      <span className="sidebar-submenu-dot"></span>
                      Notices
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===================== SHARED BOTTOM ACTIONS ===================== */}
          {/* Sign Out */}
          <div className="sidebar-section">
            <button
              type="button"
              className="sidebar-main-btn"
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#dc2626',
              }}
            >
              <span className="sidebar-main-icon" style={{ color: '#dc2626' }}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </span>
              <span className="sidebar-main-title">Sign Out</span>
            </button>
            {/* Collapsed Tooltip */}
            <div className="sidebar-flyout sidebar-tooltip">
              <span>Sign Out</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer for desktop layout so fixed sidebar does not overlap content */}
      <div
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          isDesktopOpen ? 'w-[280px]' : 'w-[80px]'
        }`}
        aria-hidden="true"
      />
    </>
  );
}
