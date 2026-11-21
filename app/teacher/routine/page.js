'use client';

import React, { useState } from 'react';
import { Clock } from 'lucide-react';

export default function TeacherRoutinePage() {
  const [routine] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Weekly Teaching Timetable</h1>
        <p className="text-xs text-slate-500">Scheduled lectures and lab sessions across assigned grades.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {routine.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Clock className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Teaching Timetable Configured</h3>
            <p className="text-xs text-slate-400 mt-1">Your lecture schedule will appear here once allocated by the administration.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Day</th>
                <th className="p-4">Time Slot</th>
                <th className="p-4">Class</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {routine.map((r, i) => (
                <tr key={i}>
                  <td className="p-4">{r.day}</td>
                  <td className="p-4">{r.time}</td>
                  <td className="p-4">{r.class}</td>
                  <td className="p-4">{r.subject}</td>
                  <td className="p-4">{r.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
