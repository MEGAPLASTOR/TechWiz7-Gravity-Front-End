import { apiClient } from './client';

export const farmerApi = {
  getDashboard: async () => {
    const res = await apiClient('/farmer/dashboard');
    return res?.data || res;
  },

  getProducts: async () => {
    const res = await apiClient('/farmer/products');
    return res?.data || res || [];
  },

  createProduct: async (productData) => {
    const res = await apiClient('/farmer/products', {
      method: 'POST',
      body: productData,
    });
    return res?.data || res;
  },

  updateProduct: async (id, productData) => {
    const res = await apiClient(`/farmer/products/${id}`, {
      method: 'PUT',
      body: productData,
    });
    return res?.data || res;
  },

  deleteProduct: async (id) => {
    const res = await apiClient(`/farmer/products/${id}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  updateProductStatus: async (id, status) => {
    const res = await apiClient(`/farmer/products/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
    return res?.data || res;
  },

  getCutoffSettings: async () => {
    const res = await apiClient('/farmer/cutoff-settings');
    return res?.data || res || [];
  },

  saveCutoffSetting: async (data) => {
    const res = await apiClient('/farmer/cutoff-settings', {
      method: 'POST',
      body: data,
    });
    return res?.data || res;
  },

  getPickupSlots: async () => {
    const res = await apiClient('/farmer/pickup-slots');
    return res?.data || res || [];
  },

  createPickupSlot: async (data) => {
    const res = await apiClient('/farmer/pickup-slots', {
      method: 'POST',
      body: data,
    });
    return res?.data || res;
  },

  getMyKyc: async () => {
    const res = await apiClient('/farmer/kyc/my-documents');
    return res?.data || res;
  },

  submitKyc: async (documentsOrPayload) => {
    const body = Array.isArray(documentsOrPayload)
      ? { documents: documentsOrPayload }
      : documentsOrPayload;
    const res = await apiClient('/farmer/kyc/submit', {
      method: 'POST',
      body,
    });
    return res?.data || res;
  },

  replyReview: async (reviewId, reply) => {
    const res = await apiClient(`/farmer/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: { reply },
    });
    return res?.data || res;
  },
};
