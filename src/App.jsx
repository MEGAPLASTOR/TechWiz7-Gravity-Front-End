import React, { useState, useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { NotificationProvider } from '@/context/NotificationContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { AppRoutes } from '@/routes/AppRoutes';
import { PATHS } from '@/routes/paths';
import { PreOrderDrawer } from '@/components/order/PreOrderDrawer';
import { AiAssistantModal } from '@/components/ai/AiAssistantModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { marketsApi } from '@/api/markets.api';

export function MainApp() {
  const navigate = useNavigate();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [markets, setMarkets] = useState([]);

  // Fetch real markets from backend API
  useEffect(() => {
    async function fetchMarkets() {
      try {
        const data = await marketsApi.getAllMarkets();
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
