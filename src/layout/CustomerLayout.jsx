import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Sparkles, Store, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PATHS } from '@/routes/paths';

export const CustomerLayout = () => {
  const navigate = useNavigate();
  const { isFarmer, isAdmin } = useAuth();

  const navItems = [
    { to: PATHS.CUSTOMER.ORDERS, label: 'Đơn Đặt Trước Của Tôi', icon: ShoppingBag },
    { to: PATHS.CUSTOMER.FAVORITES, label: 'Nông Sản Yêu Thích', icon: Heart },
    { to: PATHS.CUSTOMER.PROFILE, label: 'Hồ Sơ & Thành Viên Gia Đình', icon: User },
  ];

  return (
    <div className="container customer-container">
      <div className="customer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="customer-badge">
            <Sparkles size={16} />
            <span>Khu Vực Khách Hàng (Customer Portal)</span>
          </div>
          <h1 className="customer-title">
            Tài Khoản & Đơn Đặt Trước
          </h1>
          <p className="customer-desc">
            Theo dõi tiến độ chuẩn bị nông sản tại sạp chợ, quản lý danh sách yêu thích và lịch hẹn lấy hàng
          </p>
        </div>

        {(isFarmer || isAdmin) && (
          <button
            id="btn-customer-layout-to-farmer"
            type="button"
            onClick={() => navigate(PATHS.FARMER.DASHBOARD)}
            className="btn btn-secondary"
            style={{
              borderColor: 'rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#fbbf24',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
            }}
          >
            <Store size={18} color="#fbbf24" />
            <span>Qua Trang Nông Dân</span>
            <ArrowRight size={15} />
          </button>
        )}
      </div>

      <nav className="customer-subnav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `customer-subnav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
};

export default CustomerLayout;
