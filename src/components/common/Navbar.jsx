import React from 'react';
import { useLocation } from 'react-router-dom';
import { MarketplaceNavbar } from '@/components/navigation/MarketplaceNavbar';
import { CustomerNavbar } from '@/components/navigation/CustomerNavbar';
import { FarmerNavbar } from '@/components/navigation/FarmerNavbar';
import { AdminNavbar } from '@/components/navigation/AdminNavbar';

export const Navbar = ({ onOpenAi = () => {}, onOpenAuth = () => {} }) => {
  const location = useLocation();
  const path = location.pathname;

  if (path.startsWith('/admin')) {
    return <AdminNavbar />;
  }

  if (path.startsWith('/farmer')) {
    return <FarmerNavbar />;
  }

  if (path.startsWith('/customer')) {
    return <CustomerNavbar onOpenAi={onOpenAi} />;
  }

  return (
    <MarketplaceNavbar
      onOpenAi={onOpenAi}
      onOpenAuth={onOpenAuth}
    />
  );
};
