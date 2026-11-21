'use client';

import React, { useState } from 'react';
import { FileText } from 'lucide-react';

export default function StudentMaterialsPage() {
  const [materials] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Study Materials & Handouts</h1>
        <p className="text-xs text-slate-500">Download course materials and lecture slides shared by your teachers.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {materials.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Study Materials Uploaded</h3>
            <p className="text-xs text-slate-400 mt-1">Course handouts and notes will be available here once shared by teachers.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Resource Name</th>
                <th className="p-4">Subject</th>
                <th className="p-4">File Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {materials.map((m, i) => (
                <tr key={i}>
                  <td className="p-4">{m.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
