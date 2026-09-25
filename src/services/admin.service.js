import { apiClient } from './client';

export const adminService = {
  // ─── Dashboard & Analytics ────────────────────────────────────────────────
  getDashboardMetrics: async () => {
    const res = await apiClient('/admin/dashboard/metrics');
    return res?.data || res;
  },

  getMarketReports: async () => {
    const res = await apiClient('/admin/dashboard/reports/revenue');
    return res?.data || res || [];
  },

  getActiveFarmers: async (limit = 10) => {
    const res = await apiClient(`/admin/dashboard/reports/most-active-farmers?limit=${limit}`);
    return res?.data || res || [];
  },

  getSystemStatus: async () => {
    const res = await apiClient('/admin/system-status');
    return res?.data || res;
  },

  // ─── User Management ──────────────────────────────────────────────────────
  // API only supports: GET list, GET detail, PATCH status — no create/update/delete
  getUsers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.keyword) query.set('keyword', params.keyword);
    if (params.role) query.set('role', params.role);
    if (params.status) query.set('status', params.status);
    if (params.kycStatus) query.set('kycStatus', params.kycStatus);
    const qs = query.toString();
    const res = await apiClient(`/admin/users${qs ? `?${qs}` : ''}`);
    return res?.data || res || [];
  },

  getUserDetail: async (userId) => {
    const res = await apiClient(`/admin/users/${userId}`);
    return res?.data || res;
  },

  updateUserStatus: async (userId, status, reason = '') => {
    const res = await apiClient(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: { status, reason },
    });
    return res?.data || res;
  },

  // ─── Markets ──────────────────────────────────────────────────────────────
  getAllMarkets: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    const res = await apiClient(`/admin/markets${qs ? `?${qs}` : ''}`);
    return res?.data || res || [];
  },

  getMarketDetail: async (id) => {
    const res = await apiClient(`/admin/markets/${id}`);
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

  /** Soft-delete: sets market INACTIVE */
  deleteMarket: async (id) => {
    const res = await apiClient(`/admin/markets/${id}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  /** Hard-delete: permanent if no orders linked */
  deleteMarketPermanently: async (id) => {
    const res = await apiClient(`/admin/markets/${id}/permanent`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  updateMarketStatus: async (id, status) => {
    const res = await apiClient(`/admin/markets/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
    return res?.data || res;
  },

  getMarketAssignments: async (marketId) => {
    const res = await apiClient(`/admin/markets/${marketId}/assignments`);
    return res?.data || res || [];
  },

  assignStall: async (assignData) => {
    const res = await apiClient('/admin/markets/assignments', {
      method: 'POST',
      body: assignData,
    });
    return res?.data || res;
  },

  updateAssignmentStatus: async (assignmentId, status) => {
    const res = await apiClient(`/admin/markets/assignments/${assignmentId}/status?status=${status}`, {
      method: 'PATCH',
    });
    return res?.data || res;
  },

  deleteAssignment: async (assignmentId) => {
    const res = await apiClient(`/admin/markets/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  // ─── Categories ───────────────────────────────────────────────────────────
  // Correct paths per API spec: POST /api/categories, PUT/DELETE /api/categories/{id}
  getCategories: async () => {
    const res = await apiClient('/categories');
    return res?.data || res || [];
  },

  createCategory: async (categoryData) => {
    const res = await apiClient('/categories', {
      method: 'POST',
      body: categoryData,
    });
    return res?.data || res;
  },

  updateCategory: async (id, categoryData) => {
    const res = await apiClient(`/categories/${id}`, {
      method: 'PUT',
      body: categoryData,
    });
    return res?.data || res;
  },

  deleteCategory: async (id) => {
    const res = await apiClient(`/categories/${id}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  // ─── KYC ──────────────────────────────────────────────────────────────────
  getPendingKyc: async () => {
    const res = await apiClient('/admin/kyc/pending');
    return res?.data || res || [];
  },

  getFarmerKycDetail: async (farmerId) => {
    const res = await apiClient(`/admin/kyc/farmers/${farmerId}`);
    return res?.data || res;
  },

  /**
   * Review farmer KYC
   * @param {number} farmerId
   * @param {{ action: 'APPROVE' | 'REJECT' | 'REQUEST_REVISION', reason?: string }} reviewData
   */
  reviewKyc: async (farmerId, { action, reason = '' }) => {
    const res = await apiClient(`/admin/kyc/farmers/${farmerId}/review`, {
      method: 'POST',
      body: { action, reason },
    });
    return res?.data || res;
  },

  // ─── Announcements ────────────────────────────────────────────────────────
  /** Admin-only: includes inactive announcements */
  getAnnouncements: async () => {
    const res = await apiClient('/admin/announcements');
    return res?.data || res || [];
  },

  createAnnouncement: async (announcementData) => {
    const res = await apiClient('/admin/announcements', {
      method: 'POST',
      body: announcementData,
    });
    return res?.data || res;
  },

  updateAnnouncement: async (id, announcementData) => {
    const res = await apiClient(`/admin/announcements/${id}`, {
      method: 'PUT',
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

  // ─── Orders ───────────────────────────────────────────────────────────────
  getAllOrders: async () => {
    const res = await apiClient('/admin/orders');
    return res?.data || res || [];
  },

  // ─── Product Moderation ───────────────────────────────────────────────────
  moderateProduct: async (id, status) => {
    const res = await apiClient(`/admin/products/${id}/moderate?status=${status}`, {
      method: 'PATCH',
    });
    return res?.data || res;
  },

  // ─── Review Moderation ────────────────────────────────────────────────────
  setReviewVisibility: async (id, isHidden) => {
    const res = await apiClient(`/admin/reviews/${id}/visibility?isHidden=${isHidden}`, {
      method: 'PATCH',
    });
    return res?.data || res;
  },
};

export const adminApi = adminService;
export default adminService;
