import React from 'react';
import { useLocation } from 'react-router-dom';
import { MarketplaceNavbar } from './navigation/MarketplaceNavbar';
import { CustomerNavbar } from './navigation/CustomerNavbar';
import { FarmerNavbar } from './navigation/FarmerNavbar';
import { AdminNavbar } from './navigation/AdminNavbar';

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

export default Navbar;
