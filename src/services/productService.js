import apiClient, { formatImageUrl } from "./apiClient";
export const productService = {
  async getProducts({
    categoryId = "",
    farmerId = "",
    marketId = "",
    stallNumber = "",
    keyword = "",
    status = "AVAILABLE",
  } = {}) {
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append("categoryId", categoryId);
      if (farmerId) params.append("farmerId", farmerId);
      if (marketId) params.append("marketId", marketId);
      if (stallNumber) params.append("stallNumber", stallNumber);
      if (keyword) params.append("keyword", keyword);
      if (status) params.append("status", status);
      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await apiClient.get(`/products${qs}`);
      let rawList = [];
      if (Array.isArray(res)) rawList = res;
      else if (res && Array.isArray(res.data)) rawList = res.data;
      else if (res && Array.isArray(res.value)) rawList = res.value;
      const isEn = typeof window !== "undefined" && localStorage.getItem("ml_language") === "en";
      const fallbackFarmer = isEn ? "Member Family Farm" : "Nông Trại Thành Viên";
      const fallbackStall = isEn ? "Standard Stall" : "Sạp Tiêu Chuẩn";
      const fallbackMarket = isEn ? "Farmers' Market" : "Chợ Phiên Nông Sản";

      return rawList.map((p) => ({
        ...p,
        id: p.productId || p.id,
        farmerId: p.farmerId || p.farmer?.id || p.farmerUserId || p.userId,
        imageUrl: formatImageUrl(p.imageUrl),
        farmerName: p.farmerStallName || p.farmerName || fallbackFarmer,
        stallNumber: p.stallNumber || p.stallCode || fallbackStall,
        stallCode: p.stallNumber || p.stallCode || fallbackStall,
        marketId: p.marketId,
        marketName: p.marketName || fallbackMarket,
      }));
    } catch (err) {
      console.warn("Failed to fetch products from backend", err);
      return [];
    }
  },
  async getCategories() {
    try {
      const res = await apiClient.get("/categories");
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err) {
      console.warn("Failed to fetch categories from backend", err);
      return [];
    }
  },
  async getProductById(id) {
    const res = await apiClient.get(`/products/${id}`);
    const p = res.data || res;
    return {
      ...p,
      id: p.productId || p.id,
      farmerId: p.farmerId || p.farmer?.id || p.farmerUserId || p.userId,
      imageUrl: formatImageUrl(p.imageUrl),
      farmerName: p.farmerStallName || p.farmerName || "Nông Trại Thành Viên",
    };
  },
};
export default productService;
