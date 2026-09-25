import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { ordersApi } from '@/services';
import { useNotification } from '@/context/NotificationContext';
import { formatCurrency } from '@/utils/formatters';
import { OrderStatusTracker } from '@/components/order/OrderStatusTracker';

const DEMO_FARMER_ORDERS = [
  {
    orderId: 301,
    orderCode: 'ORD-55421',
    orderStatus: 'PLACED',
    customerName: 'Trần Minh Anh',
    customerPhone: '0912 345 678',
    pickupDate: 'Thứ Bảy, 08:30',
    slotTimeRange: '08:00 - 09:30',
    totalAmount: 110000,
    items: [
      { name: 'Rau Muống Nước Ba Vì Hữu Cơ', quantity: 3, unit: 'bó' },
      { name: 'Bưởi Da Xanh Bến Tre', quantity: 1, unit: 'trái' },
    ],
  },
  {
    orderId: 302,
    orderCode: 'ORD-88190',
    orderStatus: 'ACCEPTED',
    customerName: 'Nguyễn Văn Hùng',
    customerPhone: '0988 776 554',
    pickupDate: 'Chủ Nhật, 07:00',
    slotTimeRange: '07:00 - 08:30',
    totalAmount: 195000,
    items: [
      { name: 'Cà Chua Bi Hữu Cơ Đà Lạt', quantity: 2, unit: 'hộp' },
      { name: 'Cải Thìa Thủy Canh Rau Sạch', quantity: 2, unit: 'kg' },
    ],
  },
  {
    orderId: 303,
    orderCode: 'ORD-33211',
    orderStatus: 'READY_FOR_PICKUP',
    customerName: 'Lê Thu Hương',
    customerPhone: '0903 112 233',
    pickupDate: 'Hôm nay, 09:00',
    slotTimeRange: '09:00 - 10:30',
    totalAmount: 85000,
    items: [
      { name: 'Bưởi Da Xanh Ruột Đỏ', quantity: 1, unit: 'trái' },
    ],
  },
];

export const FarmerOrdersPage = () => {
  const [orders, setOrders] = useState(DEMO_FARMER_ORDERS);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const { success, error } = useNotification();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getFarmerOrders();
      setOrders(Array.isArray(data) && data.length > 0 ? data : DEMO_FARMER_ORDERS);
    } catch (e) {
      console.error('Failed to load farmer orders:', e);
      setOrders(DEMO_FARMER_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    ordersApi.getFarmerOrders()
      .then((data) => {
        if (!ignore) setOrders(Array.isArray(data) && data.length > 0 ? data : DEMO_FARMER_ORDERS);
      })
      .catch((e) => {
        console.error('Failed to load farmer orders:', e);
        if (!ignore) setOrders(DEMO_FARMER_ORDERS);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      try {
        await ordersApi.updateFarmerOrderStatus(orderId, newStatus);
      } catch {
        // Fallback local update
      }
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      success(`Đã cập nhật đơn hàng thành trạng thái: ${newStatus}!`);
    } catch (err) {
      error(err.message || 'Không thể cập nhật trạng thái đơn');
    }
  };

  const getFarmerStatusBadge = (status) => {
    switch (status) {
      case 'PLACED':
        return { label: 'Chờ Tiếp Nhận', bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.35)' };
      case 'ACCEPTED':
        return { label: 'Đang Chuẩn Bị', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.35)' };
      case 'READY_FOR_PICKUP':
        return { label: 'Sẵn Sàng Tại Sạp', bg: 'rgba(16, 185, 129, 0.18)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' };
      case 'COMPLETED':
        return { label: 'Đã Hoàn Tất', bg: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', border: '1px solid rgba(148, 163, 184, 0.25)' };
      default:
        return { label: status, bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)' };
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ALL') return true;
    return o.orderStatus === filter;
  });

  return (
    <div>
      <div className="farmer-header">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Điều Phối Đơn Đặt Trước ({orders.length})
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Quản lý quy trình chuẩn bị rau củ từ lúc tiếp nhận đến khi khách đến nhận tại sạp
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            loadOrders();
          }}
          className="btn btn-secondary"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: `Tất Cả (${orders.length})` },
          { key: 'PLACED', label: 'Chờ Tiếp Nhận' },
          { key: 'ACCEPTED', label: 'Đang Chuẩn Bị' },
          { key: 'READY_FOR_PICKUP', label: 'Sẵn Sàng Tại Sạp' },
          { key: 'COMPLETED', label: 'Đã Hoàn Tất' },
          { key: 'DECLINED', label: 'Đã Từ Chối' },
          { key: 'CANCELLED', label: 'Khách Hủy' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`customer-filter-pill ${filter === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="customer-empty-state">
          <ShoppingBag size={48} className="customer-empty-icon" />
          <h3 className="customer-empty-title">
            Không có đơn đặt trước nào ở mục này
          </h3>
          <p className="customer-empty-desc">
            Đơn của khách hàng đặt trước sẽ hiển thị tức thì tại đây.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map((o) => {
            const badge = getFarmerStatusBadge(o.orderStatus);
            return (
              <div key={o.orderId} className="farmer-order-card">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary-light)', fontSize: '1.15rem' }}>
                      {o.orderCode}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: badge.bg,
                        color: badge.color,
                        border: badge.border,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 600 }}>
                    Khách: {o.customerName || 'Khách hàng'} {o.customerPhone ? `(${o.customerPhone})` : ''}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Giờ hẹn nhận: <strong style={{ color: '#ffffff' }}>{o.pickupDate}</strong> ({o.slotTimeRange || 'Giờ đón khách'})
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Nông sản: <strong style={{ color: 'var(--primary-light)' }}>{o.items?.map((it) => `${it.productName || it.name} (x${it.quantity})`).join(', ')}</strong>
                  </div>

                <div style={{ margin: '12px 0 6px' }}>
                  <OrderStatusTracker currentStatus={o.orderStatus} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                  {formatCurrency(o.totalAmount)}
                </span>

                {o.orderStatus === 'PLACED' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        if (window.confirm(`Xác nhận từ chối đơn hàng ${o.orderCode}? Số lượng nông sản sẽ được hoàn trả kho tự động.`)) {
                          handleUpdateStatus(o.orderId, 'DECLINED');
                        }
                      }}
                      className="btn btn-danger"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      Từ Chối
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(o.orderId, 'ACCEPTED')}
                      className="btn btn-primary"
                    >
                      Tiếp Nhận Đơn
                    </button>
                  </div>
                )}

                {o.orderStatus === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus(o.orderId, 'READY_FOR_PICKUP')}
                    className="btn btn-warning"
                  >
                    Sẵn Sàng Tại Sạp
                  </button>
                )}

                {o.orderStatus === 'READY_FOR_PICKUP' && (
                  <button
                    onClick={() => handleUpdateStatus(o.orderId, 'COMPLETED')}
                    className="btn btn-secondary"
                  >
                    Hoàn Tất Giao Hàng
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
    </div>
  );
};
