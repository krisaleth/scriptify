import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, openAuthModal } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      // Khi guest cố tình vào path này, mình tự động mở modal cho họ
      openAuthModal();
    }
  }, [user, openAuthModal]);

  if (!user) {

    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};