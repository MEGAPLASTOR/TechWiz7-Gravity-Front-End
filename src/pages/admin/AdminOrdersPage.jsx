import React, { useState, useEffect, useMemo } from "react";
import "@/assets/styles/pages/admin/AdminOrdersPage.css";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import adminService from "../../services/adminService";
import marketService from "../../services/marketService";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminOrdersPage({ onNavigate, initialOrderId } = {}) {
  const { isEn, localizeMarketName, localizeProduceName, localizeUnit } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState(() =>
    initialOrderId ? String(initialOrderId) : "",
  );
  useEffect(() => {
    if (initialOrderId) {
      setSearchKeyword(String(initialOrderId));
      setActiveTab("ALL");
    }
  }, [initialOrderId]);
  const [selectedMarketFilter, setSelectedMarketFilter] = useState("ALL");
  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [allMarkets, setAllMarkets] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };
  useEffect(() => {
    marketService
      .getMarkets()
      .then((res) => {
        if (Array.isArray(res)) setAllMarkets(res);
      })
      .catch(() => {});
  }, []);
  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllOrders({
        keyword: searchKeyword.trim(),
        status: activeTab,
        marketId: selectedMarketFilter !== "ALL" ? selectedMarketFilter : "",
        pickupDate: selectedDateFilter,
      });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load orders for admin", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(() => {
      loadOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchKeyword, activeTab, selectedMarketFilter, selectedDateFilter]);
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.orderStatus === "COMPLETED");
  const readyOrders = orders.filter(
    (o) => o.orderStatus === "READY_FOR_PICKUP",
  );
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "PLACED" || o.orderStatus === "ACCEPTED",
  );
  const totalGMV = completedOrders.reduce(
    (sum, o) => sum + (Number(o.totalAmount) || 0),
    0,
  );
  const filteredOrders = orders;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);
  const handleResetFilters = () => {
    setSearchKeyword("");
    setSelectedMarketFilter("ALL");
    setSelectedDateFilter("");
    setActiveTab("ALL");
  };
  const hasActiveFilters = Boolean(
    (searchKeyword && searchKeyword.trim() !== "") ||
    selectedMarketFilter !== "ALL" ||
    selectedDateFilter !== "" ||
    activeTab !== "ALL",
  );
  const renderOrderStatusBadge = (status) => {
    switch (status) {
      case "PLACED":
        return (
          <Badge variant="neutral" dot>
            {isEn ? "Pending Stall" : "Chờ sạp tiếp nhận"}
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge variant="pending" dot>
            {isEn ? "Accepted by Stall" : "Sạp đã tiếp nhận"}
          </Badge>
        );
      case "READY_FOR_PICKUP":
        return (
          <Badge variant="accent" dot>
            {isEn ? "Ready at Stall" : "Đã sẵn sàng tại sạp"}
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="ready" dot>
            {isEn ? "Pickup Completed" : "Hoàn tất nhận hàng"}
          </Badge>
        );
      case "DECLINED":
        return (
          <Badge variant="cancelled" dot>
            {isEn ? "Declined by Stall" : "Sạp từ chối"}
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="cancelled" dot>
            {isEn ? "Cancelled" : "Đã hủy đơn"}
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };
  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };
  return (
    <div className="ml-admin-orders-page">
      <div className="ml-admin-orders-banner">
        <div className="ml-container ml-admin-orders-banner-inner">
          <div>
            <span
              className="ml-section-subtitle"
              style={{
                color: "#86efac",
              }}
            >
              {isEn ? "MarketLink System Administration" : "Ban Quản Trị Hệ Thống MarketLink"}
            </span>
            <h1 className="ml-admin-orders-title">
              {isEn ? "Supervise Platform-wide Pre-orders" : "Giám Sát Đơn Đặt Trước Toàn Sàn"}
            </h1>
            <p className="ml-admin-orders-desc">
              {isEn
                ? "Track end-to-end pre-order workflows across weekend markets, verify stall readiness, and coordinate customer support."
                : "Theo dõi toàn bộ luồng đơn hàng đặt trước nông sản tại các phiên chợ, tình trạng chuẩn bị tại sạp và giải quyết khiếu nại giữa các bên."}
            </p>
          </div>

          <div className="ml-admin-orders-stats-strip">
            <div className="ml-admin-stat-pill">
              <span className="ml-admin-stat-num">{totalOrders}</span>
              <span className="ml-admin-stat-lbl">{isEn ? "Total Orders" : "Tổng đơn hàng"}</span>
            </div>
            <div className="ml-admin-stat-pill">
              <span
                className="ml-admin-stat-num"
                style={{
                  color: "#fde047",
                }}
              >
                {pendingOrders.length}
              </span>
              <span className="ml-admin-stat-lbl">{isEn ? "Pending Prep" : "Chờ chuẩn bị"}</span>
            </div>
            <div className="ml-admin-stat-pill">
              <span
                className="ml-admin-stat-num"
                style={{
                  color: "#4ade80",
                }}
              >
                {formatCurrency(totalGMV)}
              </span>
              <span className="ml-admin-stat-lbl">{isEn ? "Gross Merchandise Value" : "Doanh thu giao dịch"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ml-container ml-admin-orders-content">
        <div className="ml-order-tabs-container">
          <div className="ml-order-tabs">
            <button
              type="button"
              className={`ml-order-tab ${activeTab === "ALL" ? "active" : ""}`}
              onClick={() => setActiveTab("ALL")}
            >
              <span className="ml-order-tab-icon">📋</span>
              <span className="ml-order-tab-label">{isEn ? "All Orders" : "Tất cả đơn"}</span>
              <span className="ml-tab-badge ml-tab-badge-all">
                {orders.length}
              </span>
            </button>
            <button
              type="button"
              className={`ml-order-tab ${activeTab === "PENDING" ? "active" : ""}`}
              onClick={() => setActiveTab("PENDING")}
            >
              <span className="ml-order-tab-icon">⏳</span>
              <span className="ml-order-tab-label">{isEn ? "Pending Prep" : "Chờ chuẩn bị"}</span>
              <span
                className={`ml-tab-badge ${pendingOrders.length > 0 ? "ml-tab-badge-warning" : "ml-tab-badge-neutral"}`}
              >
                {pendingOrders.length}
              </span>
            </button>
            <button
              type="button"
              className={`ml-order-tab ${activeTab === "READY_FOR_PICKUP" ? "active" : ""}`}
              onClick={() => setActiveTab("READY_FOR_PICKUP")}
            >
              <span className="ml-order-tab-icon">📦</span>
              <span className="ml-order-tab-label">{isEn ? "Ready at Stall" : "Sẵn sàng tại sạp"}</span>
              <span
                className={`ml-tab-badge ${readyOrders.length > 0 ? "ml-tab-badge-info" : "ml-tab-badge-neutral"}`}
              >
                {readyOrders.length}
              </span>
            </button>
            <button
              type="button"
              className={`ml-order-tab ${activeTab === "COMPLETED" ? "active" : ""}`}
              onClick={() => setActiveTab("COMPLETED")}
            >
              <span className="ml-order-tab-icon">✅</span>
              <span className="ml-order-tab-label">{isEn ? "Completed" : "Đã hoàn tất"}</span>
              <span className="ml-tab-badge ml-tab-badge-success">
                {completedOrders.length}
              </span>
            </button>
            <button
              type="button"
              className={`ml-order-tab ${activeTab === "CANCELLED" ? "active" : ""}`}
              onClick={() => setActiveTab("CANCELLED")}
            >
              <span className="ml-order-tab-icon">🚫</span>
              <span className="ml-order-tab-label">{isEn ? "Cancelled / Declined" : "Hủy / Từ chối"}</span>
              <span className="ml-tab-badge ml-tab-badge-danger">
                {
                  orders.filter(
                    (o) =>
                      o.orderStatus === "CANCELLED" ||
                      o.orderStatus === "DECLINED",
                  ).length
                }
              </span>
            </button>
          </div>
        </div>

        <div className="ml-user-filter-card">
          <div className="ml-filter-card-header">
            <div className="ml-filter-card-title-group">
              <div className="ml-filter-card-icon-badge">📦</div>
              <div>
                <h3 className="ml-filter-card-title">
                  {isEn ? "Filters & Order Lookup" : "Bộ Lọc & Tra Cứu Đơn Hàng"}
                </h3>
                <p className="ml-filter-card-subtitle">
                  {loading
                    ? (isEn ? "Searching orders..." : "Đang tìm kiếm đơn hàng...")
                    : (isEn
                        ? `Found ${orders.length} orders matching criteria`
                        : `Tìm thấy ${orders.length} đơn hàng phù hợp với điều kiện`)}
                </p>
              </div>
            </div>

            <div className="ml-filter-card-actions">
              {hasActiveFilters && (
                <button
                  type="button"
                  className="ml-filter-reset-btn"
                  onClick={handleResetFilters}
                  title={isEn ? "Reset all filters to default" : "Xóa tất cả bộ lọc về mặc định"}
                >
                  <span className="ml-reset-icon">✕</span>
                  <span>{isEn ? "Reset Filters" : "Xóa bộ lọc"}</span>
                </button>
              )}
              <button
                type="button"
                className="ml-filter-reload-btn"
                onClick={loadOrders}
                title={isEn ? "Reload orders list" : "Tải lại danh sách đơn hàng"}
                disabled={loading}
              >
                <span className={loading ? "ml-spin" : ""}>🔄</span>
                <span>{isEn ? "Refresh" : "Làm mới"}</span>
              </button>
            </div>
          </div>

          <div className="ml-order-filter-grid">
            <div className="ml-filter-field ml-filter-field-search">
              <label className="ml-filter-label">
                <span className="ml-label-icon">🔎</span> {isEn ? "Search Orders" : "Tìm kiếm đơn hàng"}
              </label>
              <div className="ml-search-input-wrapper">
                <span className="ml-search-leading-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input
                  type="text"
                  className="ml-filter-input"
                  placeholder={isEn ? "Order code, customer name, phone, farm..." : "Mã đơn, Tên khách, SĐT, Nhà vườn..."}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                {searchKeyword && (
                  <button
                    type="button"
                    className="ml-input-clear-btn"
                    onClick={() => setSearchKeyword("")}
                    title={isEn ? "Clear search" : "Xóa tìm kiếm"}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="ml-filter-field">
              <label className="ml-filter-label">
                <span className="ml-label-icon">📍</span> {isEn ? "Market Session" : "Điểm chợ phiên"}
              </label>
              <div className="ml-select-wrapper">
                <select
                  className="ml-filter-select"
                  value={selectedMarketFilter}
                  onChange={(e) => setSelectedMarketFilter(e.target.value)}
                >
                  <option value="ALL">
                    {isEn ? `All Market Locations (${allMarkets.length})` : `Tất cả điểm chợ (${allMarkets.length})`}
                  </option>
                  {allMarkets.map((m) => (
                    <option key={m.marketId || m.id} value={m.marketId || m.id}>
                      {localizeMarketName(m.name)}
                    </option>
                  ))}
                </select>
                <span className="ml-select-arrow">▼</span>
              </div>
            </div>

            <div className="ml-filter-field">
              <label className="ml-filter-label">
                <span className="ml-label-icon">📅</span> {isEn ? "Pickup Date" : "Ngày hẹn nhận hàng"}
              </label>
              <div className="ml-date-input-wrapper">
                <input
                  type="date"
                  className="ml-filter-input ml-filter-date"
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                />
                {selectedDateFilter && (
                  <button
                    type="button"
                    className="ml-input-clear-btn"
                    style={{
                      right: 30,
                    }}
                    onClick={() => setSelectedDateFilter("")}
                    title={isEn ? "Clear date" : "Xóa ngày lọc"}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="ml-quick-filters-row">
            <span className="ml-quick-filters-title">{isEn ? "Quick filter:" : "Lọc nhanh:"}</span>
            <div className="ml-quick-chips-list">
              <button
                type="button"
                className={`ml-filter-chip ${!hasActiveFilters ? "active" : ""}`}
                onClick={handleResetFilters}
              >
                {isEn ? "All" : "Tất cả"}
              </button>
              <button
                type="button"
                className={`ml-filter-chip ${activeTab === "PENDING" ? "active warning" : ""}`}
                onClick={() =>
                  setActiveTab(activeTab === "PENDING" ? "ALL" : "PENDING")
                }
              >
                ⏳ {isEn ? "Pending Prep" : "Chờ chuẩn bị"} ({pendingOrders.length})
              </button>
              <button
                type="button"
                className={`ml-filter-chip ${activeTab === "READY_FOR_PICKUP" ? "active" : ""}`}
                onClick={() =>
                  setActiveTab(
                    activeTab === "READY_FOR_PICKUP"
                      ? "ALL"
                      : "READY_FOR_PICKUP",
                  )
                }
              >
                📦 {isEn ? "Ready at Stall" : "Sẵn sàng tại sạp"} ({readyOrders.length})
              </button>
              <button
                type="button"
                className={`ml-filter-chip ${activeTab === "COMPLETED" ? "active" : ""}`}
                onClick={() =>
                  setActiveTab(activeTab === "COMPLETED" ? "ALL" : "COMPLETED")
                }
              >
                ✅ {isEn ? "Completed" : "Đã hoàn tất"} ({completedOrders.length})
              </button>
              <button
                type="button"
                className={`ml-filter-chip ${activeTab === "CANCELLED" ? "active danger" : ""}`}
                onClick={() =>
                  setActiveTab(activeTab === "CANCELLED" ? "ALL" : "CANCELLED")
                }
              >
                🚫 {isEn ? "Cancelled / Declined" : "Hủy / Từ chối"} (
                {
                  orders.filter(
                    (o) =>
                      o.orderStatus === "CANCELLED" ||
                      o.orderStatus === "DECLINED",
                  ).length
                }
                )
              </button>
              <button
                type="button"
                className={`ml-filter-chip ${selectedDateFilter === new Date().toISOString().split("T")[0] ? "active" : ""}`}
                onClick={() => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  setSelectedDateFilter(
                    selectedDateFilter === todayStr ? "" : todayStr,
                  );
                }}
              >
                📅 {isEn ? "Pickup Today" : "Nhận hôm nay"}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="ml-inv-loading">
            {isEn ? "Loading all platform pre-orders..." : "Đang nạp toàn bộ đơn hàng hệ thống..."}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            className="ml-card"
            style={{
              padding: 48,
              textAlign: "center",
              color: "#64748b",
            }}
          >
            {isEn
              ? "No pre-orders found matching your filters."
              : "Không tìm thấy đơn đặt trước nào phù hợp với bộ lọc."}
          </div>
        ) : (
          <>
            <div
              className="ml-card"
              style={{
                overflowX: "auto",
                padding: 0,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  fontSize: 13.5,
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      color: "#475569",
                    }}
                  >
                    <th style={{ padding: "12px 16px" }}>
                      {isEn ? "Order Code & Time" : "Mã đơn & Thời gian"}
                    </th>
                    <th style={{ padding: "12px 16px" }}>
                      {isEn ? "Customer" : "Khách hàng"}
                    </th>
                    <th style={{ padding: "12px 16px" }}>
                      {isEn ? "Stall & Farm" : "Sạp hàng & Nhà vườn"}
                    </th>
                    <th style={{ padding: "12px 16px" }}>
                      {isEn ? "Market & Pickup Slot" : "Chợ & Ca nhận hàng"}
                    </th>
                    <th style={{ padding: "12px 16px" }}>
                      {isEn ? "Total Amount" : "Tổng tiền"}
                    </th>
                    <th style={{ padding: "12px 16px" }}>
                      {isEn ? "Status" : "Trạng thái"}
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>
                      {isEn ? "Action" : "Thao tác"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((o) => (
                    <tr
                      key={o.orderId}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 700, color: "#1b5e20" }}>
                          {o.orderCode}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#64748b" }}>
                          {o.createdAt
                            ? o.createdAt.replace("T", " ").substring(0, 16)
                            : ""}
                        </div>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>
                          {o.customerName}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          📞 {o.customerPhone || "N/A"}
                        </div>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>
                          🏡 {o.stallName || o.farmerName}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {isEn ? "Owner:" : "Chủ sạp:"} {o.farmerName}
                        </div>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ color: "#1e293b", fontWeight: 500 }}>
                          🎪 {localizeMarketName(o.marketName)}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#166534",
                            fontWeight: 600,
                          }}
                        >
                          📅 {o.pickupDate} • 🕒{" "}
                          {o.slotTimeRange || "08:00 - 09:00"}
                        </div>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 700, color: "#1e293b" }}>
                          {formatCurrency(o.totalAmount)}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {o.paymentMethod === "PAY_AT_PICKUP"
                            ? (isEn ? "💵 Pay at stall" : "💵 Trả tại sạp")
                            : o.paymentMethod}
                        </div>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        {renderOrderStatusBadge(o.orderStatus)}
                      </td>

                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetail(o)}
                        >
                          👁️ {isEn ? "Details" : "Chi tiết"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredOrders.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {isDetailModalOpen && selectedOrder && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={isEn ? `Pre-order Details: ${selectedOrder.orderCode}` : `Chi Tiết Đơn Đặt Trước: ${selectedOrder.orderCode}`}
          subtitle={`${isEn ? "Placed at:" : "Đặt lúc:"} ${selectedOrder.createdAt ? selectedOrder.createdAt.replace("T", " ").substring(0, 16) : ""}`}
          maxWidth="680px"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 10,
                backgroundColor: "#f8fafc",
                padding: 14,
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <div>
                <strong>{isEn ? "Customer:" : "Khách hàng:"}</strong> {selectedOrder.customerName} (📞{" "}
                {selectedOrder.customerPhone || "N/A"})
              </div>
              <div>
                <strong>{isEn ? "Stall:" : "Gian hàng:"}</strong>{" "}
                {selectedOrder.stallName || selectedOrder.farmerName}
              </div>
              <div>
                <strong>{isEn ? "Market:" : "Điểm chợ:"}</strong> {localizeMarketName(selectedOrder.marketName)}
              </div>
              <div>
                <strong>{isEn ? "Pickup Date & Slot:" : "Hẹn nhận:"}</strong> {selectedOrder.pickupDate} (
                {selectedOrder.slotTimeRange})
              </div>
              <div>
                <strong>{isEn ? "Cutoff Time:" : "Hạn chốt đơn:"}</strong>{" "}
                {selectedOrder.cutoffTime
                  ? selectedOrder.cutoffTime.replace("T", " ").substring(0, 16)
                  : (isEn ? "None" : "Không")}
              </div>
              <div>
                <strong>{isEn ? "Status:" : "Trạng thái:"}</strong>{" "}
                {renderOrderStatusBadge(selectedOrder.orderStatus)}
              </div>
            </div>

            {selectedOrder.note && (
              <div
                style={{
                  backgroundColor: "#fefce8",
                  border: "1px solid #fef08a",
                  padding: 10,
                  borderRadius: 6,
                  fontSize: 13,
                  color: "#854d0e",
                }}
              >
                💬 <strong>{isEn ? "Customer Note:" : "Ghi chú từ khách hàng:"}</strong> "{selectedOrder.note}"
              </div>
            )}

            <div
              className="ml-card"
              style={{
                padding: 12,
              }}
            >
              <h4
                style={{
                  margin: "0 0 10px",
                  fontSize: 14,
                  color: "#166534",
                }}
              >
                🥬 {isEn ? `Pre-ordered Items (${selectedOrder.items?.length || 0} items):` : `Danh sách mặt hàng đặt trước (${selectedOrder.items?.length || 0} sản phẩm):`}
              </h4>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {selectedOrder.items?.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <img
                        src={
                          it.imageUrl ||
                          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=120"
                        }
                        alt={it.productName}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 6,
                          objectFit: "cover",
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#1e293b",
                          }}
                        >
                          {localizeProduceName(it.productName)}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#64748b",
                          }}
                        >
                          {formatCurrency(it.unitPrice)} /{" "}
                          {localizeUnit(it.productUnit || "kg")}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        x {it.quantity} {localizeUnit(it.productUnit || "kg")}
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#166534",
                        }}
                      >
                        {formatCurrency(
                          it.subtotal || it.quantity * it.unitPrice,
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "2px solid #e2e8f0",
                  marginTop: 12,
                  paddingTop: 10,
                  fontSize: 16,
                }}
              >
                <strong>{isEn ? "Total payment at stall:" : "Tổng thanh toán tại sạp:"}</strong>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#1b5e20",
                  }}
                >
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <Button
                variant="ghost"
                onClick={() => setIsDetailModalOpen(false)}
              >
                {isEn ? "Close" : "Đóng lại"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
