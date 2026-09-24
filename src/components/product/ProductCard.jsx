import React, { useState } from 'react';
import { Heart, ShoppingBag, Store, Check } from 'lucide-react';
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
    <div
      ref={tiltRef}
      onClick={() => onQuickView && onQuickView(product)}
      className="product-card sheen-card preserve-3d"
    >
      <div className="product-card-img-wrap">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500'}
          alt={product.name}
          className="product-card-img"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500';
          }}
        />

        <div className="product-category-pill">
          <span>🌱</span>
          <span>{product.categoryName || 'Nông Sản Tươi'}</span>
        </div>

        <button
          onClick={handleToggleFav}
          className="product-fav-btn"
          type="button"
          aria-label="Yêu thích"
        >
          <Heart
            size={18}
            fill={isFav ? '#ef4444' : 'none'}
            color={isFav ? '#ef4444' : '#64748b'}
          />
        </button>

        <div className="product-stock-tag">
          Tồn kho: {product.currentStock || 0} {product.unit || 'kg'}
        </div>
      </div>

      <div className="product-card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '6px' }}>
          <Store size={14} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.farmerStallName || 'Nông Trại Hữu Cơ'}
          </span>
          <span style={{ fontSize: '10px', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>
            ✓ Chuẩn
          </span>
        </div>

        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.35, minHeight: '2.7em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h4>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
          {product.description || 'Nông sản hữu cơ canh tác tự nhiên thu hoạch sớm trong ngày.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
              Giá đặt trước
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {formatCurrency(product.price)}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '3px' }}>
              /{product.unit || 'kg'}
            </span>
          </div>

          <button
            onClick={handlePreOrder}
            disabled={product.currentStock <= 0}
            className="product-preorder-btn"
            type="button"
            style={{
              backgroundColor: product.currentStock <= 0 ? '#cbd5e1' : '#ea580c',
              cursor: product.currentStock <= 0 ? 'not-allowed' : 'pointer',
              transform: isAdding ? 'scale(0.95)' : 'scale(1)',
            }}
          >
            {isAdding ? <Check size={16} /> : <ShoppingBag size={16} />}
            <span>{product.currentStock <= 0 ? 'Hết hàng' : 'Đặt trước'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
