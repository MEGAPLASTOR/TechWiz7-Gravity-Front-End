import { apiClient } from './client';

export const farmerService = {
  getDashboard: async () => {
    const res = await apiClient('/farmer/dashboard');
    return res?.data || res;
  },

  // ─── Products ─────────────────────────────────────────────────────────────
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

  /** PATCH product status: AVAILABLE | SOLD_OUT | TEMPORARILY_UNAVAILABLE */
  updateProductStatus: async (id, status) => {
    const res = await apiClient(`/farmer/products/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
    return res?.data || res;
  },

  // ─── Cutoff Settings ──────────────────────────────────────────────────────
  getCutoffSettings: async () => {
    const res = await apiClient('/farmer/cutoff-settings');
    return res?.data || res || [];
  },

  /** POST save (create or update) cutoff setting */
  saveCutoffSetting: async (data) => {
    const res = await apiClient('/farmer/cutoff-settings', {
      method: 'POST',
      body: data,
    });
    return res?.data || res;
  },

  deleteCutoffSetting: async (id) => {
    const res = await apiClient(`/farmer/cutoff-settings/${id}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  // ─── Pickup Slots ─────────────────────────────────────────────────────────
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

  deletePickupSlot: async (id) => {
    const res = await apiClient(`/farmer/pickup-slots/${id}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  // ─── Weekly Stock Templates ───────────────────────────────────────────────
  getStockTemplates: async (marketId) => {
    const qs = marketId ? `?marketId=${marketId}` : '';
    const res = await apiClient(`/farmer/stock-templates${qs}`);
    return res?.data || res || [];
  },

  /**
   * POST save template (API always uses POST for create/update)
   * Body: { productId, marketId, dayOfWeek, recurringQuantity, isActive }
   */
  saveStockTemplate: async (data) => {
    const res = await apiClient('/farmer/stock-templates', {
      method: 'POST',
      body: data,
    });
    return res?.data || res;
  },

  deleteStockTemplate: async (id) => {
    const res = await apiClient(`/farmer/stock-templates/${id}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  // ─── KYC ──────────────────────────────────────────────────────────────────
  getMyKyc: async () => {
    const res = await apiClient('/farmer/kyc/my-documents');
    return res?.data || res;
  },

  /**
   * POST submit KYC documents
   * @param {{ documents: Array<{ documentType: string, documentUrl: string, description?: string }> }} payload
   */
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

  // ─── Markets ──────────────────────────────────────────────────────────────
  getMyMarketAssignments: async () => {
    const res = await apiClient('/farmer/markets/my-assignments');
    return Array.isArray(res) ? res : (res?.data || []);
  },

  registerMarket: async ({ marketId, stallName }) => {
    const res = await apiClient('/farmer/markets/register', {
      method: 'POST',
      body: { marketId, stallName },
    });
    return res?.data || res;
  },

  // ─── Reviews ──────────────────────────────────────────────────────────────
  replyReview: async (reviewId, reply) => {
    const res = await apiClient(`/farmer/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: { reply },
    });
    return res?.data || res;
  },
};

export const farmerApi = farmerService;
export default farmerService;
