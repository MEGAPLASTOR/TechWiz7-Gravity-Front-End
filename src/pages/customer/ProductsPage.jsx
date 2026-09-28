import React, { useState, useEffect, useMemo } from "react";
import "@/assets/styles/pages/customer/ProductsPage.css";
import ProductCard from "../../components/customer/ProductCard";
import ProductDetailModal from "../../components/customer/ProductDetailModal";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import productService from "../../services/productService";
import marketService from "../../services/marketService";
import { matchSearch, POPULAR_PRODUCT_KEYWORDS } from "../../utils/searchUtils";
import { useLanguage } from "../../context/LanguageContext";

export default function ProductsPage({
  onAddToCart,
  cartItems = [],
  onUpdateCartQty,
  onNavigate,
  initialMarket = "all",
}) {
  const { t, isEn, localizeProduceName, localizeCategoryName, localizeMarketName } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMarket, setSelectedMarket] = useState(initialMarket || "all");
  const [sortBy, setSortBy] = useState("popular");
  const [priceMax, setPriceMax] = useState(200000);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;
  useEffect(() => {
    if (initialMarket && initialMarket !== "all") {
      setSelectedMarket(initialMarket);
    }
  }, [initialMarket]);
  const [categories, setCategories] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    let isMounted = true;
    async function loadMetadata() {
      try {
        const [cats, mrkts] = await Promise.all([
          productService.getCategories(),
          marketService.getMarkets(),
        ]);
        if (isMounted) {
          if (cats && cats.length > 0) {
            setCategories(
              cats.map((c) => ({
                ...c,
                icon: c.name.includes("Rau")
                  ? "🥬"
                  : c.name.includes("Củ")
                    ? "🥕"
                    : c.name.includes("Trái")
                      ? "🍓"
                      : "🍄",
              })),
            );
          }
          if (mrkts && mrkts.length > 0) {
            setMarkets(
              mrkts.map((m) => ({
                id: m.marketId || m.id,
                name: m.name,
              })),
            );
          }
        }
      } catch (err) {
        console.warn(
          "Using fallback categories/markets for ProductsPage:",
          err,
        );
      }
    }
    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, []);
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        let targetMarketId = "";
        if (selectedMarket !== "all") {
          const matched = markets.find(
            (m) =>
              String(m.id) === String(selectedMarket) ||
              m.name === selectedMarket,
          );
          targetMarketId = matched
            ? matched.id
            : !isNaN(selectedMarket)
              ? selectedMarket
              : "";
        }
        const prods = await productService.getProducts({
          keyword: searchTerm.trim(),
          categoryId: selectedCategory !== "all" ? selectedCategory : "",
          marketId: targetMarketId,
          status: "AVAILABLE",
        });
        if (isMounted) {
          if (prods && prods.length > 0) {
            setProducts(
              prods.map((p) => ({
                ...p,
                id: p.productId || p.id,
                farmerId: p.farmerId || p.farmer?.id || p.farmerUserId || p.userId,
                name: p.name,
                categoryId: p.categoryId,
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
                description:
                  p.description || "",
              })),
            );
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch filtered products from server", err);
      }
    }, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedCategory, selectedMarket, markets]);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedMarket, priceMax, sortBy]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.price <= priceMax)
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        return (b.stockQuantity || 0) - (a.stockQuantity || 0);
      });
  }, [products, sortBy, priceMax]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);
  const getCartQty = (prodId) => {
    const found = cartItems.find((item) => item.id === prodId);
    return found ? found.quantity : 0;
  };
  const formatCurrency = (val) => {
    if (isEn) return `${Number(val || 0).toLocaleString()} VND`;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };
  return (
    <div className="ml-products-page">
      <div className="ml-products-banner">
        <div className="ml-container ml-products-banner-inner">
          <div>
            <span className="ml-section-subtitle">
              {t("productsSubtitle", "Duyệt Nông Sản Tươi Sạch")} ({products.length} {isEn ? "Items" : "Sản phẩm"})
            </span>
            <h1 className="ml-products-title">{t("productsTitle", "Đặt Trước Nông Sản Theo Mùa")}</h1>
            <p className="ml-products-desc">
              {t("productsDesc", "Thu hoạch sớm trong ngày họp chợ. Chọn sạp, giữ chỗ trước và nhận hàng tươi ngon tận tay!")}
            </p>
          </div>
          <div className="ml-products-search-container">
            <div className="ml-products-search-wrap">
              <span className="ml-search-icon">🔍</span>
              <input
                type="text"
                placeholder={t("productsSearchPlaceholder", "Tìm theo tên cải bó xôi, dâu tây, tên sạp...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ml-products-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="ml-search-clear"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="ml-products-search-suggestions">
              <span className="ml-quick-label">{isEn ? "Suggestions:" : "Gợi ý:"}</span>
              {(isEn
                ? [
                    "🍅 Cherry Tomatoes",
                    "🍓 Strawberries",
                    "🥬 Baby Spinach",
                    "🍄 Mushrooms",
                    "🌿 Water Spinach",
                  ]
                : POPULAR_PRODUCT_KEYWORDS
              ).map((kw, i) => {
                const clean = kw.replace(/^[^\s]+\s*/, "");
                return (
                  <button
                    key={i}
                    type="button"
                    className={`ml-quick-tag-btn ${searchTerm === clean ? "active" : ""}`}
                    onClick={() =>
                      setSearchTerm(searchTerm === clean ? "" : clean)
                    }
                  >
                    {kw}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="ml-container ml-products-layout">
        <aside className="ml-products-sidebar">
          <div className="ml-filter-card">
            <div className="ml-filter-card-header">
              <h3 className="ml-filter-card-title">{t("productsFilterCardTitle", "Bộ Lọc Tìm Kiếm")}</h3>
              {(selectedCategory !== "all" ||
                selectedMarket !== "all" ||
                searchTerm !== "") && (
                <button
                  type="button"
                  className="ml-filter-reset"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedMarket("all");
                    setSearchTerm("");
                    setPriceMax(200000);
                  }}
                >
                  {t("productsFilterReset", "Xóa lọc")}
                </button>
              )}
            </div>

            <div className="ml-filter-block">
              <label className="ml-filter-label">{t("productsFilterCategory", "Danh mục sản phẩm")}</label>
              <div className="ml-cat-list">
                <button
                  type="button"
                  className={`ml-cat-btn ${selectedCategory === "all" ? "active" : ""}`}
                  onClick={() => setSelectedCategory("all")}
                >
                  <span>{t("productsFilterAllCats", "🌿 Tất cả danh mục")}</span>
                  <span className="ml-cat-count">{products.length}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.categoryId}
                    type="button"
                    className={`ml-cat-btn ${String(selectedCategory) === String(cat.categoryId) ? "active" : ""}`}
                    onClick={() => setSelectedCategory(String(cat.categoryId))}
                  >
                    <span>
                      {cat.icon || "🌱"} {localizeCategoryName(cat.name, isEn)}
                    </span>
                    <span className="ml-cat-count">
                      {
                        products.filter(
                          (p) =>
                            String(p.categoryId) === String(cat.categoryId),
                        ).length
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="ml-filter-block">
              <label className="ml-filter-label">{t("productsFilterMarket", "Điểm họp chợ phiên")}</label>
              <select
                className="ml-filter-select"
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
              >
                <option value="all">
                  {t("productsFilterAllMarkets", "Tất cả các chợ")} ({markets.length} {isEn ? "locations" : "điểm"})
                </option>
                {markets.map((m) => (
                  <option key={m.id} value={m.name}>
                    {localizeMarketName(m.name, isEn)}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-filter-block">
              <div className="ml-slider-header">
                <label className="ml-filter-label">{t("productsFilterMaxPrice", "Mức giá tối đa:")}</label>
                <span className="ml-slider-val">
                  {formatCurrency(priceMax)}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="200000"
                step="5000"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="ml-price-range"
              />
              <div className="ml-range-labels">
                <span>{isEn ? "10,000 VND" : "10.000₫"}</span>
                <span>{isEn ? "200,000 VND" : "200.000₫"}</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="ml-products-main">
          <div className="ml-products-topbar">
            <div className="ml-results-count">
              {t("productsCountPrefix", "Hiển thị")}{" "}
              <strong>{filteredProducts.length}</strong> / {products.length}{" "}
              {t("productsCountSuffix", "sản phẩm sẵn sàng đặt trước")}
            </div>

            <div className="ml-sort-wrap">
              <label htmlFor="sort-select" className="ml-sort-label">
                {t("productsSortLabel", "Sắp xếp:")}
              </label>
              <select
                id="sort-select"
                className="ml-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">{t("productsSortStock", "Tồn kho sẵn sàng")}</option>
                <option value="price_asc">{t("productsSortPriceAsc", "Giá từ thấp đến cao")}</option>
                <option value="price_desc">{t("productsSortPriceDesc", "Giá từ cao xuống thấp")}</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="ml-no-products">
              <span className="ml-no-prod-icon">🥦</span>
              <h3>
                {searchTerm
                  ? `${t("productsNoResultsMatch", "Không tìm thấy sản phẩm khớp với")} "${searchTerm}"`
                  : t("productsNoResults", "Không tìm thấy sản phẩm phù hợp")}
              </h3>
              <p>
                {t("productsNoResultsDesc", "Hãy thử bấm vào các gợi ý nông sản phổ biến hoặc xem các sản phẩm sẵn sàng đặt trước bên dưới.")}
              </p>

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
                          setSearchTerm(cleanKw);
                          setSelectedCategory("all");
                          setSelectedMarket("all");
                          setPriceMax(200000);
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
                    setSelectedCategory("all");
                    setSelectedMarket("all");
                    setSearchTerm("");
                    setPriceMax(200000);
                  }}
                >
                  {t("productsEmptyResetBtn", "↺ Xem tất cả nông sản")}
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
                  <span className="ml-fallback-badge">{t("productsFeaturedBadge", "🔥 NÔNG SẢN NỔI BẬT")}</span>
                  <h3 className="ml-fallback-title">
                    {t("productsFeaturedTitle", "Gợi Ý Nông Sản Sẵn Sàng Đặt Trước")}
                  </h3>
                  <p className="ml-fallback-sub">
                    {t("productsFeaturedSub", "Các mặt hàng tươi ngon được nhiều khách đi chợ lựa chọn:")}
                  </p>
                </div>

                <div className="ml-products-grid">
                  {products.slice(0, 3).map((product) => (
                    <div key={product.id} className="ml-prod-card-wrap">
                      <ProductCard
                        product={product}
                        cartQuantity={getCartQty(product.id)}
                        onAddToCart={onAddToCart}
                        onUpdateQty={onUpdateCartQty}
                        onClick={() => setSelectedProduct(product)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="ml-products-grid">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="ml-prod-card-wrap">
                    <ProductCard
                      product={product}
                      cartQuantity={getCartQty(product.id)}
                      onAddToCart={onAddToCart}
                      onUpdateQty={onUpdateCartQty}
                      onClick={() => setSelectedProduct(product)}
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
                  window.scrollTo({ top: 380, behavior: "smooth" });
                }}
              />
            </>
          )}
        </section>
      </div>

      {selectedProduct && (
        <ProductDetailModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          cartQuantity={getCartQty(selectedProduct.id)}
          onAddToCart={onAddToCart}
          onUpdateQty={onUpdateCartQty}
        />
      )}
    </div>
  );
}
