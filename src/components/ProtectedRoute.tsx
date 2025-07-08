import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'student' | 'tutor' | 'admin';
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    // Optionally, render a spinner here
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
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
