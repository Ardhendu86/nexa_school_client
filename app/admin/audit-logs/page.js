'use client';

import React, { useState } from 'react';
import { History, ShieldAlert } from 'lucide-react';
import usePermission from '@/hooks/usePermission';

export default function AdminAuditLogsPage() {
  const { hasPermission, isSuperAdmin } = usePermission();
  const canView = isSuperAdmin || hasPermission('audit_logs_view');
  const [logs] = useState([]);

  if (!canView) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/50">
        <ShieldAlert className="h-12 w-12 mx-auto text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1">
          You do not have permission to view System Audit Logs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security & Audit Logs</h1>
        <p className="text-xs text-slate-500">Immutable trail of critical system modifications, logins, and administrative actions.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {logs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <History className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Audit Logs Recorded</h3>
            <p className="text-xs text-slate-400 mt-1">Administrative security actions and login events will be logged here.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Log ID</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-mono font-bold text-indigo-600">{l.id}</td>
                  <td className="p-4 font-mono text-slate-500">{l.timestamp}</td>
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">{l.user}</td>
                  <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">{l.action}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
