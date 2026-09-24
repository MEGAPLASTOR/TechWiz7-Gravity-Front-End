import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('marketlink_token');
    const savedUser = localStorage.getItem('marketlink_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('marketlink_token');
        localStorage.removeItem('marketlink_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const authData = res?.data || res;
      if (authData?.token) {
        localStorage.setItem('marketlink_token', authData.token);
        const userData = {
          userId: authData.userId,
          fullName: authData.fullName,
          email: authData.email,
          roles: authData.roles || ['ROLE_CUSTOMER'],
          avatarUrl: authData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        };
        localStorage.setItem('marketlink_user', JSON.stringify(userData));
        setToken(authData.token);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: 'Không nhận được mã token từ máy chủ' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const register = async (registerData) => {
    try {
      const res = await authApi.register(registerData);
      const authData = res?.data || res;
      if (authData?.token) {
        localStorage.setItem('marketlink_token', authData.token);
        const userData = {
          userId: authData.userId,
          fullName: authData.fullName,
          email: authData.email,
          roles: authData.roles || (registerData.role === 'FARMER' ? ['ROLE_FARMER'] : ['ROLE_CUSTOMER']),
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        };
        localStorage.setItem('marketlink_user', JSON.stringify(userData));
        setToken(authData.token);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: true, message: 'Đăng ký thành công' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('marketlink_token');
      localStorage.removeItem('marketlink_user');
      setUser(null);
      setToken(null);
    }
  };

  const switchRole = (roleType) => {
    if (roleType === 'ROLE_FARMER') {
      const farmerUser = {
        userId: 103,
        farmerId: 103,
        fullName: 'Trần Văn Nông Dân',
        stallName: 'Nông Trại Hữu Cơ Ba Vì',
        email: 'testfarmer@marketlink.com',
        roles: ['ROLE_FARMER'],
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      };
      setUser(farmerUser);
      localStorage.setItem('marketlink_user', JSON.stringify(farmerUser));
    } else if (roleType === 'ROLE_ADMIN') {
      const adminUser = {
        userId: 101,
        fullName: 'Nguyễn Quản Trị',
        email: 'admin@marketlink.com',
        roles: ['ROLE_ADMIN'],
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      };
      setUser(adminUser);
      localStorage.setItem('marketlink_user', JSON.stringify(adminUser));
    } else {
      const customerUser = {
        userId: 115,
        fullName: 'Nguyễn Văn Test',
        email: 'testcustomer@marketlink.com',
        roles: ['ROLE_CUSTOMER'],
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };
      setUser(customerUser);
      localStorage.setItem('marketlink_user', JSON.stringify(customerUser));
    }
  };

  const hasRole = (roleName) => {
    return user?.roles?.includes(roleName) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isFarmer: hasRole('ROLE_FARMER'),
        isAdmin: hasRole('ROLE_ADMIN'),
        isCustomer: hasRole('ROLE_CUSTOMER') || (!hasRole('ROLE_FARMER') && !hasRole('ROLE_ADMIN')),
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
