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
} from 'lucide-react';
import { customerApi } from '@/api/customer.api';
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

  const { success, error } = useNotification();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await customerApi.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load customer orders:', err);
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
        return { label: 'Đang Chuẩn Bị', bg: '#eff6ff', color: '#2563eb' };
      case 'ACCEPTED':
        return { label: 'Nông Dân Tiếp Nhận', bg: '#fef3c7', color: '#d97706' };
      case 'READY_FOR_PICKUP':
        return { label: 'Sẵn Sàng Tại Sạp', bg: '#f0fdf4', color: '#16a34a' };
      case 'COMPLETED':
        return { label: 'Đã Nhận & Thanh Toán', bg: '#f8fafc', color: '#475569' };
      case 'CANCELLED':
        return { label: 'Đã Hủy', bg: '#fef2f2', color: '#dc2626' };
      default:
        return { label: status, bg: '#f1f5f9', color: '#64748b' };
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

        <button onClick={loadOrders} className="btn btn-secondary">
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 700, marginBottom: '6px' }}>
                      <Store size={16} color="#15803d" />
                      <span>{order.marketName || 'Điểm chợ phiên'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '4px' }}>
                      <Calendar size={14} />
                      <span>Ngày lấy: <strong>{order.pickupDate || 'Thứ 7 tuần này'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                      <Clock size={14} />
                      <span>Khung giờ: <strong>{order.slotTimeRange || '07:00 - 09:00'}</strong></span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                      Danh Sách Nông Sản:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {order.items?.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: '#0f172a', fontWeight: 600 }}>
                            {it.productName || it.name} <span style={{ color: '#64748b' }}>x{it.quantity} {it.unit || 'kg'}</span>
                          </span>
                          <span style={{ color: '#15803d', fontWeight: 700 }}>
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
              Mã Nhận Nông Sản Tại Sạp
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              Đưa mã QR này cho Nông dân tại sạp để quét tiếp nhận và nhận nông sản tươi
            </p>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', display: 'inline-block', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ width: '180px', height: '180px', background: '#ffffff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '2px solid #0f172a' }}>
                <QrCode size={140} color="#0f172a" />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', marginTop: '12px' }}>
                {selectedOrder.orderCode || `#ORDER-${selectedOrder.orderId}`}
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 700, marginBottom: '20px' }}>
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626', marginBottom: '6px' }}>
              Xác Nhận Hủy Đặt Trước
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Bạn có chắc chắn muốn hủy đơn hàng <strong>{cancelModalOrder.orderCode}</strong>?
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
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
    </div>
  );
};
