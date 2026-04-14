import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};
