'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import PortalLayout from '@/components/layout/PortalLayout';

export default function StudentLayout({ children }) {
  const pathname = usePathname();

  // Do not wrap the standalone Student Login page with PortalLayout/Sidebar
  if (pathname?.startsWith('/student/login')) {
    return <>{children}</>;
  }

  return (
    <PortalLayout portalType="student">
      {children}
    </PortalLayout>
  );
}
