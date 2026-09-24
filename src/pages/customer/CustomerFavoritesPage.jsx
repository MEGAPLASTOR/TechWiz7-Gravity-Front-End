import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight, RefreshCw } from 'lucide-react';
import { customerApi } from '@/api/customer.api';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';
import { formatCurrency } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';

export const CustomerFavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsDrawerOpen } = useCart();
  const { success, error } = useNotification();

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await customerApi.getFavorites();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (fav) => {
    try {
      await customerApi.toggleFavorite(fav.targetType || 'PRODUCT', fav.targetId || fav.productId);
      success('Đã xóa khỏi danh sách yêu thích!');
      loadFavorites();
    } catch (err) {
      error('Không thể cập nhật danh sách yêu thích');
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      productId: product.productId || product.targetId,
      name: product.productName || product.name || 'Nông sản yêu thích',
      price: product.price || 45000,
      unit: product.unit || 'kg',
      imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
      farmerStallName: product.farmerStallName || 'Sạp nông dân',
      marketId: product.marketId || 102,
    }, 1);
    success(`Đã thêm "${product.productName || product.name || 'sản phẩm'}" vào giỏ đặt trước!`);
  };

  return (
    <div>
      <div className="customer-filter-bar">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Nông Sản & Sạp Yêu Thích ({favorites.length})
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Lưu lại các mặt hàng thu hoạch tươi ngon để đặt trước nhanh cho phiên chợ cuối tuần
          </p>
        </div>

        <button onClick={loadFavorites} className="btn btn-secondary">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {favorites.length === 0 ? (
        <div className="customer-empty-state">
          <Heart size={48} className="customer-empty-icon" />
          <h3 className="customer-empty-title">
            Chưa có nông sản yêu thích nào
          </h3>
          <p className="customer-empty-desc">
            Nhấn vào biểu tượng trái tim trên các thẻ nông sản ở trang chủ để thêm vào danh sách này.
          </p>
          <button onClick={() => navigate(PATHS.HOME)} className="btn btn-primary">
            <span>Dạo Chợ Ngay</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="customer-favorite-grid">
          {favorites.map((fav, idx) => (
            <div key={fav.favoriteId || idx} className="customer-favorite-card">
              <div>
                <img
                  src={fav.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300'}
                  alt={fav.productName || 'Nông sản'}
                  className="customer-favorite-img"
                />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {fav.productName || fav.name || 'Rau Củ Tươi Hữu Cơ'}
                </h4>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>
                  {formatCurrency(fav.price || 40000)} /{fav.unit || 'kg'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {fav.farmerStallName || 'Nông Trại Xanh Ba Vì'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={() => handleAddToCart(fav)}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  <ShoppingBag size={14} />
                  <span>Đặt Trước</span>
                </button>

                <button
                  onClick={() => handleRemoveFavorite(fav)}
                  className="btn btn-danger"
                  style={{ padding: '8px 12px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
