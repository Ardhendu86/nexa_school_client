'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Users, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/classes`, { timeout: 4000 });
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setClasses(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load classes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assigned Classes</h1>
        <p className="text-xs text-slate-500">View roster details and student lists for your assigned classes.</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
          <p className="text-xs">Loading classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Classes Available</h3>
          <p className="text-xs text-slate-400 mt-1">Class rosters will appear here once configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((c) => (
            <div key={c.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{c.class_name}</h3>
              <p className="text-xs text-slate-500">Shift: {c.shift_name || 'Standard'}</p>
              <p className="text-xs text-slate-500">Code: <span className="font-mono">{c.class_code || '-'}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
