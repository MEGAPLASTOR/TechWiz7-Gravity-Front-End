import React, { useState, useEffect } from "react";
import "@/assets/styles/pages/farmer/FarmerDashboardPage.css";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import farmerService from "../../services/farmerService";
import { useLanguage } from "../../context/LanguageContext";

export default function FarmerDashboardPage({ onNavigate, onOpenAddProduct }) {
  const { isEn, localizeProduceName, localizeCategoryName, localizeUnit } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [kycStatus, setKycStatus] = useState(() => {
    return localStorage.getItem("ml_kyc_status") || "UNVERIFIED";
  });
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    placedOrders: 0,
    acceptedOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    declinedOrders: 0,
  });
  const [bestSellers, setBestSellers] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleKycChange = () => {
      const stored = localStorage.getItem("ml_kyc_status");
      if (stored) setKycStatus(stored);
    };
    window.addEventListener("ml_kyc_changed", handleKycChange);
    window.addEventListener("storage", handleKycChange);
    return () => {
      window.removeEventListener("ml_kyc_changed", handleKycChange);
      window.removeEventListener("storage", handleKycChange);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [profData, sumData, bestData, ordersData, kycData] = await Promise.all([
          farmerService.getFarmerProfile(),
          farmerService.getFarmerSummary(),
          farmerService.getBestSellingProducts(5),
          farmerService.getFarmerOrders(),
          farmerService.getFarmerKycStatus(),
        ]);
        if (isMounted) {
          if (kycData?.kycStatus) setKycStatus(kycData.kycStatus);
          if (profData) setProfile(profData);
          if (sumData) setSummary(sumData);
          if (bestData && bestData.length > 0) {
            setBestSellers(bestData);
          } else {
            setBestSellers([]);
          }
          if (ordersData && ordersData.length > 0) {
            const packingList = ordersData.filter(
              (o) =>
                o.orderStatus === "PLACED" ||
                o.orderStatus === "ACCEPTED" ||
                o.orderStatus === "READY_FOR_PICKUP",
            );
            setPendingOrders(packingList);
          }
        }
      } catch (err) {
        console.warn("Failed to load farmer dashboard data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  const farmStallTitle =
    profile?.stallName || profile?.fullName || (isEn ? "Stall not configured yet" : "Chưa thiết lập sạp");
  const farmAddress =
    profile?.farmAddress || (isEn ? "Farm address not updated" : "Chưa cập nhật địa chỉ trang trại");

  return (
    <div className="ml-farmer-dashboard">
      <div className="ml-farmer-dash-banner">
        <div className="ml-container ml-dash-banner-inner">
          <div>
            <div className="ml-dash-greeting">
              {isEn ? "👨‍🌾 Farmer & Market Stall Management" : "👨‍🌾 Kênh Quản Lý Nông Dân / Chủ Sạp Chợ"}
            </div>
            <h1 className="ml-dash-title">{farmStallTitle}</h1>
            <p className="ml-dash-desc">
              {isEn ? "Farm Region:" : "Khu vực trang trại:"} <strong>{farmAddress}</strong> • {isEn ? "Owner:" : "Chủ hộ:"}{" "}
              <strong>{profile?.fullName || (isEn ? "Member Farmer" : "Nông dân thành viên")}</strong>
            </p>
          </div>

          <div className="ml-dash-quick-btns">
            <Button
              variant={kycStatus === "VERIFIED" ? "accent" : "secondary"}
              size="md"
              className={kycStatus !== "VERIFIED" ? "ml-btn-unverified" : ""}
              title={
                kycStatus !== "VERIFIED"
                  ? (isEn ? "KYC approval required before listing produce" : "Cần duyệt KYC trước khi đăng món")
                  : ""
              }
              onClick={() => {
                if (kycStatus !== "VERIFIED") {
                  if (onNavigate) onNavigate("farmer-stall", { tab: "kyc" });
                  return;
                }
                onOpenAddProduct && onOpenAddProduct();
              }}
              icon={<span>+</span>}
            >
              {kycStatus === "VERIFIED"
                ? (isEn ? "Post New Produce" : "Đăng nông sản mới")
                : (isEn ? "🔒 Post Produce (Pending KYC)" : "🔒 Đăng nông sản (Chờ KYC)")}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate("farmer-orders")}
              icon={<span>📦</span>}
            >
              {isEn ? "Review Market Orders (" : "Duyệt đơn ra chợ ("}
              {summary.placedOrders +
                summary.acceptedOrders +
                summary.readyOrders}
              )
            </Button>
          </div>
        </div>
      </div>

      <div className="ml-container">
        {loading && (
          <div className="ml-orders-loading">
            {isEn ? "Loading stall operational data from system..." : "Đang tải dữ liệu vận hành sạp từ hệ thống..."}
          </div>
        )}

        <div className="ml-farmer-kpis-grid">
          <div className="ml-card ml-kpi-card">
            <div className="ml-kpi-header">
              <span className="ml-kpi-title">
                {isEn ? "Completed Delivered Revenue" : "Doanh thu thực tế đã giao"}
              </span>
              <span className="ml-kpi-icon">💵</span>
            </div>
            <div className="ml-kpi-val highlight">
              {formatCurrency(summary.totalRevenue)}
            </div>
            <div className="ml-kpi-hint">
              {isEn ? `From ${summary.completedOrders} completed orders` : `Từ ${summary.completedOrders} đơn hoàn thành`}
            </div>
          </div>

          <div className="ml-card ml-kpi-card">
            <div className="ml-kpi-header">
              <span className="ml-kpi-title">
                {isEn ? "New Orders Awaiting Acceptance" : "Đơn mới chờ tiếp nhận"}
              </span>
              <span className="ml-kpi-icon">⏳</span>
            </div>
            <div className="ml-kpi-val warning">
              {summary.placedOrders} {isEn ? "Orders" : "Đơn"}
            </div>
            <div className="ml-kpi-hint">
              {isEn ? "Requires harvest confirmation" : "Cần xác nhận chuẩn bị thu hoạch"}
            </div>
          </div>

          <div className="ml-card ml-kpi-card">
            <div className="ml-kpi-header">
              <span className="ml-kpi-title">
                {isEn ? "Harvesting & Ready for Pickup" : "Đang thu hoạch & sẵn sàng"}
              </span>
              <span className="ml-kpi-icon">🧺</span>
            </div>
            <div className="ml-kpi-val success">
              {summary.acceptedOrders + summary.readyOrders} {isEn ? "Orders" : "Đơn"}
            </div>
            <div className="ml-kpi-hint">
              {isEn ? `${summary.readyOrders} orders packed awaiting customer` : `${summary.readyOrders} đơn đã đóng gói chờ giao`}
            </div>
          </div>

          <div className="ml-card ml-kpi-card">
            <div className="ml-kpi-header">
              <span className="ml-kpi-title">
                {isEn ? "Total Pre-orders Served" : "Tổng đơn hàng đã phục vụ"}
              </span>
              <span className="ml-kpi-icon">⭐</span>
            </div>
            <div className="ml-kpi-val">
              {summary.totalOrders} {isEn ? "Orders" : "Đơn"}
            </div>
            <div className="ml-kpi-hint">
              {isEn ? `${summary.cancelledOrders} orders cancelled/returned` : `${summary.cancelledOrders} đơn đã hủy/hoàn kho`}
            </div>
          </div>
        </div>

        <div className="ml-farmer-main-grid">
          <div className="ml-farmer-left-section">
            <div className="ml-card ml-packing-card">
              <div className="ml-packing-header">
                <div>
                  <h3 className="ml-card-heading">
                    {isEn ? "🧺 Orders to Harvest & Pack at Market Stall" : "🧺 Danh sách đơn cần thu hoạch & đóng gói tại sạp"}
                  </h3>
                  <span className="ml-card-subheading">
                    {isEn ? "Check quantities before market opening for timely handover" : "Kiểm tra số lượng trước giờ họp chợ để bàn giao đúng hẹn cho khách"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate("farmer-orders")}
                >
                  {isEn ? "View order details" : "Xem chi tiết đơn"}
                </Button>
              </div>

              <div className="ml-packing-list">
                {pendingOrders.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <span>{isEn ? "✓ All pre-orders have been processed!" : "✓ Tất cả đơn đặt trước đều đã được xử lý xong!"}</span>
                  </div>
                ) : (
                  pendingOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.orderId || order.id}
                      className="ml-pack-item"
                    >
                      <div className="ml-pack-left">
                        <span className="ml-pack-check">
                          {order.orderStatus === "READY_FOR_PICKUP"
                            ? "✓"
                            : "📦"}
                        </span>
                        <div>
                          <div className="ml-pack-name">
                            {isEn ? "Order #" : "Đơn #"}{order.orderCode} • {isEn ? "Customer:" : "Khách:"}{" "}
                            <strong>{order.customerName}</strong> (
                            {order.customerPhone})
                          </div>
                          <div className="ml-pack-detail">
                            {isEn ? "Pickup Date:" : "Ngày hẹn:"} <strong>{order.pickupDate}</strong> (
                            {order.slotTimeRange || (isEn ? "Morning slot" : "Ca sáng")}) • {isEn ? "Total:" : "Tổng:"}{" "}
                            {formatCurrency(order.totalAmount)}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`ml-pack-badge ${order.orderStatus === "READY_FOR_PICKUP" ? "ready" : "in-progress"}`}
                      >
                        {order.orderStatus === "READY_FOR_PICKUP"
                          ? (isEn ? "Ready at stall" : "Sẵn sàng tại sạp")
                          : (isEn ? "Packing pending" : "Chờ đóng gói")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="ml-quick-nav-cards">
              <div
                className="ml-card ml-qnav-card"
                onClick={() => onNavigate("farmer-inventory")}
              >
                <span className="ml-qnav-icon">🥬</span>
                <div>
                  <h4 className="ml-qnav-title">
                    {isEn ? "Stall Produce Inventory" : "Kho Nông Sản Tại Sạp"}
                  </h4>
                  <p className="ml-qnav-desc">
                    {isEn
                      ? "Update quantities, adjust prices, toggle stock availability and weekly quotas."
                      : "Cập nhật số lượng, chỉnh giá bán, bật tắt tình trạng còn hàng và định mức tuần."}
                  </p>
                </div>
              </div>

              <div
                className="ml-card ml-qnav-card"
                onClick={() => onNavigate("farmer-stall")}
              >
                <span className="ml-qnav-icon">🎪</span>
                <div>
                  <h4 className="ml-qnav-title">
                    {isEn ? "Stall Profile & Pickup Slots" : "Quản Lý Sạp & Ca Nhận Hàng"}
                  </h4>
                  <p className="ml-qnav-desc">
                    {isEn
                      ? "Configure cutoff hours, setup pickup time slots, and manage KYC documents."
                      : "Cấu hình khung giờ chốt đơn trước phiên, tạo ca nhận hàng và hồ sơ KYC."}
                  </p>
                </div>
              </div>

              <div
                className="ml-card ml-qnav-card"
                onClick={() => onNavigate("farmer-reviews")}
              >
                <span className="ml-qnav-icon">💬</span>
                <div>
                  <h4 className="ml-qnav-title">
                    {isEn ? "Customer Reviews" : "Phản Hồi Đánh Giá"}
                  </h4>
                  <p className="ml-qnav-desc">
                    {isEn
                      ? "Read shopper feedback after pickups and send personal replies from your stall."
                      : "Xem cảm nhận của khách hàng sau khi nhận rau và gửi lời cảm ơn từ chủ sạp."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-farmer-right-section">
            <div className="ml-card ml-bestseller-card">
              <h3 className="ml-card-heading">
                {isEn ? "🏆 Best-Selling Produce" : "🏆 Nông Sản Bán Chạy Nhất"}
              </h3>
              <p className="ml-card-subheading">
                {isEn ? "Real data from successful pre-orders" : "Dữ liệu thực tế từ các đơn hàng thành công"}
              </p>

              <div className="ml-bestseller-list">
                {bestSellers.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: "var(--color-text-muted)",
                      fontSize: "14px",
                    }}
                  >
                    {isEn ? "No best-seller produce data yet" : "Chưa có dữ liệu nông sản bán chạy"}
                  </div>
                ) : (
                  bestSellers.map((item, idx) => (
                    <div key={idx} className="ml-bestseller-item">
                      <span className="ml-rank-num">#{idx + 1}</span>
                      <div className="ml-bestseller-info">
                        <div className="ml-bs-name">
                          {localizeProduceName(item.productName || item.name)}
                        </div>
                        <div className="ml-bs-meta">
                          {localizeCategoryName(item.categoryName || item.category || (isEn ? "Clean Produce" : "Nông sản sạch"))}{" "}
                          • {isEn ? "Sold" : "Đã bán"}{" "}
                          <strong>
                            {item.totalQuantitySold || item.salesCount || 1}{" "}
                            {localizeUnit(item.unit || "kg")}
                          </strong>
                        </div>
                      </div>
                      <div className="ml-bs-revenue">
                        {formatCurrency(item.totalRevenue || item.revenue)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="ml-bestseller-footer">
                💡 <em>{isEn ? "Stall Tip:" : "Mẹo vận hành sạp:"}</em>{" "}
                {isEn
                  ? "Early morning harvests are most frequently pre-ordered for the 07:00 - 08:30 slot. Prepare fresh baskets before market gates open!"
                  : "Rau củ hái sớm thường được đặt trước nhiều nhất trong ca 07:00 - 08:30. Hãy chuẩn bị sẵn giỏ nông sản trước giờ chợ mở!"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
