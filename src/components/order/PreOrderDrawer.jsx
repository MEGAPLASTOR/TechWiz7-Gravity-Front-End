import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, ShoppingBag, Trash2, Calendar, Clock, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context';
import { useNotification } from '@/context/NotificationContext';
import { formatCurrency } from '@/utils/formatters';
import { ordersApi, marketsApi } from '@/services';

export const PreOrderDrawer = ({ markets = [], onOrderCreated }) => {
  const { isAuthenticated } = useAuth();
  const {
    cartItems,
    totalItems,
    totalAmount,
    selectedMarket,
    setSelectedMarket,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { success, error } = useNotification();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [liveSlots, setLiveSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function fetchSlots() {
      if (!selectedMarket?.marketId) {
        setLiveSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const res = await marketsApi.getMarketPickupSlots(selectedMarket.marketId);
        const slots = Array.isArray(res) ? res : res?.data || [];
        if (!isCancelled) {
          setLiveSlots(slots);
          if (slots.length > 0) {
            setSelectedSlot(slots[0]);
          } else {
            setSelectedSlot(null);
          }
        }
      } catch (err) {
        console.error('Error fetching live pickup slots:', err);
        if (!isCancelled) {
          setLiveSlots([]);
        }
      } finally {
        if (!isCancelled) {
          setLoadingSlots(false);
        }
      }
    }

    fetchSlots();

    return () => {
      isCancelled = true;
    };
  }, [selectedMarket, setSelectedSlot]);

  if (!isDrawerOpen) return null;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      error('Vui lòng đăng nhập tài khoản trước khi hoàn tất đặt trước nông sản!');
      return;
    }
    if (cartItems.length === 0) {
      error('Giỏ hàng đặt trước của bạn đang trống!');
      return;
    }
    if (!selectedMarket) {
      error('Vui lòng chọn chợ nông sản để đến nhận hàng!');
      return;
    }
    if (!selectedDate) {
      error('Vui lòng chọn ngày đến nhận hàng!');
      return;
    }
    if (!selectedSlot) {
      error('Vui lòng chọn khung giờ nhận hàng tại sạp!');
      return;
    }

    setSubmitting(true);
    try {
      const farmerId = cartItems[0]?.product?.farmerId;
      if (!farmerId) {
        throw new Error('Không xác định được mã nông dân của sản phẩm');
      }

      const orderPayload = {
        farmerId,
        marketId: selectedMarket.marketId,
        slotId: selectedSlot.slotId,
        pickupDate: selectedDate,
        note: note.trim() || 'Đặt trước qua MarketLink App (Pay-at-pickup)',
        items: cartItems.map((item) => ({
          productId: item.product.productId,
          quantity: item.quantity,
        })),
      };

      const res = await ordersApi.createOrder(orderPayload);
      const orderInfo = res?.data || res;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#15803d', '#ea580c', '#22c55e', '#f59e0b'],
      });

      success(`Đặt trước thành công! Mã đơn: ${orderInfo.orderCode || 'ORD-NEW'}`);
      setCreatedOrder(orderInfo);
      clearCart();
      if (onOrderCreated) onOrderCreated(orderInfo);
    } catch (err) {
      error(err.message || 'Đặt trước không thành công, vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#15803d',
              }}
            >
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="drawer-header-title">
                Đơn Đặt Trước Nông Sản
              </h3>
              <p className="drawer-header-subtitle">
                Mô hình Pre-order & Pay-at-pickup tại sạp
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsDrawerOpen(false);
              setCreatedOrder(null);
            }}
            className="drawer-close-btn"
            type="button"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {createdOrder ? (
            <div className="drawer-success-state">
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <CheckCircle size={40} />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                Đặt Trước Thành Công!
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Đơn hàng đã được lưu trên máy chủ MarketLink và gửi đến sạp nông dân.
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'left',
                  width: '100%',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Mã đặt trước:</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
                    {createdOrder.orderCode}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Địa điểm nhận:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', textAlign: 'right' }}>
                    {createdOrder.marketName}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ngày & Giờ nhận:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    {createdOrder.pickupDate} ({createdOrder.slotTimeRange})
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Phương thức:</span>
                  <span style={{ fontWeight: 700, color: '#ea580c', fontSize: '0.85rem' }}>
                    Pay-at-pickup (Thanh toán tại sạp)
                  </span>
                </div>
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Tổng tiền thanh toán:</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>
                    {formatCurrency(createdOrder.totalAmount)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreatedOrder(null);
                  setIsDrawerOpen(false);
                }}
                className="drawer-submit-btn"
                style={{ background: 'var(--primary)' }}
              >
                <span>Đã Ghi Nhận - Đóng Giỏ Hàng</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <ShoppingBag size={56} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <h4 style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '8px' }}>
                Giỏ hàng đặt trước trống
              </h4>
              <p style={{ fontSize: '0.9rem' }}>
                Hãy duyệt danh mục nông sản sạch và bấm "Đặt trước" để chuẩn bị phần ăn tươi ngon cho gia đình!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                  Sản Phẩm Đã Chọn ({totalItems})
                </h4>
                <div className="drawer-cart-list">
                  {cartItems.map((item) => (
                    <div key={item.product.productId} className="drawer-cart-item">
                      <img
                        src={item.product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                        alt={item.product.name}
                        className="drawer-item-img"
                      />
                      <div className="drawer-item-info">
                        <div className="drawer-item-name">
                          {item.product.name}
                        </div>
                        <div className="drawer-item-price">
                          {formatCurrency(item.product.price)} /{item.product.unit || 'kg'}
                        </div>
                      </div>

                      <div className="drawer-item-actions">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.productId, item.quantity - 1)}
                          className="drawer-qty-btn"
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.productId, item.quantity + 1)}
                          className="drawer-qty-btn"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.productId)}
                          style={{ padding: '4px', color: '#ef4444', marginLeft: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="drawer-step-box">
                <div className="drawer-step-header">
                  <MapPin size={16} color="var(--primary)" />
                  <span>Chọn Điểm Chợ Nhận Hàng</span>
                </div>
                <select
                  value={selectedMarket?.marketId || ''}
                  onChange={(e) => {
                    const m = markets.find((mk) => mk.marketId === Number(e.target.value));
                    setSelectedMarket(m || null);
                  }}
                  className="form-input"
                >
                  <option value="">-- Chọn phiên chợ gần bạn --</option>
                  {markets.map((m) => (
                    <option key={m.marketId} value={m.marketId}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="drawer-step-box">
                <div className="drawer-step-header">
                  <Calendar size={16} color="var(--primary)" />
                  <span>Chọn Ngày Đến Lấy Hàng</span>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="drawer-step-box">
                <div className="drawer-step-header">
                  <Clock size={16} color="var(--primary)" />
                  <span>Khung Giờ Nhận Hàng Tại Sạp (Pickup Slots)</span>
                </div>
                {loadingSlots ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Đang tải ca nhận hàng...</p>
                ) : liveSlots.length === 0 ? (
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    Chợ này hiện chưa có ca đón khách nào được cấu hình trên máy chủ.
                  </div>
                ) : (
                  <div className="drawer-slots-grid">
                    {liveSlots.map((slot) => {
                      const isSelected = selectedSlot?.slotId === slot.slotId;
                      return (
                        <button
                          key={slot.slotId}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`drawer-slot-pill ${isSelected ? 'active' : ''}`}
                        >
                          <div>{slot.timeRange}</div>
                          <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.8 }}>
                            {slot.stallName || 'Sạp'} (tối đa {slot.maxOrdersCapacity})
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Ghi chú cho nông dân (Tùy chọn)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Đóng gói cẩn thận giúp tôi, tôi mang làn vải đến nhận..."
                  rows={2}
                  className="form-input"
                  style={{ resize: 'none' }}
                />
              </div>

              <div
                style={{
                  background: '#ffedd5',
                  border: '1px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '0.82rem',
                  color: '#9a3412',
                  lineHeight: 1.45,
                }}
              >
                <strong>Thanh toán trực tiếp (Pay-at-pickup):</strong> Quý khách kiểm tra chất lượng nông sản tươi tại sạp chợ rồi thanh toán trực tiếp cho nông dân. Không thu phí thanh toán trước!
              </div>
            </div>
          )}
        </div>

        {!createdOrder && cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-total-row">
              <div>
                <span className="drawer-total-label">Tổng tiền thanh toán tại sạp</span>
                <div className="drawer-total-value">{formatCurrency(totalAmount)}</div>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {totalItems} món
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="drawer-submit-btn"
              type="button"
            >
              <span>{submitting ? 'Đang gửi đơn lên máy chủ...' : 'Xác Nhận Đặt Trước (Pay-at-pickup)'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
