import { apiClient } from './client';

export const marketsApi = {
  getAllMarkets: async () => {
    const res = await apiClient('/markets');
    // Backend returns Array directly or object with data
    return Array.isArray(res) ? res : (res?.data || []);
  },

  getMarketById: async (id) => {
    const res = await apiClient(`/markets/${id}`);
    return res?.data || res;
  },

  getMarketFarmers: async (id) => {
    const res = await apiClient(`/markets/${id}/farmers`);
    return res?.data || res || [];
  },

  getMarketPickupSlots: async (marketId) => {
    const res = await apiClient(`/markets/${marketId}/pickup-slots`);
    return res?.data || res || [];
  },

  filterByDay: async (day) => {
    const res = await apiClient(`/markets/filter-by-day?day=${encodeURIComponent(day)}`);
    return res?.data || res || [];
  },
};
