import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingBag, Heart, User, Sparkles } from 'lucide-react';
import { PATHS } from '@/routes/paths';

export const CustomerLayout = () => {
  const navItems = [
    { to: PATHS.CUSTOMER.ORDERS, label: 'Đơn Đặt Trước Của Tôi', icon: ShoppingBag },
    { to: PATHS.CUSTOMER.FAVORITES, label: 'Nông Sản Yêu Thích', icon: Heart },
    { to: PATHS.CUSTOMER.PROFILE, label: 'Hồ Sơ & Thành Viên Gia Đình', icon: User },
  ];

  return (
    <div className="container customer-container">
      <div className="customer-header">
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
