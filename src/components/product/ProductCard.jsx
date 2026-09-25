import React, { useState } from 'react';
import { Heart, ShoppingBag, Store, Check, Star, Zap } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useCart } from '@/context/CartContext';
import { use3DTilt } from '@/hooks/use3DTilt';
import { useNotification } from '@/context/NotificationContext';

export const ProductCard = ({ product, onQuickView }) => {
  const tiltRef = use3DTilt(10, 1.02);
  const { addToCart } = useCart();
  const { success } = useNotification();
  const [isFav, setIsFav] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handlePreOrder = (e) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1);
    success(`Đã thêm ${product.name} vào đơn đặt trước!`);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleToggleFav = (e) => {
    e.stopPropagation();
    setIsFav(!isFav);
    success(isFav ? 'Đã bỏ yêu thích' : 'Đã lưu vào danh sách yêu thích!');
  };

  return (
    <article
      ref={tiltRef}
      onClick={() => onQuickView && onQuickView(product)}
      className="product-card card-3d-interactive preserve-3d"
    >
      {/* Top Row: Subcategory tag & Produce Thumbnail */}
      <div className="product-card-top-row">
        <div className="product-card-tag">
          <span>🌱</span>
          <span>{product.categoryName || 'Nông Sản Tươi'}</span>
        </div>

        <div className="product-card-avatar-wrap">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300'}
            alt={product.name}
            className="product-card-avatar"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300';
            }}
          />
        </div>
      </div>

      {/* Middle: Title, Farmer name & Rating */}
      <div className="product-card-middle">
        <h4 className="product-card-title">
          {product.name}
        </h4>

        <div className="product-card-seller-row">
          <div className="product-card-seller-name" title={product.farmerStallName || 'Nông Trại Hữu Cơ'}>
            <Store size={14} color="#34d399" />
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.farmerStallName || 'Nông Trại Hữu Cơ'}
            </span>
            <span className="product-card-verified-badge" title="Đã kiểm định an toàn VietGAP">
              <Check size={13} strokeWidth={3} />
            </span>
          </div>

          <div className="product-card-rating">
            <Star size={12} fill="#fbbf24" color="#fbbf24" />
            <span>{product.rating ? `${(product.rating * 20).toFixed(1)}%` : '99.4%'}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              ({product.reviewCount || 42})
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Price, Delivery Speed Tag & Action Button */}
      <div className="product-card-footer">
        <div className="product-card-price-col">
          <div className="product-card-price">
            {formatCurrency(product.price)}
          </div>
          <div className="product-card-speed-badge">
            <Zap size={11} color="#38bdf8" />
            <span>{product.currentStock > 0 ? 'Có sẵn tại sạp' : 'Đặt trước 4h'}</span>
          </div>
        </div>

        <button
          onClick={handlePreOrder}
          className="product-card-preorder-btn"
          type="button"
          title="Đặt trước nông sản này"
        >
          <ShoppingBag size={14} />
          <span>{isAdding ? 'Đã thêm' : 'Đặt Trước'}</span>
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
