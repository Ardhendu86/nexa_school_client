'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 p-4 text-center">
      <h1 className="text-5xl font-extrabold text-indigo-600">404</h1>
      <h2 className="text-xl font-bold mt-2 text-slate-800">Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-1 mb-6">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md no-underline">
        Return Home
      </Link>
    </div>
  );
}
