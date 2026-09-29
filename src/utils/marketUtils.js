/**
 * Helper utilities for Farmers Markets
 * Calculates real-time operating status based on market schedules and current time
 */

/**
 * Calculates current market operating status
 * @param {Object} market - The market object (with status, schedules, operatingDays, operatingHours)
 * @param {boolean} isEn - English mode flag
 * @returns {Object} Operating status information
 */
export function getMarketOperatingStatus(market = {}, isEn = false) {
  if (!market) {
    return {
      isOpen: false,
      isActive: false,
      code: "UNKNOWN",
      statusLabel: isEn ? "Unknown" : "Chưa xác định",
      badgeText: isEn ? "Unknown" : "Chưa xác định",
      badgeVariant: "neutral",
      detailText: "",
      platformStatusText: isEn ? "Inactive" : "Không hoạt động",
    };
  }

  const rawStatus = (market.status || "ACTIVE").toUpperCase();
  const isPlatformActive = rawStatus === "ACTIVE" || rawStatus === "APPROVED";

  // If market is administratively inactive/paused/suspended
  if (!isPlatformActive) {
    return {
      isOpen: false,
      isActive: false,
      code: "INACTIVE",
      statusLabel: isEn ? "Temporarily Paused" : "Tạm dừng hoạt động",
      badgeText: isEn ? "🔴 Paused" : "🔴 Tạm dừng",
      badgeVariant: "cancelled",
      detailText: isEn
        ? "This farmers market is temporarily paused"
        : "Điểm chợ này hiện đang tạm dừng hoạt động",
      platformStatusText: isEn ? "🔴 Inactive / Paused" : "🔴 Tạm dừng hoạt động",
    };
  }

  // Market is active on the platform. Now check real-time schedule open/close status.
  const now = new Date();
  const jsDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Normalize schedules if available
  const schedules = Array.isArray(market.schedules) ? market.schedules : [];
  
  if (schedules.length > 0) {
    // Schedule dayOfWeek representation can be 1 (Mon) - 7 (Sun), or 0 (Sun) - 6 (Sat)
    const targetDays = jsDay === 0 ? [7, 0] : [jsDay];
    const todaySched = schedules.find((s) => targetDays.includes(parseInt(s.dayOfWeek, 10)));

    if (todaySched && todaySched.openTime && todaySched.closeTime) {
      const openParts = todaySched.openTime.split(":").map(Number);
      const closeParts = todaySched.closeTime.split(":").map(Number);
      const openMinutes = openParts[0] * 60 + (openParts[1] || 0);
      const closeMinutes = closeParts[0] * 60 + (closeParts[1] || 0);

      const openStr = todaySched.openTime.substring(0, 5);
      const closeStr = todaySched.closeTime.substring(0, 5);

      if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
        return {
          isOpen: true,
          isActive: true,
          code: "OPEN_NOW",
          statusLabel: isEn ? "Open Now" : "Đang mở cửa",
          badgeText: isEn ? "🟢 Open Now" : "🟢 Đang mở cửa",
          badgeVariant: "ready",
          detailText: isEn
            ? `Open until ${closeStr} today`
            : `Đang đón khách (Đến ${closeStr} hôm nay)`,
          platformStatusText: isEn ? "🟢 Operating" : "🟢 Đang hoạt động",
        };
      } else if (currentMinutes < openMinutes) {
        return {
          isOpen: false,
          isActive: true,
          code: "OPENS_SOON",
          statusLabel: isEn ? "Opens Soon" : "Sắp mở cửa",
          badgeText: isEn ? `🟡 Opens at ${openStr}` : `🟡 Mở lúc ${openStr}`,
          badgeVariant: "pending",
          detailText: isEn
            ? `Opens at ${openStr} today (${openStr} - ${closeStr})`
            : `Sắp mở phiên lúc ${openStr} hôm nay (${openStr} - ${closeStr})`,
          platformStatusText: isEn ? "🟢 Operating" : "🟢 Đang hoạt động",
        };
      } else {
        return {
          isOpen: false,
          isActive: true,
          code: "CLOSED_TODAY",
          statusLabel: isEn ? "Closed for today" : "Đã đóng cửa hôm nay",
          badgeText: isEn ? "⚪ Closed" : "⚪ Đã đóng cửa",
          badgeVariant: "neutral",
          detailText: isEn
            ? `Today's session ended at ${closeStr}`
            : `Phiên chợ hôm nay đã kết thúc lúc ${closeStr}`,
          platformStatusText: isEn ? "🟢 Operating" : "🟢 Đang hoạt động",
        };
      }
    } else {
      // Not scheduled for today
      return {
        isOpen: false,
        isActive: true,
        code: "CLOSED_TODAY",
        statusLabel: isEn ? "Closed Today" : "Nghỉ hôm nay",
        badgeText: isEn ? "⚪ Closed Today" : "⚪ Nghỉ hôm nay",
        badgeVariant: "neutral",
        detailText: isEn
          ? `Operating days: ${market.operatingDays || "Weekend sessions"}`
          : `Lịch họp: ${market.operatingDays || "Họp phiên định kỳ"}`,
        platformStatusText: isEn ? "🟢 Operating" : "🟢 Đang hoạt động",
      };
    }
  }

  // Fallback to text parsing of operatingDays and operatingHours
  const opDays = (market.operatingDays || "").toLowerCase();
  const opHours = market.operatingHours || "";

  const dayMatches = {
    0: ["chủ nhật", "chu nhat", "cn", "sunday", "sun", "hàng ngày", "hang ngay", "daily", "cuối tuần", "cuoi tuan", "weekend"],
    1: ["thứ 2", "thu 2", "thứ hai", "thu hai", "t2", "monday", "mon", "hàng ngày", "hang ngay", "daily"],
    2: ["thứ 3", "thu 3", "thứ ba", "thu ba", "t3", "tuesday", "tue", "hàng ngày", "hang ngay", "daily"],
    3: ["thứ 4", "thu 4", "thứ tư", "thu tu", "t4", "wednesday", "wed", "hàng ngày", "hang ngay", "daily"],
    4: ["thứ 5", "thu 5", "thứ năm", "thu nam", "t5", "thursday", "thu", "hàng ngày", "hang ngay", "daily"],
    5: ["thứ 6", "thu 6", "thứ sáu", "thu sau", "t6", "friday", "fri", "hàng ngày", "hang ngay", "daily"],
    6: ["thứ 7", "thu 7", "thứ bảy", "thu bay", "t7", "saturday", "sat", "hàng ngày", "hang ngay", "daily", "cuối tuần", "cuoi tuan", "weekend"],
  };

  const isTodayOperating = dayMatches[jsDay]?.some((kw) => opDays.includes(kw));

  if (isTodayOperating) {
    const timeMatch = opHours.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const openMinutes = parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10);
      const closeMinutes = parseInt(timeMatch[3], 10) * 60 + parseInt(timeMatch[4], 10);
      const openStr = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
      const closeStr = `${timeMatch[3].padStart(2, "0")}:${timeMatch[4]}`;

      if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
        return {
          isOpen: true,
          isActive: true,
          code: "OPEN_NOW",
          statusLabel: isEn ? "Open Now" : "Đang mở cửa",
          badgeText: isEn ? "🟢 Open Now" : "🟢 Đang mở cửa",
          badgeVariant: "ready",
          detailText: isEn
            ? `Open until ${closeStr} today`
            : `Đang đón khách (Đến ${closeStr} hôm nay)`,
          platformStatusText: isEn ? "🟢 Operating" : "🟢 Đang hoạt động",
        };
      } else if (currentMinutes < openMinutes) {
        return {
          isOpen: false,
          isActive: true,
          code: "OPENS_SOON",
          statusLabel: isEn ? "Opens Soon" : "Sắp mở cửa",
          badgeText: isEn ? `🟡 Opens at ${openStr}` : `🟡 Mở lúc ${openStr}`,
          badgeVariant: "pending",
          detailText: isEn
            ? `Opens at ${openStr} today (${openStr} - ${closeStr})`
            : `Sắp mở phiên lúc ${openStr} hôm nay (${openStr} - ${closeStr})`,
          platformStatusText: isEn ? "🟢 Operating" : "🟢 Đang hoạt động",
        };
      } else {
        return {
          isOpen: false,
          isActive: true,
          code: "CLOSED_TODAY",
          statusLabel: isEn ? "Closed for today" : "Đã đóng cửa hôm nay",
          badgeText: isEn ? "⚪ Closed" : "⚪ Đã đóng cửa",
          badgeVariant: "neutral",
          detailText: isEn
            ? `Today's session ended at ${closeStr}`
            : `Phiên chợ hôm nay đã kết thúc lúc ${closeStr}`,
          platformStatusText: isEn ? "🟢 Operating" : "🟢 Đang hoạt động",
        };
      }
    } else {
      // In operating day, no specific hours parsed
      return {
        isOpen: true,
        isActive: true,
        code: "OPEN_NOW",
        statusLabel: isEn ? "Session Today" : "Hôm nay có phiên",
        badgeText: isEn ? "🟢 Open Today" : "🟢 Đang mở hôm nay",
        badgeVariant: "ready",
        detailText: isEn
          ? `Operating today: ${opHours || "Regular hours"}`
          : `Phiên chợ hoạt động hôm nay: ${opHours || "Theo giờ phiên"}`,
        platformStatusText: isEn ? "🟢 Operating" : "🟢 Đang hoạt động",
      };
    }
  }

  // Not operating today
  return {
    isOpen: false,
    isActive: true,
    code: "CLOSED_TODAY",
    statusLabel: isEn ? "Closed Today" : "Nghỉ hôm nay",
    badgeText: isEn ? "⚪ Closed Today" : "⚪ Nghỉ hôm nay",
    badgeVariant: "neutral",
    detailText: isEn
      ? `Operating days: ${market.operatingDays || "Weekend sessions"}`
      : `Lịch họp: ${market.operatingDays || "Cuối tuần"} (${opHours || "06:00 - 11:30"})`,
    platformStatusText: isEn ? "🟢 Operating" : "🟢 Đang hoạt động",
  };
}
