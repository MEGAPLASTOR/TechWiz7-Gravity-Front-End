import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Store, ShieldCheck, ArrowRight, ChevronDown, Check, Zap, Filter, X } from 'lucide-react';
import { FloatingFruit } from '@/components/3d/FloatingProduce3D';
import { MarketMap } from '@/components/market/MarketMap';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductModal } from '@/components/product/ProductModal';
import { marketsApi, productsApi, adminApi } from '@/services';

// Curated tag pills matching Eldorado quick filter tags
const QUICK_TAG_PILLS = [
  { id: 'all', label: '🌿 Tất Cả', icon: '🌿' },
  { id: 'ready', label: '⚡ Sẵn Sàng Tại Sạp', icon: '⚡' },
  { id: 'early', label: '🥬 Rau Hái Sáng Sớm', icon: '🥬' },
  { id: 'west', label: '🍊 Trái Cây Miền Tây', icon: '🍊' },
  { id: 'st25', label: '🌾 Gạo ST25 Sóc Trăng', icon: '🌾' },
  { id: 'fish', label: '🐟 Cá Đồng Tự Nhiên', icon: '🐟' },
  { id: 'vietgap', label: '⭐ Chuẩn VietGAP', icon: '⭐' },
  { id: 'top', label: '🏆 Nông Trại 5 Sao', icon: '🏆' },
];

// Fallback farm products matching eco-green Eldorado marketplace layout
const FALLBACK_FARM_PRODUCTS = [
  {
    productId: 'prod-1',
    name: 'Rau Muống Sông Đáy Hái Sớm',
    categoryId: 1,
    categoryName: 'Rau Củ Tươi',
    price: 35000,
    unit: 'bó (1kg)',
    currentStock: 65,
    farmerStallName: 'HTX Rau Sạch Sông Đáy',
    farmerId: 'farmer-1',
    rating: 4.95,
    reviewCount: 1420,
    cert: 'VietGAP',
    imageUrl: '/images/rau_muong.jpg',
    description: 'Rau muống non xanh ngắt, cọng giòn ngọt được tưới nước tự nhiên ven sông Đáy, cắt vào 4h sáng.',
  },
  {
    productId: 'prod-2',
    name: 'Bưởi Da Xanh Bến Tre Hữu Cơ',
    categoryId: 2,
    categoryName: 'Trái Cây Vườn',
    price: 85000,
    unit: 'quả (~1.5kg)',
    currentStock: 40,
    farmerStallName: 'Vườn Bưởi Chú Bảy Bến Tre',
    farmerId: 'farmer-2',
    rating: 5.0,
    reviewCount: 2628,
    cert: 'GlobalGAP',
    imageUrl: '/images/buoi_da_xanh.jpg',
    description: 'Bưởi da xanh ruột hồng đậm, múi mọng nước vị ngọt thanh mát, không hạt chuẩn GlobalGAP.',
  },
  {
    productId: 'prod-3',
    name: 'Cà Chua Bi Hữu Cơ Đà Lạt',
    categoryId: 1,
    categoryName: 'Rau Củ Tươi',
    price: 45000,
    unit: 'hộp 500g',
    currentStock: 80,
    farmerStallName: 'Nông Trại Mây Đà Lạt',
    farmerId: 'farmer-3',
    rating: 4.9,
    reviewCount: 815,
    cert: 'Hữu Cơ',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop',
    description: 'Cà chua bi đỏ mọng giòn ngọt trồng trong nhà màng hữu cơ, giàu vitamin, ăn sống cực ngon.',
  },
  {
    productId: 'prod-4',
    name: 'Gạo ST25 Sóc Trăng Thượng Hạng',
    categoryId: 3,
    categoryName: 'Gạo & Ngũ Cốc',
    price: 195000,
    unit: 'túi 5kg',
    currentStock: 120,
    farmerStallName: 'Vựa Gạo Sóc Trăng',
    farmerId: 'farmer-4',
    rating: 5.0,
    reviewCount: 3410,
    cert: 'Hữu Cơ',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop',
    description: 'Gạo ngon nhất thế giới ST25, hạt dài trắng trong, khi nấu chín dẻo mềm thơm mùi lá dứa tự nhiên.',
  },
  {
    productId: 'prod-5',
    name: 'Cá Lóc Đồng Tươi Tự Nhiên',
    categoryId: 4,
    categoryName: 'Thủy Hải Sản',
    price: 160000,
    unit: 'kg',
    currentStock: 25,
    farmerStallName: 'Thủy Sản Miền Tây',
    farmerId: 'farmer-5',
    rating: 4.88,
    reviewCount: 620,
    cert: 'Tự Nhiên',
    imageUrl: 'https://images.unsplash.com/photo-1534948216015-843149f72be3?w=500&auto=format&fit=crop',
    description: 'Cá lóc đồng đánh bắt tự nhiên kênh rạch, thịt chắc thơm ngọt, làm sạch sẵn đóng túi giữ lạnh.',
  },
  {
    productId: 'prod-6',
    name: 'Mật Ong Hoa Rừng Tây Nguyên',
    categoryId: 5,
    categoryName: 'Gia Vị Quê',
    price: 220000,
    unit: 'chai 500ml',
    currentStock: 50,
    farmerStallName: 'Trại Ong Gia Lai',
    farmerId: 'farmer-6',
    rating: 4.98,
    reviewCount: 1120,
    cert: 'OCOP 4 Sao',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop',
    description: 'Mật ong hoa rừng nguyên chất 100%, màu vàng óng ánh sóng sánh, hương thơm ngát tự nhiên.',
  },
  {
    productId: 'prod-7',
    name: 'Trứng Gà Ta Thả Vườn Đồi',
    categoryId: 1,
    categoryName: 'Rau Củ Tươi',
    price: 55000,
    unit: 'vỉ 10 quả',
    currentStock: 90,
    farmerStallName: 'Trang Trại Ba Vì',
    farmerId: 'farmer-7',
    rating: 4.92,
    reviewCount: 890,
    cert: 'VietGAP',
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop',
    description: 'Trứng gà ta thả vườn đồi ăn thóc bắp, lòng đỏ to màu cam đậm, thơm béo bổ dưỡng.',
  },
  {
    productId: 'prod-8',
    name: 'Nấm Đùi Gà Hữu Cơ Kim Bôi',
    categoryId: 1,
    categoryName: 'Rau Củ Tươi',
    price: 62000,
    unit: 'khay 400g',
    currentStock: 45,
    farmerStallName: 'HTX Nấm Sạch Kim Bôi',
    farmerId: 'farmer-8',
    rating: 4.9,
    reviewCount: 430,
    cert: 'VietGAP',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop',
    description: 'Nấm đùi gà thân mập mạp trắng nõn, vị giòn ngọt sần sật, chế biến món xào hoặc lẩu.',
  }
];

const FALLBACK_CATEGORIES = [
  { categoryId: 1, name: 'Rau Củ Tươi Sạch' },
  { categoryId: 2, name: 'Trái Cây Vườn' },
  { categoryId: 3, name: 'Gạo & Ngũ Cốc' },
  { categoryId: 4, name: 'Thủy Hải Sản' },
  { categoryId: 5, name: 'Gia Vị Quê' },
];

const FALLBACK_MARKETS = [
  { marketId: 1, name: 'Chợ Nông Sản Sạch Cầu Giấy', address: 'Số 1 Dịch Vọng Hậu, Cầu Giấy, Hà Nội', lat: 21.0333, lng: 105.7833 },
  { marketId: 2, name: 'Phiên Chợ Hữu Cơ Thảo Điền EcoMarket', address: '28 Thảo Điền, Quận 2, TP.HCM', lat: 10.8034, lng: 106.7381 },
];

export const HomePage = ({
  onSelectMarket = () => {},
}) => {
  const [markets, setMarkets] = useState(FALLBACK_MARKETS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState(FALLBACK_FARM_PRODUCTS);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & State (Eldorado style)
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTag, setActiveTag] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [standardFilter, setStandardFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeMarket, setActiveMarket] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [mkList, catList, prodList, annList] = await Promise.allSettled([
          marketsApi.getAllMarkets(),
          productsApi.getCategories(),
          productsApi.getAllProducts({ size: 50 }),
          adminApi.getAnnouncements(),
        ]);

        if (mkList.status === 'fulfilled' && Array.isArray(mkList.value) && mkList.value.length > 0) {
          setMarkets(mkList.value);
        }
        if (catList.status === 'fulfilled' && Array.isArray(catList.value) && catList.value.length > 0) {
          setCategories(catList.value);
        }
        if (prodList.status === 'fulfilled' && Array.isArray(prodList.value) && prodList.value.length > 0) {
          setProducts(prodList.value);
        }
        if (annList.status === 'fulfilled') {
          setAnnouncements(Array.isArray(annList.value) ? annList.value : []);
        }
      } catch (e) {
        console.warn('Error fetching initial data from backend, using fallback:', e);
      }
    }
    loadData();
  }, []);

  // Filter & Sort Logic
  const filteredProducts = products
    .filter((p) => {
      // Category Filter
      const matchesCat = !selectedCategory || p.categoryId === selectedCategory;

      // Search Query
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.farmerStallName?.toLowerCase().includes(searchQuery.toLowerCase());

      // Price Range Filter
      let matchesPrice = true;
      const price = Number(p.price) || 0;
      if (priceFilter === 'under-50k') matchesPrice = price < 50000;
      else if (priceFilter === '50k-100k') matchesPrice = price >= 50000 && price <= 100000;
      else if (priceFilter === '100k-200k') matchesPrice = price >= 100000 && price <= 200000;
      else if (priceFilter === 'over-200k') matchesPrice = price > 200000;

      // Quick Tag Filter
      let matchesTag = true;
      if (activeTag === 'ready') matchesTag = Number(p.currentStock) > 0;
      else if (activeTag === 'early') matchesTag = p.name.toLowerCase().includes('rau') || p.name.toLowerCase().includes('muống');
      else if (activeTag === 'west') matchesTag = p.name.toLowerCase().includes('bưởi') || p.name.toLowerCase().includes('cam');
      else if (activeTag === 'st25') matchesTag = p.name.toLowerCase().includes('gạo') || p.name.toLowerCase().includes('st25');
      else if (activeTag === 'fish') matchesTag = p.name.toLowerCase().includes('cá') || p.name.toLowerCase().includes('tôm');
      else if (activeTag === 'vietgap') matchesTag = (p.cert || '').toLowerCase().includes('vietgap') || true;
      else if (activeTag === 'top') matchesTag = (p.rating || 5) >= 4.8;

      return matchesCat && matchesSearch && matchesPrice && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      return 0; // recommended default
    });

  const uniqueFarmersCount = new Set(products.map((p) => p.farmerStallName || p.farmerId).filter(Boolean)).size;
  const totalStockKg = products.reduce((acc, p) => acc + (Number(p.currentStock) || 0), 0);

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setActiveTag('all');
    setPriceFilter('all');
    setDeliveryFilter('all');
    setStandardFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedCategory !== null ||
    activeTag !== 'all' ||
    priceFilter !== 'all' ||
    deliveryFilter !== 'all' ||
    standardFilter !== 'all' ||
    searchQuery !== '';

  const scrollToProducts = () => {
    const el = document.getElementById('products-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-container">
      {/* 1. 3D Hero Section with Floating Produce & Interactive 3D Stall */}
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
                <Sparkles size={16} color="var(--primary-light)" />
                <span>Nông Sản Hữu Cơ & VietGAP Chuẩn 100%</span>
              </div>

              <h1 className="home-hero-title">
                Nông Sản Tươi Ngon <br />
                <span className="home-hero-title-highlight">Chỉ Với Một Cú Chạm</span>
              </h1>

              <p className="home-hero-subtitle">
                Khám phá phiên chợ địa phương, đặt trước trực tiếp từ nhà vườn uy tín. Nhận hàng thong thả và thanh toán trực tiếp tại sạp (Pay-at-pickup).
              </p>

              <div className="home-hero-actions">
                <a
                  href="#products-section"
                  className="btn btn-primary"
                  style={{ padding: '12px 26px', fontSize: '0.95rem', fontWeight: 700 }}
                >
                  <Store size={18} />
                  <span>Khám Phá Sạp Nông Sản</span>
                </a>

                <button
                  type="button"
                  onClick={onSelectMarket}
                  className="btn btn-secondary"
                  style={{ padding: '12px 26px', fontSize: '0.95rem', fontWeight: 700 }}
                >
                  <span>Xem Điểm Chợ Phiên</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="home-hero-trust">
                <span>✓ Không rủi ro thanh toán</span>
                <span>✓ Đặt trước trực tiếp tại sạp nông dân</span>
                <span>✓ Hái tươi sáng sớm trong ngày</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Eldorado-Inspired Marketplace Filter & Control Architecture */}
      <section id="products-section" className="container">
        <div className="eldorado-marketplace-section">
          {/* Sub-category Tabs Row */}
          <div className="eldorado-category-bar">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`eldorado-category-tab ${selectedCategory === null ? 'active' : ''}`}
            >
              🌿 Tất Cả Danh Mục ({products.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                type="button"
                onClick={() => setSelectedCategory(cat.categoryId)}
                className={`eldorado-category-tab ${selectedCategory === cat.categoryId ? 'active' : ''}`}
              >
                <span>🌱</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Filter Dropdowns Row (Price, Delivery, Standard, Clear) */}
          <div className="eldorado-filter-row">
            {/* Price Range Dropdown */}
            <div className="eldorado-filter-select-wrap">
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="eldorado-filter-select"
                aria-label="Khoảng giá"
              >
                <option value="all">Khoảng Giá: Tất Cả</option>
                <option value="under-50k">Dưới 50.000đ</option>
                <option value="50k-100k">50.000đ - 100.000đ</option>
                <option value="100k-200k">100.000đ - 200.000đ</option>
                <option value="over-200k">Trên 200.000đ</option>
              </select>
              <ChevronDown size={14} className="eldorado-filter-chevron" />
            </div>

            {/* Delivery/Pickup Time Dropdown */}
            <div className="eldorado-filter-select-wrap">
              <select
                value={deliveryFilter}
                onChange={(e) => setDeliveryFilter(e.target.value)}
                className="eldorado-filter-select"
                aria-label="Thời gian thu hoạch"
              >
                <option value="all">Thu Hoạch: Tất Cả</option>
                <option value="morning">Hái sáng sớm (4h - 7h)</option>
                <option value="today">Hái trong ngày</option>
                <option value="weekend">Đặt trước cuối tuần</option>
              </select>
              <ChevronDown size={14} className="eldorado-filter-chevron" />
            </div>

            {/* Quality Standard Dropdown */}
            <div className="eldorado-filter-select-wrap">
              <select
                value={standardFilter}
                onChange={(e) => setStandardFilter(e.target.value)}
                className="eldorado-filter-select"
                aria-label="Tiêu chuẩn canh tác"
              >
                <option value="all">Tiêu Chuẩn: Tất Cả</option>
                <option value="vietgap">Chuẩn VietGAP</option>
                <option value="organic">Hữu Cơ (Organic 100%)</option>
                <option value="globalgap">GlobalGAP</option>
                <option value="ocop">Chuẩn OCOP</option>
              </select>
              <ChevronDown size={14} className="eldorado-filter-chevron" />
            </div>

            {/* Clear Filters Button if any filter is active */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="eldorado-clear-btn"
                title="Bỏ tất cả bộ lọc"
              >
                ✕ Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Quick Tag Filter Pills Row (Java, Money, 1b style) */}
          <div className="eldorado-tags-row">
            {QUICK_TAG_PILLS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setActiveTag(tag.id)}
                className={`eldorado-tag-pill ${activeTag === tag.id ? 'active' : ''}`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* In-view Search & Sort Action Bar */}
          <div className="eldorado-action-bar">
            {/* Search within filtered list */}
            <div className="eldorado-inview-search">
              <input
                type="text"
                placeholder="Tìm tên nông sản, sạp hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="eldorado-inview-input"
              />
              <Search size={15} className="eldorado-inview-search-icon" />
            </div>

            <div className="eldorado-meta-bar">
              {/* Items Found Counter */}
              <div className="eldorado-count-badge">
                <strong>{filteredProducts.length}</strong> nông sản tươi khả dụng
              </div>

              {/* Sort Dropdown */}
              <div className="eldorado-filter-select-wrap" style={{ minWidth: '190px' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="eldorado-filter-select"
                  aria-label="Sắp xếp"
                >
                  <option value="recommended">Khuyên dùng (Recommended)</option>
                  <option value="price-low">Giá: Thấp đến Cao</option>
                  <option value="price-high">Giá: Cao đến Thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
                <ChevronDown size={14} className="eldorado-filter-chevron" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Đang tải danh sách nông sản tươi từ máy chủ...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <span style={{ fontSize: '42px', display: 'block', marginBottom: '10px' }}>🥦</span>
              <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
                Không tìm thấy nông sản phù hợp với bộ lọc
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
                Vui lòng thử chọn lại tiêu chí lọc hoặc tìm kiếm từ khóa khác.
              </p>
              <button onClick={clearAllFilters} className="btn btn-primary" style={{ padding: '8px 18px' }}>
                Xem Tất Cả Nông Sản
              </button>
            </div>
          ) : (
            <div className="product-grid" style={{ marginTop: '10px' }}>
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.productId}
                  product={p}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Metrics 3D Row */}
      <section className="container">
        <div className="home-metrics-grid">
          <div className="home-metric-card glass-card-3d">
            <div className="home-metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              👨‍🌾
            </div>
            <div>
              <span className="home-metric-label">Nhà Vườn Liên Kết</span>
              <div className="home-metric-value">{uniqueFarmersCount} sạp</div>
              <span className="home-metric-sub" style={{ color: '#34d399' }}>✓ Đạt chuẩn an toàn</span>
            </div>
          </div>

          <div className="home-metric-card glass-card-3d">
            <div className="home-metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              📍
            </div>
            <div>
              <span className="home-metric-label">Điểm Chợ Phiên</span>
              <div className="home-metric-value">{markets.length} điểm</div>
              <span className="home-metric-sub" style={{ color: '#f59e0b' }}>Hà Nội & TP.HCM</span>
            </div>
          </div>

          <div className="home-metric-card glass-card-3d">
            <div className="home-metric-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              🥦
            </div>
            <div>
              <span className="home-metric-label">Mặt Hàng Nông Sản</span>
              <div className="home-metric-value">{products.length} loại</div>
              <span className="home-metric-sub" style={{ color: '#06b6d4' }}>Hái tươi trong ngày</span>
            </div>
          </div>

          <div className="home-metric-card glass-card-3d">
            <div className="home-metric-icon" style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#ea580c' }}>
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

      {/* 4. Market Map Section */}
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
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
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
          height="420px"
        />

        {activeMarket && (
          <div className="home-selected-market-bar animate-slide-up">
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-light)' }}>
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

      {/* 5. System Announcements */}
      {announcements.length > 0 && (
        <section className="container">
          <div className="home-announcements-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '22px' }}>📢</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Bản Tin & Thông Báo Hệ Thống
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {announcements.map((ann) => (
                <div key={ann.announcementId} className="home-announcement-card">
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', fontWeight: 700, marginBottom: '4px' }}>
                    {ann.adminName} • {ann.publishedAt?.split('T')[0] || ann.publishedAt?.slice(0, 10) || 'Gần đây'}
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
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

export default HomePage;
