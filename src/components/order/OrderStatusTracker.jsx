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
            Đơn đặt trước đã bị khách hàng hủy bỏ trước giờ chốt đơn.
          </div>
        </div>
      </div>
    );
  }

  if (currentStatus === ORDER_STATUS.DECLINED) {
    return (
      <div className="tracker-cancelled-box" style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
        <XCircle size={24} color="#dc2626" />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#b91c1c' }}>Nông dân đã từ chối đơn</div>
          <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
            Sạp tạm thời hết nông sản hoặc sự cố thu hoạch. Tồn kho đã được hoàn lại.
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
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="tracker-step-item">
              <div
                className={`tracker-step-icon-box ${isCurrent ? 'active' : isDone ? 'done' : ''}`}
              >
                <Icon size={18} />
              </div>
              <div
                className="tracker-step-label"
                style={{ color: isCurrent ? 'var(--primary-light)' : isDone ? '#ffffff' : 'var(--text-muted)' }}
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
