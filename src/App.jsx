import React, { useState, useEffect } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { NotificationProvider, AuthProvider, CartProvider } from '@/context';
import { Navbar, Footer } from '@/layout';
import { AppRoutes, PATHS } from '@/routes';
import { PreOrderDrawer, AiAssistantModal, AuthModal } from '@/components';
import { marketsService } from '@/services';

export function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [markets, setMarkets] = useState([]);

  // Automatically open auth modal if redirected with needAuth
  useEffect(() => {
    if (location.state?.needAuth) {
      setIsAuthOpen(true);
    }
  }, [location.state]);

  // Fetch real markets from backend API
  useEffect(() => {
    async function fetchMarkets() {
      try {
        const data = await marketsService.getAllMarkets();
        setMarkets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch markets:', err);
      }
    }
    fetchMarkets();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <Navbar
        onOpenAi={() => setIsAiOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Tab Content via Decoupled React Router */}
      <main style={{ flex: 1 }}>
        <AppRoutes onOpenAi={() => setIsAiOpen(true)} />
      </main>

      {/* Slide-over Pre-Order Basket Drawer */}
      <PreOrderDrawer
        markets={markets}
        onOrderCreated={() => {
          navigate(PATHS.ORDERS);
        }}
      />

      {/* AI Assistant Chatbot Modal */}
      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      {/* User Login/Register Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Site Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <MainApp />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
