import React, { useState, useEffect, useMemo } from "react";
import "@/assets/styles/pages/customer/StallsPage.css";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import ProductCard from "../../components/customer/ProductCard";
import marketService from "../../services/marketService";
import productService from "../../services/productService";
import farmerService from "../../services/farmerService";
import customerService from "../../services/customerService";
import { matchSearch, POPULAR_STALL_KEYWORDS } from "../../utils/searchUtils";
import { useLanguage } from "../../context/LanguageContext";

export default function StallsPage({
  onAddToCart,
  cartItems = [],
  onUpdateCartQty,
  onNavigate,
  initialFarmerId = null,
}) {
  const {
    t,
    isEn,
    localizeProduceName,
    localizeCategoryName,
    localizeMarketName,
    localizeStallName,
    localizeOperatingDays,
  } = useLanguage();
  const [stalls, setStalls] = useState([]);
  const [marketsList, setMarketsList] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [selectedStall, setSelectedStall] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedMarketId, setSelectedMarketId] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedCert, setSelectedCert] = useState("all");
  const [sortBy, setSortBy] = useState("rating_desc");
  const [stallProducts, setStallProducts] = useState([]);
  const [stallReviews, setStallReviews] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  useEffect(() => {
    marketService
      .getMarkets()
      .then((m) => {
        if (Array.isArray(m)) setMarketsList(m);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const liveStalls = await marketService.getStalls({
          search: searchKeyword.trim(),
          marketId: selectedMarketId !== "all" ? selectedMarketId : "",
        });
        if (isMounted && Array.isArray(liveStalls) && liveStalls.length > 0) {
          const mapped = liveStalls.map((f, idx) => ({
            id: f.assignmentId || f.marketId * 100 + f.farmerId,
            farmerId: f.farmerId,
            assignmentId: f.assignmentId || idx + 1,
            stallCode:
              f.stallNumber ||
              `Sạp ${String.fromCharCode(65 + idx)}-0${idx + 1}`,
            stallName:
              f.stallName || `Sạp Nông Sản ${f.farmerName || "Bản Địa"}`,
            farmName: f.stallName || `Nông Trại ${f.farmerName || "Sạch"}`,
            farmerName: f.farmerName || "Nhà Vườn Thành Viên",
            marketId: f.marketId,
            marketName: f.marketName || "Phiên Chợ Nông Sản",
            marketCity:
              f.farmAddress &&
              (f.farmAddress.includes("Hồ Chí Minh") ||
                f.farmAddress.includes("Thủ Đức"))
                ? "TP. Hồ Chí Minh"
                : "Hà Nội",
            marketAddress: f.farmAddress || "",
            operatingDays: f.operatingDays || "",
            operatingHours: f.operatingHours || "",
            avatarUrl:
              f.avatarUrl ||
              "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80",
            coverUrl:
              f.coverUrl ||
              "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
            farmAddress: f.farmAddress || "",
            experienceYears: f.experienceYears || "",
            rating: f.rating || 5.0,
            reviewCount: f.reviewCount || 0,
            specialty: f.specialty || "Nông sản",
            specialtyName: f.specialtyName || "Nông Sản Tươi Sạch",
            specialtyTags: Array.isArray(f.specialtyTags)
              ? f.specialtyTags
              : ["Nông sản sạch", "VietGAP"],
            certification: f.certification || "VietGAP",
            certifications: Array.isArray(f.certifications)
              ? f.certifications
              : ["Chứng nhận VietGAP"],
            bio: f.bio || "",
            productsCount: f.productsCount || 0,
          }));
          setStalls(mapped);
          if (!initialFarmerId && mapped.length > 0) {
            setSelectedStall(mapped[0]);
          }
        } else if (
          isMounted &&
          !searchKeyword.trim() &&
          selectedMarketId === "all"
        ) {
          setStalls([]);
        } else if (isMounted) {
          setStalls([]);
        }
      } catch (err) {
        console.warn("Failed to load live stalls from backend:", err);
      }
    }, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchKeyword, selectedMarketId]);
  useEffect(() => {
    if (initialFarmerId) {
      const found = stalls.find(
        (s) => s.farmerId === initialFarmerId || s.id === initialFarmerId,
      );
      if (found) {
        setSelectedStall(found);
        setViewMode("detail");
      }
    }
  }, [initialFarmerId, stalls]);
  useEffect(() => {
    if (viewMode !== "detail" || !selectedStall) return;
    let isMounted = true;
    async function loadStallDetail() {
      setDetailLoading(true);
      try {
        const normStall = (selectedStall.stallCode || "")
          .toLowerCase()
          .replace(/[\s\-_:]+/g, "");
        const [prods, revs, isFav] = await Promise.all([
          productService.getProducts({
            farmerId: selectedStall.farmerId,
            marketId: selectedStall.marketId,
          }),
          farmerService.getFarmerReviews(selectedStall.farmerId),
          customerService.checkFavorite("FARMER", selectedStall.farmerId),
        ]);
        if (isMounted) {
          let stallProds = Array.isArray(prods) ? prods : [];
          if (normStall) {
            const filteredByStall = stallProds.filter((p) => {
              if (!p.stallNumber) return true;
              const pNorm = p.stallNumber
                .toLowerCase()
                .replace(/[\s\-_:]+/g, "");
              return pNorm === normStall;
            });
            if (filteredByStall.length > 0 || selectedStall.marketId) {
              stallProds = filteredByStall;
            }
          }
          if (stallProds.length === 0 && !selectedStall.marketId) {
            const fallbackProds = await productService.getProducts({
              farmerId: selectedStall.farmerId,
            });
            if (Array.isArray(fallbackProds) && fallbackProds.length > 0) {
              stallProds = fallbackProds;
            }
          }
          setStallProducts(stallProds);
          setStallReviews(Array.isArray(revs) ? revs : []);
          setIsFavorited(Boolean(isFav));
        }
      } catch (err) {
        console.warn("Failed to load detail for stall", err);
      } finally {
        if (isMounted) setDetailLoading(false);
      }
    }
    loadStallDetail();
    return () => {
      isMounted = false;
    };
  }, [viewMode, selectedStall]);
  const handleToggleFavorite = async () => {
    if (!selectedStall) return;
    setFavLoading(true);
    try {
      if (isFavorited) {
        await customerService.removeFavorite("FARMER", selectedStall.farmerId);
        setIsFavorited(false);
      } else {
        await customerService.addFavorite("FARMER", selectedStall.farmerId);
        setIsFavorited(true);
      }
    } catch (err) {
      console.warn("Error toggling favorite:", err);
    } finally {
      setFavLoading(false);
    }
  };
  const filteredStalls = stalls.filter((stall) => {
    const q = (searchKeyword || "").trim();
    const matchesKeyword =
      !q ||
      matchSearch(
        [
          stall.stallName,
          stall.farmName,
          stall.farmerName,
          stall.stallCode,
          stall.specialty,
          stall.specialtyName,
          stall.marketName,
          stall.marketCity,
          stall.marketAddress,
          stall.farmAddress,
          ...(stall.specialtyTags || []),
          ...(stall.certifications || []),
        ].filter(Boolean),
        q,
      );

    const matchesMarket =
      selectedMarketId === "all" ||
      (stall.marketName || "")
        .toLowerCase()
        .includes(selectedMarketId.toLowerCase());

    const matchesCity =
      selectedCity === "all" ||
      (selectedCity === "hanoi" &&
        (stall.marketCity || "").includes("Hà Nội")) ||
      (selectedCity === "hcm" &&
        (stall.marketCity || "").includes("Hồ Chí Minh"));
    const matchesSpecialty =
      selectedSpecialty === "all" || stall.specialty === selectedSpecialty;
    const matchesCert =
      selectedCert === "all" ||
      (selectedCert === "vietgap" && stall.certification === "VietGAP") ||
      (selectedCert === "organic" && stall.certification === "Organic") ||
      (selectedCert === "ocop" && stall.certification === "OCOP");
    return (
      matchesKeyword &&
      matchesMarket &&
      matchesCity &&
      matchesSpecialty &&
      matchesCert
    );
  });
  const sortedStalls = [...filteredStalls].sort((a, b) => {
    if (sortBy === "rating_desc") {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === "prods_desc") {
      return (b.productsCount || 0) - (a.productsCount || 0);
    }
    if (sortBy === "code_asc") {
      return a.stallCode.localeCompare(b.stallCode);
    }
    if (sortBy === "name_asc") {
      return a.farmName.localeCompare(b.farmName);
    }
    return 0;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchKeyword,
    selectedMarketId,
    selectedCity,
    selectedSpecialty,
    selectedCert,
    sortBy,
  ]);

  const paginatedStalls = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedStalls.slice(start, start + PAGE_SIZE);
  }, [sortedStalls, currentPage]);

  const getCartQty = (prodId) => {
    const found = cartItems.find(
      (item) => item.id === prodId || item.productId === prodId,
    );
    return found ? found.quantity : 0;
  };
  const handleOpenDetail = (stall) => {
    setSelectedStall(stall);
    setViewMode("detail");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const handleBackToList = () => {
    setViewMode("list");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const handleResetFilters = () => {
    setSearchKeyword("");
    setSelectedMarketId("all");
    setSelectedCity("all");
    setSelectedSpecialty("all");
    setSelectedCert("all");
    setSortBy("rating_desc");
  };
  if (viewMode === "detail" && selectedStall) {
    return (
      <div className="ml-stalls-page">
        <div
          className="ml-container"
          style={{
            paddingTop: "24px",
          }}
        >
          <div className="ml-stall-detail-back-bar">
            <button
              type="button"
              className="ml-back-to-list-btn"
              onClick={handleBackToList}
            >
              {t("stallsBackToList", "← Quay lại danh sách gian hàng")}
            </button>
          </div>

          <div className="ml-stall-detail-banner">
            <img
              src={selectedStall.coverUrl}
              alt={selectedStall.farmName}
              className="ml-stall-banner-img"
            />
            <div className="ml-stall-banner-overlay">
              <div className="ml-stall-banner-info">
                <img
                  src={selectedStall.avatarUrl}
                  alt={selectedStall.farmerName}
                  className="ml-stall-banner-avatar"
                />
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <Badge variant="organic" size="sm">
                      {selectedStall.stallCode}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {selectedStall.certification}
                    </Badge>
                  </div>
                  <h1 className="ml-stall-banner-title">
                    {localizeStallName(selectedStall.farmName, isEn)}
                  </h1>
                  <div className="ml-stall-banner-sub">
                    {isEn ? "Grower:" : "Chủ sạp:"} <strong>{localizeStallName(selectedStall.farmerName, isEn)}</strong> •{" "}
                    {isEn ? "10+ years farming" : selectedStall.experienceYears}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-stall-detail-grid">
            <aside className="ml-stall-sidebar-card">
              <div>
                <button
                  type="button"
                  className={`ml-fav-btn-full ${isFavorited ? "active" : ""}`}
                  onClick={handleToggleFavorite}
                  disabled={favLoading}
                >
                  <span>{isFavorited ? "❤️" : "🤍"}</span>
                  <span>
                    {isFavorited ? t("stallsFavSaved", "Đã lưu sạp yêu thích") : t("stallsFavSave", "Lưu sạp này")}
                  </span>
                </button>
              </div>

              <div>
                <h4 className="ml-sidebar-title">{t("stallsInfoTitle", "🎪 Thông tin sạp tại chợ")}</h4>
                <div className="ml-sidebar-meta-list">
                  <div className="ml-sidebar-meta-item">
                    <span className="ml-sidebar-meta-icon">📍</span>
                    <div>
                      <strong>{localizeMarketName(selectedStall.marketName, isEn)}</strong>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {selectedStall.marketAddress}
                      </div>
                    </div>
                  </div>

                  <div className="ml-sidebar-meta-item">
                    <span className="ml-sidebar-meta-icon">🏷️</span>
                    <div>
                      {t("stallsStallCodeLabel", "Vị trí sạp:")} <strong>{selectedStall.stallCode}</strong>
                    </div>
                  </div>

                  <div className="ml-sidebar-meta-item">
                    <span className="ml-sidebar-meta-icon">⏰</span>
                    <div>
                      {t("stallsScheduleLabel", "Lịch họp:")} <strong>{localizeOperatingDays(selectedStall.operatingDays, isEn)}</strong> (
                      {selectedStall.operatingHours})
                    </div>
                  </div>

                  <div className="ml-sidebar-meta-item">
                    <span className="ml-sidebar-meta-icon">🏡</span>
                    <div>
                      {t("stallsFarmAddressLabel", "Nhà vườn tại:")} <strong>{selectedStall.farmAddress}</strong>
                    </div>
                  </div>

                  <div className="ml-sidebar-meta-item">
                    <span className="ml-sidebar-meta-icon">⭐</span>
                    <div>
                      {t("stallsRatingLabel", "Đánh giá:")} <strong>{selectedStall.rating} / 5.0</strong> (
                      {selectedStall.reviewCount} {isEn ? "reviews" : "đánh giá"})
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="ml-sidebar-title">{t("stallsCertTitle", "🌿 Tiêu chuẩn & Cam kết")}</h4>
                <div className="ml-certs-chips-list">
                  {selectedStall.certifications &&
                    selectedStall.certifications.map((c, i) => (
                      <span key={i} className="ml-cert-chip">
                        ✓ {c}
                      </span>
                    ))}
                </div>
              </div>
            </aside>

            <main className="ml-stall-main-content">
              <div className="ml-detail-section-card">
                <h3 className="ml-detail-section-title">
                  {isEn ? "About the Farm & Practices" : "Về Nhà Vườn & Phương Pháp Canh Tác"}
                </h3>
                <p className="ml-detail-bio-text">
                  {isEn
                    ? "Dedicated to cultivating safe, micro-organic and VietGAP-certified produce. Harvested fresh at dawn on market day and delivered directly to the stall to preserve natural crispness and vitamins."
                    : selectedStall.bio}
                </p>
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {isEn ? "Specialties:" : "Chuyên canh:"}
                  </span>
                  {selectedStall.specialtyTags &&
                    selectedStall.specialtyTags.map((t, idx) => (
                      <span key={idx} className="ml-stall-spec-tag">
                        {localizeProduceName(t, isEn)}
                      </span>
                    ))}
                </div>
              </div>

              <div className="ml-detail-section-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <h3
                      className="ml-detail-section-title"
                      style={{
                        marginBottom: "4px",
                      }}
                    >
                      {isEn ? "Available Produce" : "Nông Sản Mở Bán"} ({stallProducts.length})
                    </h3>
                    <p
                      style={{
                        fontSize: "13.5px",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {isEn
                        ? "Pre-order for the grower to harvest fresh and pack your dedicated bag for morning pickup."
                        : "Đặt trước để sạp hái tươi và đóng gói phần riêng cho bạn nhận tại chợ sáng."}
                    </p>
                  </div>
                </div>

                {detailLoading ? (
                  <div
                    style={{
                      padding: "32px",
                      textAlign: "center",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {isEn ? "Loading stall produce..." : "Đang tải nông sản của sạp..."}
                  </div>
                ) : stallProducts.length === 0 ? (
                  <div
                    style={{
                      padding: "32px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "36px",
                        marginBottom: "8px",
                      }}
                    >
                      🥬
                    </div>
                    <h4>{isEn ? "No produce open for pre-order yet" : "Sạp chưa có sản phẩm nào mở bán cho phiên tới"}</h4>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {isEn
                        ? "Please check back when the farmer updates their next harvest schedule."
                        : "Hãy quay lại sau khi nhà vườn cập nhật lịch hái mới."}
                    </p>
                  </div>
                ) : (
                  <div className="ml-detail-products-grid">
                    {stallProducts.map((prod) => (
                      <ProductCard
                        key={prod.id || prod.productId}
                        product={prod}
                        cartQuantity={getCartQty(prod.id || prod.productId)}
                        onAddToCart={onAddToCart}
                        onUpdateQty={onUpdateCartQty}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="ml-detail-section-card">
                <h3
                  className="ml-detail-section-title"
                  style={{
                    marginBottom: "16px",
                  }}
                >
                  {isEn ? `Shopper Reviews (${stallReviews.length})` : `Đánh Giá Từ Khách Đi Chợ (${stallReviews.length})`}
                </h3>

                <div className="ml-detail-reviews-list">
                  {stallReviews.map((rev, i) => (
                    <div
                      key={rev.reviewId || rev.id || i}
                      className="ml-detail-review-card"
                    >
                      <div className="ml-review-head">
                        <div className="ml-reviewer-info">
                          <div
                            className="ml-reviewer-avatar-circle"
                            style={{
                              overflow: "hidden",
                              padding: 0,
                            }}
                          >
                            {rev.customerAvatar &&
                            (rev.customerAvatar.startsWith("http") ||
                              rev.customerAvatar.startsWith("/") ||
                              rev.customerAvatar.includes("/")) ? (
                              <img
                                src={rev.customerAvatar}
                                alt={rev.customerName || (isEn ? "Customer" : "Khách")}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  if (e.target.nextSibling)
                                    e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <span
                              style={{
                                display:
                                  rev.customerAvatar &&
                                  (rev.customerAvatar.startsWith("http") ||
                                    rev.customerAvatar.startsWith("/") ||
                                    rev.customerAvatar.includes("/"))
                                    ? "none"
                                    : "flex",
                                width: "100%",
                                height: "100%",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {(rev.customerName || "K")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="ml-reviewer-name-txt">
                              {rev.customerName || (isEn ? "MarketLink Shopper" : "Khách hàng MarketLink")}
                            </div>
                            <div className="ml-review-date-txt">
                              {rev.createdAt
                                ? String(rev.createdAt)
                                    .replace("T", " ")
                                    .substring(0, 10)
                                : (isEn ? "Recently" : "Gần đây")}
                            </div>
                          </div>
                        </div>
                        <div className="ml-review-stars-txt">
                          {"★".repeat(rev.rating || 5)}
                          {"☆".repeat(5 - (rev.rating || 5))}
                        </div>
                      </div>
                      <p className="ml-review-comment-txt">{rev.comment}</p>
                      {rev.replyComment && (
                        <div className="ml-review-reply-box">
                          <strong>{isEn ? "Grower response:" : "Phản hồi từ chủ sạp:"}</strong>{" "}
                          {rev.replyComment}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  textAlign: "center",
                  paddingTop: "12px",
                }}
              >
                <Button variant="outline" size="md" onClick={handleBackToList}>
                  {isEn ? "← Back to all stalls" : "← Quay lại danh sách gian hàng"}
                </Button>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="ml-stalls-page">
      <section className="ml-stalls-hero">
        <div className="ml-container">
          <div className="ml-stalls-hero-content">
            <div className="ml-stalls-hero-badge">
              <span>🏡</span>
              <span>{isEn ? "Local Farmer Stalls" : "Gian Hàng Nông Dân Bản Địa"}</span>
            </div>

            <h1 className="ml-stalls-hero-title">
              {isEn ? "Discover Stalls at the Morning Farmers Market" : "Khám Phá Các Gian Hàng Tại Phiên Chợ Sáng"}
            </h1>

            <p className="ml-stalls-hero-desc">
              {isEn
                ? "Directly connect with passionate growers of clean vegetables, fruits, and mushrooms. Check which market they attend, pre-order fresh morning harvests, and pick up in person on weekends."
                : "Kết nối trực tiếp từng sạp rau, trái cây, nấm sạch của các nông hộ tâm huyết. Xem sạp hoạt động ở chợ nào, đặt trước nông sản hái sớm và đến nhận hàng tận tay vào sáng cuối tuần."}
            </p>

            <div className="ml-stalls-stats-strip">
              <div className="ml-stalls-stat-pill">
                <span>🎪</span>
                <span>
                  <span className="num">{stalls.length}</span> {isEn ? "Active stalls" : "Gian hàng mở bán"}
                </span>
              </div>
              <div className="ml-stalls-stat-pill">
                <span>📍</span>
                <span>
                  <span className="num">4+</span> {isEn ? "Affiliated markets" : "Phiên chợ liên kết"}
                </span>
              </div>
              <div className="ml-stalls-stat-pill">
                <span>🛡️</span>
                <span>
                  <span className="num">100%</span> {isEn ? "VietGAP & Organic Certified" : "Chuẩn VietGAP & Hữu cơ"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ml-container">
        <div className="ml-stalls-filter-card">
          <div className="ml-stalls-filter-row-top">
            <div className="ml-filter-input-wrap">
              <span className="ml-filter-icon">🔍</span>
              <input
                type="text"
                className="ml-filter-input"
                placeholder={isEn ? "Search stall name, farmer, produce (spinach, strawberry, A-01)..." : "Tìm tên sạp, nông dân, rau củ (cải bó xôi, dâu tây, A-01)..."}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              {searchKeyword && (
                <button
                  type="button"
                  className="ml-filter-clear-btn"
                  onClick={() => setSearchKeyword("")}
                  title={isEn ? "Clear search" : "Xóa tìm kiếm"}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="ml-filter-select-wrap">
              <span className="ml-filter-icon">🎪</span>
              <select
                className="ml-filter-select"
                value={selectedMarketId}
                onChange={(e) => setSelectedMarketId(e.target.value)}
              >
                <option value="all">{isEn ? "All Farmers Markets" : "Tất cả phiên chợ"}</option>
                {marketsList && marketsList.length > 0 ? (
                  marketsList.map((m) => (
                    <option key={m.marketId || m.id} value={m.name}>
                      {localizeMarketName(m.name)}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Ba Đình">{isEn ? "Ba Dinh Green Market" : "Phiên Chợ Xanh Ba Đình"}</option>
                    <option value="Thảo Điền">
                      {isEn ? "Thao Dien Organic Market" : "Phiên Chợ Hữu Cơ Thảo Điền"}
                    </option>
                    <option value="Tây Hồ">{isEn ? "Tay Ho Farmers Fair" : "Hội Chợ Nông Sản Tây Hồ"}</option>
                    <option value="Ecopark">{isEn ? "Ecopark Produce Market" : "Chợ Nông Sản Ecopark"}</option>
                  </>
                )}
              </select>
            </div>

            <div className="ml-filter-select-wrap">
              <span className="ml-filter-icon">📍</span>
              <select
                className="ml-filter-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="all">{isEn ? "All regions" : "Tất cả khu vực"}</option>
                <option value="hanoi">{isEn ? "Hanoi (Ba Dinh, Tay Ho)" : "Hà Nội (Ba Đình, Tây Hồ)"}</option>
                <option value="hcm">{isEn ? "Ho Chi Minh City (Thao Dien)" : "TP. Hồ Chí Minh (Thảo Điền)"}</option>
              </select>
            </div>

            <div className="ml-filter-select-wrap">
              <span className="ml-filter-icon">🛡️</span>
              <select
                className="ml-filter-select"
                value={selectedCert}
                onChange={(e) => setSelectedCert(e.target.value)}
              >
                <option value="all">{isEn ? "All certifications" : "Tất cả chứng nhận"}</option>
                <option value="vietgap">{isEn ? "VietGAP Standard" : "Chuẩn VietGAP"}</option>
                <option value="organic">{isEn ? "Organic Certified" : "Hữu cơ (Organic)"}</option>
                <option value="ocop">{isEn ? "OCOP Specialty" : "Đặc sản OCOP"}</option>
              </select>
            </div>
          </div>

          <div className="ml-quick-search-chips">
            <span className="ml-quick-search-label">{isEn ? "Suggestions:" : "Gợi ý:"}</span>
            {POPULAR_STALL_KEYWORDS.map((kw, idx) => (
              <button
                key={idx}
                type="button"
                className={`ml-quick-search-tag ${searchKeyword === kw ? "active" : ""}`}
                onClick={() => setSearchKeyword(searchKeyword === kw ? "" : kw)}
              >
                {localizeProduceName(kw)}
              </button>
            ))}
          </div>

          <div className="ml-stalls-filter-row-bottom">
            <div className="ml-stalls-chip-tabs">
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "var(--color-text-muted)",
                  marginRight: "4px",
                }}
              >
                {isEn ? "Specialty:" : "Chuyên canh:"}
              </span>
              <button
                type="button"
                className={`ml-stalls-tab ${selectedSpecialty === "all" ? "active" : ""}`}
                onClick={() => setSelectedSpecialty("all")}
              >
                🌿 {isEn ? "All" : "Tất cả"} ({stalls.length})
              </button>
              <button
                type="button"
                className={`ml-stalls-tab ${selectedSpecialty === "Rau" ? "active" : ""}`}
                onClick={() => setSelectedSpecialty("Rau")}
              >
                🥬 {isEn ? "Organic Greens" : "Rau Lá Hữu Cơ"}
              </button>
              <button
                type="button"
                className={`ml-stalls-tab ${selectedSpecialty === "Củ" ? "active" : ""}`}
                onClick={() => setSelectedSpecialty("Củ")}
              >
                🥕 {isEn ? "Roots & Fresh Veggies" : "Củ & Quả Tươi"}
              </button>
              <button
                type="button"
                className={`ml-stalls-tab ${selectedSpecialty === "Trái Cây" ? "active" : ""}`}
                onClick={() => setSelectedSpecialty("Trái Cây")}
              >
                🍓 {isEn ? "Native Fruits" : "Trái Cây Bản Địa"}
              </button>
              <button
                type="button"
                className={`ml-stalls-tab ${selectedSpecialty === "Nấm" ? "active" : ""}`}
                onClick={() => setSelectedSpecialty("Nấm")}
              >
                🍄 {isEn ? "Mushrooms & Herbs" : "Nấm & Thảo Dược"}
              </button>
            </div>

            <div className="ml-stalls-sort-box">
              <span>{isEn ? "Sort by:" : "Sắp xếp:"}</span>
              <select
                className="ml-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating_desc">⭐ {isEn ? "Highest rated" : "Đánh giá cao nhất"}</option>
                <option value="prods_desc">📦 {isEn ? "Most produce items" : "Nhiều sản phẩm nhất"}</option>
                <option value="code_asc">🏷️ {isEn ? "Stall Code (A → Z)" : "Mã sạp (A → Z)"}</option>
                <option value="name_asc">🏡 {isEn ? "Farm Name (A → Z)" : "Tên nhà vườn (A → Z)"}</option>
              </select>
            </div>
          </div>
        </div>

        {(searchKeyword.trim() !== "" ||
          selectedMarketId !== "all" ||
          selectedCity !== "all" ||
          selectedSpecialty !== "all" ||
          selectedCert !== "all") && (
          <div className="ml-stalls-status-bar">
            <span>
              {isEn ? "Found " : "Tìm thấy "}
              <strong>{sortedStalls.length}</strong>
              {isEn ? " matching stalls" : " gian hàng phù hợp"}
              {searchKeyword && (
                <>
                  {isEn ? " for " : " với từ khóa "}
                  "<strong>{searchKeyword}</strong>"
                </>
              )}
              {selectedMarketId !== "all" && (
                <>
                  {isEn ? " at " : " tại chợ "}
                  <strong>{localizeMarketName(selectedMarketId)}</strong>
                </>
              )}
              {selectedCity !== "all" && (
                <>
                  {isEn ? " in " : " khu vực "}
                  <strong>
                    {selectedCity === "hanoi" ? (isEn ? "Hanoi" : "Hà Nội") : (isEn ? "HCMC" : "TP. HCM")}
                  </strong>
                </>
              )}
            </span>
            <button
              type="button"
              className="ml-stalls-reset-link"
              onClick={handleResetFilters}
            >
              {isEn ? "Clear all filters" : "Xóa tất cả bộ lọc"}
            </button>
          </div>
        )}

        <div className="ml-stalls-grid">
          {paginatedStalls.map((stall) => (
            <div key={stall.id} className="ml-stall-card">
              <div className="ml-stall-card-header">
                <img
                  src={stall.coverUrl}
                  alt={stall.farmName}
                  className="ml-stall-card-cover"
                />
                <div className="ml-stall-cover-overlay"></div>
                <div className="ml-stall-badge-code">
                  <span>🎪</span>
                  <span>{stall.stallCode}</span>
                </div>
                <div className="ml-stall-badge-cert">{stall.certification}</div>
                <div className="ml-stall-avatar-wrap">
                  <img
                    src={stall.avatarUrl}
                    alt={stall.farmerName}
                    className="ml-stall-avatar-img"
                  />
                </div>
              </div>

              <div className="ml-stall-card-body">
                <div className="ml-stall-title-row">
                  <h3 className="ml-stall-farm-name">{stall.farmName}</h3>
                  <div className="ml-stall-rating">
                    <span>⭐</span>
                    <span>{stall.rating}</span>
                  </div>
                </div>

                <div className="ml-stall-farmer-name">
                  {isEn ? "Grower: " : "Chủ sạp: "}<strong>{stall.farmerName}</strong> (
                  {stall.reviewCount} {isEn ? "reviews" : "đánh giá"})
                </div>

                <div className="ml-stall-meta-box">
                  <div className="ml-stall-meta-item">
                    <span className="ml-stall-meta-icon">📍</span>
                    <span>
                      {isEn ? "At: " : "Tại: "}<strong>{localizeMarketName(stall.marketName)}</strong>
                    </span>
                  </div>
                  <div className="ml-stall-meta-item">
                    <span className="ml-stall-meta-icon">⏰</span>
                    <span>
                      {localizeOperatingDays(stall.operatingDays)} ({stall.operatingHours})
                    </span>
                  </div>
                </div>

                <div className="ml-stall-specialties-wrap">
                  {stall.specialtyTags &&
                    stall.specialtyTags.map((tag, idx) => (
                      <span key={idx} className="ml-stall-spec-tag">
                        {localizeProduceName(tag)}
                      </span>
                    ))}
                </div>

                <p className="ml-stall-bio-snip">{stall.bio}</p>

                <div className="ml-stall-card-actions">
                  <Button
                    variant="primary"
                    size="md"
                    className="ml-stall-btn-primary"
                    onClick={() => handleOpenDetail(stall)}
                  >
                    {isEn ? "View stall details →" : "Xem chi tiết gian hàng →"}
                  </Button>
                  <div
                    className="ml-stall-prods-badge"
                    title={isEn ? "Produce items open for pre-order" : "Số lượng sản phẩm mở bán"}
                  >
                    {stall.productsCount} {isEn ? "items" : "món"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={sortedStalls.length}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => {
            setCurrentPage(p);
            window.scrollTo({ top: 400, behavior: "smooth" });
          }}
        />

        {sortedStalls.length === 0 && (
          <div className="ml-stalls-empty-container">
            <div className="ml-stalls-empty-card">
              <span className="ml-stalls-empty-icon">🎪</span>
              <div className="ml-stalls-empty-title">
                {searchKeyword
                  ? (isEn ? `No stalls found matching "${searchKeyword}"` : `Không tìm thấy gian hàng khớp với "${searchKeyword}"`)
                  : (isEn ? "No stalls match the selected filters" : "Không có gian hàng nào khớp bộ lọc")}
              </div>
              <div className="ml-stalls-empty-desc">
                {isEn
                  ? "You can try clicking one of the popular keywords below or clear filters to view more stalls."
                  : "Bạn có thể thử bấm vào một trong các từ khóa phổ biến bên dưới hoặc xóa bớt tiêu chí lọc để xem thêm gian hàng."}
              </div>

              <div className="ml-empty-suggestions-box">
                <span className="ml-empty-suggestions-label">
                  {isEn ? "Try searching for:" : "Thử tìm kiếm với:"}
                </span>
                <div className="ml-empty-chips-list">
                  {POPULAR_STALL_KEYWORDS.map((kw, i) => (
                    <button
                      key={i}
                      type="button"
                      className="ml-empty-chip-btn"
                      onClick={() => {
                        setSearchKeyword(kw);
                        setSelectedMarketId("all");
                        setSelectedCity("all");
                        setSelectedSpecialty("all");
                        setSelectedCert("all");
                      }}
                    >
                      🔍 {localizeProduceName(kw)}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "12px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleResetFilters}
                >
                  {isEn ? "↺ View all stalls" : "↺ Xem tất cả gian hàng"}
                </Button>
              </div>
            </div>

            <div className="ml-fallback-recommended-section">
              <div className="ml-fallback-header">
                <span className="ml-fallback-badge">{isEn ? "⭐ HIGHLY RATED" : "⭐ ĐƯỢC ĐÁNH GIÁ CAO"}</span>
                <h3 className="ml-fallback-title">
                  {isEn ? "Featured Stalls at Farmers Markets" : "Gợi Ý Các Gian Hàng Nổi Bật Tại Chợ Phiên"}
                </h3>
                <p className="ml-fallback-sub">
                  {isEn
                    ? "Trusted local growers with fresh harvest ready for your morning pickup:"
                    : "Các nhà vườn uy tín có nhiều nông sản tươi ngon sẵn sàng phục vụ bạn:"}
                </p>
              </div>

              <div className="ml-stalls-grid">
                {stalls.slice(0, 3).map((stall) => (
                  <div key={stall.id} className="ml-stall-card">
                    <div className="ml-stall-card-header">
                      <img
                        src={stall.coverUrl}
                        alt={stall.farmName}
                        className="ml-stall-card-cover"
                      />
                      <div className="ml-stall-cover-overlay"></div>
                      <div className="ml-stall-badge-code">
                        <span>🎪</span>
                        <span>{stall.stallCode}</span>
                      </div>
                      <div className="ml-stall-badge-cert">
                        {stall.certification}
                      </div>
                      <div className="ml-stall-avatar-wrap">
                        <img
                          src={stall.avatarUrl}
                          alt={stall.farmerName}
                          className="ml-stall-avatar-img"
                        />
                      </div>
                    </div>
                    <div className="ml-stall-card-body">
                      <div className="ml-stall-title-row">
                        <h3 className="ml-stall-farm-name">{stall.farmName}</h3>
                        <div className="ml-stall-rating">
                          <span>⭐</span>
                          <span>{stall.rating}</span>
                        </div>
                      </div>
                      <div className="ml-stall-farmer-name">
                        {isEn ? "Grower: " : "Chủ sạp: "}<strong>{stall.farmerName}</strong>
                      </div>
                      <div className="ml-stall-meta-box">
                        <div className="ml-stall-meta-item">
                          <span className="ml-stall-meta-icon">📍</span>
                          <span>
                            {isEn ? "At: " : "Tại: "}<strong>{localizeMarketName(stall.marketName)}</strong>
                          </span>
                        </div>
                        <div className="ml-stall-meta-item">
                          <span className="ml-stall-meta-icon">⏰</span>
                          <span>{localizeOperatingDays(stall.operatingDays)}</span>
                        </div>
                      </div>
                      <div
                        className="ml-stall-card-actions"
                        style={{
                          marginTop: "auto",
                        }}
                      >
                        <Button
                          variant="primary"
                          size="md"
                          className="ml-stall-btn-primary"
                          onClick={() => handleOpenDetail(stall)}
                        >
                          {isEn ? "View stall details →" : "Xem chi tiết gian hàng →"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
