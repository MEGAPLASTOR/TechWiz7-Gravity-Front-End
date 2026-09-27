import apiClient from "./apiClient";
export const marketService = {
  async getMarkets({ search = "", city = "", dayOfWeek = "" } = {}) {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (city && city !== "all") params.append("city", city);
      if (dayOfWeek && dayOfWeek !== "all")
        params.append("dayOfWeek", dayOfWeek);
      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await apiClient.get(`/markets${qs}`);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res && Array.isArray(res.value)) return res.value;
      return [];
    } catch (err) {
      console.warn("Failed to fetch markets, returning fallback array", err);
      return [];
    }
  },
  async getStalls({ search = "", marketId = "" } = {}) {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (marketId && marketId !== "all") params.append("marketId", marketId);
      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await apiClient.get(`/markets/stalls${qs}`);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res && Array.isArray(res.value)) return res.value;
      return [];
    } catch (err) {
      console.warn("Failed to fetch stalls from backend", err);
      return [];
    }
  },
  async getMarketById(id) {
    const res = await apiClient.get(`/markets/${id}`);
    return res.data || res;
  },
  async getMarketFarmers(marketId) {
    try {
      const res = await apiClient.get(`/markets/${marketId}/farmers`);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res && Array.isArray(res.value)) return res.value;
      return [];
    } catch (err) {
      console.warn(`Failed to fetch farmers for market ${marketId}`, err);
      return [];
    }
  },
  async getPickupSlots(marketId, farmerId = null) {
    try {
      const query = farmerId ? `?farmerId=${farmerId}` : "";
      const res = await apiClient.get(
        `/markets/${marketId}/pickup-slots${query}`,
      );
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn(`Failed to fetch pickup slots for market ${marketId}`, err);
      return [];
    }
  },
  async createMarket(marketData) {
    return apiClient.post("/admin/markets", marketData);
  },
  async assignFarmerStall(assignmentData) {
    return apiClient.post("/admin/markets/assignments", assignmentData);
  },
};
export default marketService;
