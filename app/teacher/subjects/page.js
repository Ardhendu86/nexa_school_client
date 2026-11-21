'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Layers, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TeacherSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/subjects`, { timeout: 4000 });
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setSubjects(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubjects();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assigned Subjects & Curriculum</h1>
        <p className="text-xs text-slate-500">Subject syllabi, course modules, and lesson plans.</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
          <p className="text-xs">Loading curriculum subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
          <Layers className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Subjects Configured</h3>
          <p className="text-xs text-slate-400 mt-1">Subjects will appear here once registered in the curriculum.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((sub) => (
            <div key={sub.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600">
                {sub.class_name || 'Class Subject'}
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{sub.subject_name}</h3>
              <p className="text-xs text-slate-500">Status: {sub.status ? 'Active' : 'Inactive'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
