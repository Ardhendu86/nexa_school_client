'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '@/store/slices/authSlice';
import { toggleSidebar, toggleMobileSidebar, selectSidebarOpen } from '@/store/slices/sidebarSlice';
import { toggleTheme, selectCurrentTheme } from '@/store/slices/themeSlice';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);
  const themeMode = useSelector(selectCurrentTheme);
  const isDesktopOpen = useSelector(selectSidebarOpen);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
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

  // Determine portal branding
  const getBrandDetails = () => {
    if (pathname.startsWith('/teacher')) {
      return {
        mark: 'TP',
        text: 'Teacher Portal',
        dashboardHref: '/teacher',
        profileHref: '/teacher/classes',
        settingsHref: '/teacher',
      };
    }
    if (pathname.startsWith('/student')) {
      return {
        mark: 'SP',
        text: 'Student Portal',
        dashboardHref: '/student',
        profileHref: '/student/profile',
        settingsHref: '/student/profile',
      };
    }
    return {
      mark: 'AB',
      text: 'Admin Panel',
      dashboardHref: '/admin',
      profileHref: '/admin',
      settingsHref: null,
    };
  };

  const brand = getBrandDetails();

  // User initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : brand.mark;

  return (
    <nav
      className={`navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row admin-header ${
        !isDesktopOpen ? 'sidebar-collapsed' : ''
      }`}
    >
      {/* Brand Header */}
      <div className="admin-header-brand">
        <Link
          className="navbar-brand admin-brand m-0"
          href={brand.dashboardHref}
          aria-label="Admin dashboard home"
        >
          <span className="admin-brand-mark">{brand.mark}</span>
          <span className="admin-brand-text d-none d-sm-inline">{brand.text}</span>
        </Link>
      </div>

      {/* Desktop Toggle (Center) */}
      <div className="admin-header-center d-none d-lg-flex">
        <button
          className="header-icon-button"
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle sidebar"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>

      {/* Header Actions (Right) */}
      <div className="admin-header-actions">
        {/* Mobile Toggle */}
        <button
          className="header-icon-button d-lg-none"
          type="button"
          onClick={() => dispatch(toggleMobileSidebar())}
          aria-label="Toggle sidebar"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        {/* Theme Mode Toggle Icon Button */}
        <button
          className="header-icon-button"
          type="button"
          onClick={() => dispatch(toggleTheme())}
          aria-label="Toggle dark/light mode"
          title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <i
            className={`fa-solid ${themeMode === 'dark' ? 'fa-sun' : 'fa-moon'}`}
          ></i>
        </button>

        {/* Profile Dropdown */}
        <div
          className="nav-item nav-profile dropdown relative"
          ref={profileDropdownRef}
        >
          <button
            type="button"
            className="nav-link dropdown-toggle d-flex align-items-center gap-2 px-2 py-1 bg-transparent border-0 cursor-pointer"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen ? 'true' : 'false'}
            aria-label="Profile menu"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile avatar"
                className="profile-pic object-cover border border-blue-500/30"
              />
            ) : (
              <span className="profile-pic profile-initials">{initials}</span>
            )}
          </button>

          {profileOpen && (
            <div
              className="dropdown-menu dropdown-menu-end navbar-dropdown show"
              style={{ display: 'block' }}
            >
              <div className="dropdown-item-text pb-2 mb-2 border-bottom">
                <div className="fw-semibold">
                  {user?.name || (pathname.startsWith('/student') ? 'Student Profile' : pathname.startsWith('/teacher') ? 'Teacher Profile' : 'Admin Profile')}
                </div>
                <div className="small text-muted">
                  {user?.email || 'Manage account and preferences'}
                </div>
              </div>

              <Link
                className="dropdown-item"
                href={brand.profileHref}
                onClick={() => setProfileOpen(false)}
              >
                <i className="fa-solid fa-user text-primary me-2"></i>
                Profile
              </Link>

              {brand.settingsHref && (
                <Link
                  className="dropdown-item"
                  href={brand.settingsHref}
                  onClick={() => setProfileOpen(false)}
                >
                  <i className="fa-solid fa-gear text-primary me-2"></i>
                  Settings
                </Link>
              )}

              <button
                type="button"
                className="dropdown-item w-full text-left bg-transparent border-0 cursor-pointer"
                onClick={(event) => {
                  event.preventDefault();
                  handleLogout();
                }}
              >
                <i className="fa-solid fa-right-from-bracket text-primary me-2"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
