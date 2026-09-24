import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load saved cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('marketlink_cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
      const savedMarket = localStorage.getItem('marketlink_market');
      if (savedMarket) {
        setSelectedMarket(JSON.parse(savedMarket));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('marketlink_cart', JSON.stringify(cartItems));
    } catch (e) {
      // ignore
    }
  }, [cartItems]);

  useEffect(() => {
    if (selectedMarket) {
      try {
        localStorage.setItem('marketlink_market', JSON.stringify(selectedMarket));
      } catch (e) {
        // ignore
      }
    }
  }, [selectedMarket]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.productId === product.productId);
      if (existing) {
        return prev.map((item) =>
          item.product.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, farmerId: product.farmerId }];
    });
    setIsDrawerOpen(true);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedSlot(null);
    setSelectedDate('');
    localStorage.removeItem('marketlink_cart');
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce(
    (acc, item) => acc + (item.product.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        totalAmount,
        selectedMarket,
        setSelectedMarket,
        selectedDate,
        setSelectedDate,
        selectedSlot,
        setSelectedSlot,
        isDrawerOpen,
        setIsDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
