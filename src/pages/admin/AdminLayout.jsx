import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Shield,
  FileCheck2,
  Users,
  Store,
  Megaphone,
  LayoutDashboard,
} from 'lucide-react';
import { PATHS } from '@/routes/paths';

export const AdminLayout = () => {
  const navItems = [
    { to: PATHS.ADMIN.DASHBOARD, label: 'Tổng Quan Hệ Thống', icon: LayoutDashboard },
    { to: PATHS.ADMIN.KYC, label: 'Thẩm Định KYC Nông Dân', icon: FileCheck2 },
    { to: PATHS.ADMIN.USERS, label: 'Quản Lý Người Dùng', icon: Users },
    { to: PATHS.ADMIN.MARKETS, label: 'Điểm Chợ Phiên', icon: Store },
    { to: PATHS.ADMIN.ANNOUNCEMENTS, label: 'Thông Báo Sàn', icon: Megaphone },
  ];

  return (
    <div className="container admin-container">
      <div className="admin-header">
        <div>
          <div className="admin-badge">
            <Shield size={16} />
            <span>Bảng Điều Khiển Quản Trị Hệ Thống</span>
          </div>
          <h1 className="admin-title">
            Quản Trị MarketLink & Kiểm Duyệt Sàn
          </h1>
          <p className="admin-desc">
            Điều phối chất lượng nông sản và kiểm soát quyền kinh doanh trên toàn hệ thống
          </p>
        </div>
      </div>

      <nav className="admin-subnav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-subnav-link ${isActive ? 'active' : ''}`
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
