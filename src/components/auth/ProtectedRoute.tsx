import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "@/store/store";

export default function ProtectedRoute() {
  const user = useSelector(
    (state: RootState) => state.auth.user
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}