import React, { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { Shield, ShoppingBag, FileCheck2, Users, Store, Megaphone, LayoutDashboard, ChevronDown, User, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PATHS } from '@/routes/paths';

export const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const adminNavItems = [
    { to: PATHS.ADMIN.DASHBOARD, label: 'Thống Kê', icon: LayoutDashboard },
    { to: PATHS.ADMIN.KYC, label: 'Duyệt KYC Nông Dân', icon: FileCheck2 },
    { to: PATHS.ADMIN.USERS, label: 'Người Dùng', icon: Users },
    { to: PATHS.ADMIN.MARKETS, label: 'Điểm Chợ', icon: Store },
    { to: PATHS.ADMIN.ANNOUNCEMENTS, label: 'Thông Báo', icon: Megaphone },
  ];

  return (
    <header className="navbar-header navbar-header-admin">
      <div className="navbar-container">
        {/* Brand with Admin Console Badge */}
        <div
          onClick={() => navigate(PATHS.ADMIN.DASHBOARD)}
          className="navbar-brand"
        >
          <div className="navbar-brand-logo" style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="navbar-brand-title" style={{ color: '#dc2626' }}>MarketLink</span>
              <span className="navbar-portal-badge navbar-portal-badge-admin">
                Quản Trị Viên
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
              Trung Tâm Điều Hành & Giám Sát Toàn Sàn
            </div>
          </div>
        </div>

        {/* Dedicated Admin Navigation Items */}
        <nav className="navbar-nav">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`navbar-link-admin ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">

          {/* Quick link to view public market */}
          <button
            type="button"
            onClick={() => navigate(PATHS.HOME)}
            className="navbar-return-btn"
            title="Xem giao diện Chợ công khai"
          >
            <Store size={14} color="#10b981" />
            <span>Xem Chợ</span>
          </button>

          {/* Chuyển Phân Hệ Toàn Quyền Quản Trị Viên */}
          <div style={{ position: 'relative' }}>
            <button
              id="btn-admin-switch-menu"
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="navbar-return-btn navbar-role-btn-admin"
            >
              <Shield size={14} color="#f87171" />
              <span>Admin</span>
              <ChevronDown size={14} />
            </button>

            {roleMenuOpen && (
              <div className="navbar-dropdown">
                <div style={{ padding: '6px 10px', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Toàn Quyền Điều Hướng Cả 3 Phân Hệ
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRoleMenuOpen(false);
                    navigate(PATHS.ADMIN.DASHBOARD);
                  }}
                  className="navbar-menu-item"
                >
                  <LayoutDashboard size={16} color="#dc2626" />
                  <span>Khu Vực Quản Trị (Admin)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRoleMenuOpen(false);
                    navigate(PATHS.FARMER.DASHBOARD);
                  }}
                  className="navbar-menu-item"
                >
                  <Store size={16} color="#ea580c" />
                  <span>Kênh Nông Dân (Farmer)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRoleMenuOpen(false);
                    navigate(PATHS.CUSTOMER.ORDERS);
                  }}
                  className="navbar-menu-item"
                >
                  <ShoppingBag size={16} color="#10b981" />
                  <span>Đơn Mua Khách Hàng (Customer)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRoleMenuOpen(false);
                    navigate(PATHS.HOME);
                  }}
                  className="navbar-menu-item"
                >
                  <ArrowLeft size={16} color="#15803d" />
                  <span>Chợ Nông Sản (Marketplace)</span>
                </button>
              </div>
            )}
          </div>

          {/* User Account */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="navbar-user-pill"
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80'}
                alt={user?.fullName || 'Quản trị viên'}
                className="navbar-user-avatar"
              />
              <span className="navbar-user-name">
                {user?.fullName?.split(' ')[0] || 'Admin'}
              </span>
              <span className="navbar-portal-badge navbar-portal-badge-admin">
                Admin
              </span>
              <ChevronDown size={14} color="#64748b" />
            </div>

            {userMenuOpen && (
              <div className="navbar-dropdown">
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {user?.fullName || 'Hệ Thống Quản Trị'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {user?.email || 'admin@marketlink.com'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate(PATHS.FARMER.DASHBOARD);
                  }}
                  className="navbar-menu-item"
                >
                  <Store size={16} color="#ea580c" />
                  <span>Kênh Nông Dân (Farmer)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate(PATHS.CUSTOMER.ORDERS);
                  }}
                  className="navbar-menu-item"
                >
                  <ShoppingBag size={16} color="#10b981" />
                  <span>Trang Khách Hàng (Customer)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate(PATHS.ADMIN.KYC);
                  }}
                  className="navbar-menu-item"
                >
                  <FileCheck2 size={16} color="#dc2626" />
                  <span>Thẩm định KYC Nông Dân</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="navbar-menu-item"
                  style={{ color: '#dc2626' }}
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
