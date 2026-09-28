import React, { useState, useEffect, useRef, useMemo } from "react";
import "@/assets/styles/pages/HomePage.css";
import MarketCard from "../components/customer/MarketCard";
import ProductCard from "../components/customer/ProductCard";
import MarketDetailModal from "../components/customer/MarketDetailModal";
import MarketStallsModal from "../components/customer/MarketStallsModal";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Pagination from "../components/common/Pagination";
import marketService from "../services/marketService";
import productService from "../services/productService";
import { matchSearch, POPULAR_PRODUCT_KEYWORDS } from "../utils/searchUtils";
import { useLanguage } from "../context";

export default function HomePage({
  onAddToCart,
  cartItems = [],
  onUpdateCartQty,
  onNavigate,
  onSelectMarketProducts,
  onOpenFarmerRegister,
}) {
  const { isEn, t } = useLanguage();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedMarketDay, setSelectedMarketDay] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [marketCityFilter, setMarketCityFilter] = useState("all");
  const [scheduleMapMarket, setScheduleMapMarket] = useState(null);
  const [stallProductsMarket, setStallProductsMarket] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const realProducts = await productService.getProducts({
          keyword: searchKeyword.trim(),
          categoryId:
            activeCategory !== "all" && !isNaN(activeCategory)
              ? activeCategory
              : "",
          status: "AVAILABLE",
        });
        if (isMounted) {
          if (realProducts && realProducts.length > 0) {
            setProducts(
              realProducts.map((p) => ({
                ...p,
                id: p.productId || p.id,
                farmerId: p.farmerId || p.farmer?.id || p.farmerUserId || p.userId,
                name: p.name,
                categoryName: p.categoryName || "Nông sản mùa vụ",
                price: p.price,
                unit: p.unit || "kg",
                farmerName:
                  p.farmerStallName || p.farmerName || "Nông Trại Thành Viên",
                stallCode: p.stallCode || "Sạp Tiêu Chuẩn",
                marketName: p.marketName || "Phiên Chợ Nông Sản",
                stockQuantity: p.currentStock ?? p.stockQuantity ?? 0,
                harvestTime: p.harvestTime || "Thu hoạch sáng sớm",
                imageUrl: p.imageUrl,
                organicCertified: Boolean(p.isOrganic || p.organicCertified),
              })),
            );
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.warn(
          "Failed to load server-filtered products for HomePage:",
          err,
        );
      }
    }, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchKeyword, activeCategory]);
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        let cityParam = "";
        if (marketCityFilter === "hanoi" || selectedArea === "hanoi")
          cityParam = "Hà Nội";
        else if (marketCityFilter === "hcm" || selectedArea === "hcm")
          cityParam = "Hồ Chí Minh";
        else if (selectedArea === "ecopark") cityParam = "Hưng Yên";
        let dayParam = "";
        if (selectedMarketDay === "sat") dayParam = "Thứ 7";
        else if (selectedMarketDay === "sun") dayParam = "Chủ Nhật";
        const realMarkets = await marketService.getMarkets({
          city: cityParam,
          dayOfWeek: dayParam,
        });
        if (isMounted) {
          if (realMarkets && realMarkets.length > 0) {
            setMarkets(
              realMarkets.map((m) => ({
                ...m,
                id: m.marketId || m.id,
                name: m.name,
                address: m.address,
                city:
                  m.address &&
                  (m.address.includes("Hồ Chí Minh") ||
                    m.address.includes("Thủ Đức"))
                    ? "TP. Hồ Chí Minh"
                    : "Hà Nội",
                distance: "1.5 km",
                operatingDays: m.operatingDays || "Thứ 7 & Chủ Nhật",
                operatingHours: m.operatingHours || "06:00 - 11:30",
                stallsCount: m.stallsCount || 15,
                imageUrl:
                  m.imageUrl ||
                  "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=700&q=80",
                tag: m.tag || "Chợ nông sản sinh thái",
                verified: true,
                description:
                  m.description || "Chợ phiên nông sản sạch chất lượng cao.",
              })),
            );
          } else {
            setMarkets([]);
          }
        }
      } catch (err) {
        console.warn(
          "Failed to load server-filtered markets for HomePage:",
          err,
        );
      }
    }, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [marketCityFilter, selectedArea, selectedMarketDay]);
  useEffect(() => {
    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("ml-reveal-visible");
        }
      });
    };
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.1,
    };
    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );
    const revealElements = document.querySelectorAll(".ml-reveal");
    revealElements.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
    };
  }, [
    products,
    markets,
    activeCategory,
    marketCityFilter,
    selectedArea,
    selectedMarketDay,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, activeCategory, selectedArea]);

  const filteredProducts = products;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);
  const displayedMarkets = markets;
  const getCartQty = (prodId) => {
    const found = cartItems.find((item) => item.id === prodId);
    return found ? found.quantity : 0;
  };
  const handleScrollToProducts = () => {
    const target = document.getElementById("seasonal-products");
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      });
    }
  };
  const handleQuickSearch = (keyword) => {
    setSearchKeyword(keyword);
    handleScrollToProducts();
  };
  return (
    <div className="ml-homepage">
      <section className="ml-hero">
        <div className="ml-container ml-hero-container">
          <div className="ml-hero-content ml-reveal">
            <div className="ml-hero-badge">
              <span className="ml-hero-badge-dot"></span>
              <span>{t("heroBadge", "Sàn Nông Sản Địa Phương Đặt Trước")}</span>
            </div>

            <h1 className="ml-hero-title">
              {t("heroTitle1", "Nông Sản Tươi Từ Vườn,")}
              <br />
              <span className="ml-title-highlight">
                {t("heroTitle2", "Đặt Trước & Nhận Tại Chợ Sáng")}
              </span>
            </h1>

            <p className="ml-hero-desc">
              {t(
                "heroDesc",
                "Kết nối trực tiếp người tiêu dùng với các nhà vườn tâm huyết. Đặt trước để sạp giữ phần rau củ ngon nhất, ra chợ kiểm tra độ tươi giòn rồi mới thanh toán tiền mặt hoặc chuyển khoản tại sạp."
              )}
            </p>

            <div className="ml-hero-actions">
              <Button
                variant="accent"
                size="lg"
                onClick={handleScrollToProducts}
              >
                {t("heroBtnProducts", "🌾 Khám Phá Nông Sản")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate && onNavigate("markets")}
              >
                {t("heroBtnMarkets", "🎪 Xem Các Phiên Chợ")}
              </Button>
            </div>

            <div className="ml-hero-stats">
              <div className="ml-stat-item">
                <span className="ml-stat-num">{markets.length}+</span>
                <span className="ml-stat-label">
                  {t("heroStatMarkets", "Chợ phiên cuối tuần")}
                </span>
              </div>
              <div className="ml-stat-sep"></div>
              <div className="ml-stat-item">
                <span className="ml-stat-num">{products.length}+</span>
                <span className="ml-stat-label">
                  {t("heroStatProducts", "Nông sản thu hoạch sớm")}
                </span>
              </div>
              <div className="ml-stat-sep"></div>
              <div className="ml-stat-item">
                <span className="ml-stat-num">100%</span>
                <span className="ml-stat-label">
                  {t("heroStatPay", "Thanh toán tại sạp")}
                </span>
              </div>
            </div>
          </div>

          <div className="ml-hero-visual ml-reveal ml-stagger-2">
            <div className="ml-hero-img-frame">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                alt="MarketLink"
                className="ml-hero-main-img"
              />

              <div className="ml-hero-floating-badge top">
                <div className="ml-float-icon-box green">
                  <span>🥕</span>
                </div>
                <div>
                  <div className="ml-float-title">
                    {t("heroBadgeCut", "Cắt lúc 4h30 sáng")}
                  </div>
                  <div className="ml-float-subtitle">
                    {t("heroBadgeCutSub", "Tươi giòn nguyên sương sớm")}
                  </div>
                </div>
              </div>

              <div className="ml-hero-floating-badge bottom">
                <div className="ml-float-icon-box amber">
                  <span>🛡️</span>
                </div>
                <div>
                  <div className="ml-float-title">
                    {t("heroBadgeCert", "VietGAP & Hữu cơ")}
                  </div>
                  <div className="ml-float-subtitle">
                    {t("heroBadgeCertSub", "Kiểm định nguồn gốc rõ ràng")}
                  </div>
                </div>
              </div>
            </div>

            <div className="ml-hero-mobile-badges">
              <div className="ml-hero-floating-badge">
                <div className="ml-float-icon-box green">
                  <span>🥕</span>
                </div>
                <div>
                  <div className="ml-float-title">
                    {t("heroBadgeCut", "Cắt 4h30 sáng")}
                  </div>
                  <div className="ml-float-subtitle">
                    {t("heroBadgeCutSub", "Tươi giòn sương sớm")}
                  </div>
                </div>
              </div>

              <div className="ml-hero-floating-badge">
                <div className="ml-float-icon-box amber">
                  <span>🛡️</span>
                </div>
                <div>
                  <div className="ml-float-title">
                    {t("heroBadgeCert", "Chuẩn VietGAP")}
                  </div>
                  <div className="ml-float-subtitle">
                    {t("heroBadgeCertSub", "Minh bạch nguồn gốc")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ml-trust-strip">
        <div className="ml-container">
          <div className="ml-trust-grid ml-reveal">
            <div className="ml-trust-item">
              <div className="ml-trust-icon">🌅</div>
              <div>
                <div className="ml-trust-title">
                  {t("trustHarvest", "Hái Trong Ngày")}
                </div>
                <div className="ml-trust-desc">
                  {t("trustHarvestDesc", "Rau củ tươi vừa rời cành sáng sớm")}
                </div>
              </div>
            </div>

            <div className="ml-trust-item">
              <div className="ml-trust-icon">👨‍🌾</div>
              <div>
                <div className="ml-trust-title">
                  {t("trustDirect", "Trực Tiếp Từ Nhà Vườn")}
                </div>
                <div className="ml-trust-desc">
                  {t("trustDirectDesc", "Không qua thương lái trung gian")}
                </div>
              </div>
            </div>

            <div className="ml-trust-item">
              <div className="ml-trust-icon">🧺</div>
              <div>
                <div className="ml-trust-title">
                  {t("trustInspect", "Kiểm Tra Tại Sạp")}
                </div>
                <div className="ml-trust-desc">
                  {t("trustInspectDesc", "Ưng ý độ tươi mới gửi tiền thanh toán")}
                </div>
              </div>
            </div>

            <div className="ml-trust-item">
              <div className="ml-trust-icon">⚡</div>
              <div>
                <div className="ml-trust-title">
                  {t("trustPreorder", "Đặt Trước Giữ Chỗ")}
                </div>
                <div className="ml-trust-desc">
                  {t("trustPreorderDesc", "Không lo hết hàng vào giờ cao điểm")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ml-how-it-works">
        <div className="ml-container">
          <div className="ml-section-header center ml-reveal">
            <span className="ml-section-subtitle">
              {t("howSubtitle", "Quy trình đơn giản & an tâm")}
            </span>
            <h2 className="ml-section-title">
              {t("howTitle", "Cách Thức Đặt Trước & Nhận Hàng Tại Chợ")}
            </h2>
            <p className="ml-section-desc">
              {t(
                "howDesc",
                "Không vận chuyển lưu kho dài ngày, nông sản đi thẳng từ luống vườn đến giỏ xách của bạn."
              )}
            </p>
          </div>

          <div className="ml-steps-grid">
            <div className="ml-step-card ml-reveal ml-stagger-1">
              <div className="ml-step-card-num">01</div>
              <div className="ml-step-icon-wrap">🥦</div>
              <span className="ml-step-badge">
                {t("howStep1Badge", "Bước 1")}
              </span>
              <h3 className="ml-step-title">
                {t("howStep1Title", "Chọn sạp & đặt trước")}
              </h3>
              <p className="ml-step-desc">
                {t(
                  "howStep1Desc",
                  "Xem lượng nông sản dự kiến hái cho phiên chợ tới. Chọn món bạn thích và giữ chỗ trước khi sạp đầy đơn."
                )}
              </p>
            </div>

            <div className="ml-step-card ml-reveal ml-stagger-2">
              <div className="ml-step-card-num">02</div>
              <div className="ml-step-icon-wrap">⏰</div>
              <span className="ml-step-badge">
                {t("howStep2Badge", "Bước 2")}
              </span>
              <h3 className="ml-step-title">
                {t("howStep2Title", "Hẹn giờ ra chợ lấy")}
              </h3>
              <p className="ml-step-desc">
                {t(
                  "howStep2Desc",
                  "Chọn ca nhận hàng (sáng sớm 06:30 - 08:30 hoặc 08:30 - 10:30) để người bán đóng gói sẵn phần riêng cho bạn."
                )}
              </p>
            </div>

            <div className="ml-step-card ml-reveal ml-stagger-3">
              <div className="ml-step-card-num">03</div>
              <div className="ml-step-icon-wrap">🤝</div>
              <span className="ml-step-badge">
                {t("howStep3Badge", "Bước 3")}
              </span>
              <h3 className="ml-step-title">
                {t("howStep3Title", "Kiểm tra & trả tiền tại sạp")}
              </h3>
              <p className="ml-step-desc">
                {t(
                  "howStep3Desc",
                  "Ghé sạp tận mắt ngắm rau quả tươi giòn, hài lòng mới gửi tiền mặt hoặc quét VietQR. Thảnh thơi dạo chợ phiên!"
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ml-markets-section">
        <div className="ml-container">
          <div className="ml-section-header with-action ml-reveal">
            <div>
              <span className="ml-section-subtitle">
                {t("marketsSubtitle", "Điểm hẹn cuối tuần")}
              </span>
              <h2 className="ml-section-title">
                {t("marketsTitle", "Các Phiên Chợ Đang Nhận Đặt Trước")}
              </h2>
              <p className="ml-section-desc">
                {t(
                  "marketsDesc",
                  "Tìm phiên chợ nông sản gần nhà bạn để ghé mua sắm cuối tuần này."
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate && onNavigate("markets")}
            >
              {t("marketsViewAll", "Xem tất cả chợ")} ({markets.length}) →
            </Button>
          </div>

          <div className="ml-markets-filter-bar ml-reveal">
            <div className="ml-filter-tabs">
              <button
                type="button"
                className={`ml-filter-tab ${marketCityFilter === "all" ? "active" : ""}`}
                onClick={() => setMarketCityFilter("all")}
              >
                {t("marketsAllAreas", "Tất cả khu vực")} ({markets.length})
              </button>
              <button
                type="button"
                className={`ml-filter-tab ${marketCityFilter === "hanoi" ? "active" : ""}`}
                onClick={() => setMarketCityFilter("hanoi")}
              >
                📍 Hà Nội
              </button>
              <button
                type="button"
                className={`ml-filter-tab ${marketCityFilter === "hcm" ? "active" : ""}`}
                onClick={() => setMarketCityFilter("hcm")}
              >
                📍 {isEn ? "Ho Chi Minh City" : "TP. Hồ Chí Minh"}
              </button>
            </div>

            <span
              style={{
                fontSize: "13px",
                color: "var(--color-text-muted)",
              }}
            >
              {isEn
                ? "Open for weekend pre-orders now"
                : "Đang mở đặt hàng trước cho phiên cuối tuần"}
            </span>
          </div>

          <div className="ml-markets-grid">
            {displayedMarkets.slice(0, 3).map((market, idx) => (
              <div
                key={market.id}
                className={`ml-reveal ml-stagger-${(idx % 3) + 1}`}
              >
                <MarketCard
                  market={market}
                  onViewDetails={(m) => setScheduleMapMarket(m)}
                  onSelectMarket={(m) => setStallProductsMarket(m)}
                />
              </div>
            ))}
          </div>

          {displayedMarkets.length === 0 && (
            <div className="ml-empty-state-card ml-reveal">
              <span className="ml-empty-icon">📍</span>
              <div className="ml-empty-title">
                {isEn
                  ? "No matching markets found"
                  : "Không tìm thấy phiên chợ phù hợp"}
              </div>
              <div className="ml-empty-desc">
                {isEn
                  ? "Try selecting another area or view all markets."
                  : "Thử chọn khu vực khác hoặc chuyển sang xem toàn bộ các phiên chợ."}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMarketCityFilter("all");
                  setSelectedArea("all");
                  setSelectedMarketDay("all");
                }}
              >
                {isEn ? "Reset Filter" : "Đặt lại bộ lọc"}
              </Button>
            </div>
          )}
        </div>
      </section>

      <section id="seasonal-products" className="ml-products-section">
        <div className="ml-container">
          <div className="ml-section-header with-action ml-reveal">
            <div>
              <span className="ml-section-subtitle">
                {t("prodsSubtitle", "Đang vào mùa thu hái")}
              </span>
              <h2 className="ml-section-title">
                {t("prodsTitle", "Nông Sản Tươi Ngon Nhất Tuần Này")}
              </h2>
              <p className="ml-section-desc">
                {t(
                  "prodsDesc",
                  "Nông dân vừa cập nhật số lượng hái cho phiên chợ sáng mai."
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate && onNavigate("products")}
            >
              {isEn ? "View Full Catalog →" : "Xem danh mục đầy đủ →"}
            </Button>
          </div>

          <div className="ml-home-search-panel ml-reveal">
            <div className="ml-home-search-input-wrap">
              <span className="ml-home-search-icon">🔍</span>
              <input
                type="text"
                className="ml-home-search-input"
                placeholder={
                  isEn
                    ? "Search fresh produce (spinach, cherry tomatoes, strawberries, mushrooms)..."
                    : "Tìm nông sản tươi (cải bó xôi, cà chua cherry, dâu tây Đà Lạt, nấm, Ba Vì)..."
                }
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              {searchKeyword && (
                <button
                  type="button"
                  className="ml-home-search-clear"
                  onClick={() => setSearchKeyword("")}
                  title={isEn ? "Clear search" : "Xóa tìm kiếm"}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="ml-home-quick-tags">
              <span className="ml-home-quick-label">
                {t("prodsQuickSearchLabel", "Gợi ý tìm nhanh:")}
              </span>
              {(isEn
                ? [
                    "🍅 Cherry Tomatoes",
                    "🍓 Strawberries",
                    "🥬 Baby Spinach",
                    "🍄 Mushrooms",
                    "🌿 Water Spinach",
                    "🍊 Pomelo",
                  ]
                : POPULAR_PRODUCT_KEYWORDS
              ).map((tag, idx) => {
                const cleanTag = tag.replace(/^[^\s]+\s*/, "");
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`ml-home-quick-tag ${searchKeyword === cleanTag ? "active" : ""}`}
                    onClick={() =>
                      setSearchKeyword(
                        searchKeyword === cleanTag ? "" : cleanTag
                      )
                    }
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ml-category-chips-wrap ml-reveal">
            <button
              type="button"
              className={`ml-cat-chip ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              🌿 {t("prodsFilterAll", "Tất cả")}{" "}
              <span className="ml-cat-chip-count">{products.length}</span>
            </button>
            <button
              type="button"
              className={`ml-cat-chip ${activeCategory === "Rau" ? "active" : ""}`}
              onClick={() => setActiveCategory("Rau")}
            >
              🥬 {t("prodsFilterVeg", "Rau Lá Hữu Cơ")}
            </button>
            <button
              type="button"
              className={`ml-cat-chip ${activeCategory === "Củ" ? "active" : ""}`}
              onClick={() => setActiveCategory("Củ")}
            >
              🥕 {t("prodsFilterRoot", "Củ & Quả Tươi Sạch")}
            </button>
            <button
              type="button"
              className={`ml-cat-chip ${activeCategory === "Trái Cây" ? "active" : ""}`}
              onClick={() => setActiveCategory("Trái Cây")}
            >
              🍓 {t("prodsFilterFruit", "Trái Cây Bản Địa")}
            </button>
            <button
              type="button"
              className={`ml-cat-chip ${activeCategory === "Nấm" ? "active" : ""}`}
              onClick={() => setActiveCategory("Nấm")}
            >
              🍄 {t("prodsFilterMushroom", "Nấm & Thảo Dược")}
            </button>
          </div>

          {(searchKeyword.trim() !== "" || selectedArea !== "all") && (
            <div className="ml-search-status-bar ml-reveal">
              <span>
                {isEn ? "Found" : "Tìm thấy"}{" "}
                <strong>{filteredProducts.length}</strong>{" "}
                {isEn ? "products" : "sản phẩm"}
                {searchKeyword && (
                  <>
                    {" "}
                    {isEn ? 'for keyword "' : 'cho từ khóa "' }
                    <strong>{searchKeyword}</strong>"
                  </>
                )}
                {selectedArea !== "all" && (
                  <>{isEn ? " in selected region" : " tại khu vực đã chọn"}</>
                )}
              </span>
              <button
                type="button"
                className="ml-reset-filter-btn"
                onClick={() => {
                  setSearchKeyword("");
                  setSelectedArea("all");
                  setActiveCategory("all");
                }}
              >
                {isEn ? "Clear Filter" : "Xóa bộ lọc"}
              </button>
            </div>
          )}

          <div className="ml-products-grid">
            {paginatedProducts.map((product, idx) => (
              <div
                key={product.id}
                className="ml-product-grid-cell"
                style={{ opacity: 1, visibility: "visible" }}
              >
                <ProductCard
                  product={product}
                  cartQuantity={getCartQty(product.id)}
                  onAddToCart={onAddToCart}
                  onUpdateQty={onUpdateCartQty}
                />
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            pageSize={PAGE_SIZE}
            onPageChange={(p) => {
              setCurrentPage(p);
              const target = document.getElementById("seasonal-products");
              if (target) {
                target.scrollIntoView({ behavior: "smooth" });
              }
            }}
          />

          {filteredProducts.length === 0 && (
            <div className="ml-empty-state-card ml-reveal">
              <span className="ml-empty-icon">🥬</span>
              <div className="ml-empty-title">
                {searchKeyword
                  ? isEn
                    ? `No produce matching "${searchKeyword}"`
                    : `Không tìm thấy nông sản khớp với "${searchKeyword}"`
                  : t("prodsEmptyTitle", "Không tìm thấy nông sản phù hợp")}
              </div>
              <div className="ml-empty-desc">
                {t(
                  "prodsEmptyDesc",
                  "Bạn hãy thử bấm vào một trong các từ khóa phổ biến bên dưới hoặc xem các nông sản tươi ngon đang mở bán:"
                )}
              </div>

              <div className="ml-empty-suggestions-box">
                <span className="ml-empty-suggestions-label">
                  {isEn ? "Try searching for:" : "Thử tìm kiếm với:"}
                </span>
                <div className="ml-empty-chips-list">
                  {(isEn
                    ? [
                        "🍅 Cherry Tomatoes",
                        "🍓 Strawberries",
                        "🥬 Baby Spinach",
                        "🍄 Mushrooms",
                      ]
                    : POPULAR_PRODUCT_KEYWORDS
                  ).map((kw, i) => {
                    const cleanKw = kw.replace(/^[^\s]+\s*/, "");
                    return (
                      <button
                        key={i}
                        type="button"
                        className="ml-empty-chip-btn"
                        onClick={() => {
                          setSearchKeyword(cleanKw);
                          setActiveCategory("all");
                          setSelectedArea("all");
                        }}
                      >
                        {kw}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  marginTop: "12px",
                }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchKeyword("");
                    setActiveCategory("all");
                    setSelectedArea("all");
                  }}
                >
                  ↺ {t("prodsEmptyReset", "Xem tất cả nông sản")}
                </Button>
              </div>

              <div
                className="ml-fallback-recommended-section"
                style={{
                  width: "100%",
                  marginTop: "32px",
                  textAlign: "left",
                }}
              >
                <div className="ml-fallback-header">
                  <span className="ml-fallback-badge">
                    {isEn ? "🔥 FEATURED HARVEST" : "🔥 NÔNG SẢN NỔI BẬT"}
                  </span>
                  <h3 className="ml-fallback-title">
                    {isEn
                      ? "Recommended Fresh Produce For You"
                      : "Gợi Ý Nông Sản Tươi Ngon Nhất Cho Bạn"}
                  </h3>
                  <p className="ml-fallback-sub">
                    {isEn
                      ? "Harvested early on market day, ready for stall pickup:"
                      : "Nông dân hái sớm trong ngày họp chợ, sẵn sàng giao tại sạp:"}
                  </p>
                </div>

                <div className="ml-products-grid">
                  {products.slice(0, 4).map((product) => (
                    <div key={product.id}>
                      <ProductCard
                        product={product}
                        cartQuantity={getCartQty(product.id)}
                        onAddToCart={onAddToCart}
                        onUpdateQty={onUpdateCartQty}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="ml-farmer-cta">
        <div className="ml-container">
          <div className="ml-farmer-cta-inner ml-reveal">
            <div className="ml-farmer-cta-content">
              <div className="ml-farmer-badge">
                <span>🌱</span>
                <span>
                  {isEn
                    ? "For Family Farms & Growers"
                    : "Dành Cho Nhà Vườn & Nông Hộ"}
                </span>
              </div>

              <h2 className="ml-farmer-cta-title">
                {isEn ? (
                  <>
                    Are You a Sustainable Farmer?
                    <br />
                    Register a Market Stall & Welcome Pre-orders!
                  </>
                ) : (
                  <>
                    Bạn Là Nông Dân Canh Tác Sạch?
                    <br />
                    Đăng Ký Sạp Chợ & Đón Khách Đặt Trước Ngay!
                  </>
                )}
              </h2>

              <p className="ml-farmer-cta-desc">
                {isEn
                  ? "Plan harvest quotas the afternoon prior, knowing exactly how many shoppers will pick up at the market. Zero surplus waste, zero middleman price cuts!"
                  : "Chủ động sản lượng hái từ chiều hôm trước, biết chính xác có bao nhiêu khách đến nhận tại chợ. Không lo dội chợ, không bị ép giá trung gian!"}
              </p>

              <div className="ml-farmer-benefits-list">
                <div className="ml-benefit-item">
                  <span className="ml-benefit-icon">✓</span>
                  <span>
                    {isEn
                      ? "Plan harvest amounts with confirmed pre-orders each afternoon"
                      : "Chủ động số lượng đơn trước khi thu hoạch mỗi buổi chiều"}
                  </span>
                </div>
                <div className="ml-benefit-item">
                  <span className="ml-benefit-icon">✓</span>
                  <span>
                    {isEn
                      ? "0% platform listing fees, free VietQR payment and stall sign support"
                      : "0% chi phí sàn khởi tạo, miễn phí hỗ trợ làm bảng sạp VietQR"}
                  </span>
                </div>
                <div className="ml-benefit-item">
                  <span className="ml-benefit-icon">✓</span>
                  <span>
                    {isEn
                      ? "Shoppers inspect and pay 100% directly to you in cash or VietQR"
                      : "Khách đến nhận trực tiếp tại sạp, nhận tiền mặt hoặc chuyển khoản 100%"}
                  </span>
                </div>
              </div>

              <div className="ml-farmer-cta-actions">
                <Button
                  variant="accent"
                  size="lg"
                  onClick={onOpenFarmerRegister}
                >
                  {isEn ? "Register Free Stall" : "Đăng ký mở sạp miễn phí"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate && onNavigate("farmers")}
                >
                  {isEn ? "Explore Farmer Stalls →" : "Khám phá các gian hàng →"}
                </Button>
              </div>
            </div>

            <div className="ml-farmer-cta-visual">
              <img
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80"
                alt="Organic farming"
                className="ml-farmer-cta-img"
              />
            </div>
          </div>
        </div>
      </section>

      {scheduleMapMarket && (
        <MarketDetailModal
          isOpen={!!scheduleMapMarket}
          onClose={() => setScheduleMapMarket(null)}
          market={scheduleMapMarket}
          onViewStalls={(m) => {
            setScheduleMapMarket(null);
            setStallProductsMarket(m);
          }}
        />
      )}

      {stallProductsMarket && (
        <MarketStallsModal
          isOpen={!!stallProductsMarket}
          onClose={() => setStallProductsMarket(null)}
          market={stallProductsMarket}
          onAddToCart={onAddToCart}
          cartItems={cartItems}
          onUpdateCartQty={onUpdateCartQty}
          onViewScheduleMap={(m) => {
            setStallProductsMarket(null);
            setScheduleMapMarket(m);
          }}
          onOpenFullProducts={(m) => {
            setStallProductsMarket(null);
            if (onSelectMarketProducts) {
              onSelectMarketProducts(m);
            } else if (onNavigate) {
              onNavigate("products");
            }
          }}
        />
      )}
    </div>
  );
}
