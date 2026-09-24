import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Sparkles, ChevronDown, Store, Shield, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { PATHS } from '@/routes/paths';

export const MarketplaceNavbar = ({
  onOpenAi = () => {},
  onOpenAuth = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isFarmer, isAdmin, logout } = useAuth();
  const { totalItems, setIsDrawerOpen } = useCart();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const currentPath = location.pathname;

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <div
          onClick={() => navigate(PATHS.HOME)}
          className="navbar-brand"
        >
          <div className="navbar-brand-logo">
            🌱
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="navbar-brand-title">MarketLink</span>
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#15803d', color: '#ffffff', padding: '2px 6px', borderRadius: '999px' }}>
                3D LIVE
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
              Chợ Nông Sản Sạch • Pay-at-pickup
            </div>
          </div>
        </div>

        {/* Public Store Navigation */}
        <nav className="navbar-nav">
          <button
            type="button"
            onClick={() => navigate(PATHS.HOME)}
            className={`navbar-link ${currentPath === PATHS.HOME ? 'active' : ''}`}
          >
            Trang Chủ
          </button>

          <button
            type="button"
            onClick={() => navigate(PATHS.MARKETS)}
            className={`navbar-link ${currentPath === PATHS.MARKETS ? 'active' : ''}`}
          >
            Chợ & Bản Đồ
          </button>

          <button
            type="button"
            onClick={() => {
              if (currentPath !== PATHS.HOME) {
                navigate(PATHS.HOME);
                setTimeout(() => {
                  document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              } else {
                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="navbar-link"
          >
            Nông Sản Thu Hoạch
          </button>
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Role Portals Shortcut Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="navbar-return-btn"
            >
              <span>Cổng Phân Quyền</span>
              <ChevronDown size={14} />
            </button>

            {roleMenuOpen && (
              <div className="navbar-dropdown">
                <div style={{ padding: '6px 10px', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Truy Cập Phân Hệ Chuyên Biệt
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRoleMenuOpen(false);
                    navigate(PATHS.CUSTOMER.ORDERS);
                  }}
                  className="navbar-menu-item"
                >
                  <User size={16} color="#15803d" />
                  <span>Khu Vực Khách Hàng</span>
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
                  <span>Sạp Nông Dân (Bán Hàng)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRoleMenuOpen(false);
                    navigate(PATHS.ADMIN.DASHBOARD);
                  }}
                  className="navbar-menu-item"
                >
                  <Shield size={16} color="#dc2626" />
                  <span>Quản Trị Viên (Admin)</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Assistant Button */}
          <button
            type="button"
            onClick={onOpenAi}
            className="navbar-ai-btn"
          >
            <Sparkles size={16} color="#fde047" />
            <span>Hỏi AI</span>
          </button>

          {/* Pre-Order Cart Trigger */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="navbar-cart-btn"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="navbar-cart-badge">
                {totalItems}
              </span>
            )}
          </button>

          {/* User Auth / Profile */}
          <div style={{ position: 'relative' }}>
            {user ? (
              <div
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="navbar-user-pill"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                  alt={user.fullName}
                  className="navbar-user-avatar"
                />
                <span className="navbar-user-name">
                  {user.fullName?.split(' ')[0] || 'Tài khoản'}
                </span>
                <ChevronDown size={14} color="#64748b" />
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="btn btn-primary"
                style={{ padding: '8px 16px', borderRadius: '12px' }}
              >
                Đăng Nhập
              </button>
            )}

            {userMenuOpen && user && (
              <div className="navbar-dropdown">
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.fullName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate(PATHS.CUSTOMER.ORDERS);
                  }}
                  className="navbar-menu-item"
                >
                  <ShoppingBag size={16} />
                  <span>Đơn hàng đặt trước</span>
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
