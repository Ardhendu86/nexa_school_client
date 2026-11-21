'use client';

import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';

export default function StudentFeesPage() {
  const [fees] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fee Statements & Payment History</h1>
        <p className="text-xs text-slate-500">View paid receipts and upcoming fee statements.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {fees.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <DollarSign className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Fee Invoices Found</h3>
            <p className="text-xs text-slate-400 mt-1">Fee statements and payment receipts will appear here once issued.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Fee Statement</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {fees.map((f, i) => (
                <tr key={i}>
                  <td className="p-4">{f.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
