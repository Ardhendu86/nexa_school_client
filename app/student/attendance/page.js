'use client';

import React, { useState } from 'react';
import { CalendarCheck, AlertCircle } from 'lucide-react';

export default function StudentAttendancePage() {
  const [history] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Attendance Record</h1>
        <p className="text-xs text-slate-500">Monthly attendance summary and breakdown.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {history.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CalendarCheck className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Attendance Records Found</h3>
            <p className="text-xs text-slate-400 mt-1">Your attendance records will appear here once marked by faculty.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-mono font-medium text-slate-600 dark:text-slate-400">{h.date}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">{h.status}</span>
                  </td>
                  <td className="p-4 text-slate-500">{h.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
