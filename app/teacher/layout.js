'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import PortalLayout from '@/components/layout/PortalLayout';

export default function TeacherLayout({ children }) {
  const pathname = usePathname();

  // Do not wrap the standalone Teacher Login page with PortalLayout/Sidebar
  if (pathname?.startsWith('/teacher/login')) {
    return <>{children}</>;
  }

  return (
    <PortalLayout portalType="teacher">
      {children}
    </PortalLayout>
  );
}
