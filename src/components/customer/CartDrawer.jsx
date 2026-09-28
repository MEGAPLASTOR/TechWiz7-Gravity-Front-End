import React, { useState, useEffect } from "react";
import "@/assets/styles/components/customer/CartDrawer.css";
import Button from "../common/Button";
import marketService from "../../services/marketService";
import { useLanguage } from "../../context/LanguageContext";

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
  isLoggedIn = false,
  onOpenLogin,
}) {
  const { t, isEn, localizeProduceName, localizeUnit, localizeStallName, localizeMarketName } = useLanguage();
  const [markets, setMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [customerNote, setCustomerNote] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    let isMounted = true;
    async function fetchMarkets() {
      try {
        const data = await marketService.getMarkets();
        if (isMounted && data && data.length > 0) {
          setMarkets(data);
          const itemMarketId = cartItems[0]?.marketId;
          const match = data.find(
            (m) => m.marketId === itemMarketId || m.id === itemMarketId,
          );
          if (match) {
            setSelectedMarketId(String(match.marketId || match.id));
          } else {
            setSelectedMarketId(String(data[0].marketId || data[0].id));
          }
        }
      } catch (err) {
        console.warn("Failed to load markets for CartDrawer", err);
      }
    }
    if (isOpen) {
      fetchMarkets();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, cartItems]);
  useEffect(() => {
    if (!selectedMarketId) return;
    let isMounted = true;
    async function fetchSlots() {
      setLoadingSlots(true);
      try {
        const farmerId = cartItems[0]?.farmerId || null;
        const slotsData = await marketService.getPickupSlots(
          selectedMarketId,
          farmerId,
        );
        if (isMounted) {
          if (slotsData && slotsData.length > 0) {
            setSlots(slotsData);
            setSelectedSlotId(String(slotsData[0].slotId || slotsData[0].id));
          } else {
            setSlots([]);
            setSelectedSlotId("");
          }
        }
      } catch (err) {
        console.warn("Failed to fetch slots", err);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }
    fetchSlots();
    return () => {
      isMounted = false;
    };
  }, [selectedMarketId, cartItems]);
  if (!isOpen) return null;
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  );
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };
  const selectedMarket = markets.find(
    (m) => String(m.marketId || m.id) === String(selectedMarketId),
  );
  const selectedSlot = slots.find(
    (s) => String(s.slotId || s.id) === String(selectedSlotId),
  );
  const handleSubmit = async () => {
    if (cartItems.length === 0) return;
    if (!isLoggedIn) {
      if (onOpenLogin) onOpenLogin();
      return;
    }
    setIsSubmitting(true);
    const farmerId = cartItems[0]?.farmerId || selectedSlot?.farmerId;
    const marketId = Number(selectedMarketId);
    const slotId = Number(selectedSlotId);
    const productIdsValid = cartItems.every((item) => item.productId || item.id);
    if (!farmerId || !marketId || !slotId || !productIdsValid) {
      window.alert("Không đủ thông tin chợ, sạp hoặc ca nhận hàng để tạo đơn.");
      setIsSubmitting(false);
      return;
    }
    const payload = {
      farmerId: Number(farmerId),
      marketId: Number(marketId),
      slotId: Number(slotId),
      pickupDate: pickupDate,
      note: customerNote || "Khách đặt trước nông sản tươi",
      items: cartItems.map((item) => ({
        productId: Number(item.productId || item.id),
        quantity: Number(item.quantity || 1),
      })),
    };
    if (onSubmitOrder) {
      await onSubmitOrder(payload, {
        pickupMarket: selectedMarket?.name || "Phiên Chợ Nông Sản",
        pickupSlot: selectedSlot?.timeRange || "07:00 - 08:00",
        customerNote,
        totalAmount,
      });
    }
    setIsSubmitting(false);
  };
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  return (
    <div
      className="ml-cart-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="ml-cart-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ml-cart-header">
          <div className="ml-cart-title-wrap">
            <span className="ml-cart-header-icon">🧺</span>
            <div>
              <h3 className="ml-cart-title">{t("cartDrawerTitle", "Giỏ Nông Sản Đặt Trước")}</h3>
              <p className="ml-cart-subtitle">
                {cartItems.length} {t("cartDrawerSubtitle", "loại nông sản đã chọn")}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="ml-cart-close"
            onClick={onClose}
            aria-label={isEn ? "Close Cart" : "Đóng giỏ hàng"}
          >
            ✕
          </button>
        </div>

        <div className="ml-cart-body">
          {cartItems.length === 0 ? (
            <div className="ml-cart-empty">
              <span className="ml-empty-basket-icon">🥕</span>
              <h4>{t("cartEmptyTitle", "Giỏ hàng của bạn đang rỗng")}</h4>
              <p>
                {t(
                  "cartEmptyDesc",
                  "Hãy khám phá các sạp nông dân gần bạn và đặt trước để giữ phần rau củ ngon nhất cho buổi chợ sớm!"
                )}
              </p>
              <Button variant="primary" size="md" onClick={onClose}>
                {t("cartBrowseBtn", "Duyệt nông sản ngay")}
              </Button>
            </div>
          ) : (
            <>
              <div className="ml-cart-items-section">
                <div className="ml-cart-section-label">
                  {t("cartSectionLabelItems", "Nông sản thu hoạch sớm từ nhà vườn")}
                </div>
                <div className="ml-cart-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="ml-cart-item">
                      <img
                        src={
                          item.imageUrl ||
                          "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=150&q=80"
                        }
                        alt={item.name}
                        className="ml-cart-item-img"
                      />

                      <div className="ml-cart-item-info">
                        <div className="ml-cart-item-name">{localizeProduceName(item.name, isEn)}</div>
                        <div className="ml-cart-item-farmer">
                          🏡 {localizeStallName(item.farmerName, isEn) || (isEn ? "Organic Farm" : "Nông Trại Hữu Cơ")} •{" "}
                          {item.stallCode || (isEn ? "Farmer Stall" : "Sạp nông dân")}
                        </div>
                        <div className="ml-cart-item-price">
                          {formatCurrency(item.price)}{" "}
                          <span className="ml-unit">/ {localizeUnit(item.unit, isEn) || "kg"}</span>
                        </div>
                      </div>

                      <div className="ml-cart-item-actions">
                        <div className="ml-qty-control sm">
                          <button
                            type="button"
                            className="ml-qty-btn"
                            onClick={() => onUpdateQty(item, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="ml-qty-num">{item.quantity}</span>
                          <button
                            type="button"
                            className="ml-qty-btn"
                            onClick={() => onUpdateQty(item, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="ml-item-del-btn"
                          onClick={() => onRemoveItem(item.id)}
                          title={t("cartDeleteTip", "Xóa món này")}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ml-pickup-config">
                <div className="ml-cart-section-label">
                  {t("cartSectionLabelPickup", "Thông tin nhận hàng tại chợ")}
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {t("cartMarketLabel", "Điểm chợ bạn sẽ đến lấy hàng:")}
                  </label>
                  <select
                    className="ml-form-select"
                    value={selectedMarketId}
                    onChange={(e) => setSelectedMarketId(e.target.value)}
                  >
                    {markets.map((m) => (
                      <option
                        key={m.marketId || m.id}
                        value={m.marketId || m.id}
                      >
                        {localizeMarketName(m.name, isEn)} {m.address ? `(${m.address})` : ""}
                      </option>
                    ))}
                    {markets.length === 0 && (
                      <option value="" disabled>
                        {isEn ? "Loading market locations..." : "Chưa tải được danh sách chợ"}
                      </option>
                    )}
                  </select>
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">{t("cartDateLabel", "Ngày bạn sẽ ghé chợ:")}</label>
                  <input
                    type="date"
                    className="ml-form-input"
                    value={pickupDate}
                    min={minDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                  />
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {t("cartSlotLabel", "Chọn ca nhận hàng (khung giờ ghé sạp):")}
                    {loadingSlots && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#16a34a",
                          marginLeft: "6px",
                        }}
                      >
                        {t("cartSlotLoading", "Đang tải ca...")}
                      </span>
                    )}
                  </label>
                  <div className="ml-slot-options">
                    {slots.map((slot) => {
                      const sid = String(slot.slotId || slot.id);
                      return (
                        <label
                          key={sid}
                          className={`ml-slot-label ${selectedSlotId === sid ? "active" : ""}`}
                        >
                          <input
                            type="radio"
                            name="pickup_slot"
                            checked={selectedSlotId === sid}
                            onChange={() => setSelectedSlotId(sid)}
                          />
                          <span>
                            <strong>
                              {t("cartSlotItem", "Ca")}{" "}
                              {slot.timeRange ||
                                `${slot.startTime} - ${slot.endTime}`}
                            </strong>
                            {slot.farmerName ? ` • ${localizeStallName(slot.farmerName, isEn)}` : ""}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {t("cartNoteLabel", "Ghi chú gửi người bán (nếu có):")}
                  </label>
                  <input
                    type="text"
                    className="ml-form-input"
                    placeholder={t("cartNotePlaceholder", "VD: Nhặt giúp bó rau non, đóng riêng từng túi...")}
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="ml-payment-pledge">
                <span className="ml-pledge-icon">💵</span>
                <div className="ml-pledge-text">
                  <strong>{t("cartCashPledgeTitle", "Thanh toán trực tiếp tại sạp chợ")}</strong>
                  <p>
                    {t(
                      "cartCashPledgeDesc",
                      "Khi ra chợ nhận hàng, bạn được tận mắt kiểm tra độ tươi ngon rồi mới thanh toán tiền mặt hoặc quét mã VietQR cho chủ sạp."
                    )}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="ml-cart-footer">
            <div className="ml-cart-summary-row">
              <span className="ml-summary-label">{t("cartSubtotal", "Tổng tiền tạm tính:")}</span>
              <span className="ml-summary-amount">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {isLoggedIn ? (
              <Button
                variant="accent"
                size="lg"
                fullWidth
                loading={isSubmitting}
                onClick={handleSubmit}
                icon={<span>✓</span>}
              >
                {t("cartConfirmOrder", "Xác nhận đặt trước")} ({formatCurrency(totalAmount)})
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  if (onOpenLogin) onOpenLogin();
                }}
                icon={<span>🔑</span>}
              >
                {t("cartLoginToOrder", "Đăng nhập để đặt trước")}
              </Button>
            )}

            <div className="ml-cart-guarantee">
              {t("cartPledgeGuarantee", "🌿 Không cần thẻ ngân hàng • Giữ nông sản tươi tới khi bạn đến")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
