import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Store, ShieldCheck, ArrowRight } from 'lucide-react';
import { MarketStall3D } from '@/components/3d/MarketStall3D';
import { FloatingFruit } from '@/components/3d/FloatingProduce3D';
import { MarketMap } from '@/components/market/MarketMap';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductModal } from '@/components/product/ProductModal';
import { marketsApi } from '@/api/markets.api';
import { productsApi } from '@/api/products.api';
import { adminApi } from '@/api/admin.api';

export const HomePage = ({
  onSelectMarket = () => {},
}) => {
  const [markets, setMarkets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMarket, setActiveMarket] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [mkList, catList, prodList, annList] = await Promise.allSettled([
          marketsApi.getAllMarkets(),
          productsApi.getCategories(),
          productsApi.getAllProducts({ size: 50 }),
          adminApi.getAnnouncements(),
        ]);

        if (mkList.status === 'fulfilled') setMarkets(Array.isArray(mkList.value) ? mkList.value : []);
        if (catList.status === 'fulfilled') setCategories(Array.isArray(catList.value) ? catList.value : []);
        if (prodList.status === 'fulfilled') setProducts(Array.isArray(prodList.value) ? prodList.value : []);
        if (annList.status === 'fulfilled') setAnnouncements(Array.isArray(annList.value) ? annList.value : []);
      } catch (e) {
        console.error('Error fetching initial data from backend:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCat = !selectedCategory || p.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.farmerStallName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const uniqueFarmersCount = new Set(products.map((p) => p.farmerStallName || p.farmerId).filter(Boolean)).size;
  const totalStockKg = products.reduce((acc, p) => acc + (Number(p.currentStock) || 0), 0);
  const featuredProduct = products[0] || null;

  const scrollToProducts = () => {
    const el = document.getElementById('products-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero-section">
        <FloatingFruit
          type="tomato"
          size={52}
          style={{ position: 'absolute', top: '15%', left: '4%', zIndex: 0 }}
          className="animate-float-slow"
        />
        <FloatingFruit
          type="orange"
          size={48}
          style={{ position: 'absolute', top: '75%', right: '5%', zIndex: 0 }}
          className="animate-float-reverse"
        />
        <FloatingFruit
          type="leaf"
          size={40}
          style={{ position: 'absolute', top: '10%', right: '12%', zIndex: 0 }}
          className="animate-float-slow"
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="home-hero-grid">
            <div>
              <div className="home-hero-badge">
                <Sparkles size={16} color="var(--primary)" />
                <span>Nông Sản Hữu Cơ & VietGAP Chuẩn 100%</span>
              </div>

              <h1 className="home-hero-title">
                Nông Sản Tươi Ngon <br />
                <span className="home-hero-title-highlight">Chỉ Với Một Cú Chạm</span>
              </h1>

              <p className="home-hero-subtitle">
                Khám phá phiên chợ địa phương, đặt trước trực tiếp từ nhà vườn uy tín. Hái tươi trong ngày, nhận hàng thong thả và thanh toán trực tiếp tại sạp (Pay-at-pickup).
              </p>

              <div className="home-search-bar">
                <Search size={20} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Tìm rau xanh, cà chua, dâu tây hoặc tên sạp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="home-search-input"
                />
                <button
                  type="button"
                  onClick={scrollToProducts}
                  className="home-search-btn"
                >
                  Tìm Kiếm
                </button>
              </div>

              <div className="home-trust-badges">
                <div className="home-trust-item">
                  <ShieldCheck size={18} />
                  <span>Không rủi ro thanh toán</span>
                </div>
                <div className="home-trust-item">
                  <Store size={18} />
                  <span>Đặt trực tiếp tại sạp nông dân</span>
                </div>
              </div>
            </div>

            <div className="home-3d-card-wrapper">
              <div className="home-3d-card preserve-3d">
                <div className="home-3d-header">
                  <span className="home-3d-header-title">
                    3D FARMER MARKET STALL
                  </span>
                  <span className="home-3d-badge">
                    Trực Quan 360°
                  </span>
                </div>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <MarketStall3D width={360} height={260} interactive={true} />
                </div>

                {featuredProduct && (
                  <div className="home-featured-card">
                    <div>
                      <div className="home-featured-name">
                        {featuredProduct.farmerStallName}
                      </div>
                      <div className="home-featured-desc">
                        {featuredProduct.name} • Tồn: {featuredProduct.currentStock} {featuredProduct.unit}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(featuredProduct)}
                      className="home-featured-btn"
                    >
                      Đặt trước
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="container">
        <div className="home-metrics-grid">
          <div className="home-metric-card glass-card-3d">
            <div className="home-metric-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
              👨‍🌾
            </div>
            <div>
              <span className="home-metric-label">Nhà Vườn Liên Kết</span>
              <div className="home-metric-value">{uniqueFarmersCount} sạp</div>
              <span className="home-metric-sub" style={{ color: '#16a34a' }}>✓ Đạt chuẩn an toàn</span>
            </div>
          </div>

          <div className="home-metric-card glass-card-3d">
            <div className="home-metric-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              📍
            </div>
            <div>
              <span className="home-metric-label">Điểm Chợ Phiên</span>
              <div className="home-metric-value">{markets.length} điểm</div>
              <span className="home-metric-sub" style={{ color: '#d97706' }}>Hà Nội & TP.HCM</span>
            </div>
          </div>

          <div className="home-metric-card glass-card-3d">
            <div className="home-metric-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              🥦
            </div>
            <div>
              <span className="home-metric-label">Mặt Hàng Nông Sản</span>
              <div className="home-metric-value">{products.length} loại</div>
              <span className="home-metric-sub" style={{ color: '#0284c7' }}>Hái tươi trong ngày</span>
            </div>
          </div>

          <div className="home-metric-card glass-card-3d">
            <div className="home-metric-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>
              📦
            </div>
            <div>
              <span className="home-metric-label">Sản Lượng Sẵn Sàng</span>
              <div className="home-metric-value">{totalStockKg} kg</div>
              <span className="home-metric-sub" style={{ color: '#ea580c' }}>✓ Cho phép đặt trước</span>
            </div>
          </div>
        </div>
      </section>

      {/* Market Map Section */}
      <section className="container">
        <div className="home-section-header-row">
          <div>
            <div className="home-section-tag">
              Mạng Lưới Chợ Nông Sản Địa Phương
            </div>
            <h2 className="home-section-title">
              Bản Đồ Điểm Chợ & Sạp Hàng
            </h2>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Dữ liệu tọa độ GPS thực tế từ hệ thống MarketLink
          </div>
        </div>

        <MarketMap
          markets={markets}
          selectedMarket={activeMarket}
          onSelectMarket={(m) => {
            setActiveMarket(m);
            onSelectMarket(m);
          }}
          height="440px"
        />

        {activeMarket && (
          <div className="home-selected-market-bar animate-slide-up">
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>
                📍 {activeMarket.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {activeMarket.address}
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToProducts}
              className="home-selected-market-btn"
            >
              <span>Xem Nông Sản Tại Chợ Này</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>

      {/* Produce Catalog */}
      <section id="products-section" className="container">
        <div className="home-catalog-header">
          <div className="home-section-tag">
            Mùa Vụ Thu Hoạch Hôm Nay
          </div>
          <h2 className="home-section-title">
            Nông Sản Tươi Sạch Đang Cho Đặt Trước
          </h2>
          <p className="home-section-subtitle">
            Lấy trực tiếp từ hệ thống API máy chủ MarketLink
          </p>
        </div>

        <div className="home-categories-bar">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`home-category-btn ${selectedCategory === null ? 'active' : ''}`}
          >
            Tất Cả ({products.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.categoryId}
              type="button"
              onClick={() => setSelectedCategory(cat.categoryId)}
              className={`home-category-btn ${selectedCategory === cat.categoryId ? 'active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Đang tải danh sách nông sản từ máy chủ...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="home-empty-notice">
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>🥕</span>
            <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              Không tìm thấy nông sản phù hợp
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Vui lòng thử tìm với từ khóa khác hoặc chuyển sang danh mục khác.
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.productId}
                product={p}
                onQuickView={(prod) => setQuickViewProduct(prod)}
              />
            ))}
          </div>
        )}
      </section>

      {/* System Announcements */}
      {announcements.length > 0 && (
        <section className="container">
          <div className="home-announcements-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '22px' }}>📢</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Bản Tin & Thông Báo Hệ Thống
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {announcements.map((ann) => (
                <div key={ann.announcementId} className="home-announcement-card">
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>
                    {ann.adminName} • {ann.publishedAt?.split('T')[0] || ann.publishedAt?.slice(0, 10) || 'Gần đây'}
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {ann.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick View Modal */}
      <ProductModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
