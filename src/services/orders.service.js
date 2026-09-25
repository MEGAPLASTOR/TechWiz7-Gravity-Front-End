import { apiClient } from './client';

export const ordersService = {
  // ─── Customer Orders ──────────────────────────────────────────────────────
  createOrder: async (orderData) => {
    const res = await apiClient('/customer/orders', {
      method: 'POST',
      body: orderData,
    });
    return res?.data || res;
  },

  getCustomerOrders: async () => {
    const res = await apiClient('/customer/orders');
    return res?.data || res || [];
  },

  getCustomerOrderById: async (id) => {
    const res = await apiClient(`/customer/orders/${id}`);
    return res?.data || res;
  },

  /** PUT cancel (before cutoff) */
  cancelOrder: async (id) => {
    const res = await apiClient(`/customer/orders/${id}/cancel`, {
      method: 'PUT',
    });
    return res?.data || res;
  },

  /** PUT modify (pickup date, slot, note — before cutoff) */
  modifyOrder: async (id, { pickupDate, slotId, note }) => {
    const res = await apiClient(`/customer/orders/${id}/modify`, {
      method: 'PUT',
      body: { pickupDate, slotId, note },
    });
    return res?.data || res;
  },

  /** POST reorder from existing order */
  reorder: async (id, { pickupDate, slotId }) => {
    const res = await apiClient(`/customer/orders/${id}/reorder`, {
      method: 'POST',
      body: { pickupDate, slotId },
    });
    return res?.data || res;
  },

  // ─── Farmer Orders ────────────────────────────────────────────────────────
  getFarmerOrders: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.pickupDate) query.set('pickupDate', params.pickupDate);
    if (params.status) query.set('status', params.status);
    const qs = query.toString();
    const res = await apiClient(`/farmer/orders${qs ? `?${qs}` : ''}`);
    return res?.data || res || [];
  },

  getFarmerOrderById: async (id) => {
    const res = await apiClient(`/farmer/orders/${id}`);
    return res?.data || res;
  },

  /**
   * PUT update farmer order status
   * Valid statuses: ACCEPTED | READY_FOR_PICKUP | COMPLETED | DECLINED
   */
  updateFarmerOrderStatus: async (id, orderStatus) => {
    const res = await apiClient(`/farmer/orders/${id}/status`, {
      method: 'PUT',
      body: { orderStatus },
    });
    return res?.data || res;
  },

  getFarmerSummary: async () => {
    const res = await apiClient('/farmer/orders/summary');
    return res?.data || res;
  },

  getFarmerBestSelling: async (limit = 10) => {
    const res = await apiClient(`/farmer/orders/insights/best-selling?limit=${limit}`);
    return res?.data || res || [];
  },

  // ─── Admin Orders ─────────────────────────────────────────────────────────
  getAdminOrders: async () => {
    const res = await apiClient('/admin/orders');
    return res?.data || res || [];
  },
};

export const ordersApi = ordersService;
export default ordersService;
