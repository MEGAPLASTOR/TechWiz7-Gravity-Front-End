import { apiClient } from './client';

export const ordersApi = {
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

  cancelOrder: async (id) => {
    const res = await apiClient(`/customer/orders/${id}/cancel`, {
      method: 'PUT',
    });
    return res?.data || res;
  },

  getFarmerOrders: async () => {
    const res = await apiClient('/farmer/orders');
    return res?.data || res || [];
  },

  getFarmerOrderById: async (id) => {
    const res = await apiClient(`/farmer/orders/${id}`);
    return res?.data || res;
  },

  updateFarmerOrderStatus: async (id, status) => {
    const res = await apiClient(`/farmer/orders/${id}/status`, {
      method: 'PUT',
      body: { orderStatus: status },
    });
    return res?.data || res;
  },

  getFarmerSummary: async () => {
    const res = await apiClient('/farmer/orders/summary');
    return res?.data || res;
  },

  getAdminOrders: async () => {
    const res = await apiClient('/admin/orders');
    return res?.data || res || [];
  },
};
