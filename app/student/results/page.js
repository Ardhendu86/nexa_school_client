'use client';

import React, { useState } from 'react';
import { Award } from 'lucide-react';

export default function StudentResultsPage() {
  const [grades] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Performance & Transcripts</h1>
          <p className="text-xs text-slate-500">Official term marksheets and cumulative GPA breakdown.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {grades.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Award className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Exam Results Published</h3>
            <p className="text-xs text-slate-400 mt-1">Official report cards and grade sheets will appear here once published.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Subject</th>
                <th className="p-4">Exam Title</th>
                <th className="p-4">Marks Obtained</th>
                <th className="p-4">Letter Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {grades.map((g, i) => (
                <tr key={i}>
                  <td className="p-4">{g.subject}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
