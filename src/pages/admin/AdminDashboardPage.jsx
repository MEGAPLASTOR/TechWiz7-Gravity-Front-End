import React, { useState, useEffect } from "react";
import "@/assets/styles/pages/admin/AdminDashboardPage.css";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import adminService from "../../services/adminService";
import { SWAGGER_DOCS_URL } from "../../services/apiClient";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminDashboardPage({ onNavigate }) {
  const { isEn, localizeMarketName, localizeProduceName } = useLanguage();
  const [metrics, setMetrics] = useState({
    totalFarmers: 0,
    totalCustomers: 0,
    totalMarkets: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingKycCount: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [marketReports, setMarketReports] = useState([]);
  const [topProduce, setTopProduce] = useState([]);
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };
  const [activeFarmers, setActiveFarmers] = useState([]);
  useEffect(() => {
    let isMounted = true;
    async function loadAdminData() {
      try {
        const [realMetrics, realKyc, realMarkets, realActiveFarmers] =
          await Promise.all([
            adminService.getPlatformMetrics(),
            adminService.getPendingKycList(),
            adminService.getMarketRevenueReports(),
            adminService.getMostActiveFarmers(5),
          ]);
        if (isMounted) {
          if (realMetrics) {
            setMetrics(realMetrics);
          }
          if (realKyc && realKyc.length > 0) {
            setPendingApprovals(
              realKyc.map((k) => ({
                id: k.farmerId,
                farmerName: k.stallName || k.farmName || "",
                repName: k.fullName || "",
                phone: k.phoneNumber || "",
                marketApplied: k.farmAddress || "",
                certType: k.certificationType || "VietGAP",
                appliedAt: k.lastSubmittedAt
                  ? k.lastSubmittedAt.replace("T", " ").substring(0, 16)
                  : "",
                status: k.kycStatus || "PENDING",
              })),
            );
          } else {
            setPendingApprovals([]);
          }
          if (realMarkets && realMarkets.length > 0) {
            setMarketReports(realMarkets);
          } else {
            setMarketReports([]);
          }
          if (realActiveFarmers && realActiveFarmers.length > 0) {
            setActiveFarmers(realActiveFarmers);
          } else {
            setActiveFarmers([]);
          }
        }
      } catch (err) {
        console.warn("Error loading real admin data", err);
      }
    }
    loadAdminData();
    return () => {
      isMounted = false;
    };
  }, []);
  const kpis = [
    {
      title: isEn ? "Active Weekend Markets" : "Chợ phiên hoạt động",
      value: `${metrics.totalMarkets || 0} ${isEn ? "Markets" : "Chợ"}`,
      trend: isEn ? "Open for pre-orders" : "Đang mở nhận đặt",
      trendType: "positive",
      icon: "🎪",
      hint: metrics.totalMarkets
        ? (isEn ? "Active market locations" : "Các điểm chợ đang mở")
        : (isEn ? "No active markets" : "Chưa có chợ hoạt động"),
    },
    {
      title: isEn ? "Farms & Family Growers" : "Nhà vườn & Nông hộ",
      value: `${metrics.totalFarmers || 0} ${isEn ? "Stalls" : "Sạp"}`,
      trend: isEn
        ? `${metrics.pendingKycCount || 0} KYC pending`
        : `${metrics.pendingKycCount || 0} hồ sơ chờ duyệt`,
      trendType: "warning",
      icon: "👨‍🌾",
      hint: isEn
        ? `${metrics.totalFarmers || 0} registered growers`
        : `${metrics.totalFarmers || 0} nông hộ trong hệ thống`,
    },
    {
      title: isEn ? "Platform Pre-orders" : "Đơn đặt trước toàn sàn",
      value: `${metrics.totalOrders || 0} ${isEn ? "Orders" : "Đơn"}`,
      trend: isEn ? "Growing volume" : "Đang tăng trưởng",
      trendType: "positive",
      icon: "📦",
      hint: isEn ? "Pickup at markets" : "Khách nhận tại chợ",
    },
    {
      title: isEn ? "Gross Produce GMV" : "Giá trị nông sản giao dịch",
      value: formatCurrency(metrics.totalRevenue || 0),
      trend: isEn ? "Transacted at market stalls" : "Giao dịch tại sạp chợ phiên",
      trendType: "neutral",
      icon: "💵",
      hint: isEn ? "Cash & VietQR payments" : "Thanh toán tiền mặt & VietQR",
    },
  ];
  return (
    <div className="ml-admin-dashboard">
      <div className="ml-admin-dash-banner">
        <div className="ml-container ml-admin-banner-inner">
          <div>
            <div className="ml-admin-banner-badge">
              <span className="ml-admin-badge-dot"></span>
              {isEn
                ? "MarketLink System Administration Center (Live Data)"
                : "Trung Tâm Quản Trị Hệ Thống MarketLink (Dữ Liệu Thật)"}
            </div>
            <h1 className="ml-admin-dash-title">
              {isEn
                ? "Agricultural Market Platform Executive Dashboard"
                : "Bảng Điều Hành Nền Tảng Chợ Nông Sản"}
            </h1>
            <p className="ml-admin-dash-desc">
              {isEn
                ? "Monitor farmers' market network, review VietGAP farm KYC, supervise pre-orders, and administer platform operations."
                : "Giám sát mạng lưới chợ phiên, thẩm định hồ sơ nông hộ VietGAP, kiểm soát đơn đặt trước và điều hành toàn bộ nền tảng."}
            </p>
          </div>

          <div
            className="ml-admin-quick-actions"
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate && onNavigate("admin-markets")}
            >
              🎪 {isEn ? "Markets & Stalls" : "Chợ & Sạp"}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate && onNavigate("admin-orders")}
            >
              📦 {isEn ? "All Pre-orders" : "Đơn toàn sàn"}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate && onNavigate("admin-content")}
            >
              🛡️ {isEn ? "Moderation & Categories" : "Kiểm duyệt & Danh mục"}
            </Button>
            <Button
              variant="accent"
              size="md"
              onClick={() => onNavigate && onNavigate("admin-users")}
            >
              👨‍🌾 {isEn
                ? `Review ${pendingApprovals.length} KYC profiles →`
                : `Duyệt ${pendingApprovals.length} hồ sơ KYC →`}
            </Button>
            <a
              href={SWAGGER_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-btn ml-btn--outline ml-btn--md"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#ffffff",
                borderColor: "rgba(255, 255, 255, 0.4)",
                background: "rgba(255, 255, 255, 0.1)",
              }}
              title={isEn ? "View Backend Swagger API Docs" : "Xem tài liệu API Swagger Backend"}
            >
              📄 Swagger API ↗
            </a>
          </div>
        </div>
      </div>

      <div className="ml-container ml-admin-dash-content">
        <div className="ml-kpi-grid">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="ml-card ml-kpi-card">
              <div className="ml-kpi-header">
                <span className="ml-kpi-title">{kpi.title}</span>
                <span className="ml-kpi-icon">{kpi.icon}</span>
              </div>
              <div className="ml-kpi-value">{kpi.value}</div>
              <div className="ml-kpi-footer">
                <span className={`ml-kpi-trend ${kpi.trendType}`}>
                  {kpi.trend}
                </span>
                <span className="ml-kpi-hint">• {kpi.hint}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="ml-admin-op-grid">
          <div className="ml-card ml-op-card">
            <div className="ml-op-card-header">
              <div>
                <h3 className="ml-op-card-title">
                  {isEn
                    ? "Farmer KYC Profiles Pending Approval"
                    : "Hồ Sơ Nông Hộ Chờ Thẩm Định (KYC)"}
                </h3>
                <p className="ml-op-card-subtitle">
                  {isEn
                    ? "Verify VietGAP, GlobalGAP, or Organic certifications before granting stall operating privileges"
                    : "Kiểm tra giấy chứng nhận VietGAP, GlobalGAP hoặc hữu cơ trước khi cấp quyền mở sạp"}
                </p>
              </div>
              <Badge variant="pending">
                {pendingApprovals.length} {isEn ? "Pending" : "Chờ duyệt"}
              </Badge>
            </div>

            <div className="ml-op-list">
              {pendingApprovals.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "28px",
                    color: "var(--color-text-muted)",
                    fontSize: "14px",
                  }}
                >
                  {isEn
                    ? "✓ No pending KYC applications at this time"
                    : "✓ Hiện không có hồ sơ KYC nào chờ thẩm định"}
                </div>
              ) : (
                pendingApprovals.map((item) => (
                  <div key={item.id} className="ml-op-item">
                    <div className="ml-op-avatar">🏡</div>
                    <div className="ml-op-info">
                      <div className="ml-op-name">{item.farmerName}</div>
                      <div className="ml-op-meta">
                        {isEn ? "Representative:" : "Đại diện:"}{" "}
                        <strong>{item.repName}</strong> ({item.phone})
                      </div>
                      <div className="ml-op-applied">
                        <span>📍 {item.marketApplied}</span>
                        <span>📜 {item.certType}</span>
                      </div>
                    </div>
                    <div className="ml-op-actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onNavigate && onNavigate("admin-users")}
                      >
                        {isEn ? "Review Profile" : "Kiểm duyệt hồ sơ"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="ml-op-card-footer">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => onNavigate && onNavigate("admin-users")}
              >
                {isEn ? "View all pending approvals →" : "Xem toàn bộ hồ sơ thẩm định →"}
              </Button>
            </div>
          </div>

          <div className="ml-card ml-op-card">
            <div className="ml-op-card-header">
              <div>
                <h3 className="ml-op-card-title">
                  {isEn ? "Weekend Markets Operating Status" : "Tình Trạng Các Điểm Chợ Phiên"}
                </h3>
                <p className="ml-op-card-subtitle">
                  {isEn
                    ? "Track pre-order volumes and transacted GMV across market sessions"
                    : "Theo dõi số lượng đơn hàng và giá trị giao dịch phân bổ theo điểm chợ"}
                </p>
              </div>
            </div>

            <div className="ml-occupancy-list">
              {marketReports.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "28px",
                    color: "var(--color-text-muted)",
                    fontSize: "14px",
                  }}
                >
                  {isEn ? "No market reports available" : "Chưa có báo cáo hoạt động chợ phiên"}
                </div>
              ) : (
                marketReports.map((m, idx) => (
                  <div key={idx} className="ml-occupancy-item">
                    <div className="ml-occ-top">
                      <span className="ml-occ-name">🎪 {localizeMarketName(m.marketName)}</span>
                      <span className="ml-occ-rate">
                        {formatCurrency(m.totalRevenue || 0)}
                      </span>
                    </div>
                    <div className="ml-occ-bar-track">
                      <div
                        className="ml-occ-bar-fill"
                        style={{
                          width: `${Math.min(100, Math.max(20, (m.totalOrders || 1) * 25))}%`,
                        }}
                      ></div>
                    </div>
                    <div className="ml-occ-session">
                      {isEn ? "Completed:" : "Đã hoàn thành:"}{" "}
                      <strong>{m.totalOrders || 0} {isEn ? "pre-orders" : "đơn đặt trước"}</strong> •{" "}
                      {m.activeFarmers || 2} {isEn ? "active stalls" : "sạp hoạt động"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="ml-card ml-top-produce-card">
          <div className="ml-op-card-header">
            <div>
              <h3 className="ml-op-card-title">
                {isEn ? "Top Pre-ordered Produce This Week" : "Nông Sản Được Đặt Trước Nhiều Nhất Tuần"}
              </h3>
              <p className="ml-op-card-subtitle">
                {isEn
                  ? "Produce items attracting the highest pre-order reservations from shoppers"
                  : "Xếp hạng các sản phẩm thu hút lượng đặt giữ chỗ cao nhất từ cư dân"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate && onNavigate("products")}
            >
              {isEn ? "View Produce Catalog" : "Xem danh mục nông sản"}
            </Button>
          </div>

          <div className="ml-produce-rank-grid">
            {topProduce.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "28px",
                  color: "var(--color-text-muted)",
                  fontSize: "14px",
                  gridColumn: "1 / -1",
                }}
              >
                {isEn
                  ? "No produce reservation data for this week"
                  : "Chưa có dữ liệu nông sản được đặt trước trong tuần"}
              </div>
            ) : (
              topProduce.map((p, idx) => (
                <div key={idx} className="ml-produce-rank-item">
                  <div className="ml-rank-num">#{idx + 1}</div>
                  <div className="ml-rank-info">
                    <div className="ml-rank-name">{localizeProduceName(p.name)}</div>
                    <div className="ml-rank-farmer">
                      👨‍🌾 {p.farmer} • {isEn ? "Market" : "Chợ"} {localizeMarketName(p.market)}
                    </div>
                  </div>
                  <div className="ml-rank-stat">
                    <span className="ml-rank-count">{p.preorders} {isEn ? "orders" : "lượt"}</span>
                    <Badge variant="organic" size="sm">
                      {p.tag}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
