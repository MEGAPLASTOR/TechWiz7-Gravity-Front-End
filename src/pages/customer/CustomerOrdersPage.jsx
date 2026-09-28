import React, { useState, useEffect } from "react";
import "@/assets/styles/pages/customer/CustomerOrdersPage.css";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import OrderModifyModal from "../../components/customer/OrderModifyModal";
import ReviewModal from "../../components/customer/ReviewModal";
import orderService from "../../services/orderService";
import customerService from "../../services/customerService";
import { useLanguage } from "../../context/LanguageContext";

export default function CustomerOrdersPage({
  initialOrderId,
  initialOrderCode,
  initialSearch,
  onReorder,
  onNavigate,
} = {}) {
  const { isEn, localizeProduceName, localizeMarketName, localizeUnit } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState(
    () =>
      initialSearch ||
      initialOrderCode ||
      (initialOrderId ? String(initialOrderId) : ""),
  );
  const [orders, setOrders] = useState([]);
  const [selectedModifyOrder, setSelectedModifyOrder] = useState(null);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState(null);
  const [selectedQrOrder, setSelectedQrOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const target =
      initialOrderCode || (initialOrderId ? String(initialOrderId) : "");
    if (target) {
      setSearchKeyword(target);
      setActiveTab("all");
    }
  }, [initialOrderId, initialOrderCode]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let statusParam = "";
      if (activeTab === "READY") statusParam = "READY_FOR_PICKUP";
      else if (activeTab === "PENDING") statusParam = "PLACED";
      else if (activeTab !== "all") statusParam = activeTab;

      const realOrders = await orderService.getMyOrders({
        keyword: searchKeyword.trim(),
        status: statusParam,
      });

      if (realOrders && realOrders.length > 0) {
        setOrders(
          realOrders.map((o) => ({
            id: o.orderId || o.id,
            orderId: o.orderId || o.id,
            orderCode: o.orderCode || `ORD-${o.orderId || o.id}`,
            pickupMarket: o.marketName || "Chợ Phiên Nông Sản",
            marketAddress: o.marketAddress || "",
            stallLocation: o.stallName
              ? `${o.stallName} (${o.marketAddress || ""})`
              : o.marketAddress || "Sạp nông dân",
            pickupDate: o.pickupDate,
            pickupSlot: o.slotTimeRange || "07:00 - 08:00",
            pickupSlotLabel: o.slotTimeRange
              ? `Ca nhận hàng: ${o.slotTimeRange}`
              : "Khung giờ sáng sớm",
            slotId: o.slotId,
            farmerId: o.farmerId,
            marketId: o.marketId,
            status: o.orderStatus || "PLACED",
            totalAmount: o.totalAmount || 0,
            paymentMethod: o.paymentMethod || "Thanh toán trực tiếp tại sạp",
            farmerName: o.farmerName || "Nông Trại Hữu Cơ",
            farmerPhone: o.customerPhone || "0900000003",
            note: o.note || "",
            createdAt: o.createdAt
              ? String(o.createdAt).replace("T", " ").substring(0, 16)
              : "Hôm nay",
            canCancel:
              o.canCancel !== undefined
                ? o.canCancel
                : o.orderStatus === "PLACED",
            items: (o.items || []).map((it) => ({
              id: it.productId || it.orderItemId,
              name: it.productName || "Nông sản sạch",
              quantity: it.quantity || 1,
              price: it.unitPrice || 0,
              unit: it.productUnit || "kg",
            })),
            reviewed: o.hasReview === true,
          })),
        );
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn("Error loading real orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchKeyword, activeTab]);

  const filteredOrders = orders;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "READY":
      case "READY_FOR_PICKUP":
        return (
          <Badge variant="ready" dot>
            {isEn ? "Ready for pickup at market" : "Sẵn sàng tại sạp chợ"}
          </Badge>
        );
      case "PENDING":
      case "PLACED":
        return (
          <Badge variant="pending" dot>
            {isEn ? "Waiting for stall confirmation" : "Đang chờ sạp chốt đơn"}
          </Badge>
        );
      case "ACCEPTED":
      case "CONFIRMED":
        return (
          <Badge variant="organic" dot>
            {isEn ? "Harvesting & packing" : "Đang thu hoạch & đóng gói"}
          </Badge>
        );
      case "COMPLETED":
        return <Badge variant="completed">{isEn ? "Picked up & paid" : "Đã nhận & thanh toán"}</Badge>;
      case "CANCELLED":
      case "DECLINED":
        return <Badge variant="cancelled">{isEn ? "Cancelled" : "Đã hủy"}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (
      window.confirm(
        isEn
          ? "Are you sure you want to cancel this pre-order? The farmer will release the reserved stock."
          : "Bạn có chắc muốn hủy đơn đặt trước này? Nông dân sẽ hoàn lại tồn kho cho khách hàng khác.",
      )
    ) {
      try {
        await orderService.cancelOrder(orderId);
        setActionMessage(isEn ? "Order cancelled successfully. Stock released." : "Đã hủy đơn thành công. Tồn kho đã được hoàn lại.");
        setTimeout(() => setActionMessage(""), 4000);
        await loadOrders();
      } catch (err) {
        alert(err?.message || (isEn ? "Could not cancel order at this time." : "Không thể hủy đơn hàng vào lúc này."));
      }
    }
  };

  const handleSaveModification = async (orderId, newDetails) => {
    try {
      await customerService.modifyOrder(orderId, {
        pickupDate: newDetails.pickupDate,
        slotId: Number(newDetails.slotId),
        note: newDetails.note,
      });
      setActionMessage(isEn ? "Pickup schedule updated successfully!" : "Đã điều chỉnh lịch nhận hàng thành công!");
      setTimeout(() => setActionMessage(""), 4000);
      await loadOrders();
    } catch (err) {
      alert(err?.message || (isEn ? "Could not modify order at this time." : "Không thể thay đổi đơn hàng lúc này."));
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      await customerService.submitReview({
        orderId: Number(reviewData.orderId),
        productId: reviewData.productId ? Number(reviewData.productId) : null,
        rating: Number(reviewData.rating),
        comment: reviewData.comment,
      });
      setActionMessage(isEn ? "Thank you for reviewing the farmer stall!" : "Cảm ơn bạn đã gửi đánh giá cho sạp nông dân!");
      setTimeout(() => setActionMessage(""), 4000);
      await loadOrders();
    } catch (err) {
      alert(err?.message || (isEn ? "Could not submit review at this time." : "Không thể gửi đánh giá lúc này."));
    }
  };

  return (
    <div className="ml-orders-page">
      <div className="ml-orders-banner">
        <div className="ml-container">
          <span className="ml-section-subtitle">{isEn ? "Your Pre-orders" : "Đơn Hàng Của Bạn"}</span>
          <h1 className="ml-orders-title">{isEn ? "Manage Fresh Produce Pre-orders" : "Quản Lý Đơn Đặt Trước Nông Sản"}</h1>
          <p className="ml-orders-subtitle">
            {isEn
              ? "Track harvest and packing status from growers, present your QR code at the stall, and pay cash directly upon morning pickup."
              : "Theo dõi trạng thái thu hoạch và đóng gói từ nhà vườn, lấy mã QR xuất trình tại sạp và thanh toán tiền mặt trực tiếp khi đến chợ."}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 16,
            }}
          >
            <div
              className="ml-orders-tabs"
              style={{
                margin: 0,
              }}
            >
              {[
                {
                  key: "all",
                  label: isEn ? `All (${orders.length})` : `Tất cả (${orders.length})`,
                },
                {
                  key: "READY",
                  label: isEn ? "🌿 Ready at stall" : "🌿 Sẵn sàng tại sạp",
                },
                {
                  key: "PENDING",
                  label: isEn ? "⏳ Pending" : "⏳ Chờ chốt đơn",
                },
                {
                  key: "COMPLETED",
                  label: isEn ? "✓ Picked up" : "✓ Đã nhận hàng",
                },
                {
                  key: "CANCELLED",
                  label: isEn ? "✕ Cancelled" : "✕ Đã hủy",
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`ml-order-tab ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <input
                type="text"
                className="ml-products-search-input"
                style={{
                  width: 280,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 13.5,
                }}
                placeholder={isEn ? "Search order code, produce name, stall..." : "Tìm mã đơn, tên nông sản, sạp..."}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              {searchKeyword && (
                <button
                  type="button"
                  className="ml-search-clear"
                  onClick={() => setSearchKeyword("")}
                  title={isEn ? "Clear search" : "Xóa tìm kiếm"}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16,
                    color: "#64748b",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ml-container">
        {actionMessage && (
          <div
            className="ml-orders-loading"
            style={{
              backgroundColor: "#ecfdf5",
              borderColor: "#a7f3d0",
              color: "#065f46",
            }}
          >
            ✓ {actionMessage}
          </div>
        )}

        {loading && (
          <div className="ml-orders-loading">
            {isEn ? "Loading orders from system..." : "Đang tải dữ liệu đơn hàng thực tế từ hệ thống..."}
          </div>
        )}

        {!loading && filteredOrders.length === 0 ? (
          <div className="ml-card ml-orders-empty">
            <span className="ml-orders-empty-icon">🧺</span>
            <h3>{isEn ? "No pre-orders found" : "Chưa có đơn đặt trước nào"}</h3>
            <p>
              {isEn
                ? "Morning market stalls are currently accepting pre-orders. Reserve ahead to get the freshest produce!"
                : "Các sạp nông dân họp chợ đang mở nhận đơn rau sạch sớm. Đặt trước để giữ phần ngon nhất!"}
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate && onNavigate("products")}
            >
              {isEn ? "Explore seasonal produce" : "Khám phá nông sản mùa vụ"}
            </Button>
          </div>
        ) : (
          <div className="ml-orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="ml-card ml-order-card">
                <div className="ml-order-header">
                  <div className="ml-order-identity">
                    <span className="ml-order-code">
                      {isEn ? "Order: #" : "Mã: #"}{order.orderCode}
                    </span>
                    <span className="ml-order-dot">•</span>
                    <span className="ml-order-time">
                      {isEn ? "Placed at: " : "Đặt lúc: "}{order.createdAt}
                    </span>
                  </div>
                  <div className="ml-order-status-wrap">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div className="ml-order-pickup-box">
                  <div className="ml-pickup-grid">
                    <div className="ml-pickup-col">
                      <span className="ml-pickup-icon">🎪</span>
                      <div>
                        <div className="ml-pickup-label">
                          {isEn ? "Pickup Market:" : "Điểm hẹn chợ phiên:"}
                        </div>
                        <div className="ml-pickup-val">
                          <strong>{localizeMarketName(order.pickupMarket)}</strong>
                        </div>
                        <div className="ml-pickup-sub">
                          {order.stallLocation}
                        </div>
                      </div>
                    </div>

                    <div className="ml-pickup-col">
                      <span className="ml-pickup-icon">⏰</span>
                      <div>
                        <div className="ml-pickup-label">
                          {isEn ? "Pickup Window:" : "Thời gian đến lấy hàng:"}
                        </div>
                        <div className="ml-pickup-val">
                          <strong>
                            {order.pickupSlotLabel || order.pickupSlot}
                          </strong>
                        </div>
                        <div className="ml-pickup-sub">
                          {isEn ? "Date: " : "Ngày: "}{order.pickupDate}
                        </div>
                      </div>
                    </div>

                    <div className="ml-pickup-col">
                      <span className="ml-pickup-icon">👨‍🌾</span>
                      <div>
                        <div className="ml-pickup-label">{isEn ? "Grower Stall:" : "Sạp nông dân:"}</div>
                        <div className="ml-pickup-val">
                          <strong>{order.farmerName}</strong>
                        </div>
                        <div className="ml-pickup-sub">
                          Hotline: {order.farmerPhone}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-order-items-table">
                  <div className="ml-table-head">
                    <span className="col-name">{isEn ? "Pre-ordered Produce" : "Nông sản đặt trước"}</span>
                    <span className="col-qty">{isEn ? "Quantity" : "Số lượng"}</span>
                    <span className="col-price">{isEn ? "Unit Price" : "Đơn giá"}</span>
                    <span className="col-total">{isEn ? "Subtotal" : "Tạm tính"}</span>
                  </div>
                  <div className="ml-table-body">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="ml-table-row">
                        <span className="col-name">🥬 {localizeProduceName(item.name)}</span>
                        <span className="col-qty">
                          {item.quantity} {localizeUnit(item.unit)}
                        </span>
                        <span className="col-price">
                          {formatCurrency(item.price)}
                        </span>
                        <span className="col-total">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.note && (
                  <div className="ml-order-note">
                    <strong>{isEn ? "Note to farmer:" : "Ghi chú cho nông dân:"}</strong> "{order.note}"
                  </div>
                )}

                <div className="ml-order-footer">
                  <div className="ml-order-total-block">
                    <span className="ml-total-label">
                      {isEn ? "Total due at stall:" : "Tổng thanh toán tại sạp:"}
                    </span>
                    <span className="ml-total-val">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <span className="ml-payment-tag">
                      {order.paymentMethod === "Thanh toán trực tiếp tại sạp" || !order.paymentMethod
                        ? (isEn ? "Cash at stall" : "Thanh toán trực tiếp tại sạp")
                        : order.paymentMethod}
                    </span>
                  </div>

                  <div className="ml-order-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQrOrder(order)}
                    >
                      {isEn ? "📱 View pickup QR" : "📱 Xem mã QR nhận hàng"}
                    </Button>

                    {order.status === "COMPLETED" && !order.reviewed && (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => setSelectedReviewOrder(order)}
                      >
                        {isEn ? "⭐ Review stall" : "⭐ Đánh giá sạp"}
                      </Button>
                    )}

                    {order.status === "COMPLETED" && order.reviewed && (
                      <span className="ml-reviewed-badge">{isEn ? "✓ Reviewed" : "✓ Đã đánh giá"}</span>
                    )}

                    {(order.status === "PENDING" ||
                      order.status === "PLACED") && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedModifyOrder(order)}
                        >
                          {isEn ? "Change pickup time" : "Đổi giờ lấy hàng"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="btn-danger-text"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          {isEn ? "Cancel order" : "Hủy đơn"}
                        </Button>
                      </>
                    )}

                    {order.status === "COMPLETED" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onReorder && onReorder(order)}
                      >
                        {isEn ? "🧺 Reorder this" : "🧺 Đặt lại đơn này"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedQrOrder && (
        <Modal
          isOpen={!!selectedQrOrder}
          onClose={() => setSelectedQrOrder(null)}
          title={isEn ? "Pickup QR Code at Market Stall" : "Mã Nhận Hàng Tại Sạp Chợ"}
          subtitle={isEn ? `Present this code to grower ${selectedQrOrder.farmerName}` : `Xuất trình mã này cho chủ sạp ${selectedQrOrder.farmerName}`}
          maxWidth="440px"
        >
          <div className="ml-qr-pickup-modal">
            <div className="ml-qr-code-text">#{selectedQrOrder.orderCode}</div>

            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(selectedQrOrder.orderCode)}`}
              alt={isEn ? "Order QR Code" : "Mã QR đơn hàng"}
              className="ml-qr-code-img"
            />

            <div className="ml-qr-stall-info">
              <div>
                🎪 <strong>{isEn ? "Pickup Market:" : "Điểm hẹn:"}</strong> {localizeMarketName(selectedQrOrder.pickupMarket)}
              </div>
              <div>
                📍 <strong>{isEn ? "Stall Location:" : "Vị trí sạp:"}</strong> {selectedQrOrder.stallLocation}
              </div>
              <div>
                ⏰ <strong>{isEn ? "Pickup Window:" : "Ca lấy hàng:"}</strong>{" "}
                {selectedQrOrder.pickupSlotLabel || selectedQrOrder.pickupSlot}{" "}
                ({selectedQrOrder.pickupDate})
              </div>
              <div>
                💵 <strong>{isEn ? "Amount to Pay:" : "Số tiền thanh toán:"}</strong>{" "}
                <span
                  style={{
                    color: "var(--color-accent)",
                    fontWeight: "bold",
                  }}
                >
                  {formatCurrency(selectedQrOrder.totalAmount)}
                </span>
              </div>
            </div>

            <p className="ml-qr-pickup-guide">
              {isEn
                ? "When arriving at the stall, show this screen to the farmer or read the order code to collect your pre-packed produce basket and inspect it before paying cash."
                : "Khi đến sạp, hãy đưa màn hình này cho nông dân quét hoặc đọc mã đơn để nhận giỏ nông sản đã đóng gói sẵn và kiểm tra trước khi trả tiền mặt."}
            </p>

            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => setSelectedQrOrder(null)}
            >
              {isEn ? "Understood & Close" : "Đã hiểu & Đóng"}
            </Button>
          </div>
        </Modal>
      )}

      {selectedModifyOrder && (
        <OrderModifyModal
          isOpen={!!selectedModifyOrder}
          onClose={() => setSelectedModifyOrder(null)}
          order={selectedModifyOrder}
          onSave={handleSaveModification}
          onSaveModification={handleSaveModification}
        />
      )}

      {selectedReviewOrder && (
        <ReviewModal
          isOpen={!!selectedReviewOrder}
          onClose={() => setSelectedReviewOrder(null)}
          order={selectedReviewOrder}
          onSubmit={handleSubmitReview}
          onSubmitReview={handleSubmitReview}
        />
      )}
    </div>
  );
}
