// src/components/AdminProtectedRoute.tsx - UPDATED
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { adminAuthService } from '../services/adminAuthService';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
    
    // Set up interval to check token validity every 5 minutes
    const interval = setInterval(checkAdminStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAdminStatus = async () => {
    try {
      const status = await adminAuthService.checkAdminStatus();
      setIsAdmin(status.isAdmin);
      
      if (!status.isAdmin && status.valid === false) {
        setError('Session expired. Please login again.');
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Admin check error:', error);
      setIsAdmin(false);
      setError('Error checking admin status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="loading-spinner" style={{ width: '50px', height: '50px' }}></div>
        <p className="mt-4 text-gray-600">Checking admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    const currentPath = window.location.pathname + window.location.search;
    const redirectUrl = `/admin/login?returnUrl=${encodeURIComponent(currentPath)}`;
    
    if (error) {
      console.log('Admin redirect:', { error, redirectUrl });
    }
    
    return <Navigate to={redirectUrl} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;