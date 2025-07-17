import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'student' | 'tutor' | 'admin';
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading, logout } = useAuth();

  if (loading) {
    // Optionally, render a spinner here
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // Restrict access for students if accessTill is set and expired
  if (user?.role !== 'admin' && user.accessTill) {
    const now = new Date();
    const accessTill = new Date(user.accessTill);
    if (now > accessTill) {
      if (logout) logout();
      return <Navigate to='/login' replace state={{ message: 'Your access has been restricted by the admin. Please contact support.' }} />;
    }
  }

  if (requireRole && user?.role !== requireRole) {
    // Admin can access all routes, others are restricted to their role
    if (user?.role !== 'admin') {
      return <Navigate to='/dashboard' replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
