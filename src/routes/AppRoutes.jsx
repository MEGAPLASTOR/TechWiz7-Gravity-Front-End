import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { PATHS } from './paths';

// Top-level Public Pages
import { HomePage } from '@/pages/HomePage';
import { MarketsPage } from '@/pages/MarketsPage';

// Customer Module
import { CustomerLayout } from '@/pages/customer/CustomerLayout';
import { CustomerOrdersPage } from '@/pages/customer/CustomerOrdersPage';
import { CustomerFavoritesPage } from '@/pages/customer/CustomerFavoritesPage';
import { CustomerProfilePage } from '@/pages/customer/CustomerProfilePage';

// Farmer Module
import { FarmerLayout } from '@/pages/farmer/FarmerLayout';
import { FarmerDashboardPage } from '@/pages/farmer/FarmerDashboardPage';
import { FarmerKycPage } from '@/pages/farmer/FarmerKycPage';
import { FarmerProductsPage } from '@/pages/farmer/FarmerProductsPage';
import { FarmerOrdersPage } from '@/pages/farmer/FarmerOrdersPage';
import { FarmerSlotsPage } from '@/pages/farmer/FarmerSlotsPage';

// Admin Module
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminKycReviewPage } from '@/pages/admin/AdminKycReviewPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminMarketsPage } from '@/pages/admin/AdminMarketsPage';
import { AdminAnnouncementsPage } from '@/pages/admin/AdminAnnouncementsPage';

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
      <Route path={PATHS.CUSTOMER.ROOT} element={<CustomerLayout />}>
        <Route index element={<Navigate to={PATHS.CUSTOMER.ORDERS} replace />} />
        <Route path="orders" element={<CustomerOrdersPage />} />
        <Route path="favorites" element={<CustomerFavoritesPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
      </Route>

      {/* 3. Farmer Sub-routes (/farmer/...) */}
      <Route path={PATHS.FARMER.ROOT} element={<FarmerLayout />}>
        <Route index element={<Navigate to={PATHS.FARMER.DASHBOARD} replace />} />
        <Route path="dashboard" element={<FarmerDashboardPage />} />
        <Route path="kyc" element={<FarmerKycPage />} />
        <Route path="products" element={<FarmerProductsPage />} />
        <Route path="orders" element={<FarmerOrdersPage />} />
        <Route path="slots" element={<FarmerSlotsPage />} />
      </Route>

      {/* 4. Admin Sub-routes (/admin/...) */}
      <Route path={PATHS.ADMIN.ROOT} element={<AdminLayout />}>
        <Route index element={<Navigate to={PATHS.ADMIN.DASHBOARD} replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="kyc" element={<AdminKycReviewPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="markets" element={<AdminMarketsPage />} />
        <Route path="announcements" element={<AdminAnnouncementsPage />} />
      </Route>

      {/* Direct Shortcuts & Fallbacks */}
      <Route path="/orders" element={<Navigate to={PATHS.CUSTOMER.ORDERS} replace />} />
      <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
    </Routes>
  );
};
