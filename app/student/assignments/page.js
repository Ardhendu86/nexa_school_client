'use client';

import React, { useState } from 'react';
import { FileText, Upload } from 'lucide-react';

export default function StudentAssignmentsPage() {
  const [assignments] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Assignments</h1>
        <p className="text-xs text-slate-500">View upcoming homework tasks and upload your completed files.</p>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Assignments Found</h3>
          <p className="text-xs text-slate-400 mt-1">You currently have no pending or submitted assignments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{a.title}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
