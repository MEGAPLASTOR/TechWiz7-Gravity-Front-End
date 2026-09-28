import React, { useState, useEffect, useMemo } from "react";
import "@/assets/styles/pages/farmer/FarmerOrdersPage.css";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import farmerService from "../../services/farmerService";
import { useLanguage } from "../../context/LanguageContext";

export default function FarmerOrdersPage({
  initialOrderId,
  initialOrderCode,
  initialSearch,
  onNavigate,
} = {}) {
  const { isEn, localizeProduceName, localizeUnit } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState(
    () =>
      initialSearch ||
      initialOrderCode ||
      (initialOrderId ? String(initialOrderId) : ""),
  );
  const [loading, setLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => {
    const targetQuery =
      initialOrderCode || (initialOrderId ? String(initialOrderId) : "");
    if (targetQuery) {
      setSearchQuery(targetQuery);
      setActiveTab("all");
      setDateFilter("");
    }
  }, [initialOrderId, initialOrderCode]);

  const [declineModal, setDeclineModal] = useState({
    isOpen: false,
    orderId: null,
    orderCode: "",
    reason: "Rau đã hết đợt hái trong ngày",
  });
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    placedCount: 0,
    acceptedCount: 0,
    readyCount: 0,
    completedCount: 0,
    totalRevenue: 0,
  });

  const showSuccess = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(""), 4000);
  };

  const loadFarmerOrders = async () => {
    setLoading(true);
    try {
      let statusParam = "";
      if (activeTab === "DECLINED_CANCELLED") {
        statusParam = "DECLINED";
      } else if (activeTab !== "all") {
        statusParam = activeTab;
      }
      const [orderList, summaryData] = await Promise.all([
        farmerService.getFarmerOrders({
          pickupDate: dateFilter,
          status: statusParam,
          keyword: searchQuery.trim(),
        }),
        farmerService.getFarmerSummary(),
      ]);
      if (orderList && Array.isArray(orderList)) {
        setOrders(
          orderList.map((o) => ({
            id: o.orderId || o.id,
            orderCode: o.orderCode || `ORD-${o.orderId}`,
            customerName: o.customerName || (isEn ? "Valued Shopper" : "Khách hàng"),
            customerPhone: o.customerPhone || "",
            pickupDate: o.pickupDate,
            pickupSession: o.slotTimeRange || "",
            pickupSessionLabel: o.slotTimeRange
              ? (isEn ? `Slot: ${o.slotTimeRange}` : `Ca: ${o.slotTimeRange}`)
              : "",
            marketName: o.marketName || "",
            status: o.orderStatus || "PLACED",
            totalAmount: Number(o.totalAmount) || 0,
            paymentMethod: o.paymentMethod || "CASH_ON_PICKUP",
            note: o.note || "",
            createdAt: o.createdAt
              ? o.createdAt.replace("T", " ").substring(0, 16)
              : "",
            items: (o.items || []).map((it) => ({
              name: it.productName || (isEn ? "Clean Produce" : "Nông sản"),
              qty: it.quantity,
              unit: it.productUnit || "kg",
              price: Number(it.unitPrice) || 0,
              subtotal: Number(it.subtotal) || 0,
            })),
          })),
        );
      } else {
        setOrders([]);
      }
      if (summaryData) {
        setSummary({
          placedCount: summaryData.placedCount || 0,
          acceptedCount: summaryData.acceptedCount || 0,
          readyCount: summaryData.readyCount || 0,
          completedCount: summaryData.completedCount || 0,
          totalRevenue: Number(summaryData.totalRevenue) || 0,
        });
      }
    } catch (err) {
      console.warn("Error loading real farmer orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFarmerOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [dateFilter, activeTab, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, activeTab, searchQuery, sessionFilter]);

  const filteredOrders = useMemo(() => {
    if (sessionFilter === "all") return orders;
    return orders.filter((o) => o.pickupSession === sessionFilter);
  }, [orders, sessionFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  const handleUpdateStatus = async (orderId, newStatus, reason = "") => {
    try {
      await farmerService.updateFarmerOrderStatus(orderId, newStatus, reason);
      const statusLabels = {
        ACCEPTED: isEn ? "Order accepted successfully!" : "Đã tiếp nhận đơn hàng thành công!",
        READY_FOR_PICKUP: isEn ? "Order marked as packed and ready at stall!" : "Đơn hàng đã được đánh dấu đóng gói sẵn sàng tại sạp!",
        COMPLETED: isEn ? "Handed over produce and collected payment!" : "Đã hoàn tất giao nông sản & thu tiền tại sạp!",
        DECLINED: isEn ? "Order declined successfully." : "Đã từ chối đơn hàng thành công.",
      };
      showSuccess(statusLabels[newStatus] || (isEn ? "Order status updated!" : "Đã cập nhật trạng thái đơn!"));
      await loadFarmerOrders();
    } catch (err) {
      console.error("Failed to update status on backend", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        (isEn ? "Failed to update order status" : "Lỗi khi cập nhật trạng thái đơn hàng");
      alert((isEn ? "Cannot update order status: " : "Không thể cập nhật trạng thái đơn: ") + errMsg);
    }
  };

  const confirmDecline = async (e) => {
    e.preventDefault();
    if (!declineModal.orderId) return;
    await handleUpdateStatus(
      declineModal.orderId,
      "DECLINED",
      declineModal.reason,
    );
    setDeclineModal({
      isOpen: false,
      orderId: null,
      orderCode: "",
      reason: "",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "READY_FOR_PICKUP":
        return (
          <Badge variant="ready" dot>
            {isEn ? "Ready at stall" : "Sẵn sàng tại sạp"}
          </Badge>
        );
      case "PENDING":
      case "PLACED":
        return (
          <Badge variant="pending" dot>
            {isEn ? "New Order (Pending)" : "Đơn mới (Chờ nhận)"}
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge variant="organic" dot>
            {isEn ? "Harvesting & Packing" : "Đang chuẩn bị tại vườn/sạp"}
          </Badge>
        );
      case "COMPLETED":
        return <Badge variant="completed">{isEn ? "Delivered & Paid" : "Đã giao & thu tiền"}</Badge>;
      case "DECLINED":
        return <Badge variant="cancelled">{isEn ? "Stall Declined" : "Chủ sạp từ chối"}</Badge>;
      case "CANCELLED":
        return <Badge variant="cancelled">{isEn ? "Customer Cancelled" : "Khách đã hủy"}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="ml-farmer-orders-page">
      <div className="ml-farmer-orders-banner">
        <div className="ml-container">
          <span className="ml-section-subtitle">
            {isEn ? "Farmer & Stall Owner Portal" : "Phân hệ Nông Dân / Chủ Sạp"}
          </span>
          <h1 className="ml-farmer-orders-title">
            {isEn ? "Manage Pre-orders at Market Stall" : "Quản Lý Đơn Khách Đặt Trước Tại Sạp"}
          </h1>
          <p className="ml-farmer-orders-subtitle">
            {isEn
              ? "Prepare early-harvested fresh produce portions for each pickup time window. Guarantee promised quantity and freshness."
              : "Chuẩn bị trước phần nông sản tươi hái sớm theo từng ca đón khách. Đảm bảo đúng định lượng và chất lượng cam kết."}
          </p>

          <div className="ml-farmer-quick-strip">
            <div className="ml-strip-item">
              <span className="ml-strip-num">
                {summary.placedCount ||
                  orders.filter(
                    (o) => o.status === "PENDING" || o.status === "PLACED",
                  ).length}
              </span>
              <span className="ml-strip-label">
                {isEn ? "New orders to accept" : "Đơn mới cần tiếp nhận"}
              </span>
            </div>
            <div className="ml-strip-sep"></div>
            <div className="ml-strip-item">
              <span className="ml-strip-num">
                {summary.acceptedCount ||
                  orders.filter((o) => o.status === "ACCEPTED").length}
              </span>
              <span className="ml-strip-label">
                {isEn ? "Orders packing" : "Đơn đang gói"}
              </span>
            </div>
            <div className="ml-strip-sep"></div>
            <div className="ml-strip-item">
              <span className="ml-strip-num">
                {summary.readyCount ||
                  orders.filter((o) => o.status === "READY_FOR_PICKUP").length}
              </span>
              <span className="ml-strip-label">
                {isEn ? "Ready at stall" : "Sẵn sàng tại sạp"}
              </span>
            </div>
            <div className="ml-strip-sep"></div>
            <div className="ml-strip-item">
              <span className="ml-strip-num">
                {formatCurrency(
                  summary.totalRevenue ||
                    orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
                )}
              </span>
              <span className="ml-strip-label">
                {isEn ? "Total stall revenue" : "Tổng doanh thu sạp"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="ml-container ml-farmer-orders-body">
        {actionSuccessMsg && (
          <div className="ml-alert-success">✓ {actionSuccessMsg}</div>
        )}

        <div className="ml-card ml-farmer-filter-box">
          <div className="ml-farmer-search-row">
            <div className="ml-farmer-search-box-wrap">
              <div className="ml-farmer-search-field">
                <span className="ml-farmer-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder={isEn ? "Search order code (#ORD-...), customer name, phone..." : "Tìm theo mã đơn (#ORD-...), tên khách, số điện thoại..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ml-farmer-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="ml-clear-search-btn"
                    onClick={() => setSearchQuery("")}
                    title={isEn ? "Clear search" : "Xóa tìm kiếm để xem tất cả đơn"}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="ml-farmer-quick-tags">
                <span className="ml-farmer-quick-label">{isEn ? "Quick hints:" : "Gợi ý:"}</span>
                {["ORD-", isEn ? "Morning slot" : "Ca sáng", isEn ? "Afternoon slot" : "Ca chiều", "Ba Đình", "Thảo Điền", "Tây Hồ"].map((tag, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`ml-farmer-tag-chip ${searchQuery === tag ? "active" : ""}`}
                    onClick={() => setSearchQuery(searchQuery === tag ? "" : tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="ml-farmer-date-filter">
              <span className="ml-filter-label">{isEn ? "📅 Pickup date:" : "📅 Ngày nhận:"}</span>
              <input
                type="date"
                className="ml-date-input"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              {dateFilter && (
                <button
                  type="button"
                  className="ml-clear-date-btn"
                  onClick={() => setDateFilter("")}
                >
                  {isEn ? "Clear date" : "Xóa lọc ngày"}
                </button>
              )}
            </div>
          </div>

          <div className="ml-farmer-tabs-row">
            <div className="ml-farmer-status-tabs">
              {[
                {
                  key: "all",
                  label: isEn ? `All (${orders.length})` : `Tất cả (${orders.length})`,
                },
                {
                  key: "PLACED",
                  label: isEn
                    ? `New (${orders.filter((o) => o.status === "PLACED" || o.status === "PENDING").length})`
                    : `Mới nhận (${orders.filter((o) => o.status === "PLACED" || o.status === "PENDING").length})`,
                },
                {
                  key: "ACCEPTED",
                  label: isEn
                    ? `Packing (${orders.filter((o) => o.status === "ACCEPTED").length})`
                    : `Đang chuẩn bị (${orders.filter((o) => o.status === "ACCEPTED").length})`,
                },
                {
                  key: "READY_FOR_PICKUP",
                  label: isEn
                    ? `Ready (${orders.filter((o) => o.status === "READY_FOR_PICKUP").length})`
                    : `Sẵn sàng tại sạp (${orders.filter((o) => o.status === "READY_FOR_PICKUP").length})`,
                },
                {
                  key: "COMPLETED",
                  label: isEn
                    ? `Completed (${orders.filter((o) => o.status === "COMPLETED").length})`
                    : `Hoàn tất (${orders.filter((o) => o.status === "COMPLETED").length})`,
                },
                {
                  key: "DECLINED_CANCELLED",
                  label: isEn
                    ? `Declined / Cancelled (${orders.filter((o) => o.status === "DECLINED" || o.status === "CANCELLED").length})`
                    : `Từ chối / Hủy (${orders.filter((o) => o.status === "DECLINED" || o.status === "CANCELLED").length})`,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`ml-farmer-tab ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="ml-farmer-loading">
            {isEn ? "Loading orders from stall..." : "Đang tải danh sách đơn từ sạp..."}
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="ml-card ml-farmer-orders-empty">
            <span className="ml-farmer-empty-icon">🥬</span>
            <h3>{isEn ? "No pre-orders found in this status" : "Không có đơn hàng nào trong trạng thái này"}</h3>
            <p>
              {isEn
                ? "Customers typically pre-order on Thursday and Friday prior to weekend market opening."
                : "Khách hàng thường đặt trước nông sản vào thứ Năm và thứ Sáu trước ngày phiên chợ họp."}
            </p>
          </div>
        ) : (
          <>
            <div className="ml-farmer-orders-grid">
              {paginatedOrders.map((order) => (
                <div key={order.id} className="ml-card ml-farmer-order-card">
                  <div className="ml-farmer-card-top">
                    <div>
                      <span className="ml-order-badge-code">
                        #{order.orderCode}
                      </span>
                      <span className="ml-order-badge-date">
                        {isEn ? "Pickup Date:" : "Ngày nhận:"} {order.pickupDate}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="ml-farmer-customer-box">
                    <div className="ml-customer-avatar">👤</div>
                    <div className="ml-customer-details">
                      <div className="ml-customer-name">{order.customerName}</div>
                      <div className="ml-customer-phone">
                        📞 {order.customerPhone}
                      </div>
                    </div>
                    <div className="ml-session-tag">
                      ⏰ {order.pickupSessionLabel || (isEn ? "Morning slot" : "Ca sáng")}
                    </div>
                  </div>

                  <div className="ml-farmer-items-wrap">
                    <div className="ml-farmer-items-label">
                      {isEn ? "Items to prepare:" : "Mặt hàng cần soạn:"}
                    </div>
                    <ul className="ml-farmer-items-list">
                      {order.items.map((it, idx) => (
                        <li key={idx} className="ml-farmer-item-row">
                          <span className="ml-item-name">🥦 {localizeProduceName(it.name)}</span>
                          <span className="ml-item-qty">
                            <strong>
                              {it.qty} {localizeUnit(it.unit)}
                            </strong>{" "}
                            ({formatCurrency(it.price * it.qty)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.note && (
                    <div className="ml-farmer-order-note">
                      📝 <strong>{isEn ? "Shopper note:" : "Dặn dò của khách:"}</strong> {order.note}
                    </div>
                  )}

                  <div className="ml-farmer-card-footer">
                    <div className="ml-farmer-total">
                      <span className="ml-total-txt">
                        {isEn ? "Collect at stall" : "Thu tại sạp"} (
                        {order.paymentMethod === "VNPAY"
                          ? (isEn ? "Paid via VNPay" : "Đã thanh toán VNPay")
                          : (isEn ? "Cash at stall" : "Tiền mặt tại sạp")}
                        ):
                      </span>
                      <span className="ml-total-val">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>

                    <div className="ml-farmer-action-buttons">
                      {(order.status === "PENDING" ||
                        order.status === "PLACED") && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(order.id, "ACCEPTED")
                            }
                          >
                            ✓ {isEn ? "Accept Order" : "Tiếp nhận đơn"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="btn-danger-text"
                            onClick={() =>
                              setDeclineModal({
                                isOpen: true,
                                orderId: order.id,
                                orderCode: order.orderCode,
                                reason: isEn ? "Produce sold out for early morning harvest" : "Rau đã hết đợt hái sớm trong ngày",
                              })
                            }
                          >
                            ✕ {isEn ? "Out of Stock" : "Hết hàng"}
                          </Button>
                        </>
                      )}

                      {order.status === "ACCEPTED" && (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(order.id, "READY_FOR_PICKUP")
                          }
                        >
                          📦 {isEn ? "Packed & Ready at Stall" : "Đã gói xong tại sạp"}
                        </Button>
                      )}

                      {order.status === "READY_FOR_PICKUP" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(order.id, "COMPLETED")
                          }
                        >
                          💰 {isEn ? "Handed Over & Paid" : "Khách đã nhận & trả tiền"}
                        </Button>
                      )}

                      {order.status === "COMPLETED" && (
                        <span className="ml-done-label">
                          ✓ {isEn ? "Completed" : "Giao dịch thành công"}
                        </span>
                      )}

                      {(order.status === "DECLINED" ||
                        order.status === "CANCELLED") && (
                        <span className="ml-cancelled-label">✕ {isEn ? "Closed" : "Đã đóng"}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredOrders.length}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 320, behavior: "smooth" });
              }}
            />
          </>
        )}
      </div>

      {declineModal.isOpen && (
        <div className="ml-modal-overlay">
          <div className="ml-modal-box">
            <div className="ml-modal-header">
              <h3>
                {isEn ? `Decline Order #${declineModal.orderCode}` : `Từ chối đơn hàng #${declineModal.orderCode}`}
              </h3>
              <button
                type="button"
                className="ml-modal-close"
                onClick={() =>
                  setDeclineModal({
                    isOpen: false,
                    orderId: null,
                    orderCode: "",
                    reason: "",
                  })
                }
              >
                ✕
              </button>
            </div>

            <form onSubmit={confirmDecline} className="ml-modal-form">
              <p className="ml-modal-tip">
                {isEn
                  ? "Please provide a reason so the system can promptly notify the pre-ordering shopper."
                  : "Vui lòng cung cấp lý do để hệ thống thông báo kịp thời cho khách hàng đặt trước."}
              </p>

              <div className="ml-form-group">
                <label className="ml-form-label">{isEn ? "Decline Reason:" : "Lý do từ chối:"}</label>
                <select
                  className="ml-form-input"
                  value={declineModal.reason}
                  onChange={(e) =>
                    setDeclineModal({
                      ...declineModal,
                      reason: e.target.value,
                    })
                  }
                  required
                >
                  <option value="Rau đã hết đợt hái sớm trong ngày">
                    {isEn ? "Early harvest sold out for the day" : "Rau đã hết đợt hái sớm trong ngày"}
                  </option>
                  <option value="Thời tiết mưa bão không kịp thu hoạch">
                    {isEn ? "Inclement weather prevented timely harvest" : "Thời tiết mưa bão không kịp thu hoạch"}
                  </option>
                  <option value="Sản lượng không đạt chất lượng tươi ngon cam kết">
                    {isEn ? "Produce yield did not meet freshness standard" : "Sản lượng không đạt chất lượng tươi ngon cam kết"}
                  </option>
                  <option value="Khung giờ nhận không kịp chuẩn bị">
                    {isEn ? "Unable to prepare in time for this pickup slot" : "Khung giờ nhận không kịp chuẩn bị"}
                  </option>
                </select>
              </div>

              <div className="ml-modal-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setDeclineModal({
                      isOpen: false,
                      orderId: null,
                      orderCode: "",
                      reason: "",
                    })
                  }
                >
                  {isEn ? "Back" : "Quay lại"}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="btn-danger-text"
                >
                  {isEn ? "Confirm Decline" : "Xác nhận từ chối"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
