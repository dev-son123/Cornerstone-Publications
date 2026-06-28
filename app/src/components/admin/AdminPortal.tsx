// src/components/admin/AdminPortal.tsx
// Drop this in as your /portal-cRs7x9mK route component

import AdminDashboard from "./AdminDashboard";
import { IntroSplash } from '@/components/IntroSplash';

export function AdminPortal() {
  return (
    <>
      <IntroSplash />
      <AdminDashboard />
    </>
  );
}
