import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  Calendar,
  RefreshCw,
  QrCode,
  ArrowRight,
  Store,
  Star,
} from 'lucide-react';
import { customerApi, reviewsApi } from '@/services';
import { useNotification } from '@/context/NotificationContext';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { OrderStatusTracker } from '@/components/order/OrderStatusTracker';
import { PATHS } from '@/routes/paths';

export const CustomerOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // State đánh giá chất lượng (Luồng 6)
  const [reviewModalOrder, setReviewModalOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { success, error } = useNotification();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await customerApi.getOrders();
      setOrders(Array.isArray(data) ? data : (data?.content || data?.data || []));
    } catch (err) {
      console.error('Failed to load customer orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    setCancelling(true);
    try {
      await customerApi.cancelOrder(cancelModalOrder.orderId, cancelReason || 'Khách hàng đổi ý');
      success(`Đã hủy đơn hàng ${cancelModalOrder.orderCode || ''}!`);
      setCancelModalOrder(null);
      setCancelReason('');
      loadOrders();
    } catch (err) {
      error(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.orderStatus === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PLACED':
        return { label: 'Đang Chuẩn Bị', bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.35)' };
      case 'ACCEPTED':
        return { label: 'Nông Dân Tiếp Nhận', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.35)' };
      case 'READY_FOR_PICKUP':
        return { label: 'Sẵn Sàng Tại Sạp', bg: 'rgba(16, 185, 129, 0.18)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' };
      case 'COMPLETED':
        return { label: 'Đã Nhận & Thanh Toán', bg: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', border: '1px solid rgba(148, 163, 184, 0.25)' };
      case 'DECLINED':
      case 'CANCELLED':
        return { label: status === 'CANCELLED' ? 'Đã Hủy' : 'Bị Từ Chối', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)' };
      default:
        return { label: status, bg: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.15)' };
    }
  };

  const handleOpenReview = (order) => {
    setReviewModalOrder(order);
    setRating(5);
    setComment('');
  };

  const handleSubmitReview = async () => {
    if (!reviewModalOrder) return;
    setSubmittingReview(true);
    try {
      await reviewsApi.createReview({
        orderId: reviewModalOrder.orderId,
        farmerId: reviewModalOrder.farmerId,
        rating,
        comment: comment.trim() || 'Nông sản rất tươi ngon và dịch vụ sạp rất tốt!',
      });
      success('Cảm ơn bạn đã gửi đánh giá chất lượng nông sản!');
      setReviewModalOrder(null);
    } catch (err) {
      error(err.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div>
      <div className="customer-filter-bar">
        <div className="customer-pill-group">
          {[
            { key: 'ALL', label: `Tất Cả (${orders.length})` },
            { key: 'PLACED', label: 'Chờ Tiếp Nhận' },
            { key: 'ACCEPTED', label: 'Đã Tiếp Nhận' },
            { key: 'READY_FOR_PICKUP', label: 'Sẵn Sàng Tại Sạp' },
            { key: 'COMPLETED', label: 'Đã Hoàn Tất' },
            { key: 'DECLINED', label: 'Bị Từ Chối' },
            { key: 'CANCELLED', label: 'Đã Hủy' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`customer-filter-pill ${statusFilter === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button onClick={() => loadOrders(true)} className="btn btn-secondary">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="customer-empty-state">
          <ShoppingBag size={48} className="customer-empty-icon" />
          <h3 className="customer-empty-title">
            Không tìm thấy đơn đặt trước nào
          </h3>
          <p className="customer-empty-desc">
            Hãy dạo quanh các sạp nông sản sạch trên trang chủ và đặt trước để giữ phần tươi ngon nhất cho bạn.
          </p>
          <button onClick={() => navigate(PATHS.HOME)} className="btn btn-primary">
            <span>Khám Phá Sạp Nông Sản</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.orderStatus);
            return (
              <div key={order.orderId} className="customer-order-card">
                <div className="customer-order-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="customer-order-code">
                        {order.orderCode || `Đơn #${order.orderId}`}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: badge.bg,
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      Đặt lúc: {formatDateTime(order.createdAt)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="customer-order-total">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Pay-at-pickup (Thanh toán tại sạp)
                    </span>
                  </div>
                </div>

                <div style={{ margin: '14px 0 18px' }}>
                  <OrderStatusTracker currentStatus={order.orderStatus} />
                </div>

                <div className="customer-order-grid">
                  <div className="customer-order-pickup-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 700, marginBottom: '6px' }}>
                      <Store size={16} color="var(--primary-light)" />
                      <span>{order.marketName || 'Điểm chợ phiên'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <Calendar size={14} color="#60a5fa" />
                      <span>Ngày lấy: <strong style={{ color: '#ffffff' }}>{order.pickupDate || 'Thứ 7 tuần này'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      <Clock size={14} color="#fbbf24" />
                      <span>Khung giờ: <strong style={{ color: '#ffffff' }}>{order.slotTimeRange || '07:00 - 09:00'}</strong></span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Danh Sách Nông Sản:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {order.items?.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                          <span style={{ color: '#ffffff', fontWeight: 600 }}>
                            {it.productName || it.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>x{it.quantity} {it.unit || 'kg'}</span>
                          </span>
                          <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>
                            {formatCurrency(it.unitPrice * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setSelectedOrder(order)} className="btn btn-secondary">
                    <QrCode size={14} />
                    <span>Mã Nhận Hàng (QR)</span>
                  </button>

                  {order.orderStatus === 'COMPLETED' && (
                    <button
                      onClick={() => handleOpenReview(order)}
                      className="btn btn-primary"
                      style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
                    >
                      <Star size={14} fill="#ffffff" />
                      <span>Đánh Giá Sạp</span>
                    </button>
                  )}

                  {order.orderStatus === 'PLACED' && (
                    <button onClick={() => setCancelModalOrder(order)} className="btn btn-danger">
                      Hủy Đặt Trước
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <div className="kyc-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '420px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              Mã Nhận Nông Sản Tại Sạp
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Đưa mã QR này cho Nông dân tại sạp để quét tiếp nhận và nhận nông sản tươi
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '20px', borderRadius: '16px', display: 'inline-block', border: '1px solid var(--border-light)', marginBottom: '16px' }}>
              <div style={{ width: '180px', height: '180px', background: '#ffffff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '2px solid var(--primary)' }}>
                <QrCode size={140} color="#0b0f15" />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)', marginTop: '12px' }}>
                {selectedOrder.orderCode || `#ORDER-${selectedOrder.orderId}`}
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--primary-light)', fontWeight: 700, marginBottom: '20px' }}>
              Tổng tiền thanh toán tại sạp: {formatCurrency(selectedOrder.totalAmount)}
            </div>

            <button onClick={() => setSelectedOrder(null)} className="btn btn-primary" style={{ width: '100%' }}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {cancelModalOrder && (
        <div className="kyc-modal-overlay" onClick={() => setCancelModalOrder(null)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '460px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f87171', marginBottom: '6px' }}>
              Xác Nhận Hủy Đặt Trước
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Bạn có chắc chắn muốn hủy đơn hàng <strong style={{ color: 'var(--text-main)' }}>{cancelModalOrder.orderCode}</strong>?
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                Lý do hủy đơn:
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="VD: Thay đổi kế hoạch cuối tuần..."
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setCancelModalOrder(null)} className="btn btn-secondary">
                Không, giữ đơn
              </button>
              <button disabled={cancelling} onClick={handleCancelOrder} className="btn btn-danger">
                {cancelling ? 'Đang hủy...' : 'Xác Nhận Hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewModalOrder && (
        <div className="kyc-modal-overlay" onClick={() => setReviewModalOrder(null)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '460px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              Đánh Giá Chất Lượng Nông Sản
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Chia sẻ cảm nhận về độ tươi ngon và dịch vụ tại sạp của đơn hàng <strong style={{ color: 'var(--text-main)' }}>{reviewModalOrder.orderCode}</strong>
            </p>

            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    <Star
                      size={28}
                      color="#f59e0b"
                      fill={star <= rating ? '#f59e0b' : 'transparent'}
                    />
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b' }}>
                {rating === 5 && 'Tuyệt vời - Rất tươi ngon!'}
                {rating === 4 && 'Hài lòng - Nông sản sạch'}
                {rating === 3 && 'Bình thường - Đạt yêu cầu'}
                {rating === 2 && 'Chưa hài lòng'}
                {rating === 1 && 'Không đạt chất lượng'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                Nhận xét chi tiết:
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="VD: Rau rất tươi, giữ nguyên vị ngọt tự nhiên, sạp giao hàng đúng giờ..."
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setReviewModalOrder(null)} className="btn btn-secondary">
                Đóng
              </button>
              <button
                disabled={submittingReview}
                onClick={handleSubmitReview}
                className="btn btn-primary"
                style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
              >
                {submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
