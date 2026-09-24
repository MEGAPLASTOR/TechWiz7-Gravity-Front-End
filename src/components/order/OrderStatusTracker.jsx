import React from 'react';
import { Clock, CheckCircle2, PackageCheck, ShoppingBag, XCircle } from 'lucide-react';
import { ORDER_STATUS } from '@/constants/orderStatus';

export const OrderStatusTracker = ({ currentStatus = 'PLACED' }) => {
  const steps = [
    { key: ORDER_STATUS.PLACED, label: 'Đã Đặt', icon: Clock, desc: 'Đã gửi đến sạp' },
    { key: ORDER_STATUS.ACCEPTED, label: 'Xác Nhận', icon: PackageCheck, desc: 'Nông dân chuẩn bị' },
    { key: ORDER_STATUS.READY_FOR_PICKUP, label: 'Sẵn Sàng', icon: ShoppingBag, desc: 'Đã tới quầy nhận' },
    { key: ORDER_STATUS.COMPLETED, label: 'Hoàn Tất', icon: CheckCircle2, desc: 'Đã nhận & thanh toán' },
  ];

  if (currentStatus === ORDER_STATUS.CANCELLED) {
    return (
      <div className="tracker-cancelled-box">
        <XCircle size={24} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Đơn hàng đã hủy</div>
          <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
            Đơn đặt trước đã bị hủy bỏ trước giờ chốt đơn.
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="tracker-wrapper">
      <div className="tracker-track-container">
        <div className="tracker-track-bg" />
        <div
          className="tracker-track-fill"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 85}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="tracker-step-item">
              <div
                className="tracker-step-icon-box"
                style={{
                  background: isDone ? 'var(--primary)' : '#ffffff',
                  color: isDone ? '#ffffff' : '#94a3b8',
                  border: `2.5px solid ${isDone ? 'var(--primary)' : '#e2e8f0'}`,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(21, 128, 61, 0.2)' : 'none',
                }}
              >
                <Icon size={18} />
              </div>
              <div
                className="tracker-step-label"
                style={{ color: isDone ? 'var(--text-main)' : 'var(--text-muted)' }}
              >
                {step.label}
              </div>
              <div className="tracker-step-desc">
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
