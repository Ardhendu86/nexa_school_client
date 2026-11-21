'use client';

import React, { useState } from 'react';
import { Plus, FileText } from 'lucide-react';

export default function TeacherMaterialsPage() {
  const [materials] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Study Materials & Notes</h1>
          <p className="text-xs text-slate-500">Upload lecture PDFs, syllabus documents, and reference sheets.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {materials.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Study Materials Uploaded</h3>
            <p className="text-xs text-slate-400 mt-1">Uploaded notes and syllabus files will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Document Title</th>
                <th className="p-4">Target Class</th>
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
