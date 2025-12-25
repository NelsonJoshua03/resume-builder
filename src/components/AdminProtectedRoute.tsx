// src/components/AdminProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '../utils/adminAuth';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const checkAdminStatus = () => {
    return isAdmin();
  };

  if (!checkAdminStatus()) {
    // Redirect to admin login with return URL
    const currentPath = window.location.pathname + window.location.search;
    return <Navigate to={`/admin/login?returnUrl=${encodeURIComponent(currentPath)}`} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;