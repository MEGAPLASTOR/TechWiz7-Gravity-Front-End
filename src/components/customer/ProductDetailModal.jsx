import React, { useState } from "react";
import "@/assets/styles/components/customer/ProductDetailModal.css";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { useLanguage } from "../../context/LanguageContext";

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  cartQuantity = 0,
  onUpdateCartQty,
}) {
  const { t, isEn, localizeProduceName, localizeUnit, localizeStallName, localizeMarketName } = useLanguage();
  const [selectedQty, setSelectedQty] = useState(1);
  const {
    id,
    name,
    categoryName = "",
    price = 0,
    unit = "kg",
    farmerName = "",
    stallCode = "",
    marketName = "",
    stockQuantity = 0,
    harvestTime = "",
    description = "",
    imageUrl,
    organicCertified = false,
    cutoffTime = "",
  } = product || {};
  const fallbackImg =
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80";
  const isOutOfStock = stockQuantity <= 0;
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };
  const handleAdd = () => {
    if (onAddToCart) {
      for (let i = 0; i < selectedQty; i++) {
        onAddToCart(product);
      }
      onClose();
    }
  };
  if (!product) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={localizeProduceName(name, isEn)}
      subtitle={
        isEn
          ? `From ${localizeStallName(farmerName, isEn)} • ${stallCode}`
          : `Thuộc sạp ${farmerName} • ${stallCode}`
      }
      maxWidth="680px"
    >
      <div className="ml-product-detail-modal">
        <div className="ml-detail-grid">
          <div className="ml-detail-img-box">
            <img
              src={imageUrl || fallbackImg}
              alt={name}
              className="ml-detail-main-img"
              onError={(e) => {
                e.target.src = fallbackImg;
              }}
            />
            <div className="ml-detail-img-badges">
              {organicCertified && (
                <Badge variant="organic" size="sm">
                  {t("prodModalOrganicBadge", "🌿 Hữu cơ kiểm định")}
                </Badge>
              )}
              <span className="ml-cutoff-pill">
                ⏰ {isEn ? "Pre-order cutoff before market" : cutoffTime}
              </span>
            </div>
          </div>

          <div className="ml-detail-info-col">
            <div className="ml-detail-price-row">
              <span className="ml-detail-price">{formatCurrency(price)}</span>
              <span className="ml-detail-unit">/ {localizeUnit(unit, isEn)}</span>
            </div>

            <div className="ml-detail-meta-list">
              <div className="ml-detail-meta-item">
                <span className="ml-meta-label">{isEn ? "Farm / Grower:" : "Nhà vườn:"}</span>
                <span className="ml-meta-val">🏡 {localizeStallName(farmerName, isEn)}</span>
              </div>
              <div className="ml-detail-meta-item">
                <span className="ml-meta-label">{t("prodModalPickupLocation", "Điểm nhận hàng:")}</span>
                <span className="ml-meta-val">
                  🎪 {localizeMarketName(marketName, isEn)} ({stallCode})
                </span>
              </div>
              <div className="ml-detail-meta-item">
                <span className="ml-meta-label">{t("prodModalHarvestTime", "Thời điểm cắt:")}</span>
                <span className="ml-meta-val">
                  ⚡ {isEn ? "Dawn harvest at 4:30 AM" : harvestTime}
                </span>
              </div>
              <div className="ml-detail-meta-item">
                <span className="ml-meta-label">{t("prodModalStockStatus", "Tình trạng kho:")}</span>
                <span className={`ml-meta-val ${isOutOfStock ? "out" : "in"}`}>
                  {isOutOfStock
                    ? t("prodModalSoldOut", "Đã hết hàng cho phiên này")
                    : isEn
                      ? `Stock: ${stockQuantity} ${localizeUnit(unit, isEn)}`
                      : `Còn ${stockQuantity} ${unit}`}
                </span>
              </div>
            </div>

            <div className="ml-detail-desc-box">
              <h5 className="ml-desc-title">{t("prodModalDescTitle", "Mô tả nông sản:")}</h5>
              <p className="ml-desc-text">
                {isEn
                  ? "Naturally grown without synthetic pesticides, watered with natural mountain springs. Harvested fresh at dawn and brought directly to market stalls to preserve natural sweetness and crisp dew-freshness."
                  : description}
              </p>
            </div>

            {onAddToCart ? (
              <div className="ml-detail-order-actions">
                <div className="ml-detail-qty-picker">
                  <label className="ml-qty-label">{t("prodModalQtyLabel", "Số lượng đặt:")}</label>
                  <div className="ml-qty-control">
                    <button
                      type="button"
                      className="ml-qty-btn"
                      disabled={selectedQty <= 1}
                      onClick={() =>
                        setSelectedQty(Math.max(1, selectedQty - 1))
                      }
                    >
                      -
                    </button>
                    <span className="ml-qty-num">{selectedQty}</span>
                    <button
                      type="button"
                      className="ml-qty-btn"
                      disabled={selectedQty >= stockQuantity}
                      onClick={() =>
                        setSelectedQty(Math.min(stockQuantity, selectedQty + 1))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  variant="accent"
                  size="lg"
                  fullWidth
                  disabled={isOutOfStock}
                  onClick={handleAdd}
                  icon={<span>🧺</span>}
                >
                  {isOutOfStock
                    ? t("prodModalSoldOutBtn", "Tạm hết hàng")
                    : `${t("prodModalOrderBtn", "Đặt trước")} • ${formatCurrency(price * selectedQty)}`}
                </Button>

                <div className="ml-detail-guarantee">
                  {t("prodModalGuarantee", "✓ Nhận tại sạp chợ • Kiểm tra độ tươi trước khi trả tiền mặt")}
                </div>
              </div>
            ) : (
              <div
                className="ml-detail-guarantee"
                style={{
                  marginTop: "20px",
                  textAlign: "center",
                  background: "var(--color-bg-base)",
                  padding: "14px",
                  borderRadius: "12px",
                }}
              >
                {isEn
                  ? "🌾 Management Mode (Admin / Farmer): Listing preview only"
                  : "🌾 Chế độ quản lý (Admin / Farmer): Chỉ xem thông tin niêm yết của sạp"}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
