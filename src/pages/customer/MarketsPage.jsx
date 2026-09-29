import React, { useState, useEffect, useMemo } from "react";
import "@/assets/styles/pages/customer/MarketsPage.css";
import MarketCard from "../../components/customer/MarketCard";
import MarketDetailModal from "../../components/customer/MarketDetailModal";
import MarketStallsModal from "../../components/customer/MarketStallsModal";
import OpenStreetMapRouting from "../../components/OpenStreetMapRouting";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import marketService from "../../services/marketService";
import { matchSearch, POPULAR_MARKET_KEYWORDS } from "../../utils/searchUtils";
import { useLanguage } from "../../context/LanguageContext";
import { getMarketOperatingStatus } from "../../utils/marketUtils";

export default function MarketsPage({
  onNavigate,
  onSelectMarketProducts,
  onAddToCart,
  cartItems = [],
  onUpdateCartQty,
}) {
  const { t, isEn, localizeMarketName } = useLanguage();
  const [activeCity, setActiveCity] = useState("all");
  const [activeDay, setActiveDay] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [scheduleMapMarket, setScheduleMapMarket] = useState(null);
  const [stallProductsMarket, setStallProductsMarket] = useState(null);
  const [marketsData, setMarketsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        let cityParam = "";
        if (activeCity !== "all") {
          cityParam = activeCity;
        }
        let dayParam = "";
        if (activeDay !== "all") {
          dayParam = activeDay;
        }
        const real = await marketService.getMarkets({
          search: searchTerm.trim(),
          city: cityParam,
          dayOfWeek: dayParam,
        });
        if (isMounted) {
          if (real && real.length > 0) {
            setMarketsData(
              real.map((m) => {
                const isHcm =
                  m.address && m.address.toLowerCase().includes("hồ chí minh");
                const isEcopark =
                  m.address && m.address.toLowerCase().includes("ecopark");
                return {
                  ...m,
                  id: m.marketId || m.id,
                  name: m.name,
                  address: m.address,
                  status: m.status || "ACTIVE",
                  schedules: m.schedules || [],
                  city: m.city || (isHcm
                    ? "TP. Hồ Chí Minh"
                    : isEcopark
                      ? "Hưng Yên"
                      : "Hà Nội"),
                  distance: m.distance || "",
                  operatingDays: m.operatingDays || "",
                  operatingHours: m.operatingHours || "",
                  stallsCount: m.stallsCount || m.farmerCount || 0,
                  imageUrl:
                    m.imageUrl ||
                    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=700&q=80",
                  tag: m.tag || "",
                  verified: m.verified !== undefined ? m.verified : true,
                  description:
                    m.description || "",
                };
              }),
            );
          } else {
            setMarketsData([]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch filtered markets from server:", err);
      }
    }, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [activeCity, activeDay, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCity, activeDay, activeStatus]);

  const filteredMarkets = useMemo(() => {
    return marketsData.filter((m) => {
      if (activeStatus === "open_now") {
        const op = getMarketOperatingStatus(m, isEn);
        return op.isOpen;
      }
      if (activeStatus === "active") {
        return (m.status || "ACTIVE").toUpperCase() === "ACTIVE";
      }
      return true;
    });
  }, [marketsData, activeStatus, isEn]);

  const paginatedMarkets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMarkets.slice(start, start + PAGE_SIZE);
  }, [filteredMarkets, currentPage]);
  return (
    <div className="ml-markets-page">
      <div className="ml-markets-banner">
        <div className="ml-container ml-markets-banner-inner">
          <div>
            <span className="ml-section-subtitle">
              {t("marketsPageSubtitle", "Mạng Lưới Chợ Phiên")} ({marketsData.length} {isEn ? "Locations" : "Điểm"})
            </span>
            <h1 className="ml-markets-title">
              {t("marketsPageTitle", "Khám Phá Các Điểm Chợ Nông Sản Sạch")}
            </h1>
            <p className="ml-markets-desc">
              {t(
                "marketsPageDesc",
                "Tìm các chợ phiên họp định kỳ gần nơi bạn sinh sống, xem lịch họp sạp và lộ trình đi lại thuận tiện nhất."
              )}
            </p>
          </div>

          <div className="ml-view-toggle">
            <button
              type="button"
              className={`ml-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              {t("marketsTabGrid", "⊞ Danh sách sạp")}
            </button>
            <button
              type="button"
              className={`ml-toggle-btn ${viewMode === "map" ? "active" : ""}`}
              onClick={() => setViewMode("map")}
            >
              {t("marketsTabMap", "🗺️ Bản đồ & Định vị")}
            </button>
          </div>
        </div>
      </div>

      <div className="ml-container ml-markets-content">
        <div className="ml-markets-filters">
          <div className="ml-filter-search-box">
            <div className="ml-filter-search">
              <span className="ml-filter-icon">🔍</span>
              <input
                type="text"
                placeholder={t("marketsSearchPlaceholder", "Tìm theo tên chợ, quận/huyện, tên đường...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ml-markets-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="ml-markets-clear-btn"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="ml-markets-quick-tags">
              <span className="ml-markets-quick-label">{isEn ? "Suggestions:" : "Gợi ý:"}</span>
              {(isEn
                ? ["Ba Dinh", "Tay Ho", "Thao Dien", "Ecopark", "Weekend Market"]
                : POPULAR_MARKET_KEYWORDS
              ).map((kw, i) => (
                <button
                  key={i}
                  type="button"
                  className={`ml-market-tag-chip ${searchTerm === kw ? "active" : ""}`}
                  onClick={() => setSearchTerm(searchTerm === kw ? "" : kw)}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-filter-group">
            <span className="ml-filter-label">{t("marketsCityFilter", "Thành phố:")}</span>
            <div className="ml-filter-chips">
              <button
                type="button"
                className={`ml-chip-btn ${activeCity === "all" ? "active" : ""}`}
                onClick={() => setActiveCity("all")}
              >
                {t("marketsCityAll", "Tất cả")} ({marketsData.length})
              </button>
              <button
                type="button"
                className={`ml-chip-btn ${activeCity === "Hà Nội" ? "active" : ""}`}
                onClick={() => setActiveCity("Hà Nội")}
              >
                Hà Nội
              </button>
              <button
                type="button"
                className={`ml-chip-btn ${activeCity === "TP. Hồ Chí Minh" ? "active" : ""}`}
                onClick={() => setActiveCity("TP. Hồ Chí Minh")}
              >
                {isEn ? "Ho Chi Minh City" : "TP. Hồ Chí Minh"}
              </button>
              <button
                type="button"
                className={`ml-chip-btn ${activeCity === "Hưng Yên" ? "active" : ""}`}
                onClick={() => setActiveCity("Hưng Yên")}
              >
                Hưng Yên
              </button>
            </div>
          </div>

          <div className="ml-filter-group">
            <span className="ml-filter-label">{isEn ? "Operating Status:" : "Trạng thái:"}</span>
            <div className="ml-filter-chips">
              <button
                type="button"
                className={`ml-chip-btn ${activeStatus === "all" ? "active" : ""}`}
                onClick={() => setActiveStatus("all")}
              >
                {isEn ? "All" : "Tất cả"}
              </button>
              <button
                type="button"
                className={`ml-chip-btn ${activeStatus === "open_now" ? "active" : ""}`}
                onClick={() => setActiveStatus("open_now")}
              >
                🟢 {isEn ? "Open Now" : "Đang mở cửa"}
              </button>
              <button
                type="button"
                className={`ml-chip-btn ${activeStatus === "active" ? "active" : ""}`}
                onClick={() => setActiveStatus("active")}
              >
                ✓ {isEn ? "Operating" : "Đang hoạt động"}
              </button>
            </div>
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="ml-markets-map-view">
            <OpenStreetMapRouting
              onSelectMarketProducts={(m) => setStallProductsMarket(m)}
            />
          </div>
        ) : (
          <div className="ml-markets-grid-wrap">
            {filteredMarkets.length === 0 ? (
              <div className="ml-markets-empty-container">
                <div className="ml-markets-empty">
                  <span className="ml-empty-icon">🎪</span>
                  <h3>
                    {searchTerm
                      ? `${t("marketsEmptyMatch", "Không tìm thấy chợ phiên khớp với")} "${searchTerm}"`
                      : t("marketsEmptyTitle", "Không tìm thấy chợ phiên phù hợp")}
                  </h3>
                  <p>
                    {t(
                      "marketsEmptyDesc",
                      "Thử tìm kiếm với từ khóa khác hoặc chuyển sang khu vực 'Tất cả'."
                    )}
                  </p>

                  <div className="ml-empty-suggestions-box">
                    <span className="ml-empty-suggestions-label">
                      {isEn ? "Try searching for:" : "Thử tìm kiếm với:"}
                    </span>
                    <div className="ml-empty-chips-list">
                      {(isEn
                        ? ["Ba Dinh", "Tay Ho", "Thao Dien", "Ecopark"]
                        : POPULAR_MARKET_KEYWORDS
                      ).map((kw, i) => (
                        <button
                          key={i}
                          type="button"
                          className="ml-empty-chip-btn"
                          onClick={() => {
                            setSearchTerm(kw);
                            setActiveCity("all");
                            setActiveDay("all");
                          }}
                        >
                          🎪 {kw}
                        </button>
                      ))}
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
                        setActiveCity("all");
                        setActiveDay("all");
                        setSearchTerm("");
                      }}
                    >
                      {t("marketsEmptyResetBtn", "↺ Xem tất cả chợ")}
                    </Button>
                  </div>
                </div>

                {marketsData.length > 0 && (
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
                        {t("marketsFeaturedBadge", "⭐ CHỢ PHIÊN TIÊU BIỂU")}
                      </span>
                      <h3 className="ml-fallback-title">
                        {t("marketsFeaturedTitle", "Gợi Ý Các Phiên Chợ Nổi Bật Cho Bạn")}
                      </h3>
                      <p className="ml-fallback-sub">
                        {t(
                          "marketsFeaturedSub",
                          "Các điểm chợ nông sản sạch họp định kỳ mỗi cuối tuần:"
                        )}
                      </p>
                    </div>

                    <div className="ml-markets-cards-grid">
                      {marketsData.slice(0, 3).map((market) => (
                        <MarketCard
                          key={market.id}
                          market={market}
                          onViewDetails={(m) => setScheduleMapMarket(m)}
                          onSelectMarket={(m) => setStallProductsMarket(m)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="ml-markets-cards-grid">
                  {paginatedMarkets.map((market) => (
                    <MarketCard
                      key={market.id}
                      market={market}
                      onViewDetails={(m) => setScheduleMapMarket(m)}
                      onSelectMarket={(m) => setStallProductsMarket(m)}
                    />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredMarkets.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 320, behavior: "smooth" });
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>

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
