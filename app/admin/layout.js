'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import PortalLayout from '@/components/layout/PortalLayout';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // Do not wrap the standalone Admin Login page with PortalLayout/Sidebar
  if (pathname?.startsWith('/admin/login')) {
    return <>{children}</>;
  }

  return (
    <PortalLayout portalType="admin">
      {children}
    </PortalLayout>
  );
}
