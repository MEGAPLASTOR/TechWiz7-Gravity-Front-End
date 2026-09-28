import React from "react";
import "@/assets/styles/components/customer/ProductCard.css";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { useLanguage } from "@/context";

export default function ProductCard({
  product,
  onAddToCart,
  cartQuantity = 0,
  onUpdateCartQty,
}) {
  const { isEn, t, localizeProduceName, localizeMarketName, localizeStallName, localizeUnit } = useLanguage();

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
    imageUrl,
    organicCertified = false,
  } = product;

  const displayName = localizeProduceName(name);
  const displayFarmer = localizeStallName(farmerName);
  const displayMarket = localizeMarketName(marketName);
  const displayUnit = localizeUnit(unit);
  const displayHarvest = isEn
    ? (harvestTime
        ? harvestTime
            .replace(/Thu hoạch lúc 4h30 sáng/gi, "Harvested 4:30 AM")
            .replace(/Thu hoạch 5h sáng/gi, "Harvested 5:00 AM")
            .replace(/Thu hoạch sáng nay/gi, "Harvested this morning")
            .replace(/Thu hoạch hôm qua/gi, "Harvested yesterday")
            .replace(/Thu hái sáng sớm/gi, "Early morning harvest")
            .replace(/Hái tự nhiên trên núi/gi, "Mountain harvest")
            .replace(/Thu hoạch sớm/gi, "Early morning harvest")
        : "Early morning harvest")
    : harvestTime;

  const fallbackImg =
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80";

  const isOutOfStock = stockQuantity <= 0;

  const formatPrice = (amount) => {
    if (isEn) {
      return `${Number(amount).toLocaleString()} VND`;
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div
      className={`ml-card ml-product-card ${isOutOfStock ? "is-out-of-stock" : ""}`}
    >
      <div className="ml-product-img-wrap">
        <img
          src={imageUrl || fallbackImg}
          alt={displayName}
          className="ml-product-img"
          loading="lazy"
          onError={(e) => {
            e.target.src = fallbackImg;
          }}
        />

        <div className="ml-product-badges">
          {organicCertified && (
            <Badge variant="organic" size="sm">
              🌿 {t("organicTag", "Hữu cơ")}
            </Badge>
          )}
          {isOutOfStock ? (
            <Badge variant="cancelled" size="sm">
              {t("outOfStock", "Hết hàng")}
            </Badge>
          ) : (
            <span className="ml-harvest-tag">⚡ {displayHarvest}</span>
          )}
        </div>
      </div>

      <div className="ml-product-body">
        {(displayFarmer || stallCode) && (
          <div className="ml-product-origin">
            {displayFarmer && <span className="ml-farmer-name">🏡 {displayFarmer}</span>}
            {stallCode && (
              <span className="ml-stall-code">
                {isEn ? stallCode.replace(/Sạp/gi, "Stall") : stallCode}
              </span>
            )}
          </div>
        )}

        <h4 className="ml-product-title" title={displayName}>
          {displayName}
        </h4>

        {displayMarket && (
          <div className="ml-product-market-hint">
            <span>
              🎪 {t("pickupAt", "Nhận tại:")} <strong>{displayMarket}</strong>
            </span>
          </div>
        )}

        <div className="ml-product-stock-wrap">
          {!isOutOfStock ? (
            <span className="ml-stock-text">
              {t("inStock", "Còn lại:")}{" "}
              <strong>
                {stockQuantity} {displayUnit}
              </strong>
            </span>
          ) : (
            <span className="ml-stock-text out">
              {t("restocking", "Sạp sẽ bổ sung vào phiên sau")}
            </span>
          )}
        </div>

        <div className="ml-product-footer">
          <div className="ml-product-price-box">
            <span className="ml-product-price">{formatPrice(price)}</span>
            <span className="ml-product-unit">/ {displayUnit}</span>
          </div>

          {onAddToCart && (
            <div
              className="ml-product-action"
              onClick={(e) => e.stopPropagation()}
            >
              {cartQuantity > 0 ? (
                <div className="ml-qty-control">
                  <button
                    type="button"
                    className="ml-qty-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateCartQty &&
                        onUpdateCartQty(product, cartQuantity - 1);
                    }}
                    aria-label={isEn ? "Decrease quantity" : "Giảm số lượng"}
                  >
                    -
                  </button>
                  <span className="ml-qty-val">{cartQuantity}</span>
                  <button
                    type="button"
                    className="ml-qty-btn"
                    disabled={cartQuantity >= stockQuantity}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateCartQty &&
                        onUpdateCartQty(product, cartQuantity + 1);
                    }}
                    aria-label={isEn ? "Increase quantity" : "Tăng số lượng"}
                  >
                    +
                  </button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isOutOfStock}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                >
                  {t("addToCart", "Đặt trước")}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
