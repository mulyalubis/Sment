import { Navigate, Route, Routes } from "react-router-dom";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import FullScreenSpinner from "./components/FullScreenSpinner";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportsPage"
import Pengguna from "./pages/Users";

// Penjaga akses: belum login -> halaman login, bukan admin -> ditolak, admin -> dashboard.
// Pengecekan role sebenarnya tetap dilakukan di server (convex/reports.ts: requireAdmin).
export default function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me, isAuthenticated ? {} : "skip");

  if (isLoading || (isAuthenticated && me === undefined)) return <FullScreenSpinner />;
  if (!isAuthenticated) return <LoginPage />;
  if (me === null || me === undefined) return <AccessDeniedPage reason="not-found" />;
  if (me.role !== "admin") return <AccessDeniedPage name={me.name} reason="not-admin" />;

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/laporan" element={<ReportsPage />} />
      <Route path="/pengguna" element={<Pengguna />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}