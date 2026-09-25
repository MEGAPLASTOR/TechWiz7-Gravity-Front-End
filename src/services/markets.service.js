import { apiClient } from './client';

export const marketsService = {
  // ─── Public endpoints ─────────────────────────────────────────────────────
  /** Returns all ACTIVE markets with GPS coords */
  getAllMarkets: async () => {
    const res = await apiClient('/markets');
    return Array.isArray(res) ? res : (res?.data || []);
  },

  getMarketById: async (id) => {
    const res = await apiClient(`/markets/${id}`);
    // This endpoint returns MarketDetailResponse directly (no wrapper)
    return res?.data || res;
  },

  getMarketFarmers: async (id) => {
    const res = await apiClient(`/markets/${id}/farmers`);
    return Array.isArray(res) ? res : (res?.data || []);
  },

  getMarketPickupSlots: async (marketId, farmerId) => {
    const qs = farmerId ? `?farmerId=${farmerId}` : '';
    const res = await apiClient(`/markets/${marketId}/pickup-slots${qs}`);
    return res?.data || res || [];
  },

  /** Filter markets by day: 1=Mon, 6=Sat, 7=Sun */
  filterByDay: async (dayOfWeek) => {
    const res = await apiClient(`/markets/filter-by-day?dayOfWeek=${encodeURIComponent(dayOfWeek)}`);
    return Array.isArray(res) ? res : (res?.data || []);
  },

  /** Get nearest market + OSRM route from GPS coordinates */
  getNearestRoute: async ({ latitude, longitude, marketId }) => {
    const query = new URLSearchParams({ latitude, longitude });
    if (marketId) query.set('marketId', marketId);
    const res = await apiClient(`/markets/nearest-and-route?${query.toString()}`);
    return res?.data || res;
  },

  // ─── Geofencing (public demo) ─────────────────────────────────────────────
  simulateGeofence: async ({ latitude, longitude, targetMarketId }) => {
    const res = await apiClient('/markets/geofence/simulate', {
      method: 'POST',
      body: { latitude, longitude, targetMarketId },
    });
    return res?.data || res;
  },
};

export const marketsApi = marketsService;
export default marketsService;
