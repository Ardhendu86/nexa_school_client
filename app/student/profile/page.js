'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { User, Mail, Phone, MapPin, Calendar, ShieldCheck } from 'lucide-react';

export default function StudentProfilePage() {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile & Information</h1>
        <p className="text-xs text-slate-500">Official student record and account details.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-2xl flex items-center justify-center border-2 border-indigo-500 shadow">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || 'Student Account'}</h2>
            <p className="text-xs text-slate-500">Account Role: <span className="font-mono text-indigo-600 font-bold">{user?.role || 'STUDENT'}</span></p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">Active Student</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-500">Email Address</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{user?.email || '-'}</p>
          </div>
          <div>
            <p className="text-slate-500">Contact Phone</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{user?.phone || '-'}</p>
          </div>
          <div>
            <p className="text-slate-500">City / Location</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{user?.city || '-'}</p>
          </div>
          <div>
            <p className="text-slate-500">Franchise / Branch</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{user?.franchise_id || 'Main Campus'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
