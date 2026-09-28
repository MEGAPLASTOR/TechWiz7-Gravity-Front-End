import apiClient, { formatImageUrl } from "./apiClient";
export const farmerService = {
  async getFarmerProducts({
    keyword = "",
    categoryId = "",
    marketId = "",
    status = "",
  } = {}) {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append("keyword", keyword);
      if (categoryId && categoryId !== "all")
        params.append("categoryId", categoryId);
      if (marketId && marketId !== "all") params.append("marketId", marketId);
      if (status && status !== "all") params.append("status", status);
      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await apiClient.get(`/farmer/products${qs}`);
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (res && Array.isArray(res.data)) list = res.data;
      return list.map((p) => ({
        ...p,
        id: p.productId || p.id,
        imageUrl: formatImageUrl(p.imageUrl),
        marketId: p.marketId,
        marketName: p.marketName || "",
        stallNumber: p.stallNumber || p.stallCode || "",
        stallCode: p.stallNumber || p.stallCode || "",
      }));
    } catch (err) {
      console.warn("Failed to fetch farmer products", err);
      return [];
    }
  },
  async createProduct(productData) {
    const res = await apiClient.post("/farmer/products", productData);
    return res.data || res;
  },
  async updateProduct(id, productData) {
    const res = await apiClient.put(`/farmer/products/${id}`, productData);
    return res.data || res;
  },
  async updateProductStatus(id, status) {
    const res = await apiClient.patch(
      `/farmer/products/${id}/status?status=${status}`,
    );
    return res.data || res;
  },
  async deleteProduct(id) {
    const res = await apiClient.delete(`/farmer/products/${id}`);
    return res.data || res;
  },
  async getFarmerOrders({ pickupDate = "", status = "", keyword = "" } = {}) {
    try {
      const params = new URLSearchParams();
      if (pickupDate) params.append("pickupDate", pickupDate);
      if (status && status !== "all") params.append("status", status);
      if (keyword) params.append("keyword", keyword);
      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await apiClient.get(`/farmer/orders${qs}`);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn("Failed to fetch farmer orders", err);
      return [];
    }
  },
  async updateFarmerOrderStatus(orderId, newStatus, reason = "") {
    const res = await apiClient.put(`/farmer/orders/${orderId}/status`, {
      orderStatus: newStatus,
      newStatus,
      reason,
    });
    return res.data || res;
  },
  async getFarmerSummary() {
    try {
      const res = await apiClient.get("/farmer/orders/summary");
      return res.data || res;
    } catch (err) {
      console.warn("Failed to fetch farmer summary", err);
      return null;
    }
  },
  async getBestSellingProducts(limit = 10) {
    try {
      const res = await apiClient.get(
        `/farmer/orders/insights/best-selling?limit=${limit}`,
      );
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn("Failed to fetch best selling products", err);
      return [];
    }
  },
  async getFarmerPickupSlots() {
    try {
      const res = await apiClient.get("/farmer/pickup-slots");
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn("Failed to fetch farmer pickup slots", err);
      return [];
    }
  },
  async createFarmerPickupSlot(slotData) {
    const res = await apiClient.post("/farmer/pickup-slots", slotData);
    return res.data || res;
  },
  async deleteFarmerPickupSlot(id) {
    const res = await apiClient.delete(`/farmer/pickup-slots/${id}`);
    return res.data || res;
  },
  async getFarmerCutoffSettings() {
    try {
      const res = await apiClient.get("/farmer/cutoff-settings");
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn("Failed to fetch cutoff settings", err);
      return [];
    }
  },
  async saveFarmerCutoffSetting(settingData) {
    const res = await apiClient.post("/farmer/cutoff-settings", settingData);
    return res.data || res;
  },
  async deleteFarmerCutoffSetting(id) {
    const res = await apiClient.delete(`/farmer/cutoff-settings/${id}`);
    return res.data || res;
  },
  async getFarmerStockTemplates(params = {}) {
    try {
      const query = new URLSearchParams();
      const marketId = typeof params === "object" ? params.marketId : params;
      const keyword = typeof params === "object" ? params.keyword : "";
      if (marketId && marketId !== "all") query.append("marketId", marketId);
      if (keyword) query.append("keyword", keyword);
      const qs = query.toString() ? `?${query.toString()}` : "";
      const res = await apiClient.get(`/farmer/stock-templates${qs}`);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn("Failed to fetch stock templates", err);
      return [];
    }
  },
  async saveFarmerStockTemplate(templateData) {
    const res = await apiClient.post("/farmer/stock-templates", templateData);
    return res.data || res;
  },
  async deleteFarmerStockTemplate(id) {
    const res = await apiClient.delete(`/farmer/stock-templates/${id}`);
    return res.data || res;
  },
  async getMyMarketAssignments() {
    try {
      const res = await apiClient.get("/farmer/markets/my-assignments");
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn("Failed to fetch my market assignments", err);
      return [];
    }
  },
  async registerMarket({ marketId, stallNumber }) {
    const res = await apiClient.post("/farmer/markets/register", {
      marketId,
      stallNumber,
    });
    return res.data || res;
  },
  async getFarmerKycStatus() {
    try {
      const res = await apiClient.get("/farmer/kyc/my-documents");
      return res.data || res;
    } catch (err) {
      console.warn("Failed to fetch KYC status", err);
      return null;
    }
  },
  async submitFarmerKyc(kycPayload) {
    const res = await apiClient.post("/farmer/kyc/submit", kycPayload);
    return res.data || res;
  },
  async getFarmerReviews(farmerId, keyword = "") {
    try {
      const qs = keyword ? `?keyword=${encodeURIComponent(keyword)}` : "";
      const res = await apiClient.get(`/reviews/farmer/${farmerId}${qs}`);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn(`Failed to fetch reviews for farmer ${farmerId}`, err);
      return [];
    }
  },
  async replyReview(reviewId, replyComment) {
    const res = await apiClient.post(`/farmer/reviews/${reviewId}/reply`, {
      farmerReply: replyComment,
    });
    return res.data || res;
  },
  async getFarmerProfile() {
    try {
      const res = await apiClient.get("/users/profile");
      return res.data || res;
    } catch (err) {
      console.warn("Failed to fetch farmer profile", err);
      return null;
    }
  },
  async updateFarmerProfile(profileData) {
    const res = await apiClient.put("/users/profile", profileData);
    return res.data || res;
  },
  async updateAvatar(avatarUrl) {
    const res = await apiClient.patch("/users/profile/avatar", {
      avatarUrl,
    });
    return res.data || res;
  },
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post("/upload/image", formData);
    return res.data || res;
  },
};
export default farmerService;
