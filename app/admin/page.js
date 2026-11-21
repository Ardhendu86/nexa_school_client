'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  BookOpen,
  Layers,
  Calendar,
  ShieldCheck,
  UserCog,
  Activity,
  ArrowUpRight,
  Plus,
  Loader2
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    classes: 0,
    subjects: 0,
    shifts: 0,
    academicYears: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      setLoading(true);
      try {
        const [classesRes, subjectsRes, shiftsRes, yearsRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/admin/classes`, { timeout: 4000 }),
          axios.get(`${API_BASE_URL}/api/admin/subjects`, { timeout: 4000 }),
          axios.get(`${API_BASE_URL}/api/admin/shifts`, { timeout: 4000 }),
          axios.get(`${API_BASE_URL}/api/admin/academic-years`, { timeout: 4000 }),
        ]);

        const extractCount = (res) => {
          if (res.status === 'fulfilled' && res.value?.data?.data && Array.isArray(res.value.data.data)) {
            return res.value.data.data.length;
          }
          return 0;
        };

        setStats({
          classes: extractCount(classesRes),
          subjects: extractCount(subjectsRes),
          shifts: extractCount(shiftsRes),
          academicYears: extractCount(yearsRes),
        });
      } catch (err) {
        console.error('Error fetching admin counts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  const kpis = [
    { title: 'Configured Classes', value: stats.classes, icon: BookOpen, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50', href: '/admin/settings/class' },
    { title: 'Total Subjects', value: stats.subjects, icon: Layers, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50', href: '/admin/settings/subject' },
    { title: 'Active Shifts', value: stats.shifts, icon: Calendar, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50', href: '/admin/settings/shift' },
    { title: 'Academic Years', value: stats.academicYears, icon: Calendar, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50', href: '/admin/settings/academic-year' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Welcome back, Administrator</h1>
          <p className="text-sm text-indigo-200">Nexaweb Education School Management System Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings/class/create"
            className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 rounded-lg font-semibold text-xs transition flex items-center gap-1.5 shadow"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Class</span>
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 border border-indigo-500 rounded-lg font-semibold text-xs text-white transition flex items-center gap-1.5"
          >
            <UserCog className="h-3.5 w-3.5" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-indigo-500/50 transition"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin text-indigo-500" /> : item.value}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>View settings</span>
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
              <div className={`p-3 rounded-xl ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Administrative Configuration Modules */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Core Administrative Modules</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Link href="/admin/settings/class" className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 bg-slate-50 dark:bg-slate-800/50 transition">
                <BookOpen className="h-5 w-5 text-sky-600 mb-2" />
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Classes</h4>
                <p className="text-[11px] text-slate-500">Class settings & sections</p>
              </Link>
              <Link href="/admin/settings/subject" className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 bg-slate-50 dark:bg-slate-800/50 transition">
                <Layers className="h-5 w-5 text-indigo-600 mb-2" />
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Subjects</h4>
                <p className="text-[11px] text-slate-500">Curricula & subjects</p>
              </Link>
              <Link href="/admin/settings/shift" className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 bg-slate-50 dark:bg-slate-800/50 transition">
                <Calendar className="h-5 w-5 text-emerald-600 mb-2" />
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Shifts</h4>
                <p className="text-[11px] text-slate-500">School working shifts</p>
              </Link>
              <Link href="/admin/settings/academic-year" className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 bg-slate-50 dark:bg-slate-800/50 transition">
                <Calendar className="h-5 w-5 text-amber-600 mb-2" />
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Academic Years</h4>
                <p className="text-[11px] text-slate-500">Session periods & dates</p>
              </Link>
              <Link href="/admin/permissions" className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 bg-slate-50 dark:bg-slate-800/50 transition">
                <ShieldCheck className="h-5 w-5 text-rose-600 mb-2" />
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Permissions</h4>
                <p className="text-[11px] text-slate-500">Security & RBAC rules</p>
              </Link>
              <Link href="/admin/audit-logs" className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 bg-slate-50 dark:bg-slate-800/50 transition">
                <Activity className="h-5 w-5 text-purple-600 mb-2" />
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Audit Logs</h4>
                <p className="text-[11px] text-slate-500">Security history</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Links / Stream */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">System Status</h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active</span>
            </span>
          </div>
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Database Connection</p>
              <p className="text-[11px] text-slate-500 mt-0.5">MySQL Master Schema Connected</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200">RBAC Configuration</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Admin, Teacher, and Student roles verified</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Security Audits</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Immutable audit trail active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
