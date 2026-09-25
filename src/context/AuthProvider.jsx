import React, { useState } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '@/services/auth.service';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('marketlink_token') || null;
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('marketlink_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('marketlink_token');
      localStorage.removeItem('marketlink_user');
      return null;
    }
  });

  const [loading] = useState(false);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email: email.trim(), password });
      const authData = res?.data || res;
      const userToken = authData?.token || authData?.accessToken || authData?.jwt;
      if (userToken) {
        localStorage.setItem('marketlink_token', userToken);
        if (authData?.refreshToken) {
          localStorage.setItem('marketlink_refresh_token', authData.refreshToken);
        }

        // Parse & normalize roles from backend
        let rawRoles = authData?.roles || authData?.user?.roles || [];
        if (typeof rawRoles === 'string') rawRoles = [rawRoles];
        const roles = Array.isArray(rawRoles)
          ? rawRoles.map((r) => {
              const str = typeof r === 'string' ? r : r?.name || r?.role || '';
              return str.startsWith('ROLE_') ? str : `ROLE_${str.toUpperCase()}`;
            })
          : ['ROLE_CUSTOMER'];

        const userData = {
          userId: authData.userId || authData.id || authData?.user?.id || 1,
          fullName: authData.fullName || authData.name || authData?.user?.fullName || email.split('@')[0],
          email: authData.email || authData?.user?.email || email,
          roles: roles.length > 0 ? roles : ['ROLE_CUSTOMER'],
          avatarUrl: authData.avatarUrl || authData?.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          farmerId: authData.farmerId || authData?.user?.farmerId || null,
          stallName: authData.stallName || authData?.user?.stallName || null,
        };

        localStorage.setItem('marketlink_user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        return { success: true, user: userData };
      }

      return {
        success: false,
        message: res?.message || 'Không nhận được mã token xác thực từ máy chủ',
      };
    } catch (err) {
      console.error('[AuthProvider Login Error]:', err);
      let errorMsg = err?.data?.message || err?.message || 'Email hoặc mật khẩu không chính xác.';
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        errorMsg = 'Không thể kết nối đến máy chủ xác thực. Vui lòng kiểm tra kết nối mạng.';
      }
      return { success: false, message: errorMsg };
    }
  };

  const register = async (registerData) => {
    try {
      const res = await authService.register(registerData);
      const authData = res?.data || res;
      const userToken = authData?.token || authData?.accessToken || authData?.jwt;
      if (userToken) {
        localStorage.setItem('marketlink_token', userToken);
        if (authData?.refreshToken) {
          localStorage.setItem('marketlink_refresh_token', authData.refreshToken);
        }

        let rawRoles = authData?.roles || (registerData.role === 'FARMER' ? ['ROLE_FARMER'] : ['ROLE_CUSTOMER']);
        if (typeof rawRoles === 'string') rawRoles = [rawRoles];
        const roles = Array.isArray(rawRoles)
          ? rawRoles.map((r) => {
              const str = typeof r === 'string' ? r : r?.name || '';
              return str.startsWith('ROLE_') ? str : `ROLE_${str.toUpperCase()}`;
            })
          : ['ROLE_CUSTOMER'];

        const userData = {
          userId: authData.userId || authData.id || 1,
          fullName: authData.fullName || registerData.fullName,
          email: authData.email || registerData.email,
          roles,
          avatarUrl: authData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          farmerId: authData.farmerId || null,
          stallName: registerData.farmName || null,
        };
        localStorage.setItem('marketlink_user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        return { success: true, user: userData, message: 'Đăng ký tài khoản thành công!' };
      }

      return {
        success: true,
        message: authData?.message || res?.message || 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.',
      };
    } catch (err) {
      console.error('[AuthProvider Register Error]:', err);
      let errorMsg = err?.data?.message || err?.message || 'Đăng ký thất bại, vui lòng kiểm tra lại thông tin.';
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        errorMsg = 'Không thể kết nối đến máy chủ xác thực. Vui lòng kiểm tra kết nối mạng.';
      }
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
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

export default AuthProvider;
