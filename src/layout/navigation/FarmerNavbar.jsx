import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { Store, FileCheck2, Package, ShoppingBag, Clock, ChevronDown, Shield, User, LogOut, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { farmerService } from '@/services/farmer.service';
import { PATHS } from '@/routes/paths';

export const FarmerNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isFarmer } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    async function checkApproval() {
      try {
        const res = await farmerService.getMyKyc();
        const data = res?.data || res;
        if (data) {
          setIsApproved(Boolean(data.isApproved));
        }
      } catch {
        // Silently handled
      }
    }
    checkApproval();
  }, [location.pathname]);

  const farmerNavItems = [
    { to: PATHS.FARMER.DASHBOARD, label: 'Tổng Quan', icon: Store },
    { to: PATHS.FARMER.KYC, label: 'Hồ Sơ KYC & VietGAP', icon: FileCheck2 },
    { to: PATHS.FARMER.PRODUCTS, label: 'Nông Sản & Giá', icon: Package },
    { to: PATHS.FARMER.ORDERS, label: 'Đơn Đặt Trước', icon: ShoppingBag },
    { to: PATHS.FARMER.SLOTS, label: 'Khung Giờ Nhận', icon: Clock },
  ];

  return (
    <header className="navbar-header navbar-header-farmer">
      <div className="navbar-container">
        {/* Brand with Farmer Portal Badge */}
        <div
          onClick={() => navigate(PATHS.FARMER.DASHBOARD)}
          className="navbar-brand"
        >
          <div className="navbar-brand-logo" style={{ background: 'linear-gradient(135deg, #ea580c, #f59e0b)' }}>
            🌾
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="navbar-brand-title" style={{ color: '#ea580c' }}>MarketLink</span>
              <span className="navbar-portal-badge navbar-portal-badge-farmer">
                Sạp Nông Dân
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
              Cổng Điều Phối Nông Sản & Quầy Chợ
            </div>
          </div>
        </div>

        {/* Dedicated Farmer Navigation Items */}
        <nav className="navbar-nav">
          {farmerNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`navbar-link-farmer ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Selling Permission Status Tag */}
          <div
            className="navbar-kyc-status-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              background: isApproved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isApproved ? '#34d399' : '#f87171',
              border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
            }}
          >
            {isApproved ? (
              <>
                <CheckCircle2 size={13} />
                <span>Đã Xác Minh</span>
              </>
            ) : (
              <>
                <AlertCircle size={13} />
                <span>Chưa Xác Minh</span>
              </>
            )}
          </div>

          {/* Nút Xem Chợ / Dạo Chợ dành cho Farmer */}
          <button
            id="btn-farmer-view-market"
            type="button"
            onClick={() => navigate(PATHS.HOME)}
            className="navbar-return-btn"
            title="Xem giao diện Chợ Nông Sản công khai"
          >
            <Store size={14} color="#10b981" />
            <span>Xem Chợ</span>
          </button>

          {/* Nếu tài khoản là Admin: Menu chuyển phân hệ gọn gàng */}
          {isAdmin && (
            <div style={{ position: 'relative' }}>
              <button
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
          )}

          {/* User Account */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="navbar-user-pill"
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=80'}
                alt={user?.fullName || 'Nông dân'}
                className="navbar-user-avatar"
              />
              <span className="navbar-user-name">
                {user?.fullName?.split(' ')[0] || (isAdmin ? 'Admin' : 'Chủ Sạp')}
              </span>
              <span className={`navbar-portal-badge ${
                isAdmin ? 'navbar-portal-badge-admin' : 'navbar-portal-badge-farmer'
              }`}>
                {isAdmin ? 'Admin' : 'Farmer'}
              </span>
              <ChevronDown size={14} color="#64748b" />
            </div>

            {userMenuOpen && (
              <div className="navbar-dropdown">
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {user?.fullName || 'Nhà Vườn Liên Kết'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {user?.email || 'farmer@marketlink.com'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate(PATHS.CUSTOMER.ORDERS);
                  }}
                  className="navbar-menu-item"
                >
                  <ShoppingBag size={16} color="var(--primary-light)" />
                  <span>Trang Khách Hàng (Đơn mua)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate(PATHS.FARMER.KYC);
                  }}
                  className="navbar-menu-item"
                >
                  <FileCheck2 size={16} color="#ea580c" />
                  <span>Hồ sơ thẩm định KYC</span>
                </button>

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

export default FarmerNavbar;
