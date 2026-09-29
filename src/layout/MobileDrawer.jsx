import React, { useState, useEffect } from "react";
import "@/assets/styles/layout/MobileDrawer.css";
import Button from "@/components/common/Button";
import { useLanguage } from "@/context";
import { formatImageUrl } from "@/services/apiClient";

export default function MobileDrawer({
  isOpen,
  onClose,
  currentRole,
  userName = "Khách vãng lai",
  userAvatar = "",
  onSwitchRole,
  selectedLocation,
  onSelectLocation,
  activeNav,
  onNavigate,
  onOpenAuthModal,
  onLogout,
  theme = "light",
  onToggleTheme,
}) {
  const { language, isEn, toggleLanguage, t } = useLanguage();
  if (!isOpen) return null;
  const locations = [
    "Hà Nội",
    "TP. Hồ Chí Minh",
    "Đà Lạt",
    "Mộc Châu",
    "Cần Thơ",
  ];
  const formatName = (name) => {
    if (!name || name === "Khách vãng lai") return "Khách vãng lai";
    return name
      .replace(/Nguy\?n\s*Nh\?t\s*Quang/gi, "Nguyễn Nhựt Quang")
      .replace(/Nguy\?n/gi, "Nguyễn")
      .replace(/Nh\?t/gi, "Nhựt")
      .replace(/\?/g, "");
  };
  const displayName = formatName(userName);
  const [avatarImgError, setAvatarImgError] = useState(false);

  useEffect(() => {
    setAvatarImgError(false);
  }, [userAvatar]);

  const hasAvatarImg = Boolean(userAvatar && !avatarImgError);

  const avatarLetter =
    displayName && displayName.trim().length > 0
      ? displayName.trim().charAt(0).toUpperCase()
      : "U";
  return (
    <div
      className="ml-drawer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="ml-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="ml-drawer-header">
          <div className="ml-brand">
            <div className="ml-brand-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M12 2a9 9 0 0 1 9 9v1a9 9 0 0 1-9 9 9 9 0 0 1-9-9v-1a9 9 0 0 1 9-9Z"
                  fill="#E8F5E9"
                  stroke="#2E7D32"
                />
                <path d="M12 21V11" stroke="#1B5E20" />
              </svg>
            </div>
            <div className="ml-brand-text">
              <span className="ml-brand-title">
                Market<span className="ml-brand-title-accent">Link</span>
              </span>
              <span className="ml-brand-tagline">
                {t("brandTagline", "Nông sản sạch từ vườn")}
              </span>
            </div>
          </div>
          <div className="ml-drawer-header-actions">
            <button
              type="button"
              className="ml-drawer-lang-btn"
              onClick={toggleLanguage}
              title={isEn ? "Chuyển sang Tiếng Việt (VI)" : "Switch to English (EN)"}
              aria-label={t("languageToggle")}
            >
              {isEn ? "VI" : "EN"}
            </button>
            {onToggleTheme && (
              <button
                type="button"
                className="ml-drawer-theme-btn"
                onClick={onToggleTheme}
                aria-label={
                  theme === "dark"
                    ? "Chuyển sang giao diện sáng"
                    : "Chuyển sang giao diện tối"
                }
                title="Đổi giao diện sáng / tối"
              >
                {theme === "dark" ? "☀" : "☾"}
              </button>
            )}
            <button
              type="button"
              className="ml-drawer-close"
              onClick={onClose}
              aria-label="Đóng menu"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="ml-drawer-body">
          {currentRole !== "GUEST" && (
            <div className="ml-drawer-user-card">
              <div className={`ml-drawer-user-avatar ${hasAvatarImg ? "has-image" : ""}`}>
                {hasAvatarImg ? (
                  <img
                    src={formatImageUrl(userAvatar)}
                    alt={displayName}
                    className="ml-drawer-user-avatar-img"
                    onError={() => setAvatarImgError(true)}
                  />
                ) : (
                  avatarLetter
                )}
              </div>
              <div className="ml-drawer-user-info">
                <div className="ml-drawer-user-name">{displayName}</div>
                <div className="ml-drawer-user-role">
                  {currentRole === "ADMIN"
                    ? (isEn ? "🛡️ Administrator" : "🛡️ Quản trị viên")
                    : currentRole === "FARMER"
                      ? (isEn ? "👨‍🌾 Farmer (Stall Owner)" : "👨‍🌾 Nông dân (Chủ sạp)")
                      : (isEn ? "🛒 Customer" : "🛒 Khách hàng")}
                </div>
              </div>
            </div>
          )}

          <div className="ml-drawer-section">
            <div className="ml-drawer-section-title">{isEn ? "Your Market Region" : "Khu vực chợ của bạn"}</div>
            <div className="ml-drawer-chips">
              {locations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  className={`ml-drawer-chip ${loc === selectedLocation ? "active" : ""}`}
                  onClick={() => onSelectLocation(loc)}
                >
                  📍 {loc}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-drawer-section">
            <div className="ml-drawer-section-title">{isEn ? "Explore" : "Khám phá"}</div>
            <nav className="ml-drawer-nav">
              <button
                type="button"
                className={`ml-drawer-nav-item ${activeNav === "home" ? "active" : ""}`}
                onClick={() => {
                  onNavigate("home");
                  onClose();
                }}
              >
                🏠 {isEn ? "Home" : "Trang chủ"}
              </button>
              <button
                type="button"
                className={`ml-drawer-nav-item ${activeNav === "markets" ? "active" : ""}`}
                onClick={() => {
                  onNavigate("markets");
                  onClose();
                }}
              >
                🎪 {isEn ? "Weekend Markets" : "Khám phá các chợ phiên"}
              </button>
              <button
                type="button"
                className={`ml-drawer-nav-item ${activeNav === "products" ? "active" : ""}`}
                onClick={() => {
                  onNavigate("products");
                  onClose();
                }}
              >
                🥦 {isEn ? "Fresh Seasonal Produce" : "Nông sản tươi theo mùa"}
              </button>
              <button
                type="button"
                className={`ml-drawer-nav-item ${activeNav === "farmers" ? "active" : ""}`}
                onClick={() => {
                  onNavigate("farmers");
                  onClose();
                }}
              >
                👨‍🌾 {isEn ? "Farmer Stalls" : "Gian hàng nông dân"}
              </button>
              <button
                type="button"
                className={`ml-drawer-nav-item ${activeNav === "announcements" ? "active" : ""}`}
                onClick={() => {
                  onNavigate("announcements");
                  onClose();
                }}
              >
                📋 {isEn ? "Announcements Board" : "Bảng tin MarketLink"}
              </button>
              {currentRole === "CUSTOMER" && (
                <>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "orders" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("orders");
                      onClose();
                    }}
                  >
                    📦 {isEn ? "My Pre-orders" : "Đơn đặt trước của tôi"}
                  </button>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "dashboard" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("dashboard");
                      onClose();
                    }}
                  >
                    👤 {isEn ? "Personal Dashboard" : "Dashboard cá nhân & sạp thích"}
                  </button>
                </>
              )}
              {currentRole === "FARMER" && (
                <>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "farmer-dashboard" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("farmer-dashboard");
                      onClose();
                    }}
                  >
                    📊 {isEn ? "Stall Operations" : "Tổng quan sạp chợ"}
                  </button>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "farmer-orders" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("farmer-orders");
                      onClose();
                    }}
                  >
                    📦 {isEn ? "Customer Pre-orders" : "Đơn khách đặt trước"}
                  </button>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "farmer-inventory" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("farmer-inventory");
                      onClose();
                    }}
                  >
                    🥬 {isEn ? "Produce Inventory" : "Quản lý kho nông sản"}
                  </button>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "farmer-stall" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("farmer-stall");
                      onClose();
                    }}
                  >
                    🎪 {isEn ? "Stall Profile & Markets" : "Hồ sơ sạp & chợ đăng ký"}
                  </button>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "farmer-reviews" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("farmer-reviews");
                      onClose();
                    }}
                  >
                    💬 {isEn ? "Customer Reviews" : "Đánh giá từ khách"}
                  </button>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "announcements" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("announcements");
                      onClose();
                    }}
                  >
                    📋 {isEn ? "Announcements Board" : "Bảng tin MarketLink"}
                  </button>
                </>
              )}
              {currentRole === "ADMIN" && (
                <>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "admin-dashboard" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("admin-dashboard");
                      onClose();
                    }}
                  >
                    📊 {isEn ? "System Operations" : "Tổng quan sàn MarketLink"}
                  </button>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "admin-markets" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("admin-markets");
                      onClose();
                    }}
                  >
                    🎪 {isEn ? "Manage Markets & Stalls" : "Quản lý chợ & sạp"}
                  </button>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "admin-users" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("admin-users");
                      onClose();
                    }}
                  >
                    👥 {isEn ? "Users & KYC" : "Quản lý người dùng & KYC"}
                  </button>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "admin-orders" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("admin-orders");
                      onClose();
                    }}
                  >
                    📦 {isEn ? "Platform Orders" : "Giám sát đơn toàn sàn"}
                  </button>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "admin-content" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("admin-content");
                      onClose();
                    }}
                  >
                    🛡️ {isEn ? "Content Moderation" : "Kiểm duyệt & Vận hành"}
                  </button>
                  <button
                    type="button"
                    className={`ml-drawer-nav-item ${activeNav === "announcements" ? "active" : ""}`}
                    onClick={() => {
                      onNavigate("announcements");
                      onClose();
                    }}
                  >
                    📋 {isEn ? "Announcements Board" : "Bảng tin MarketLink"}
                  </button>
                </>
              )}
            </nav>
          </div>

          <div className="ml-drawer-auth">
            {currentRole === "GUEST" ? (
              <div className="ml-drawer-auth-buttons">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    onOpenAuthModal("LOGIN");
                    onClose();
                  }}
                >
                  {isEn ? "Sign In" : "Đăng nhập"}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    onOpenAuthModal("REGISTER");
                    onClose();
                  }}
                >
                  {isEn ? "Create Account" : "Đăng ký tài khoản"}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                className="ml-drawer-logout-btn"
                onClick={() => {
                  if (onLogout) onLogout();
                  onClose();
                }}
              >
                🚪 {isEn ? "Sign out" : "Đăng xuất tài khoản"}
              </button>
            )}
          </div>
        </div>

        <div className="ml-drawer-footer">
          <p>
            📞 {isEn ? "Support Hotline:" : "Hotline hỗ trợ chợ phiên:"} <strong>1900 8899</strong>
          </p>
          <span className="ml-drawer-pledge">
            {isEn ? "100% committed to fresh local farm produce" : "Cam kết 100% nông sản sạch địa phương"}
          </span>
        </div>
      </div>
    </div>
  );
}
