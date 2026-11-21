'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { BookOpen, Users, CalendarCheck, Award, FileText, Clock, AlertCircle } from 'lucide-react';

export default function TeacherDashboard() {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Faculty Member'}</h1>
          <p className="text-xs text-teal-200 mt-1">
            {user?.department || user?.designation || 'Faculty Member'} {user?.email ? `• ${user.email}` : ''}
          </p>
        </div>
        <Link href="/teacher/attendance" className="px-4 py-2 bg-white text-emerald-900 font-bold rounded-lg text-xs shadow hover:bg-emerald-50">
          Mark Attendance
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Today's Lectures</h3>
            <Clock className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-center py-6 text-slate-400">
            <Clock className="h-7 w-7 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No lectures scheduled today</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Your daily timetable slots will appear here.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Quick Actions</h3>
            <Award className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="space-y-2">
            <Link href="/teacher/marks" className="block p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-emerald-500 transition text-xs">
              <p className="font-semibold text-slate-900 dark:text-white">Enter Exam Marks</p>
              <p className="text-slate-500 text-[11px]">Submit student test scores</p>
            </Link>
            <Link href="/teacher/assignments" className="block p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-emerald-500 transition text-xs">
              <p className="font-semibold text-slate-900 dark:text-white">Post New Assignment</p>
              <p className="text-slate-500 text-[11px]">Publish homework or project guidelines</p>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">My Classes</h3>
            <Users className="h-5 w-5 text-sky-600" />
          </div>
          <div className="text-center py-6 text-slate-400">
            <Users className="h-7 w-7 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No classes assigned</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Assigned rosters will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
