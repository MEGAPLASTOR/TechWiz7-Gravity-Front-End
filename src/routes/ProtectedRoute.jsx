import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PATHS } from './paths';

/**
 * Route guard based on user roles and authentication state.
 *
 * Rules:
 * - Admin (ROLE_ADMIN): Full access to everything (Customer, Farmer, Admin).
 * - Farmer (ROLE_FARMER): Allowed on Customer and Farmer routes. BLOCKED on Admin routes.
 * - Customer (ROLE_CUSTOMER): Allowed on Customer routes. BLOCKED on Farmer and Admin routes.
 * - Guest (not authenticated): BLOCKED on Customer/Farmer/Admin protected routes.
 */
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--primary)', fontWeight: 600 }}>Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  // Not logged in -> redirect to home
  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.HOME} state={{ from: location, needAuth: true }} replace />;
  }

  // Admin has universal access to all portals
  if (isAdmin) {
    return children;
  }

  const userRoles = Array.isArray(user.roles) ? user.roles : [];

  // Check if user has at least one of the allowed roles
  if (allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      // Role violation handling:
      // If Farmer trying to access Admin -> redirect to Farmer Dashboard
      if (userRoles.includes('ROLE_FARMER')) {
        return <Navigate to={PATHS.FARMER.DASHBOARD} replace />;
      }
      // If Customer trying to access Farmer or Admin -> redirect to Customer Orders
      return <Navigate to={PATHS.CUSTOMER.ORDERS} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
