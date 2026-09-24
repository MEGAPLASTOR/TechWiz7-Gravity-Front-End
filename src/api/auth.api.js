import { apiClient } from './client';

export const authApi = {
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
    const res = await apiClient('/auth/me', {
      method: 'GET',
    });
    return res;
  },

  logout: async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('marketlink_token');
      localStorage.removeItem('marketlink_user');
    }
  },
};
