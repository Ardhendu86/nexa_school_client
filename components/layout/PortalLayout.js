'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { selectSidebarOpen } from '@/store/slices/sidebarSlice';

export default function PortalLayout({ portalType = 'admin', children }) {
  const isDesktopOpen = useSelector(selectSidebarOpen);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 pt-[76px] w-full overflow-x-hidden">
      <Header />
      <Sidebar portalType={portalType} />
      <div
        className={`flex-1 w-full min-w-0 transition-all duration-300 min-h-[calc(100vh-76px)] flex flex-col ${
          isDesktopOpen ? 'lg:pl-[280px]' : 'lg:pl-[80px]'
        }`}
      >
        <main className="w-full min-w-0 p-4 md:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
