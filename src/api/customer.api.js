import { apiClient } from './client';

export const customerApi = {
  getProfileSummary: async () => {
    const res = await apiClient('/customer/profile-summary');
    return res?.data || res;
  },

  getOrders: async () => {
    const res = await apiClient('/customer/orders');
    return res?.data || res || [];
  },

  getOrderDetail: async (id) => {
    const res = await apiClient(`/customer/orders/${id}`);
    return res?.data || res;
  },

  cancelOrder: async (id) => {
    const res = await apiClient(`/customer/orders/${id}/cancel`, {
      method: 'PUT',
    });
    return res?.data || res;
  },

  getFavorites: async () => {
    const res = await apiClient('/customer/favorites');
    return res?.data || res || [];
  },

  toggleFavorite: async (targetType, targetId) => {
    const res = await apiClient('/customer/favorites', {
      method: 'POST',
      body: { targetType, targetId },
    });
    return res?.data || res;
  },

  getFamilyMembers: async () => {
    const res = await apiClient('/customer/family/members');
    return res?.data || res || [];
  },

  getFamilyInvitations: async () => {
    const res = await apiClient('/customer/family/invitations');
    return res?.data || res || [];
  },
};
