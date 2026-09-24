export const PATHS = {
  HOME: '/',
  MARKETS: '/markets',

  // Customer sub-routes
  CUSTOMER: {
    ROOT: '/customer',
    ORDERS: '/customer/orders',
    FAVORITES: '/customer/favorites',
    PROFILE: '/customer/profile',
  },

  // Farmer sub-routes
  FARMER: {
    ROOT: '/farmer',
    DASHBOARD: '/farmer/dashboard',
    KYC: '/farmer/kyc',
    PRODUCTS: '/farmer/products',
    ORDERS: '/farmer/orders',
    SLOTS: '/farmer/slots',
  },

  // Admin sub-routes
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    KYC: '/admin/kyc',
    USERS: '/admin/users',
    MARKETS: '/admin/markets',
    ANNOUNCEMENTS: '/admin/announcements',
  },

  // Direct shortcuts
  ORDERS: '/customer/orders',
};
