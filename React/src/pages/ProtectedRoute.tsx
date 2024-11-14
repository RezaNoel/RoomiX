import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { token, role, loading, setRedirectPath } = useAuth();



  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    setRedirectPath(window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  const isRoleAllowed = allowedRoles.some(
    (allowedRole) => allowedRole.trim().toLowerCase() === (role || "").trim().toLowerCase()
  );


  if (!isRoleAllowed) {
    return <Navigate to="/reservation" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
