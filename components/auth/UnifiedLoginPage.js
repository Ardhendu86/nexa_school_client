'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setUser } from '@/store/slices/authSlice';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  ArrowRight,
  School,
  KeyRound
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function LoginFormContent({ initialRole = 'ADMIN' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  // Active Role State (ADMIN by default, switchable to TEACHER or STUDENT)
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync role from query param if provided (e.g. ?role=teacher or ?role=student)
  useEffect(() => {
    const queryRole = searchParams?.get('role')?.toUpperCase();
    if (queryRole === 'TEACHER' || queryRole === 'STUDENT' || queryRole === 'ADMIN') {
      setRole(queryRole);
    }
  }, [searchParams]);

  // Normalize URL to root (/) and strip any redundant query strings on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      let changed = false;

      // Strip redundant 'from=/admin' or 'from=/'
      if (url.searchParams.get('from') === '/admin' || url.searchParams.get('from') === '/') {
        url.searchParams.delete('from');
        changed = true;
      }

      // If user landed on dedicated login path aliases, normalize to root /
      if (
        url.pathname === '/admin/login' ||
        url.pathname === '/login' ||
        url.pathname === '/teacher/login' ||
        url.pathname === '/student/login'
      ) {
        url.pathname = '/';
        changed = true;
      }

      if (changed) {
        window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
      }
    }
  }, []);

  // Handle Role Switch
  const handleRoleChange = (newRole) => {
    if (newRole !== role) {
      setRole(newRole);
      setErrorMessage('');
      setPassword('');

      // Keep browser address bar pristine at http://localhost:3000 without redirect loops
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('from') && url.searchParams.get('from') === '/admin') {
          url.searchParams.delete('from');
        }
        if (url.pathname !== '/') {
          url.pathname = '/';
        }
        window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
      }
    }
  };

  // Role Metadata Config
  const roleConfig = {
    ADMIN: {
      title: 'Administrator',
      badge: 'GOVERNANCE PORTAL',
      description: 'Sign in to access administrative operations, user permissions, and institutional records.',
      emailLabel: 'Administrator Email Address',
      emailPlaceholder: 'admin@school.com',
      buttonText: 'Log In as Administrator',
      themeGradient: 'from-cyan-600 to-indigo-600',
      themeHoverGradient: 'hover:from-cyan-500 hover:to-indigo-500',
      shadowColor: 'shadow-cyan-600/25',
      activeBorder: 'border-cyan-500',
      activeRing: 'ring-2 ring-cyan-500/20',
      activeBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300',
      icon: ShieldCheck,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      redirectDefault: '/admin'
    },
    TEACHER: {
      title: 'Teacher & Faculty',
      badge: 'FACULTY & CLASSROOM PORTAL',
      description: 'Sign in with your faculty credentials to manage daily attendance, grade entries, and routines.',
      emailLabel: 'Faculty Email Address',
      emailPlaceholder: 'teacher@school.com',
      buttonText: 'Log In to Faculty Portal',
      themeGradient: 'from-emerald-600 to-teal-600',
      themeHoverGradient: 'hover:from-emerald-500 hover:to-teal-500',
      shadowColor: 'shadow-emerald-600/25',
      activeBorder: 'border-emerald-500',
      activeRing: 'ring-2 ring-emerald-500/20',
      activeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      icon: GraduationCap,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      redirectDefault: '/teacher'
    },
    STUDENT: {
      title: 'Student & Guardian',
      badge: 'STUDENT & PARENT PORTAL',
      description: 'Sign in to access academic mark sheets, attendance percentages, fees, and lecture notices.',
      emailLabel: 'Student Email / Login ID',
      emailPlaceholder: 'student@school.com',
      buttonText: 'Log In to Student Portal',
      themeGradient: 'from-amber-500 to-orange-600',
      themeHoverGradient: 'hover:from-amber-400 hover:to-orange-500',
      shadowColor: 'shadow-amber-500/25',
      activeBorder: 'border-amber-500',
      activeRing: 'ring-2 ring-amber-500/20',
      activeBg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      icon: Users,
      iconColor: 'text-amber-600 dark:text-amber-400',
      redirectDefault: '/student'
    }
  };

  const currentConfig = roleConfig[role];

  // Submit dynamic authentication
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage(`Please enter both your ${currentConfig.emailLabel.toLowerCase()} and password.`);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        {
          role,
          email: email.trim(),
          password
        },
        { timeout: 8000 }
      );

      if (response.data && response.data.success) {
        const { token, user } = response.data;
        const actualRole = (user?.role || role).toUpperCase();

        if (typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem('authToken', token);
            document.cookie = `authToken=${token}; path=/; max-age=86400; SameSite=Lax`;
            if (actualRole === 'ADMIN') {
              localStorage.setItem('adminToken', token);
            }
          }
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            if (user.permissions) {
              localStorage.setItem('userPermissions', JSON.stringify(user.permissions));
            }
            localStorage.setItem('userRole', actualRole);
            document.cookie = `userRole=${actualRole}; path=/; max-age=86400; SameSite=Lax`;
          }
        }

        if (user) {
          dispatch(setUser(user));
        }

        const fromParam = searchParams?.get('from');
        const redirectTo =
          fromParam && fromParam !== '/admin' && fromParam !== '/'
            ? fromParam
            : roleConfig[actualRole]?.redirectDefault || '/admin';
        router.push(redirectTo);
      } else {
        setErrorMessage(response.data?.message || 'Authentication failed. Please verify your credentials.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials. Please verify your email and password.';
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* ============================================================== */}
      {/* Left Column: Original High-Resolution Banner Image Showcase    */}
      {/* (50% width on lg screens, hidden on mobile)                    */}
      {/* ============================================================== */}
      <div className="hidden lg:block lg:w-1/2 relative h-screen overflow-hidden bg-slate-900 border-r border-slate-200/80 dark:border-slate-800">
        {/* Original Banner Image */}
        <img
          src="/assets/images/slider-1.png"
          alt="School Management Banner"
          className="w-full h-full object-cover object-center scale-102 transform hover:scale-105 transition-transform duration-1000"
        />

        {/* Modern Layered Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-900/60 z-[1]" />

        {/* Top Left Logo & Institutional Brand */}
        <div className="absolute top-8 left-8 z-10">
          <div className="inline-flex items-center gap-3 text-white group">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight block text-white leading-tight">
                Nexaweb Education
              </span>
              <span className="text-xs text-slate-300 font-medium">School Management System</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Right Column: Multi-Role Login Form Container                  */}
      {/* (50% on lg, 100% on mobile)                                    */}
      {/* ============================================================== */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-10 lg:p-14 overflow-y-auto">
        <div className="max-w-[480px] w-full mx-auto my-auto py-4">

          {/* Heading */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Sign In to Your Portal</span>
              <span className="inline-block animate-bounce text-xl">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select your designated role below to display your authorized login form.
            </p>
          </div>

          {/* ========================================================== */}
          {/* 3 Role Selection Buttons Directly Below the Heading        */}
          {/* ========================================================== */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              
              {/* Role 1: Admin */}
              <button
                type="button"
                onClick={() => handleRoleChange('ADMIN')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer border ${
                  role === 'ADMIN'
                    ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border-cyan-400/80 shadow-md shadow-cyan-500/10 scale-[1.02]'
                    : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${role === 'ADMIN' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                <span>Admin</span>
              </button>

              {/* Role 2: Teacher */}
              <button
                type="button"
                onClick={() => handleRoleChange('TEACHER')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer border ${
                  role === 'TEACHER'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-emerald-400/80 shadow-md shadow-emerald-500/10 scale-[1.02]'
                    : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${role === 'TEACHER' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>Teacher</span>
              </button>

              {/* Role 3: Student */}
              <button
                type="button"
                onClick={() => handleRoleChange('STUDENT')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer border ${
                  role === 'STUDENT'
                    ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 border-amber-400/80 shadow-md shadow-amber-500/10 scale-[1.02]'
                    : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Users className={`w-4 h-4 ${role === 'STUDENT' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                <span>Student</span>
              </button>

            </div>
          </div>

          {/* Error Alert Notification */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Authentication Notice</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email / Identifier Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {currentConfig.emailLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type={role === 'STUDENT' ? 'text' : 'email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentConfig.emailPlaceholder}
                  required
                  autoFocus
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Secure Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 no-underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Keep me signed in on this device
                </span>
              </label>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${currentConfig.themeGradient} ${currentConfig.themeHoverGradient} shadow-lg ${currentConfig.shadowColor} hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying {currentConfig.title} Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{currentConfig.buttonText}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

export default function UnifiedLoginPage({ initialRole = 'ADMIN' }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      }
    >
      <LoginFormContent initialRole={initialRole} />
    </Suspense>
  );
}
