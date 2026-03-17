// src/components/admin/AdminPortal.tsx
// Drop this in as your /portal-cRs7x9mK route component

import { useAdminAuth } from "../../hooks/useAdminAuth";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

export function AdminPortal() {
  const { step, logout } = useAdminAuth();

  if (step === "dashboard") {
    return <AdminDashboard onLogout={logout} />;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top left, #ffe0f0 0%, #f8f9fa 60%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <AdminLogin onAuthenticated={() => {}} />
    </div>
  );
}
