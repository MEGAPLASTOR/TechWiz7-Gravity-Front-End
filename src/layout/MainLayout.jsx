import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Main application shell containing top Navbar, main Outlet content, and Footer.
 */
export const MainLayout = ({ onOpenAi = () => {}, onOpenAuth = () => {} }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onOpenAi={onOpenAi} onOpenAuth={onOpenAuth} />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
