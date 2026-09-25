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
  const { user, logout, isFarmer, isAdmin } = useAuth();
  const { totalItems, setIsDrawerOpen } = useCart();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const currentPath = location.pathname;

  return (
    <header className="navbar-header">
      <div className="navbar-container">
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
              <span className="navbar-vietgap-badge" style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: 'var(--primary-light)', padding: '2px 7px', borderRadius: '999px' }}>
                VIETGAP
              </span>
            </div>
            <div className="navbar-brand-sub" style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
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
          {/* Nút chuyển phân hệ theo đúng quyền của tài khoản */}
          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                id="btn-admin-nav-farmer"
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
                        navigate(PATHS.CUSTOMER.ORDERS);
                      }}
                      className="navbar-menu-item"
                    >
                      <User size={16} color="#15803d" />
                      <span>Đơn Mua Khách Hàng (Customer)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : isFarmer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                id="btn-farmer-nav-portal"
                type="button"
                onClick={() => navigate(PATHS.FARMER.DASHBOARD)}
                className="navbar-return-btn navbar-role-btn-farmer"
                title="Chuyển sang Cổng Quản Lý Sạp Nông Dân"
              >
                <Store size={15} />
                <span>Qua Trang Nông Dân</span>
              </button>

              <button
                id="btn-farmer-nav-customer"
                type="button"
                onClick={() => navigate(PATHS.CUSTOMER.ORDERS)}
                className="navbar-return-btn navbar-role-btn-customer"
                title="Chuyển sang Trang Khách Hàng"
              >
                <ShoppingBag size={14} />
                <span>Trang Khách Hàng</span>
              </button>
            </div>
          ) : null}

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
                <span className={`navbar-portal-badge ${
                  isAdmin ? 'navbar-portal-badge-admin' :
                  isFarmer ? 'navbar-portal-badge-farmer' :
                  'navbar-portal-badge-customer'
                }`}>
                  {isAdmin ? 'Admin' : isFarmer ? 'Farmer' : 'Customer'}
                </span>
                <ChevronDown size={14} color="#64748b" />
              </div>
            ) : (
              <button
                id="navbar-login-btn"
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
                  <span>Trang Khách Hàng (Đơn mua)</span>
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

export default MarketplaceNavbar;
