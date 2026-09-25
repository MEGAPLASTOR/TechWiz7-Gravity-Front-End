import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { PATHS } from './paths';
import { ProtectedRoute } from './ProtectedRoute';


// Layouts
import { CustomerLayout, FarmerLayout, AdminLayout } from '@/layout';

// Pages
import {
  HomePage,
  MarketsPage,
  CustomerOrdersPage,
  CustomerFavoritesPage,
  CustomerProfilePage,
  FarmerDashboardPage,
  FarmerKycPage,
  FarmerProductsPage,
  FarmerOrdersPage,
  FarmerSlotsPage,
  AdminDashboardPage,
  AdminKycReviewPage,
  AdminUsersPage,
  AdminCategoriesPage,
  AdminMarketsPage,
  AdminAnnouncementsPage,
} from '@/pages';

export const AppRoutes = ({ onOpenAi = () => {} }) => {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* 1. Public Pages */}
      <Route
        path={PATHS.HOME}
        element={
          <HomePage
            onSelectMarket={() => navigate(PATHS.MARKETS)}
            onOpenAi={onOpenAi}
          />
        }
      />
      <Route
        path={PATHS.MARKETS}
        element={<MarketsPage onSelectMarketForShop={() => navigate(PATHS.HOME)} />}
      />

      {/* 2. Customer Sub-routes (/customer/...) */}
      <Route
        path={PATHS.CUSTOMER.ROOT}
        element={
          <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_FARMER', 'ROLE_ADMIN']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={PATHS.CUSTOMER.ORDERS} replace />} />
        <Route path="orders" element={<CustomerOrdersPage />} />
        <Route path="favorites" element={<CustomerFavoritesPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
      </Route>

      {/* 3. Farmer Sub-routes (/farmer/...) - Chỉ Nông dân và Admin mới được vào */}
      <Route
        path={PATHS.FARMER.ROOT}
        element={
          <ProtectedRoute allowedRoles={['ROLE_FARMER', 'ROLE_ADMIN']}>
            <FarmerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={PATHS.FARMER.DASHBOARD} replace />} />
        <Route path="dashboard" element={<FarmerDashboardPage />} />
        <Route path="kyc" element={<FarmerKycPage />} />
        <Route path="products" element={<FarmerProductsPage />} />
        <Route path="orders" element={<FarmerOrdersPage />} />
        <Route path="slots" element={<FarmerSlotsPage />} />
      </Route>

      {/* 4. Admin Sub-routes (/admin/...) - Chỉ Admin mới được vào */}
      <Route
        path={PATHS.ADMIN.ROOT}
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={PATHS.ADMIN.DASHBOARD} replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="kyc" element={<AdminKycReviewPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="markets" element={<AdminMarketsPage />} />
        <Route path="announcements" element={<AdminAnnouncementsPage />} />
      </Route>

      {/* Direct Shortcuts & Fallbacks */}
      <Route path="/orders" element={<Navigate to={PATHS.CUSTOMER.ORDERS} replace />} />
      <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
    </Routes>
  );
};

export default AppRoutes;
