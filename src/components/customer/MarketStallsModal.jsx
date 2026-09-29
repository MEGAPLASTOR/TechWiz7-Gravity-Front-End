import React, { useState, useEffect, useMemo } from "react";
import "@/assets/styles/components/customer/MarketStallsModal.css";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import Button from "../common/Button";
import marketService from "../../services/marketService";
import productService from "../../services/productService";
import { formatImageUrl } from "../../services/apiClient";
import { useLanguage } from "../../context/LanguageContext";

export default function MarketStallsModal({
  isOpen,
  onClose,
  market,
  onAddToCart,
  cartItems = [],
  onUpdateCartQty,
  onViewScheduleMap,
  onOpenFullProducts,
}) {
  const { t, isEn, localizeProduceName, localizeMarketName, localizeStallName } = useLanguage();
  const [activeTab, setActiveTab] = useState("products");
  const [selectedStallCode, setSelectedStallCode] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const marketId = market?.id || market?.marketId || "";
  const marketName = market?.name || "";
  const [stalls, setStalls] = useState([]);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    let isMounted = true;
    async function loadStalls() {
      if (!marketId) return;
      try {
        const farmers = await marketService.getMarketFarmers(marketId);
        if (isMounted) {
          if (Array.isArray(farmers) && farmers.length > 0) {
            const mapped = farmers.map((f, idx) => ({
              stallNumber: f.stallNumber || `Sạp ${idx + 1}`,
              stallName:
                f.stallName || f.farmerName || `Sạp Nông Dân #${idx + 1}`,
              farmerName: f.farmerName || "Chủ nông trại",
              phone: f.phoneNumber || "",
              farmAddress: f.farmAddress || "Vùng trồng liên kết",
              bio: f.bio || "Chuyên cung cấp nông sản sạch cho phiên chợ.",
              avatarUrl: formatImageUrl(
                f.avatarUrl,
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
              ),
              featuredItems: ["Rau hữu cơ", "Củ quả tươi", "Trái cây sạch"],
            }));
            setStalls(mapped);
          } else {
            setStalls([]);
          }
        }
      } catch (err) {
        console.warn("Failed to load stalls for market:", err);
        if (isMounted) setStalls([]);
      }
    }
    async function loadProducts() {
      try {
        let prods = await productService.getProducts({
          marketId,
          status: "AVAILABLE",
        });
        if (isMounted) {
          if (Array.isArray(prods) && prods.length > 0) {
            setProducts(prods);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.warn("Failed to load products for market modal:", err);
        if (isMounted) setProducts([]);
      }
    }
    loadStalls();
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [marketId, marketName, market?.city]);
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      let matchStall = selectedStallCode === "all";
      if (!matchStall && selectedStallCode) {
        const normSelected = selectedStallCode
          .toLowerCase()
          .replace(/[\s\-_:]+/g, "");
        const normStallNum = (p.stallNumber || "")
          .toLowerCase()
          .replace(/[\s\-_:]+/g, "");
        const normStallCode = (p.stallCode || "")
          .toLowerCase()
          .replace(/[\s\-_:]+/g, "");
        matchStall =
          (normStallNum && normStallNum === normSelected) ||
          (normStallCode && normStallCode === normSelected) ||
          (p.stallNumber &&
            p.stallNumber
              .toLowerCase()
              .includes(selectedStallCode.toLowerCase())) ||
          (p.stallCode &&
            p.stallCode
              .toLowerCase()
              .includes(selectedStallCode.toLowerCase())) ||
          (p.farmerStallName &&
            p.farmerStallName
              .toLowerCase()
              .includes(selectedStallCode.toLowerCase())) ||
          (p.farmerName &&
            p.farmerName
              .toLowerCase()
              .includes(selectedStallCode.toLowerCase()));
      }
      const matchCategory =
        selectedCategory === "all" ||
        String(p.categoryId) === String(selectedCategory);
      const matchSearch =
        searchTerm === "" ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.farmerName &&
          p.farmerName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchStall && matchCategory && matchSearch;
    });
  }, [products, selectedStallCode, selectedCategory, searchTerm]);
  const getCartQty = (prodId) => {
    const found = cartItems.find((item) => item.id === prodId);
    return found ? found.quantity : 0;
  };
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };
  const handleSelectStallToFilter = (stall) => {
    setSelectedStallCode(stall.stallNumber || stall.stallName);
    setActiveTab("products");
  };
  if (!market) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEn
          ? `Produce & Stalls: ${localizeMarketName(marketName, isEn)}`
          : `Sản Phẩm & Sạp Bán: ${marketName}`
      }
      subtitle={
        isEn
          ? `🎪 ${stalls.length} Farmer Stalls • Pickup at: ${market.address || market.city}`
          : `🎪 ${stalls.length} Gian hàng nông dân • Nhận hàng tại: ${market.address || market.city}`
      }
      maxWidth="860px"
    >
      <div className="ml-market-stalls-modal-content">
        <div className="ml-stalls-tab-nav">
          <button
            type="button"
            className={`ml-stalls-tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            🧺 {isEn ? "Market Produce" : "Nông Sản Tại Chợ"} ({filteredProducts.length})
          </button>
          <button
            type="button"
            className={`ml-stalls-tab-btn ${activeTab === "stalls" ? "active" : ""}`}
            onClick={() => setActiveTab("stalls")}
          >
            🎪 {isEn ? "Stall Directory" : "Danh Sách Gian Hàng / Sạp"} ({stalls.length})
          </button>
        </div>

        {activeTab === "products" && (
          <div className="ml-stalls-tab-pane">
            <div className="ml-stalls-filter-bar">
              <div className="ml-filter-chips-row">
                <span className="ml-filter-sublabel">{isEn ? "Select stall:" : "Chọn sạp:"}</span>
                <button
                  type="button"
                  className={`ml-stall-chip ${selectedStallCode === "all" ? "active" : ""}`}
                  onClick={() => setSelectedStallCode("all")}
                >
                  {isEn ? "All Stalls" : "Tất cả các sạp"} ({products.length})
                </button>
                {stalls.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`ml-stall-chip ${selectedStallCode === s.stallNumber ? "active" : ""}`}
                    onClick={() => setSelectedStallCode(s.stallNumber)}
                    title={s.stallName}
                  >
                    🎪 {s.stallNumber}: {localizeStallName(s.stallName, isEn).split(" ")[0]}
                  </button>
                ))}
              </div>

              <div className="ml-cat-search-row">
                <div className="ml-cat-chips-wrap">
                  <button
                    type="button"
                    className={`ml-cat-btn ${selectedCategory === "all" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("all")}
                  >
                    {isEn ? "All" : "Tất cả"}
                  </button>
                  <button
                    type="button"
                    className={`ml-cat-btn ${selectedCategory === "1" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("1")}
                  >
                    🥬 {isEn ? "Leafy Greens" : "Rau lá"}
                  </button>
                  <button
                    type="button"
                    className={`ml-cat-btn ${selectedCategory === "2" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("2")}
                  >
                    🥕 {isEn ? "Roots & Veggies" : "Củ quả"}
                  </button>
                  <button
                    type="button"
                    className={`ml-cat-btn ${selectedCategory === "3" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("3")}
                  >
                    🍓 {isEn ? "Fruits" : "Trái cây"}
                  </button>
                  <button
                    type="button"
                    className={`ml-cat-btn ${selectedCategory === "4" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("4")}
                  >
                    🍄 {isEn ? "Mushrooms" : "Nấm"}
                  </button>
                </div>

                <div className="ml-search-input-wrap">
                  <span className="ml-search-ic">🔍</span>
                  <input
                    type="text"
                    placeholder={isEn ? "Search produce, stall..." : "Tìm rau, củ, tên sạp..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ml-stalls-search-input"
                  />
                </div>
              </div>
            </div>

            {selectedStallCode !== "all" && (
              <div className="ml-active-stall-banner">
                <span>
                  {isEn ? "Filtering by:" : "Đang lọc theo:"} <strong>{selectedStallCode}</strong>
                </span>
                <button
                  type="button"
                  className="ml-clear-stall-btn"
                  onClick={() => setSelectedStallCode("all")}
                >
                  ✕ {isEn ? "Clear stall filter" : "Bỏ lọc sạp"}
                </button>
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="ml-products-empty-state">
                <span className="ml-empty-icon">🥬</span>
                <h4>{isEn ? "No matching produce found" : "Không tìm thấy nông sản phù hợp"}</h4>
                <p>
                  {isEn
                    ? "Try clearing search keywords or view all stalls."
                    : "Thử bỏ bớt từ khóa hoặc chuyển sang xem tất cả các sạp nông dân."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedStallCode("all");
                    setSelectedCategory("all");
                    setSearchTerm("");
                  }}
                >
                  {isEn ? "View all produce" : "Xem toàn bộ nông sản"}
                </Button>
              </div>
            ) : (
              <div className="ml-stalls-products-grid">
                {filteredProducts.map((p) => {
                  const cartQty = getCartQty(p.id);
                  return (
                    <div key={p.id} className="ml-stall-product-card">
                      <div className="ml-sp-img-box">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="ml-sp-img"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                        {p.organicCertified && (
                          <span className="ml-sp-badge">🌿 VietGAP</span>
                        )}
                      </div>

                      <div className="ml-sp-info">
                        <div className="ml-sp-stall-tag">
                          🎪 {p.stallCode || (isEn ? "Farmer Stall" : "Sạp nông sản")} • {localizeStallName(p.farmerName, isEn)}
                        </div>
                        <h4 className="ml-sp-name" title={p.name}>
                          {localizeProduceName(p.name, isEn)}
                        </h4>
                        <div className="ml-sp-stock">
                          {isEn ? "Stock:" : "Tồn kho:"}{" "}
                          <strong>
                            {p.stockQuantity} {p.unit}
                          </strong>{" "}
                          ({isEn ? "Early harvest" : (p.harvestTime || "Thu hoạch sớm")})
                        </div>

                        <div className="ml-sp-footer">
                          <div className="ml-sp-price">
                            <strong>{formatCurrency(p.price)}</strong>
                            <span>/ {p.unit}</span>
                          </div>

                          {onAddToCart && (
                            <div className="ml-sp-actions">
                              {cartQty > 0 ? (
                                <div className="ml-sp-qty-row">
                                  <button
                                    type="button"
                                    className="ml-sp-qty-btn"
                                    onClick={() =>
                                      onUpdateCartQty &&
                                      onUpdateCartQty(p, cartQty - 1)
                                    }
                                  >
                                    -
                                  </button>
                                  <span className="ml-sp-qty-val">
                                    {cartQty}
                                  </span>
                                  <button
                                    type="button"
                                    className="ml-sp-qty-btn"
                                    disabled={cartQty >= p.stockQuantity}
                                    onClick={() =>
                                      onUpdateCartQty &&
                                      onUpdateCartQty(p, cartQty + 1)
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="ml-sp-add-btn"
                                  onClick={() => onAddToCart(p)}
                                >
                                  + {isEn ? "Pre-order" : "Đặt trước"}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "stalls" && (
          <div className="ml-stalls-tab-pane">
            <div className="ml-stalls-overview-banner">
              <div className="ml-stalls-ob-text">
                <strong>
                  {isEn
                    ? `Farmer Stalls at ${localizeMarketName(marketName, isEn)}`
                    : `Các Sạp Nông Dân Tại Phiên Chợ ${marketName}`}
                </strong>
                <p>
                  {isEn
                    ? "Each stall represents a dedicated cooperative or family farm committed to clean, transparent agriculture."
                    : "Mỗi sạp đại diện cho một hợp tác xã hoặc nông hộ cam kết sản phẩm sạch, minh bạch nguồn gốc."}
                </p>
              </div>
            </div>

            <div className="ml-stalls-list-grid">
              {stalls.map((s, idx) => (
                <div key={idx} className="ml-stall-detail-card">
                  <div className="ml-sd-header">
                    <img
                      src={s.avatarUrl}
                      alt={s.farmerName}
                      className="ml-sd-avatar"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80";
                      }}
                    />
                    <div className="ml-sd-meta">
                      <div className="ml-sd-stall-pill">{s.stallNumber}</div>
                      <h4 className="ml-sd-stall-name">{localizeStallName(s.stallName, isEn)}</h4>
                      <div className="ml-sd-owner">
                        👨‍🌾 {isEn ? "Grower:" : "Chủ sạp:"} <strong>{localizeStallName(s.farmerName, isEn)}</strong>
                      </div>
                    </div>
                  </div>

                  <p className="ml-sd-bio">
                    {isEn
                      ? "Specialized in clean, micro-organic leafy vegetables and seasonal specialties, harvested at dawn on market day."
                      : s.bio}
                  </p>

                  <div className="ml-sd-address">
                    📍 {isEn ? "Farm location:" : "Vùng trồng:"} <span>{s.farmAddress}</span>
                  </div>

                  <div className="ml-sd-featured">
                    <span className="ml-sd-feat-label">{isEn ? "Key produce:" : "Nông sản thế mạnh:"}</span>
                    <div className="ml-sd-feat-tags">
                      {(s.featuredItems || []).map((it, i) => (
                        <span key={i} className="ml-feat-tag">
                          ✓ {localizeProduceName(it, isEn)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="ml-sd-actions">
                    <button
                      type="button"
                      className="ml-sd-view-prods-btn"
                      onClick={() => handleSelectStallToFilter(s)}
                    >
                      🧺 {isEn ? "View stall produce →" : "Xem nông sản sạp này →"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="ml-stalls-modal-footer">
          <div className="ml-stalls-footer-left">
            {onViewScheduleMap && (
              <button
                type="button"
                className="ml-btn-schedule-map"
                onClick={() => {
                  onClose();
                  onViewScheduleMap(market);
                }}
              >
                📅 {isEn ? "Schedule & Map for this market" : "Xem lịch & bản đồ chợ này"}
              </button>
            )}
          </div>

          <div className="ml-stalls-footer-right">
            {onOpenFullProducts && (
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  onClose();
                  onOpenFullProducts(market);
                }}
                icon={<span>🛒</span>}
              >
                {isEn ? "Browse in Full Catalog →" : "Duyệt trên trang Mua sắm đầy đủ →"}
              </Button>
            )}
            <Button variant="primary" size="md" onClick={onClose}>
              {isEn ? "Done" : "Xong"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
