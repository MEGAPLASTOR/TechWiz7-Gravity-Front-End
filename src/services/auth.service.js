import { apiClient } from './client';

export const authService = {
  login: async (credentials) => {
    const res = await apiClient('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    return res;
  },

  register: async (data) => {
    const res = await apiClient('/auth/register', {
      method: 'POST',
      body: data,
    });
    return res;
  },

  getCurrentUser: async () => {
    const res = await apiClient('/auth/me');
    return res;
  },

  /** POST refresh token (Refresh Token Rotation) */
  refreshToken: async (refreshToken) => {
    const res = await apiClient('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
    return res;
  },

  logout: async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // ignore server errors on logout
    } finally {
      localStorage.removeItem('marketlink_token');
      localStorage.removeItem('marketlink_user');
    }
  },

  // ─── OTP / Password Reset ─────────────────────────────────────────────────
  /**
   * Send OTP via email or SMS
   * @param {{ target: string, type: 'EMAIL' | 'PHONE', purpose: 'VERIFY' | 'RESET_PASSWORD' }} data
   */
  sendOtp: async (data) => {
    const res = await apiClient('/auth/verification/send-otp', {
      method: 'POST',
      body: data,
    });
    return res?.data || res;
  },

  /**
   * Verify OTP
   * @param {{ target: string, otp: string }} data
   */
  verifyOtp: async (data) => {
    const res = await apiClient('/auth/verification/verify-otp', {
      method: 'POST',
      body: data,
    });
    return res?.data || res;
  },

  /**
   * Reset password with OTP
   * @param {{ target: string, otp: string, newPassword: string }} data
   */
  resetPassword: async (data) => {
    const res = await apiClient('/auth/reset-password', {
      method: 'POST',
      body: data,
    });
    return res?.data || res;
  },
};

export const authApi = authService;
export default authService;
