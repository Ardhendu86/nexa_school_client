'use client';

import React, { useState } from 'react';
import { Users } from 'lucide-react';

export default function TeacherStudentsPage() {
  const [students] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Directory</h1>
        <p className="text-xs text-slate-500">View individual student progress, attendance averages, and academic performance.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {students.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Students Found</h3>
            <p className="text-xs text-slate-400 mt-1">Students enrolled in your classes will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Roll</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {students.map((s, i) => (
                <tr key={i}>
                  <td className="p-4">{s.roll}</td>
                  <td className="p-4">{s.name}</td>
                  <td className="p-4">{s.class}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
