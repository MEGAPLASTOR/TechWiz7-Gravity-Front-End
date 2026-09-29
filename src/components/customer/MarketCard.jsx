import React, { useMemo } from "react";
import "@/assets/styles/components/customer/MarketCard.css";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { useLanguage } from "@/context";
import { getMarketOperatingStatus } from "@/utils/marketUtils";

export default function MarketCard({
  market,
  onSelectMarket,
  onViewDetails,
  onSelect,
  onViewScheduleMap,
  onViewStalls,
}) {
  const { isEn, t, localizeMarketName, localizeOperatingDays } = useLanguage();

  const {
    id,
    name,
    address,
    city = "",
    distance = "",
    operatingDays = "",
    operatingHours = "",
    stallsCount = 0,
    imageUrl,
    tag = "",
    verified = true,
  } = market;

  const displayName = localizeMarketName(name);
  const displayOperatingDays = localizeOperatingDays(operatingDays);
  const displayCity = isEn
    ? (city || "").replace(/TP\. Hồ Chí Minh/gi, "Ho Chi Minh City")
    : (city || "");

  const opStatus = useMemo(() => {
    return getMarketOperatingStatus(market, isEn);
  }, [market, isEn]);

  const displayTag = isEn
    ? (tag || "")
        .replace(/Chợ rau hữu cơ/gi, "Organic Produce Market")
        .replace(/Chợ phiên sạch/gi, "Clean Produce Market")
        .replace(/Đặc sản hữu cơ/gi, "Organic Specialties")
        .replace(/Đặc sản Đà Lạt & Miền Tây/gi, "Da Lat & Mekong Specialties")
        .replace(/Nông sản vùng cao/gi, "Highland Produce")
        .replace(/Nông sản sinh thái/gi, "Eco Produce")
        .replace(/Nông sản sạch/gi, "Clean Produce")
    : tag;

  const handleViewScheduleMap = () => {
    if (onViewScheduleMap) {
      onViewScheduleMap(market);
    } else if (onViewDetails) {
      onViewDetails(market);
    } else if (onSelect) {
      onSelect(market, "schedule_map");
    }
  };

  const handleViewStalls = () => {
    if (onViewStalls) {
      onViewStalls(market);
    } else if (onSelectMarket) {
      onSelectMarket(market);
    } else if (onSelect) {
      onSelect(market, "stalls");
    }
  };

  const fallbackImg =
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=700&q=80";

  return (
    <div className="ml-card ml-market-card">
      <div className="ml-market-img-wrap">
        <img
          src={imageUrl || fallbackImg}
          alt={displayName}
          className="ml-market-img"
          loading="lazy"
          onError={(e) => {
            e.target.src = fallbackImg;
          }}
        />
        <div className="ml-market-badge-top">
          {distance ? (
            <Badge variant="organic" size="sm">
              📍 {distance}
            </Badge>
          ) : (
            <div />
          )}
          <Badge variant={opStatus.badgeVariant} size="sm" dot>
            {opStatus.badgeText}
          </Badge>
        </div>
        {(displayOperatingDays || operatingHours) && (
          <div className="ml-market-schedule-pill">
            🕒 {displayOperatingDays || (isEn ? "Market Day" : "Ngày họp chợ")}{operatingHours ? ` (${operatingHours})` : ""}
          </div>
        )}
      </div>

      <div className="ml-market-body">
        <div className="ml-market-header">
          <h3 className="ml-market-name" title={displayName}>
            {displayName}
          </h3>
          {displayCity && <span className="ml-market-city">{displayCity}</span>}
        </div>

        <div className={`ml-market-op-status ml-market-op-${opStatus.code.toLowerCase()}`}>
          <span className="ml-op-status-icon">
            {opStatus.isOpen ? "🟢" : opStatus.code === "OPENS_SOON" ? "🟡" : opStatus.code === "INACTIVE" ? "🔴" : "⚪"}
          </span>
          <span className="ml-op-status-label">{opStatus.statusLabel}</span>
          {opStatus.detailText && (
            <span className="ml-op-status-sub">• {opStatus.detailText}</span>
          )}
        </div>

        <p className="ml-market-address">
          <span className="ml-icon-pin">📌</span> {address}
        </p>

        <div className="ml-market-footer-info">
          <div className="ml-market-stalls">
            <span className="ml-stalls-icon">🎪</span>
            <span>
              <strong>{stallsCount || 0}</strong> {t("stallsCountLabel", "gian hàng nông dân")}
            </span>
          </div>
          {displayTag && <span className="ml-market-tag">{displayTag}</span>}
        </div>

        <div className="ml-market-actions">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={handleViewScheduleMap}
          >
            {t("btnScheduleMap", "Xem lịch & sơ đồ")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleViewStalls}
          >
            {t("btnBrowseStalls", "Xem sạp & đặt món")}
          </Button>
        </div>
      </div>
    </div>
  );
}
