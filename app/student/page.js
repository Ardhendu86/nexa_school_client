'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Award, CalendarCheck, FileText, DollarSign, BookOpen, Clock, AlertCircle } from 'lucide-react';

export default function StudentDashboard() {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Student'}</h1>
          <p className="text-xs text-sky-200 mt-1">
            {user?.email || 'Student Portal'} {user?.city ? `• ${user.city}` : ''}
          </p>
        </div>
        <div className="sm:text-right">
          <span className="text-[10px] uppercase tracking-wider text-sky-300 font-semibold block">Academic Status</span>
          <span className="text-sm font-bold text-white px-3 py-1 bg-white/10 rounded-full inline-block mt-0.5">Enrolled</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link href="/student/attendance" className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center hover:border-sky-500/50 transition">
          <div>
            <p className="text-xs text-slate-500 font-medium">Attendance</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">My Records</p>
            <span className="text-[11px] text-sky-600 font-semibold">View breakdown</span>
          </div>
          <CalendarCheck className="h-8 w-8 text-sky-500 bg-sky-50 dark:bg-sky-950/50 p-1.5 rounded-xl" />
        </Link>

        <Link href="/student/results" className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center hover:border-indigo-500/50 transition">
          <div>
            <p className="text-xs text-slate-500 font-medium">Performance</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">Grade Cards</p>
            <span className="text-[11px] text-indigo-600 font-semibold">View results</span>
          </div>
          <Award className="h-8 w-8 text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 p-1.5 rounded-xl" />
        </Link>

        <Link href="/student/assignments" className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center hover:border-amber-500/50 transition">
          <div>
            <p className="text-xs text-slate-500 font-medium">Assignments</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">Course Tasks</p>
            <span className="text-[11px] text-amber-600 font-semibold">Submissions</span>
          </div>
          <FileText className="h-8 w-8 text-amber-500 bg-amber-50 dark:bg-amber-950/50 p-1.5 rounded-xl" />
        </Link>

        <Link href="/student/fees" className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center hover:border-emerald-500/50 transition">
          <div>
            <p className="text-xs text-slate-500 font-medium">Fee Statements</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">Receipts</p>
            <span className="text-[11px] text-emerald-600 font-semibold">Check dues</span>
          </div>
          <DollarSign className="h-8 w-8 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 p-1.5 rounded-xl" />
        </Link>
      </div>

      {/* Quick Links Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-sky-500" />
            <span>Today's Class Schedule</span>
          </h3>
          <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
            <Clock className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No scheduled classes today</p>
            <p className="text-[11px] text-slate-400 mt-1">Your class routine will display lecture slots here once published.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-500" />
            <span>Recent Exam Marks</span>
          </h3>
          <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
            <Award className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No exam marks published</p>
            <p className="text-[11px] text-slate-400 mt-1">Results and term grades will appear here once released by the faculty.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
