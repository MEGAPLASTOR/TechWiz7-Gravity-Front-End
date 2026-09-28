import React, { useState, useEffect, useRef, useMemo } from "react";
import "@/assets/styles/pages/farmer/FarmerInventoryPage.css";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Pagination from "../../components/common/Pagination";
import FarmerProductModal from "../../components/farmer/FarmerProductModal";
import farmerService from "../../services/farmerService";
import { useLanguage } from "../../context/LanguageContext";

const getDayOfWeekName = (day, isEn) => {
  const viMap = {
    1: "Thứ Hai",
    2: "Thứ Ba",
    3: "Thứ Tư",
    4: "Thứ Năm",
    5: "Thứ Sáu",
    6: "Thứ Bảy",
    7: "Chủ Nhật",
  };
  const enMap = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
  };
  return isEn ? (enMap[day] || `Day ${day}`) : (viMap[day] || `Thứ ${day}`);
};

export default function FarmerInventoryPage({ onNavigate }) {
  const { isEn, localizeProduceName, localizeCategoryName, localizeUnit, localizeMarketName } = useLanguage();
  const [activeMainTab, setActiveMainTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [stockTemplates, setStockTemplates] = useState([]);
  const [assignedMarkets, setAssignedMarkets] = useState([]);
  const [kycStatus, setKycStatus] = useState(() => {
    return localStorage.getItem("ml_kyc_status") || "UNVERIFIED";
  });
  const [kycLoaded, setKycLoaded] = useState(false);
  const redirectedToKyc = useRef(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStallFilter, setSelectedStallFilter] = useState("all");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [templatePage, setTemplatePage] = useState(1);
  const PAGE_SIZE = 15;
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    productId: "",
    marketId: "",
    dayOfWeek: "",
    recurringQuantity: "",
  });

  const paginatedTemplates = useMemo(() => {
    const start = (templatePage - 1) * PAGE_SIZE;
    return stockTemplates.slice(start, start + PAGE_SIZE);
  }, [stockTemplates, templatePage]);

  useEffect(() => {
    const handleKycChange = () => {
      const stored = localStorage.getItem("ml_kyc_status");
      if (stored) setKycStatus(stored);
    };
    window.addEventListener("ml_kyc_changed", handleKycChange);
    window.addEventListener("storage", handleKycChange);
    return () => {
      window.removeEventListener("ml_kyc_changed", handleKycChange);
      window.removeEventListener("storage", handleKycChange);
    };
  }, []);

  const isAnyModalOpen = Boolean(isProductModalOpen || isTemplateModalOpen);
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAnyModalOpen]);

  const showSuccess = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(""), 4000);
  };

  const loadData = async (
    kw = searchKeyword,
    cat = selectedCategory,
    stall = selectedStallFilter,
  ) => {
    setLoading(true);
    try {
      const [prods, templates, markets, kyc] = await Promise.all([
        farmerService.getFarmerProducts({
          keyword: (kw || "").trim(),
          categoryId: cat !== "all" && !isNaN(cat) ? cat : "",
          marketId: stall !== "all" && !isNaN(stall) ? stall : "",
        }),
        farmerService.getFarmerStockTemplates((kw || "").trim()),
        farmerService.getMyMarketAssignments(),
        farmerService.getFarmerKycStatus(),
      ]);
      const statusFromApi =
        kyc?.kycStatus || (kyc?.isApproved ? "VERIFIED" : "UNVERIFIED");
      const effectiveKyc = statusFromApi;
      setKycStatus(effectiveKyc);
      setKycLoaded(true);
      if (prods && prods.length > 0) {
        setProducts(
          prods.map((p) => ({
            ...p,
            id: p.productId || p.id,
            name: p.name,
            categoryName: p.categoryName || (isEn ? "Clean Produce" : "Nông sản sạch"),
            price: p.price,
            unit: p.unit || "kg",
            stockQuantity: p.currentStock != null ? p.currentStock : (p.stockQuantity ?? 0),
            inStock:
              p.status === "AVAILABLE" ||
              (p.currentStock != null && p.currentStock > 0),
            harvestTime: p.harvestTime || "",
            cutoffTime: p.cutoffTime || "",
            imageUrl: p.imageUrl,
            organicCertified: p.organicCertified ?? p.isOrganic ?? false,
          })),
        );
      } else {
        setProducts([]);
      }
      setStockTemplates(templates || []);
      setAssignedMarkets(markets || []);
      if (prods && prods.length > 0) {
        setTemplateForm((prev) => ({
          ...prev,
          productId: prods[0].productId || prods[0].id,
        }));
      }
      if (markets && markets.length > 0) {
        setTemplateForm((prev) => ({
          ...prev,
          marketId: markets[0].marketId,
        }));
      }
    } catch (err) {
      console.warn("Error loading farmer inventory data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(searchKeyword, selectedCategory, selectedStallFilter);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchKeyword, selectedCategory, selectedStallFilter]);

  useEffect(() => {
    if (kycLoaded && kycStatus !== "VERIFIED" && !redirectedToKyc.current) {
      redirectedToKyc.current = true;
      onNavigate?.("farmer-stall", { tab: "kyc" });
    }
  }, [kycLoaded, kycStatus, onNavigate]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  const handleToggleStock = async (p) => {
    const nextInStock = !p.inStock;
    if (nextInStock && kycStatus !== "VERIFIED") {
      showSuccess(isEn ? "KYC profile must be approved before opening sales on stall." : "Hồ sơ KYC phải được quản trị viên duyệt trước khi mở bán trên sạp.");
      onNavigate?.("farmer-stall", { tab: "kyc" });
      return;
    }
    const nextStatus = nextInStock ? "AVAILABLE" : "SOLD_OUT";
    const nextQty = nextInStock
      ? p.stockQuantity > 0
        ? p.stockQuantity
        : 15
      : 0;
    setProducts((prev) =>
      prev.map((item) =>
        item.id === p.id
          ? {
              ...item,
              inStock: nextInStock,
              stockQuantity: nextQty,
            }
          : item,
      ),
    );
    try {
      await farmerService.updateProductStatus(p.id, nextStatus);
      showSuccess(
        isEn
          ? `Updated produce availability: ${nextInStock ? "Accepting pre-orders" : "Sold out"}`
          : `Đã cập nhật trạng thái nông sản: ${nextInStock ? "Mở nhận đặt" : "Tạm hết hàng"}`,
      );
    } catch (err) {
      console.warn("Backend updateProductStatus failed", err);
    }
  };

  const handleAdjustQty = async (p, delta) => {
    if (kycStatus !== "VERIFIED") {
      showSuccess(isEn ? "Please complete KYC verification before updating stock." : "Vui lòng hoàn tất và chờ duyệt KYC trước khi cập nhật tồn kho.");
      onNavigate?.("farmer-stall", { tab: "kyc" });
      return;
    }
    const newQty = Math.max(0, p.stockQuantity + delta);
    setProducts((prev) =>
      prev.map((item) =>
        item.id === p.id
          ? {
              ...item,
              stockQuantity: newQty,
              inStock: newQty > 0 ? item.inStock : false,
            }
          : item,
      ),
    );
    try {
      await farmerService.updateProductStock(p.id, newQty);
      showSuccess(isEn ? `Updated quota: ${p.name} -> ${newQty} ${p.unit}` : `Đã cập nhật định mức: ${p.name} -> ${newQty} ${p.unit}`);
    } catch (err) {
      console.warn("Failed adjusting stock on backend", err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (
      window.confirm(
        isEn
          ? "Are you sure you want to remove this produce item from your stall?"
          : "Bạn có chắc chắn muốn xóa nông sản này khỏi sạp?",
      )
    ) {
      try {
        await farmerService.deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showSuccess(isEn ? "Produce item removed from stall." : "Đã gỡ nông sản khỏi sạp.");
      } catch (err) {
        console.error("Delete failed on backend", err);
        showSuccess(isEn ? "Produce item deleted." : "Đã xóa sản phẩm.");
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await farmerService.updateProduct(editingProduct.id, productData);
        showSuccess(isEn ? "Updated produce details successfully!" : "Đã cập nhật thông tin nông sản thành công!");
      } else {
        await farmerService.createProduct(productData);
        showSuccess(isEn ? "Added new fresh produce to your stall!" : "Đã thêm nông sản tươi mới vào sạp thành công!");
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      await loadData();
    } catch (err) {
      console.error("Failed saving product", err);
      throw err;
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (
      window.confirm(
        isEn
          ? "Are you sure you want to delete this weekly quota template?"
          : "Bạn có chắc muốn xóa định mức định kỳ này?",
      )
    ) {
      try {
        await farmerService.deleteFarmerStockTemplate(templateId);
        setStockTemplates((prev) =>
          prev.filter((t) => t.templateId !== templateId),
        );
        showSuccess(isEn ? "Weekly quota template deleted." : "Đã xóa định mức tồn kho mẫu.");
      } catch (err) {
        console.error("Failed to delete stock template", err);
        showSuccess(isEn ? "Deleted stock template." : "Đã xóa định mức mẫu.");
        setStockTemplates((prev) =>
          prev.filter((t) => t.templateId !== templateId),
        );
      }
    }
  };

  const submitTemplate = async (e) => {
    e.preventDefault();
    setSavingTemplate(true);
    try {
      await farmerService.createFarmerStockTemplate({
        productId: Number(templateForm.productId),
        marketId: Number(templateForm.marketId),
        dayOfWeek: Number(templateForm.dayOfWeek),
        recurringQuantity: Number(templateForm.recurringQuantity),
      });
      showSuccess(isEn ? "Created weekly quota template successfully!" : "Đã tạo định mức mẫu phân bổ hàng tuần thành công!");
      setIsTemplateModalOpen(false);
      const updated = await farmerService.getFarmerStockTemplates();
      setStockTemplates(updated || []);
    } catch (err) {
      console.warn("Failed to create template", err);
      alert((isEn ? "Failed to create quota: " : "Không thể tạo định mức: ") + (err.response?.data?.message || err.message));
    } finally {
      setSavingTemplate(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchStall =
        selectedStallFilter === "all" ||
        String(p.marketId) === String(selectedStallFilter);
      return matchStall;
    });
  }, [products, selectedStallFilter]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedCategory, selectedStallFilter]);

  const isVerified = kycStatus === "VERIFIED";

  return (
    <div className="ml-farmer-inventory-page">
      <div className="ml-inv-banner">
        <div className="ml-container ml-inv-banner-inner">
          <div>
            <span className="ml-section-subtitle">
              {isEn ? "Produce & Quotas Management" : "Quản Trị Kho & Định Mức"}
            </span>
            <h1 className="ml-inv-title">
              {isEn ? "Stall Inventory & Availability" : "Kho Nông Sản & Tình Trạng Bán Tại Sạp"}
            </h1>
            <p className="ml-inv-desc">
              {isEn
                ? "Control harvest quantities, toggle pre-order availability, manage recurring weekly quotas, and post fresh produce for weekend markets."
                : "Chủ động kiểm soát sản lượng rau củ, bật/tắt nhận đơn đặt trước, quản lý định mức bán hàng tuần và bổ sung nông sản mới cho phiên chợ."}
            </p>
          </div>

          <div className="ml-inv-actions">
            {activeMainTab === "products" ? (
              <Button
                variant={isVerified ? "accent" : "secondary"}
                size="lg"
                className={!isVerified ? "ml-btn-unverified" : ""}
                title={
                  !isVerified
                    ? (isEn ? "KYC verification required before listing produce" : "Tài khoản cần được duyệt KYC trước khi đăng bán")
                    : ""
                }
                onClick={() => {
                  if (!isVerified) {
                    showSuccess(
                      isEn
                        ? "KYC documents must be approved before listing produce."
                        : "Hồ sơ KYC phải được quản trị viên duyệt trước khi đăng bán nông sản.",
                    );
                    if (onNavigate) onNavigate("farmer-stall", { tab: "kyc" });
                    return;
                  }
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
              >
                {isVerified
                  ? (isEn ? "+ Post New Produce" : "+ Đăng bán nông sản mới")
                  : (isEn ? "🔒 Post Produce (Pending KYC)" : "🔒 Đăng bán nông sản (Chờ duyệt KYC)")}
              </Button>
            ) : (
              <Button
                variant={isVerified ? "accent" : "secondary"}
                size="lg"
                className={!isVerified ? "ml-btn-unverified" : ""}
                title={
                  !isVerified
                    ? (isEn ? "KYC verification required before creating quotas" : "Tài khoản cần được duyệt KYC trước khi thêm định mức")
                    : ""
                }
                onClick={() => {
                  if (!isVerified) {
                    showSuccess(
                      isEn
                        ? "KYC documents must be approved before creating quotas."
                        : "Hồ sơ KYC phải được quản trị viên duyệt trước khi thêm định mức.",
                    );
                    if (onNavigate) onNavigate("farmer-stall", { tab: "kyc" });
                    return;
                  }
                  setIsTemplateModalOpen(true);
                }}
              >
                {isVerified
                  ? (isEn ? "+ Add Weekly Quota" : "+ Thêm định mức tuần mới")
                  : (isEn ? "🔒 Add Quota (Pending KYC)" : "🔒 Thêm định mức (Chờ duyệt KYC)")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="ml-container ml-inv-content">
        {actionSuccessMsg && (
          <div className="ml-alert-success">✓ {actionSuccessMsg}</div>
        )}

        <div className="ml-inv-main-tabs">
          <button
            type="button"
            className={`ml-inv-main-tab ${activeMainTab === "products" ? "active" : ""}`}
            onClick={() => setActiveMainTab("products")}
          >
            📦 {isEn ? `Listed Produce (${products.length})` : `Nông sản đang bán (${products.length})`}
          </button>
          <button
            type="button"
            className={`ml-inv-main-tab ${activeMainTab === "templates" ? "active" : ""}`}
            onClick={() => setActiveMainTab("templates")}
          >
            🔁 {isEn ? `Weekly Recurring Quotas (${stockTemplates.length})` : `Định mức tồn kho hàng tuần (${stockTemplates.length})`}
          </button>
        </div>

        {activeMainTab === "products" && (
          <>
            <div className="ml-card ml-inv-controls">
              <div className="ml-inv-search-box-wrap">
                <div className="ml-inv-search">
                  <span className="ml-inv-search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder={isEn ? "Search produce in your stall..." : "Tìm theo tên rau, củ, quả trong sạp..."}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="ml-inv-search-input"
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      className="ml-clear-search-btn"
                      onClick={() => setSearchKeyword("")}
                      title={isEn ? "Clear search" : "Xóa tìm kiếm"}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="ml-farmer-quick-tags">
                  <span className="ml-farmer-quick-label">{isEn ? "Hints:" : "Gợi ý:"}</span>
                  {[isEn ? "Spinach" : "Cải bó xôi", isEn ? "Tomatoes" : "Cà chua", isEn ? "Strawberries" : "Dâu tây", isEn ? "Mushrooms" : "Nấm", isEn ? "Water spinach" : "Rau muống"].map((tag, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`ml-farmer-tag-chip ${searchKeyword === tag ? "active" : ""}`}
                      onClick={() => setSearchKeyword(searchKeyword === tag ? "" : tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ml-inv-filters">
                <button
                  type="button"
                  className={`ml-inv-chip ${selectedCategory === "all" ? "active" : ""}`}
                  onClick={() => setSelectedCategory("all")}
                >
                  {isEn ? `All (${products.length})` : `Tất cả (${products.length})`}
                </button>
                <button
                  type="button"
                  className={`ml-inv-chip ${selectedCategory === "veg" ? "active" : ""}`}
                  onClick={() => setSelectedCategory("veg")}
                >
                  🥬 {isEn ? "Leafy Greens" : "Rau ăn lá"}
                </button>
                <button
                  type="button"
                  className={`ml-inv-chip ${selectedCategory === "fruit_veg" ? "active" : ""}`}
                  onClick={() => setSelectedCategory("fruit_veg")}
                >
                  🥕 {isEn ? "Roots & Veggies" : "Củ quả"}
                </button>
                <button
                  type="button"
                  className={`ml-inv-chip ${selectedCategory === "fruit" ? "active" : ""}`}
                  onClick={() => setSelectedCategory("fruit")}
                >
                  🍓 {isEn ? "Fruits" : "Trái cây"}
                </button>

                {assignedMarkets.length > 0 && (
                  <select
                    className="ml-inv-stall-select"
                    value={selectedStallFilter}
                    onChange={(e) => setSelectedStallFilter(e.target.value)}
                  >
                    <option value="all">
                      🏪 {isEn ? `All stalls & markets (${products.length})` : `Tất cả sạp & chợ (${products.length})`}
                    </option>
                    {assignedMarkets.map((m, idx) => (
                      <option key={idx} value={m.marketId}>
                        {m.stallNumber || (isEn ? "Stall" : "Sạp")} —{" "}
                        {localizeMarketName(m.marketName || `Market #${m.marketId}`)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {loading && (
              <div className="ml-inv-loading">
                {isEn ? "Loading produce inventory..." : "Đang tải nông sản từ máy chủ..."}
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="ml-card ml-inv-empty">
                <span className="ml-inv-empty-icon">🌱</span>
                <h3>{isEn ? "Your stall inventory is currently empty" : "Kho nông sản của bạn đang trống"}</h3>
                <p>
                  {isVerified
                    ? (isEn ? "Start listing fresh early-harvest produce for this weekend's farmers' market." : "Bắt đầu đăng bán những món rau củ thu hoạch sớm đầu tiên cho phiên chợ cuối tuần.")
                    : (isEn ? "Your account is awaiting KYC & VietGAP verification. Admin must approve your profile before you can list produce." : "Tài khoản của bạn chưa được duyệt định danh KYC & VietGAP. Bạn cần được quản trị viên phê duyệt hồ sơ trước khi mở bán nông sản.")}
                </p>
                <Button
                  variant={isVerified ? "primary" : "secondary"}
                  size="md"
                  className={!isVerified ? "ml-btn-unverified" : ""}
                  title={
                    !isVerified
                      ? (isEn ? "KYC pending. Please complete your profile to post produce." : "Chưa được duyệt KYC. Hãy hoàn tất hồ sơ để đăng món.")
                      : ""
                  }
                  onClick={() => {
                    if (!isVerified) {
                      showSuccess(
                        isEn ? "KYC must be approved before posting produce." : "Hồ sơ KYC phải được quản trị viên duyệt trước khi đăng bán nông sản.",
                      );
                      if (onNavigate) onNavigate("farmer-stall", { tab: "kyc" });
                      return;
                    }
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                >
                  {isVerified
                    ? (isEn ? "Post First Item" : "Đăng món đầu tiên")
                    : (isEn ? "🔒 Post First Item (Pending KYC)" : "🔒 Đăng món đầu tiên (Chưa duyệt KYC)")}
                </Button>
                {!isVerified && (
                  <div className="ml-inv-unverified-hint">
                    <span>
                      {isEn ? "Haven't submitted or want to check status? " : "Chưa nộp hoặc muốn kiểm tra hồ sơ? "}
                      <button
                        type="button"
                        onClick={() => onNavigate && onNavigate("farmer-stall", { tab: "kyc" })}
                        className="ml-inv-link-stall"
                      >
                        {isEn ? "Go to Stall Profile & KYC →" : "Vào Hồ sơ sạp & Định danh KYC →"}
                      </button>
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="ml-inv-grid">
                  {paginatedProducts.map((p) => (
                    <div
                      key={p.id}
                      className={`ml-card ml-inv-card ${!p.inStock ? "out-of-stock" : ""}`}
                    >
                      <div className="ml-inv-card-body">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="ml-inv-img"
                        />

                        <div className="ml-inv-info">
                          <div className="ml-inv-badges">
                            {p.inStock ? (
                              <Badge variant="ready" size="sm">
                                {isEn ? "Accepting Orders" : "Đang mở đặt"}
                              </Badge>
                            ) : (
                              <Badge variant="cancelled" size="sm">
                                {isEn ? "Temporarily Sold Out" : "Tạm hết hàng"}
                              </Badge>
                            )}
                            {p.organicCertified && (
                              <Badge variant="organic" size="sm">
                                {isEn ? "VietGAP / Organic" : "VietGAP / Hữu cơ"}
                              </Badge>
                            )}
                          </div>

                          <h4 className="ml-inv-name">{localizeProduceName(p.name)}</h4>
                          <div className="ml-inv-price">
                            {formatCurrency(p.price)}{" "}
                            <span className="ml-unit">/ {localizeUnit(p.unit)}</span>
                          </div>

                          <div className="ml-inv-meta">
                            <span
                              style={{
                                color: "#15803d",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              🏪 {p.stallNumber || p.stallCode || (isEn ? "Stall" : "Chưa gán sạp")}{" "}
                              — {localizeMarketName(p.marketName || (isEn ? "Farmers' Market" : "Chợ phiên"))}
                            </span>
                            {p.harvestTime && <span>🌱 {p.harvestTime}</span>}
                            {p.cutoffTime && <span>⏰ {p.cutoffTime}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="ml-inv-card-footer">
                        <div className="ml-inv-stock-control">
                          <span className="ml-stock-label">
                            {isEn ? "Pre-order reservation quota:" : "Số lượng có thể nhận đặt:"}
                          </span>
                          <div className="ml-stock-stepper">
                            <button
                              type="button"
                              className="ml-step-btn"
                              onClick={() => handleAdjustQty(p, -5)}
                              disabled={!p.inStock || p.stockQuantity <= 0}
                            >
                              -5
                            </button>
                            <button
                              type="button"
                              className="ml-step-btn"
                              onClick={() => handleAdjustQty(p, -1)}
                              disabled={!p.inStock || p.stockQuantity <= 0}
                            >
                              -1
                            </button>
                            <span className="ml-stock-display">
                              <strong>{p.stockQuantity}</strong> {localizeUnit(p.unit)}
                            </span>
                            <button
                              type="button"
                              className="ml-step-btn"
                              onClick={() => handleAdjustQty(p, +1)}
                            >
                              +1
                            </button>
                            <button
                              type="button"
                              className="ml-step-btn"
                              onClick={() => handleAdjustQty(p, +5)}
                            >
                              +5
                            </button>
                          </div>
                        </div>

                        <div className="ml-inv-action-buttons">
                          <Button
                            variant={p.inStock ? "outline" : "primary"}
                            size="sm"
                            onClick={() => handleToggleStock(p)}
                          >
                            {p.inStock
                              ? (isEn ? "Pause Pre-orders" : "Tạm dừng nhận đơn")
                              : (isEn ? "Resume Pre-orders" : "Mở lại đặt trước")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (kycStatus !== "VERIFIED") {
                                showSuccess(isEn ? "Please complete KYC verification before editing produce." : "Vui lòng hoàn tất và chờ duyệt KYC trước khi chỉnh sửa sản phẩm.");
                                onNavigate("farmer-stall", { tab: "kyc" });
                                return;
                              }
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                          >
                            ✏️ {isEn ? "Edit" : "Sửa"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="btn-danger-text"
                            onClick={() => handleDeleteProduct(p.id)}
                          >
                            🗑️ {isEn ? "Delete" : "Xóa"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredProducts.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 320, behavior: "smooth" });
                  }}
                />
              </>
            )}
          </>
        )}

        {activeMainTab === "templates" && (
          <div className="ml-card ml-templates-section">
            <div className="ml-templates-header">
              <div>
                <h3 className="ml-card-title">
                  {isEn ? "🔁 Weekly Recurring Harvest & Stock Quotas" : "🔁 Định mức phân bổ sản lượng tự động hàng tuần"}
                </h3>
                <p className="ml-templates-desc">
                  {isEn
                    ? "Pre-configure harvest quantities expected for each market day of the week. The platform automatically resets pre-order availability for each market cycle."
                    : "Thiết lập sẵn sản lượng nông sản bạn dự kiến thu hoạch và mang đến từng phiên chợ theo thứ trong tuần. Hệ thống tự động kích hoạt số lượng mở bán mỗi chu kỳ họp chợ mà không cần nhập tay lại."}
                </p>
              </div>
              <Button
                variant={isVerified ? "primary" : "secondary"}
                size="md"
                className={!isVerified ? "ml-btn-unverified" : ""}
                title={
                  !isVerified
                    ? (isEn ? "KYC verification required before creating quotas" : "Tài khoản cần được duyệt KYC trước khi thêm định mức")
                    : ""
                }
                onClick={() => {
                  if (!isVerified) {
                    showSuccess(
                      isEn ? "KYC must be approved before adding recurring quota." : "Hồ sơ KYC phải được duyệt trước khi thêm định mức.",
                    );
                    return;
                  }
                  setIsTemplateModalOpen(true);
                }}
              >
                {isVerified
                  ? (isEn ? "+ Add New Quota" : "+ Thêm định mức mới")
                  : (isEn ? "🔒 Add Quota (Pending KYC)" : "🔒 Thêm định mức (Chờ KYC)")}
              </Button>
            </div>

            {stockTemplates.length === 0 ? (
              <div className="ml-templates-empty">
                <span className="ml-templates-empty-icon">📅</span>
                <h4>{isEn ? "No weekly quotas created yet" : "Chưa có định mức tuần nào được tạo"}</h4>
                <p>
                  {isEn
                    ? "Adding weekly quotas helps your farm automatically open reservations for weekend market sessions."
                    : "Thêm định mức hàng tuần giúp nông trại tự động mở bán đúng ngày họp chợ phiên."}
                </p>
                <Button
                  variant={isVerified ? "outline" : "secondary"}
                  size="sm"
                  className={!isVerified ? "ml-btn-unverified" : ""}
                  title={
                    !isVerified
                      ? (isEn ? "KYC verification required before creating quotas" : "Tài khoản cần được duyệt KYC trước khi tạo định mức")
                      : ""
                  }
                  onClick={() => {
                    if (!isVerified) {
                      showSuccess(
                        isEn ? "KYC must be approved before creating quotas." : "Hồ sơ KYC phải được duyệt trước khi tạo định mức.",
                      );
                      if (onNavigate) onNavigate("farmer-stall", { tab: "kyc" });
                      return;
                    }
                    setIsTemplateModalOpen(true);
                  }}
                >
                  {isVerified
                    ? (isEn ? "Create First Quota" : "Tạo định mức đầu tiên")
                    : (isEn ? "🔒 Create First Quota (Pending KYC)" : "🔒 Tạo định mức đầu tiên (Chờ KYC)")}
                </Button>
              </div>
            ) : (
              <>
                <div className="ml-templates-table-wrap">
                  <table className="ml-templates-table">
                    <thead>
                      <tr>
                        <th>{isEn ? "Day of Week" : "Thứ trong tuần"}</th>
                        <th>{isEn ? "Produce" : "Nông sản"}</th>
                        <th>{isEn ? "Designated Market" : "Chợ phiên áp dụng"}</th>
                        <th>{isEn ? "Recurring Quota" : "Định mức mở bán"}</th>
                        <th>{isEn ? "Status" : "Trạng thái"}</th>
                        <th className="text-right">{isEn ? "Action" : "Thao tác"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTemplates.map((t) => (
                        <tr key={t.templateId}>
                          <td>
                            <span className="ml-day-badge">
                              {getDayOfWeekName(t.dayOfWeek, isEn)}
                            </span>
                          </td>
                          <td>
                            <div className="ml-tbl-prod">
                              <strong>
                                {localizeProduceName(t.productName || (isEn ? `Produce #${t.productId}` : `Sản phẩm #${t.productId}`))}
                              </strong>
                              <span className="ml-tbl-unit">
                                {formatCurrency(t.productPrice)} /{" "}
                                {localizeUnit(t.productUnit || "kg")}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="ml-tbl-market">
                              🎪 {localizeMarketName(t.marketName || (isEn ? `Market #${t.marketId}` : `Chợ #${t.marketId}`))}
                            </span>
                          </td>
                          <td>
                            <strong className="ml-tbl-qty">
                              {t.recurringQuantity} {localizeUnit(t.productUnit || "kg")}
                            </strong>
                          </td>
                          <td>
                            <Badge
                              variant={t.isActive ? "ready" : "cancelled"}
                              size="sm"
                            >
                              {t.isActive ? (isEn ? "Active" : "Đang kích hoạt") : (isEn ? "Paused" : "Tạm ngưng")}
                            </Badge>
                          </td>
                          <td className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="btn-danger-text"
                              onClick={() => handleDeleteTemplate(t.templateId)}
                            >
                              🗑️ {isEn ? "Delete" : "Xóa"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={templatePage}
                  totalItems={stockTemplates.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setTemplatePage}
                />
              </>
            )}
          </div>
        )}
      </div>

      {isProductModalOpen && (
        <FarmerProductModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          assignedMarkets={assignedMarkets}
          onSave={handleSaveProduct}
        />
      )}

      {isTemplateModalOpen && (
        <div className="ml-modal-overlay">
          <div className="ml-modal-box">
            <div className="ml-modal-header">
              <h3>{isEn ? "Add Weekly Stock Quota Template" : "Thêm định mức tồn kho mẫu hàng tuần"}</h3>
              <button
                type="button"
                className="ml-modal-close"
                onClick={() => setIsTemplateModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitTemplate} className="ml-modal-form">
              <div className="ml-form-group">
                <label className="ml-form-label">
                  {isEn ? "Select farm produce:" : "Chọn nông sản trong vườn:"}
                </label>
                <select
                  className="ml-form-input"
                  value={templateForm.productId}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      productId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">{isEn ? "-- Select produce --" : "-- Chọn sản phẩm --"}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {localizeProduceName(p.name)} ({formatCurrency(p.price)} / {localizeUnit(p.unit)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="ml-form-group">
                <label className="ml-form-label">{isEn ? "Designated Farmers' Market:" : "Chợ phiên áp dụng:"}</label>
                <select
                  className="ml-form-input"
                  value={templateForm.marketId}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      marketId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">{isEn ? "-- Select market session --" : "-- Chọn chợ phiên --"}</option>
                  {assignedMarkets.map((m) => (
                    <option
                      key={m.assignmentId || m.marketId}
                      value={m.marketId}
                    >
                      {localizeMarketName(m.marketName || `Market #${m.marketId}`)} - {isEn ? "Stall:" : "Sạp:"}{" "}
                      {m.stallNumber || (isEn ? "Main" : "Chính")}
                    </option>
                  ))}
                  {assignedMarkets.length === 0 && (
                    <option value="" disabled>
                      {isEn ? "No allocated stalls" : "Chưa có sạp được phân bổ"}
                    </option>
                  )}
                </select>
              </div>

              <div className="ml-form-grid-2">
                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Market Day of Week:" : "Thứ họp chợ hàng tuần:"}
                  </label>
                  <select
                    className="ml-form-input"
                    value={templateForm.dayOfWeek}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        dayOfWeek: Number(e.target.value),
                      })
                    }
                    required
                  >
                    <option value={6}>{isEn ? "Saturday (Main Weekend Market)" : "Thứ Bảy (Phiên chính cuối tuần)"}</option>
                    <option value={7}>{isEn ? "Sunday (Weekend Market)" : "Chủ Nhật (Phiên cuối tuần)"}</option>
                    <option value={1}>{isEn ? "Monday" : "Thứ Hai"}</option>
                    <option value={2}>{isEn ? "Tuesday" : "Thứ Ba"}</option>
                    <option value={3}>{isEn ? "Wednesday" : "Thứ Tư"}</option>
                    <option value={4}>{isEn ? "Thursday" : "Thứ Năm"}</option>
                    <option value={5}>{isEn ? "Friday" : "Thứ Sáu"}</option>
                  </select>
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Harvest Quota (kg/bundle):" : "Sản lượng định mức (kg/bó):"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    className="ml-form-input"
                    value={templateForm.recurringQuantity}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        recurringQuantity: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="ml-modal-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsTemplateModalOpen(false)}
                >
                  {isEn ? "Cancel" : "Hủy bỏ"}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={savingTemplate}
                >
                  {isEn ? "Save Recurring Quota" : "Lưu định mức tự động"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
