import { apiClient } from './client';

export const adminApi = {
  getDashboardMetrics: async () => {
    const res = await apiClient('/admin/dashboard/metrics');
    return res?.data || res;
  },

  getMarketReports: async () => {
    const res = await apiClient('/admin/dashboard/reports/markets');
    return res?.data || res || [];
  },

  getActiveFarmers: async () => {
    const res = await apiClient('/admin/dashboard/reports/most-active-farmers');
    return res?.data || res || [];
  },

  getSystemStatus: async () => {
    const res = await apiClient('/admin/system-status');
    return res?.data || res;
  },

  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await apiClient(`/admin/users${query ? `?${query}` : ''}`);
    return res?.data || res || [];
  },

  updateUserStatus: async (userId, status, reason = '') => {
    const res = await apiClient(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: { status, reason },
    });
    return res?.data || res;
  },

  createMarket: async (marketData) => {
    const res = await apiClient('/admin/markets', {
      method: 'POST',
      body: marketData,
    });
    return res?.data || res;
  },

  updateMarket: async (id, marketData) => {
    const res = await apiClient(`/admin/markets/${id}`, {
      method: 'PUT',
      body: marketData,
    });
    return res?.data || res;
  },

  deleteMarket: async (id) => {
    const res = await apiClient(`/admin/markets/${id}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  getPendingKyc: async () => {
    const res = await apiClient('/admin/kyc/pending');
    return res?.data || res || [];
  },

  getFarmerKycDetail: async (farmerId) => {
    const res = await apiClient(`/admin/kyc/farmers/${farmerId}`);
    return res?.data || res;
  },

  /**
   * Review farmer KYC documents
   * @param {number} farmerId
   * @param {{ action: 'APPROVE' | 'REJECT' | 'REQUEST_REVISION', reason: string }} reviewData
   */
  reviewKyc: async (farmerId, { action, reason = '' }) => {
    const res = await apiClient(`/admin/kyc/farmers/${farmerId}/review`, {
      method: 'POST',
      body: { action, reason },
    });
    return res?.data || res;
  },

  getAnnouncements: async () => {
    const res = await apiClient('/announcements');
    return res?.data || res || [];
  },

  createAnnouncement: async (announcementData) => {
    const res = await apiClient('/admin/announcements', {
      method: 'POST',
      body: announcementData,
    });
    return res?.data || res;
  },

  deleteAnnouncement: async (id) => {
    const res = await apiClient(`/admin/announcements/${id}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },
};
