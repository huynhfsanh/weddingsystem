import { Navigate, Outlet } from "react-router-dom";
import { homeForRole, useAuth } from "@/features/auth/AuthContext";
import type { Role } from "@/types";

export const ProtectedRoute = ({ roles }: { roles?: Role[] }) => {
  const { user, isInitializing } = useAuth();
  if (isInitializing) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Đang xác minh phiên đăng nhập...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role.code)) return <Navigate to={homeForRole(user.role.code)} replace />;
  return <Outlet />;
};
