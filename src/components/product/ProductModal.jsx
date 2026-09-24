import React, { useState } from 'react';
import { X, ShoppingBag, Store, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';

export const ProductModal = ({ product, isOpen, onClose }) => {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { success } = useNotification();

  if (!isOpen || !product) return null;

  const handlePreOrder = () => {
    addToCart(product, qty);
    success(`Đã thêm ${qty} ${product.unit || 'kg'} ${product.name} vào đơn đặt trước!`);
    onClose();
  };

  return (
    <div className="product-modal-backdrop" onClick={onClose}>
      <div className="product-modal-container" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="product-modal-close"
          type="button"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        <div className="product-modal-img-col">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'}
            alt={product.name}
            className="product-modal-img"
          />
          <div className="product-modal-cert-badge">
            <ShieldCheck size={16} />
            <span>Tiêu chuẩn canh tác an toàn</span>
          </div>
        </div>

        <div className="product-modal-content">
          <div className="product-modal-stall-tag">
            <Store size={16} />
            <span>{product.farmerStallName || 'Nông Trại Chuẩn Xanh'}</span>
          </div>

          <h3 className="product-modal-title">
            {product.name}
          </h3>

          <div className="product-modal-price">
            {formatCurrency(product.price)}
            <span className="product-modal-unit"> / {product.unit || 'kg'}</span>
          </div>

          <p className="product-modal-desc">
            {product.description || 'Nông sản hữu cơ được thu hoạch sớm tại nông trại, đóng gói theo tiêu chuẩn VietGAP đảm bảo độ tươi ngọt khi giao tại sạp chợ phiên.'}
          </p>

          <div className="product-modal-qty-row">
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Số lượng đặt trước:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="product-modal-qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span className="product-modal-qty-val">{qty}</span>
              <button
                type="button"
                className="product-modal-qty-btn"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{product.unit || 'kg'}</span>
          </div>

          <button
            type="button"
            onClick={handlePreOrder}
            className="product-modal-add-btn"
          >
            <ShoppingBag size={18} />
            <span>Thêm Vào Giỏ Đặt Trước ({formatCurrency((product.price || 0) * qty)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
