import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { ordersApi } from '@/api/orders.api';
import { useNotification } from '@/context/NotificationContext';
import { formatCurrency } from '@/utils/formatters';
import { OrderStatusTracker } from '@/components/order/OrderStatusTracker';

export const FarmerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const { success, error } = useNotification();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getFarmerOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load farmer orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersApi.updateFarmerOrderStatus(orderId, newStatus);
      success(`Đã cập nhật đơn hàng thành trạng thái: ${newStatus}!`);
      loadOrders();
    } catch (err) {
      error(err.message || 'Không thể cập nhật trạng thái đơn');
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

        <button onClick={loadOrders} className="btn btn-secondary">
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
          { key: 'COMPLETED', label: 'Đã Nhận Hàng' },
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
          {filteredOrders.map((o) => (
            <div key={o.orderId} className="farmer-order-card">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
                    {o.orderCode}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background:
                        o.orderStatus === 'PLACED' ? '#eff6ff' : o.orderStatus === 'ACCEPTED' ? '#fef3c7' : '#f0fdf4',
                      color:
                        o.orderStatus === 'PLACED' ? '#2563eb' : o.orderStatus === 'ACCEPTED' ? '#d97706' : 'var(--primary)',
                    }}
                  >
                    {o.orderStatus}
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  Khách: {o.customerName || 'Khách hàng'} {o.customerPhone ? `(${o.customerPhone})` : ''}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Giờ hẹn nhận: {o.pickupDate} ({o.slotTimeRange || 'Giờ đón khách'})
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>
                  Hàng hóa: <strong>{o.items?.map((it) => `${it.productName || it.name} (x${it.quantity})`).join(', ')}</strong>
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
                  <button
                    onClick={() => handleUpdateStatus(o.orderId, 'ACCEPTED')}
                    className="btn btn-primary"
                  >
                    Tiếp Nhận Đơn
                  </button>
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
          ))}
        </div>
      )}
    </div>
  );
};
