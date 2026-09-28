import React, { useState } from "react";
import "@/assets/styles/layout/Header.css";
import NotificationBell from "./NotificationBell";
import { useLanguage } from "@/context";

export default function Header({
  currentRole = "GUEST",
  userName = "Khách vãng lai",
  onSwitchRole,
  cartCount = 0,
  onOpenCart,
  onOpenMobileMenu,
  selectedLocation = "Hà Nội",
  onSelectLocation,
  onOpenAuthModal,
  activeNav = "home",
  onNavigate,
  onLogout,
  notifications = [],
  unreadCount = 0,
  onNotificationRead,
  onMarkAllRead,
  isLiveConnected = true,
  theme = "light",
  onToggleTheme,
}) {
  const { language, isEn, toggleLanguage, t } = useLanguage();
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const locations = [
    "Hà Nội",
    "TP. Hồ Chí Minh",
    "Đà Lạt",
    "Mộc Châu",
    "Cần Thơ",
  ];
  const roleLabels = {
    GUEST: {
      label: t("roleGuest", "Khách vãng lai"),
      icon: "👤",
      color: "neutral",
    },
    CUSTOMER: {
      label: t("roleCustomer", "Khách hàng"),
      icon: "🛒",
      color: "primary",
    },
    FARMER: {
      label: t("roleFarmer", "Nông dân (Chủ sạp)"),
      icon: "👨‍🌾",
      color: "accent",
    },
    ADMIN: {
      label: t("roleAdmin", "Quản trị viên"),
      icon: "🛡️",
      color: "dark",
    },
  };
  const formatName = (name) => {
    if (!name || name === "Khách vãng lai" || name === "Guest") return isEn ? "Guest" : "Khách vãng lai";
    return name
      .replace(/Nguy\?n\s*Nh\?t\s*Quang/gi, "Nguyễn Nhựt Quang")
      .replace(/Nguy\?n/gi, "Nguyễn")
      .replace(/Nh\?t/gi, "Nhựt")
      .replace(/\?/g, "");
  };
  const displayName = formatName(userName);
  const avatarLetter =
    displayName && displayName.trim().length > 0
      ? displayName.trim().charAt(0).toUpperCase()
      : "U";
  return (
    <header className="ml-header">
      <div className="ml-header-inner">
        <div className="ml-header-left">
          <button
            type="button"
            className="ml-mobile-toggle"
            onClick={onOpenMobileMenu}
            aria-label={isEn ? "Open navigation menu" : "Mở menu điều hướng"}
          >
            <span className="ml-hamburger-bar" />
            <span className="ml-hamburger-bar" />
            <span className="ml-hamburger-bar" />
          </button>

          <div
            className="ml-brand"
            onClick={() => onNavigate && onNavigate("home")}
            role="button"
            tabIndex={0}
          >
            <div className="ml-brand-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d="M12 2a9 9 0 0 1 9 9v1a9 9 0 0 1-9 9 9 9 0 0 1-9-9v-1a9 9 0 0 1 9-9Z"
                  fill="#E8F5E9"
                  stroke="#2E7D32"
                />
                <path d="M12 21V11" stroke="#1B5E20" />
                <path
                  d="M12 11c-2-3-5.5-4-8-3 0 4 2 7 8 7"
                  fill="#81C784"
                  stroke="#2E7D32"
                />
                <path
                  d="M12 14c2-2.5 5-3.5 7-2.5 0 3.5-1.8 6-7 6"
                  fill="#A5D6A7"
                  stroke="#1B5E20"
                />
              </svg>
            </div>
            <div className="ml-brand-text">
              <span className="ml-brand-title">
                Market<span className="ml-brand-title-accent">Link</span>
              </span>
              <span className="ml-brand-tagline">
                {t("brandTagline", "Nông sản chợ phiên")}
              </span>
            </div>
          </div>

          <div className="ml-location-picker">
            <button
              type="button"
              className="ml-location-btn"
              onClick={() => setShowLocationMenu(!showLocationMenu)}
            >
              <span className="ml-location-icon">📍</span>
              <span className="ml-location-text">{selectedLocation}</span>
              <span className="ml-dropdown-arrow">▾</span>
            </button>

            {showLocationMenu && (
              <div className="ml-location-dropdown">
                <div className="ml-dropdown-header">
                  {t("selectLocation", "Chọn khu vực của bạn:")}
                </div>
                {locations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className={`ml-dropdown-item ${loc === selectedLocation ? "active" : ""}`}
                    onClick={() => {
                      onSelectLocation(loc);
                      setShowLocationMenu(false);
                    }}
                  >
                    <span>{loc}</span>
                    {loc === selectedLocation && (
                      <span className="ml-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="ml-nav-desktop" aria-label="Điều hướng chính">
          <div className="ml-nav-inner">
            {(currentRole === "GUEST" || currentRole === "CUSTOMER") && (
              <>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "home" ? "active" : ""}`}
                  onClick={() => onNavigate("home")}
                >
                  🏠 {t("navHome", "Trang chủ")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "markets" ? "active" : ""}`}
                  onClick={() => onNavigate("markets")}
                  title={isEn ? "Explore farmers' markets" : "Khám phá các phiên chợ nông sản"}
                >
                  🏪 {t("navMarkets", "Chợ phiên")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "products" ? "active" : ""}`}
                  onClick={() => onNavigate("products")}
                  title={isEn ? "Seasonal clean produce" : "Nông sản sạch theo mùa vụ"}
                >
                  🥦 {t("navProducts", "Nông sản")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "farmers" ? "active" : ""}`}
                  onClick={() => onNavigate("farmers")}
                  title={isEn ? "Local farmer stalls" : "Gian hàng các nông hộ địa phương"}
                >
                  👨‍🌾 {t("navStalls", "Gian hàng")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "announcements" ? "active" : ""}`}
                  onClick={() => onNavigate("announcements")}
                  title={isEn ? "Platform news & announcements" : "Tin tức & thông báo nền tảng"}
                >
                  📋 {t("navAnnouncements", "Bảng tin")}
                </button>
                {currentRole === "CUSTOMER" && (
                  <>
                    <button
                      type="button"
                      className={`ml-nav-link ${activeNav === "orders" ? "active" : ""}`}
                      onClick={() => onNavigate("orders")}
                      title={isEn ? "My pre-orders" : "Danh sách đơn đặt trước của tôi"}
                    >
                      📦 {t("navOrders", "Đơn hàng")}
                    </button>
                    <button
                      type="button"
                      className={`ml-nav-link ml-nav-desktop-extra ${activeNav === "dashboard" ? "active" : ""}`}
                      onClick={() => onNavigate("dashboard")}
                      title={isEn ? "Personal dashboard" : "Trang quản lý cá nhân"}
                    >
                      👤 {t("navDashboard", "Cá nhân")}
                    </button>
                  </>
                )}
              </>
            )}

            {currentRole === "FARMER" && (
              <>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "farmer-dashboard" ? "active" : ""}`}
                  onClick={() => onNavigate("farmer-dashboard")}
                  title={isEn ? "Sales & stall overview" : "Bảng tổng quan doanh số và sạp hàng"}
                >
                  📊 {t("navFarmerDashboard", "Tổng quan")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "farmer-orders" ? "active" : ""}`}
                  onClick={() => onNavigate("farmer-orders")}
                  title={isEn ? "Customer pre-orders" : "Danh sách đơn khách đặt trước"}
                >
                  📦 {t("navFarmerOrders", "Đơn đặt")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "farmer-inventory" ? "active" : ""}`}
                  onClick={() => onNavigate("farmer-inventory")}
                  title={isEn ? "Inventory & quotas" : "Quản lý kho nông sản & định mức sạp"}
                >
                  🥬 {t("navFarmerInventory", "Kho hàng")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "farmer-stall" ? "active" : ""}`}
                  onClick={() => onNavigate("farmer-stall")}
                  title={isEn ? "Stall profile & registration" : "Hồ sơ sạp và đăng ký phiên chợ"}
                >
                  🎪 {t("navFarmerStall", "Sạp hàng")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "farmer-reviews" ? "active" : ""}`}
                  onClick={() => onNavigate("farmer-reviews")}
                  title={isEn ? "Customer reviews" : "Đánh giá từ khách hàng"}
                >
                  💬 {t("navFarmerReviews", "Đánh giá")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "markets" ? "active" : ""}`}
                  onClick={() => onNavigate("markets")}
                  title={isEn ? "View active markets" : "Xem các phiên chợ đang mở"}
                >
                  🏪 {t("navViewMarket", "Xem chợ")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "announcements" ? "active" : ""}`}
                  onClick={() => onNavigate("announcements")}
                  title={isEn ? "Platform news & announcements" : "Tin tức & thông báo nền tảng"}
                >
                  📋 {t("navAnnouncements", "Bảng tin")}
                </button>
              </>
            )}

            {currentRole === "ADMIN" && (
              <>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "admin-dashboard" ? "active" : ""}`}
                  onClick={() => onNavigate("admin-dashboard")}
                  title={isEn ? "System overview" : "Bảng điều hành tổng quan hệ thống"}
                >
                  📊 {t("navAdminDashboard", "Tổng quan")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "admin-markets" ? "active" : ""}`}
                  onClick={() => onNavigate("admin-markets")}
                  title={isEn ? "Manage markets & allocations" : "Quản lý các phiên chợ và phân bổ sạp"}
                >
                  🎪 {t("navAdminMarkets", "Chợ & Sạp")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "admin-users" ? "active" : ""}`}
                  onClick={() => onNavigate("admin-users")}
                  title={isEn ? "User moderation & KYC" : "Thẩm định hồ sơ nông hộ & Quản lý người dùng"}
                >
                  👥 {t("navAdminUsers", "Người dùng & KYC")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "admin-orders" ? "active" : ""}`}
                  onClick={() => onNavigate("admin-orders")}
                  title={isEn ? "Platform-wide orders" : "Giám sát đơn đặt trước toàn sàn"}
                >
                  📦 {t("navAdminOrders", "Đơn toàn sàn")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "admin-content" ? "active" : ""}`}
                  onClick={() => onNavigate("admin-content")}
                  title={isEn ? "Moderate reviews & announcements" : "Kiểm duyệt đánh giá, danh mục & thông báo"}
                >
                  🛡️ {t("navAdminContent", "Kiểm duyệt")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "announcements" ? "active" : ""}`}
                  onClick={() => onNavigate("announcements")}
                  title={isEn ? "Platform news & announcements" : "Tin tức & thông báo nền tảng"}
                >
                  📋 {t("navAnnouncements", "Bảng tin")}
                </button>
                <button
                  type="button"
                  className={`ml-nav-link ${activeNav === "home" ? "active" : ""}`}
                  onClick={() => onNavigate("home")}
                  title={isEn ? "View customer homepage" : "Xem trang chủ góc nhìn người mua"}
                >
                  🏠 {t("navViewMarket", "Xem chợ")}
                </button>
              </>
            )}
          </div>
        </nav>

        <div className="ml-header-right">
          <button
            id="ml-header-lang-btn"
            type="button"
            className="ml-lang-toggle"
            onClick={toggleLanguage}
            aria-label={t("languageToggle")}
            title={isEn ? "Chuyển sang Tiếng Việt (VI)" : "Switch to English (EN)"}
          >
            <span className="ml-lang-flag">{isEn ? "🇬🇧" : "🇻🇳"}</span>
            <span className="ml-lang-code">{isEn ? "EN" : "VI"}</span>
          </button>

          <button
            type="button"
            className="ml-theme-toggle"
            onClick={onToggleTheme}
            aria-label={
              theme === "dark"
                ? t("themeToggleLight", "Chuyển sang giao diện sáng")
                : t("themeToggleDark", "Chuyển sang giao diện tối")
            }
            title={t("themeToggleDark", "Đổi giao diện sáng / tối")}
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          </button>

          {currentRole !== "ADMIN" && currentRole !== "FARMER" && (
            <button
              type="button"
              className="ml-cart-trigger"
              onClick={onOpenCart}
              aria-label={isEn ? `Pre-order cart with ${cartCount} items` : `Giỏ hàng đặt trước với ${cartCount} sản phẩm`}
            >
              <div className="ml-cart-icon-wrap">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cartCount > 0 && (
                  <span className="ml-cart-badge ml-badge-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="ml-cart-label">{t("cartTitle", "Giỏ đặt trước")}</span>
            </button>
          )}

          {currentRole !== "GUEST" && (
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onNotificationRead={onNotificationRead}
              onMarkAllRead={onMarkAllRead}
              isLiveConnected={isLiveConnected}
              onNavigate={onNavigate}
              currentRole={currentRole}
            />
          )}

          {currentRole !== "GUEST" ? (
            <div className="ml-user-dropdown-wrap">
              <button
                type="button"
                className={`ml-header-user-btn ml-header-user-btn--${roleLabels[currentRole]?.color || "primary"} ${showUserMenu ? "active" : ""}`}
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={isEn ? "Personal Account & Logout" : "Tài khoản cá nhân & Đăng xuất"}
                aria-expanded={showUserMenu}
              >
                <div className="ml-header-avatar">{avatarLetter}</div>
                <div className="ml-header-user-meta">
                  <span className="ml-header-user-name" title={displayName}>
                    {displayName}
                  </span>
                  <span
                    className="ml-header-user-role"
                  >
                    {roleLabels[currentRole]?.label}
                  </span>
                </div>
                <span
                  className={`ml-header-dropdown-arrow ${showUserMenu ? "open" : ""}`}
                >
                  ▾
                </span>
              </button>

              {showUserMenu && (
                <div className="ml-user-dropdown-menu">
                  <div className="ml-user-dropdown-header">
                    <div className="ml-user-dropdown-avatar">
                      {avatarLetter}
                    </div>
                    <div className="ml-user-dropdown-info">
                      <strong className="ml-user-dropdown-name">
                        {displayName}
                      </strong>
                      <span className="ml-user-dropdown-badge">
                        {roleLabels[currentRole]?.icon}{" "}
                        {roleLabels[currentRole]?.label}
                      </span>
                    </div>
                  </div>

                  <div className="ml-user-dropdown-body">
                    {currentRole === "CUSTOMER" && (
                      <>
                        <button
                          type="button"
                          className="ml-user-dropdown-item"
                          onClick={() => {
                            onNavigate && onNavigate("dashboard");
                            setShowUserMenu(false);
                          }}
                        >
                          <span>👤</span> {isEn ? "Personal Dashboard" : "Dashboard cá nhân"}
                        </button>
                        <button
                          type="button"
                          className="ml-user-dropdown-item"
                          onClick={() => {
                            onNavigate && onNavigate("orders");
                            setShowUserMenu(false);
                          }}
                        >
                          <span>📦</span> {isEn ? "My Pre-orders" : "Đơn đặt trước của tôi"}
                        </button>
                      </>
                    )}

                    {currentRole === "FARMER" && (
                      <>
                        <button
                          type="button"
                          className={`ml-user-dropdown-item ${activeNav === "farmer-dashboard" ? "active" : ""}`}
                          onClick={() => {
                            onNavigate && onNavigate("farmer-dashboard");
                            setShowUserMenu(false);
                          }}
                        >
                          <span>📊</span> {isEn ? "Stall Operations Overview" : "Tổng quan hoạt động sạp"}
                        </button>
                        <button
                          type="button"
                          className={`ml-user-dropdown-item ${activeNav === "farmer-inventory" ? "active" : ""}`}
                          onClick={() => {
                            onNavigate && onNavigate("farmer-inventory");
                            setShowUserMenu(false);
                          }}
                        >
                          <span>🥬</span> {isEn ? "Produce Inventory & Quotas" : "Kho nông sản & định mức"}
                        </button>
                      </>
                    )}

                    {currentRole === "ADMIN" && (
                      <>
                        <button
                          type="button"
                          className="ml-user-dropdown-item"
                          onClick={() => {
                            onNavigate && onNavigate("admin-dashboard");
                            setShowUserMenu(false);
                          }}
                        >
                          <span>📊</span> {isEn ? "System Operations Dashboard" : "Bảng điều hành tổng quan sàn"}
                        </button>
                        <button
                          type="button"
                          className="ml-user-dropdown-item"
                          onClick={() => {
                            onNavigate && onNavigate("admin-markets");
                            setShowUserMenu(false);
                          }}
                        >
                          <span>🎪</span> {isEn ? "Manage Markets" : "Quản lý các phiên chợ"}
                        </button>
                      </>
                    )}

                    <div className="ml-user-dropdown-divider" />
                    <button
                      type="button"
                      className="ml-user-dropdown-item ml-user-dropdown-item--logout"
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onLogout) onLogout();
                      }}
                    >
                      <span>🚪</span> {t("logout", isEn ? "Sign out" : "Đăng xuất tài khoản")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-guest-auth-actions">
              <button
                type="button"
                className="ml-login-action-btn"
                onClick={() => onOpenAuthModal && onOpenAuthModal("LOGIN")}
              >
                {t("login", "Đăng nhập")}
              </button>
              <button
                type="button"
                className="ml-register-action-btn"
                onClick={() => onOpenAuthModal && onOpenAuthModal("REGISTER")}
              >
                {t("register", "Đăng ký")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
