import React, { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { ShoppingBag, Heart, User, Sparkles, ChevronDown, Store, Shield, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { PATHS } from '@/routes/paths';

export const CustomerNavbar = ({
  onOpenAi = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isFarmer, isAdmin } = useAuth();
  const { totalItems, setIsDrawerOpen } = useCart();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const customerNavItems = [
    { to: PATHS.CUSTOMER.ORDERS, label: 'Đơn Đặt Trước', icon: ShoppingBag },
    { to: PATHS.CUSTOMER.FAVORITES, label: 'Yêu Thích', icon: Heart },
    { to: PATHS.CUSTOMER.PROFILE, label: 'Hồ Sơ & Gia Đình', icon: User },
  ];

  return (
    <header className="navbar-header navbar-header-customer">
      <div className="navbar-container">
        {/* Brand with Customer Portal Badge */}
        <div
          onClick={() => navigate(PATHS.CUSTOMER.ORDERS)}
          className="navbar-brand"
        >
          <div className="navbar-brand-logo">
            🌱
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="navbar-brand-title">MarketLink</span>
              <span className="navbar-portal-badge navbar-portal-badge-customer">
                Khách Hàng
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
              Khu Vực Quản Lý Đơn & Mua Sắm
            </div>
          </div>
        </div>

        {/* Dedicated Customer Navigation Items */}
        <nav className="navbar-nav">
          {customerNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`navbar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <button
            type="button"
            onClick={() => navigate(PATHS.HOME)}
            className="navbar-link"
            style={{ color: 'var(--primary)', fontWeight: 700 }}
          >
            <span>Dạo Chợ</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* AI button */}
          <button
            type="button"
            onClick={onOpenAi}
            className="navbar-ai-btn"
          >
            <Sparkles size={16} color="#fde047" />
            <span>Hỏi AI</span>
          </button>

          {/* Cart trigger */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="navbar-cart-btn"
            aria-label="Giỏ hàng đặt trước"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="navbar-cart-badge">
                {totalItems}
              </span>
            )}
          </button>

          {/* Phân quyền chuyển đổi: Admin toàn quyền, Farmer có nút sang Kênh Nông Dân */}
          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                id="btn-admin-go-farmer"
                type="button"
                onClick={() => navigate(PATHS.FARMER.DASHBOARD)}
                className="navbar-return-btn navbar-role-btn-farmer"
                title="Truy cập Kênh Nông Dân"
              >
                <Store size={15} />
                <span>Kênh Nông Dân</span>
              </button>

              <div style={{ position: 'relative' }}>
                <button
                  id="btn-admin-role-menu"
                  type="button"
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="navbar-return-btn navbar-role-btn-admin"
                >
                  <Shield size={14} color="#f87171" />
                  <span>Toàn Quyền Admin</span>
                  <ChevronDown size={14} />
                </button>

                {roleMenuOpen && (
                  <div className="navbar-dropdown">
                    <div style={{ padding: '6px 10px', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                      Toàn Quyền Quản Trị Hệ Thống
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRoleMenuOpen(false);
                        navigate(PATHS.ADMIN.DASHBOARD);
                      }}
                      className="navbar-menu-item"
                    >
                      <Shield size={16} color="#dc2626" />
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
                        navigate(PATHS.HOME);
                      }}
                      className="navbar-menu-item"
                    >
                      <ArrowLeft size={16} color="#15803d" />
                      <span>Quay Về Trang Chủ Chợ</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : isFarmer ? (
            <button
              id="btn-customer-go-to-farmer"
              type="button"
              onClick={() => navigate(PATHS.FARMER.DASHBOARD)}
              className="navbar-return-btn navbar-role-btn-farmer"
              title="Chuyển sang Cổng Quản Lý Sạp Nông Dân"
            >
              <Store size={15} />
              <span>Qua Trang Nông Dân</span>
            </button>
          ) : null}

          {/* User Account */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="navbar-user-pill"
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                alt={user?.fullName || 'Khách hàng'}
                className="navbar-user-avatar"
              />
              <span className="navbar-user-name">
                {user?.fullName?.split(' ')[0] || (isAdmin ? 'Admin' : isFarmer ? 'Nông Dân' : 'Khách Hàng')}
              </span>
              <span className={`navbar-portal-badge ${
                isAdmin ? 'navbar-portal-badge-admin' :
                isFarmer ? 'navbar-portal-badge-farmer' :
                'navbar-portal-badge-customer'
              }`}>
                {isAdmin ? 'Admin' : isFarmer ? 'Farmer' : 'Customer'}
              </span>
              <ChevronDown size={14} color="#64748b" />
            </div>

            {userMenuOpen && (
              <div className="navbar-dropdown">
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {user?.fullName || 'Khách Hàng Thân Thiết'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {user?.email || 'customer@marketlink.com'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate(PATHS.CUSTOMER.PROFILE);
                  }}
                  className="navbar-menu-item"
                >
                  <User size={16} />
                  <span>Hồ sơ người dùng</span>
                </button>

                {(isFarmer || isAdmin) && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate(PATHS.FARMER.DASHBOARD);
                    }}
                    className="navbar-menu-item"
                  >
                    <Store size={16} color="#ea580c" />
                    <span>Qua Trang Nông Dân</span>
                  </button>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate(PATHS.ADMIN.DASHBOARD);
                    }}
                    className="navbar-menu-item"
                  >
                    <Shield size={16} color="#dc2626" />
                    <span>Khu Vực Quản Trị (Admin)</span>
                  </button>
                )}

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

export default CustomerNavbar;
