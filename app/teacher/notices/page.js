'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export default function TeacherNoticesPage() {
  const [notices] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Faculty Circulars & Notices</h1>
        <p className="text-xs text-slate-500">Official updates from the school administration.</p>
      </div>

      {notices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
          <Bell className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Faculty Circulars Published</h3>
          <p className="text-xs text-slate-400 mt-1">Institutional memos and faculty meeting notices will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((n, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{n.title}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
