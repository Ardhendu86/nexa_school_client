'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, FileText, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TeacherAssignmentsPage() {
  const [assignmentTypes, setAssignmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignmentTypes() {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/assignment-types`, { timeout: 4000 });
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setAssignmentTypes(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load assignment types:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignmentTypes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments & Homework</h1>
          <p className="text-xs text-slate-500">Active curriculum assignment categories and homework guidelines.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
          <p className="text-xs">Loading assignment types from database...</p>
        </div>
      ) : assignmentTypes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Assignments Configured</h3>
          <p className="text-xs text-slate-400 mt-1">Assignment types configured by the administration will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignmentTypes.map((a) => (
            <div key={a.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${a.status ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {a.status ? 'ACTIVE TYPE' : 'INACTIVE'}
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{a.type_name}</h3>
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>System Assignment Category #{a.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
