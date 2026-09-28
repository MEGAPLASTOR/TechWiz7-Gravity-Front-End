import React, { useState, useEffect, useMemo } from "react";
import "@/assets/styles/pages/AnnouncementsPage.css";
import announcementService from "../services/announcementService";
import { useLanguage } from "../context/LanguageContext";

const TYPE_LABELS = {
  GENERAL: { vi: "Thông báo chung", en: "General Notice", icon: "📢", color: "#2e7d32" },
  EVENT: { vi: "Sự kiện", en: "Platform Event", icon: "🎉", color: "#1565c0" },
  MAINTENANCE: { vi: "Bảo trì hệ thống", en: "Maintenance", icon: "🔧", color: "#e65100" },
  MARKET: { vi: "Chợ phiên", en: "Market Schedule", icon: "🏪", color: "#4a148c" },
};

const PRIORITY_LABELS = {
  HIGH: { vi: "Quan trọng", en: "Important", color: "#c62828" },
  NORMAL: { vi: "Thông thường", en: "Normal", color: "#37474f" },
  LOW: { vi: "Thấp", en: "Low", color: "#78909c" },
};

const DEFAULT_ANNOUNCEMENTS = [
  {
    announcementId: "ann-1",
    title: "Thông báo lịch họp chợ phiên cuối tuần tại Ba Đình",
    titleEn: "Ba Dinh Weekend Farmers' Market Schedule Notice",
    content: "Ban quản lý chợ xin thông báo: Phiên chợ nông sản Ba Đình sẽ họp từ 06:00 đến 12:00 thứ Bảy và Chủ Nhật tuần này. Kính mời quý khách đặt trước nông sản từ hôm nay để các nhà vườn chuẩn bị phần rau củ tươi ngon nhất.",
    contentEn: "Market Management Announcement: The Ba Dinh Farmers' Market will take place from 06:00 to 12:00 this Saturday and Sunday. Customers are encouraged to pre-order fresh produce in advance so that family farms can harvest and prepare your orders fresh.",
    type: "MARKET",
    priority: "HIGH",
    targetRole: "ALL",
    adminName: "MarketLink Admin",
    publishedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    announcementId: "ann-2",
    title: "Khởi động mùa vụ Nông sản Hè 2026",
    titleEn: "Launch of Summer 2026 Fresh Produce Season",
    content: "Mùa vụ hè đã chính thức bắt đầu với nhiều loại trái cây và rau hữu cơ đặc sản từ Mộc Châu, Đà Lạt và Ba Vì. Khám phá ngay các ưu đãi đặc quyền cho đơn đặt trước số lượng lớn!",
    contentEn: "The summer harvest season has officially begun featuring crisp local fruits and organic vegetables from Moc Chau, Da Lat, and Ba Vi. Explore exclusive perks for pre-orders now!",
    type: "EVENT",
    priority: "NORMAL",
    targetRole: "CUSTOMER",
    adminName: "Ban Quản Trị MarketLink",
    publishedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
  {
    announcementId: "ann-3",
    title: "Kế hoạch bảo trì hệ thống định kỳ",
    titleEn: "Scheduled Platform Maintenance Notice",
    content: "Hệ thống MarketLink sẽ tiến hành nâng cấp hạ tầng vào lúc 00:00 - 02:00 sáng Thứ Hai. Trong khoảng thời gian này, các tính năng đặt hàng có thể bị gián đoạn tạm thời. Rất mong quý khách và quý nông hộ thông cảm.",
    contentEn: "MarketLink system will perform routine server upgrades between 00:00 - 02:00 AM on Monday. Pre-ordering features may be momentarily unavailable during this period. We appreciate your patience and understanding.",
    type: "MAINTENANCE",
    priority: "NORMAL",
    targetRole: "ALL",
    adminName: "Kỹ Thuật Hệ Thống",
    publishedAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
  },
  {
    announcementId: "ann-4",
    title: "Quy định mới về đóng gói & kiểm định VietGAP",
    titleEn: "Updated Guidelines on Packaging & VietGAP Standards",
    content: "Để nâng cao trải nghiệm khách hàng tại phiên chợ, đề nghị các chủ sạp tuân thủ dán nhãn thông tin nhà vườn, ngày thu hái và đóng gói bao bì sinh học thân thiện với môi trường.",
    contentEn: "To enhance customer experience at weekend markets, stall owners are requested to adhere to farm labeling, harvest date disclosures, and eco-friendly biodegradable packaging.",
    type: "GENERAL",
    priority: "HIGH",
    targetRole: "FARMER",
    adminName: "Thẩm Định Chất Lượng",
    publishedAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
  },
];

function formatDate(dateStr, isEn) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString(isEn ? "en-US" : "vi-VN", {
      day: "2-digit",
      month: isEn ? "short" : "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function AnnouncementsPage({ onNavigate, currentRole }) {
  const { isEn } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await announcementService.getActiveAnnouncements();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setAnnouncements(data);
          } else {
            setAnnouncements(DEFAULT_ANNOUNCEMENTS);
          }
        }
      } catch (err) {
        console.warn("Failed to load announcements, using defaults:", err);
        if (isMounted) setAnnouncements(DEFAULT_ANNOUNCEMENTS);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const localizedList = useMemo(() => {
    return announcements.map((a) => {
      const title = isEn ? (a.titleEn || a.title) : a.title;
      const content = isEn ? (a.contentEn || a.content) : a.content;
      return {
        ...a,
        displayTitle: title,
        displayContent: content,
      };
    });
  }, [announcements, isEn]);

  const filtered = useMemo(() => {
    let list = [...localizedList];
    if (activeType !== "ALL") {
      list = list.filter((a) => a.type === activeType);
    }
    if (searchTerm.trim()) {
      const kw = searchTerm.trim().toLowerCase();
      list = list.filter(
        (a) =>
          (a.displayTitle || "").toLowerCase().includes(kw) ||
          (a.displayContent || "").toLowerCase().includes(kw),
      );
    }
    return list;
  }, [localizedList, activeType, searchTerm]);

  const typeOptions = [
    { key: "ALL", labelVi: "Tất cả", labelEn: "All", icon: "🗂️" },
    { key: "MARKET", labelVi: "Chợ phiên", labelEn: "Markets", icon: "🏪" },
    { key: "EVENT", labelVi: "Sự kiện", labelEn: "Events", icon: "🎉" },
    { key: "MAINTENANCE", labelVi: "Bảo trì", labelEn: "Maintenance", icon: "🔧" },
    { key: "GENERAL", labelVi: "Chung", labelEn: "General", icon: "📢" },
  ];

  return (
    <div className="ml-announcements-page">
      {/* Banner */}
      <div className="ml-announcements-banner">
        <div className="ml-container ml-announcements-banner-inner">
          <div>
            <span className="ml-section-subtitle">
              {isEn ? "Platform News & Updates" : "Tin tức & Thông báo Nền tảng"}
            </span>
            <h1 className="ml-announcements-title">
              {isEn ? "Announcements Board" : "Bảng Tin MarketLink"}
            </h1>
            <p className="ml-announcements-desc">
              {isEn
                ? "Stay updated with market schedules, platform events, and official notices from MarketLink."
                : "Cập nhật lịch chợ phiên, sự kiện và thông báo chính thức từ nền tảng MarketLink."}
            </p>
          </div>
          <div className="ml-announcements-banner-meta">
            <span className="ml-announcements-count-badge">
              📋 {announcements.length} {isEn ? "active notices" : "thông báo đang hiệu lực"}
            </span>
          </div>
        </div>
      </div>

      <div className="ml-container ml-announcements-content">
        {/* Filter bar */}
        <div className="ml-announcements-controls">
          <div className="ml-announcements-type-tabs">
            {typeOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`ml-announcements-tab ${activeType === opt.key ? "active" : ""}`}
                onClick={() => setActiveType(opt.key)}
              >
                {opt.icon} {isEn ? opt.labelEn : opt.labelVi}
                {opt.key !== "ALL" && (
                  <span className="ml-announcements-tab-count">
                    {announcements.filter((a) => a.type === opt.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="ml-announcements-search-wrap">
            <span className="ml-announcements-search-icon">🔍</span>
            <input
              id="ml-announcements-search"
              className="ml-announcements-search"
              type="text"
              placeholder={isEn ? "Search announcements…" : "Tìm kiếm thông báo…"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="ml-announcements-search-clear"
                onClick={() => setSearchTerm("")}
                aria-label={isEn ? "Clear search" : "Xóa tìm kiếm"}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="ml-announcements-loading">
            <span className="ml-announcements-spinner" />
            <p>{isEn ? "Loading announcements…" : "Đang tải bảng tin…"}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ml-announcements-empty">
            <span className="ml-announcements-empty-icon">📭</span>
            <p>
              {isEn
                ? "No announcements found matching your search."
                : "Không tìm thấy thông báo nào phù hợp."}
            </p>
            {searchTerm && (
              <button
                type="button"
                className="ml-btn ml-btn--outline ml-btn--sm"
                onClick={() => setSearchTerm("")}
              >
                {isEn ? "Clear search" : "Xóa tìm kiếm"}
              </button>
            )}
          </div>
        ) : (
          <div className="ml-announcements-list">
            {filtered.map((ann) => {
              const typeInfo = TYPE_LABELS[ann.type] || TYPE_LABELS.GENERAL;
              const isHighPriority = ann.priority === "HIGH";
              return (
                <article
                  key={ann.announcementId}
                  className={`ml-announcement-card ${isHighPriority ? "ml-announcement-card--high" : ""}`}
                  onClick={() => setSelectedAnnouncement(ann)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedAnnouncement(ann)}
                >
                  <div className="ml-announcement-card-header">
                    <div className="ml-announcement-badges">
                      <span
                        className="ml-announcement-type-badge"
                        style={{ background: `${typeInfo.color}18`, color: typeInfo.color, borderColor: `${typeInfo.color}33` }}
                      >
                        {typeInfo.icon} {isEn ? typeInfo.en : typeInfo.vi}
                      </span>
                      {isHighPriority && (
                        <span className="ml-announcement-priority-badge">
                          🔴 {isEn ? "Important" : "Quan trọng"}
                        </span>
                      )}
                      {ann.targetRole && ann.targetRole !== "ALL" && (
                        <span className="ml-announcement-role-badge">
                          {ann.targetRole === "FARMER"
                            ? (isEn ? "👨‍🌾 Farmers" : "👨‍🌾 Nông dân")
                            : (isEn ? "🛒 Customers" : "🛒 Khách hàng")}
                        </span>
                      )}
                    </div>
                    <span className="ml-announcement-date">
                      🕐 {formatDate(ann.publishedAt || ann.createdAt, isEn)}
                    </span>
                  </div>

                  <h2 className="ml-announcement-title">{ann.displayTitle}</h2>
                  <p className="ml-announcement-preview">
                    {(ann.displayContent || "").length > 160
                      ? (ann.displayContent || "").substring(0, 160) + "…"
                      : ann.displayContent}
                  </p>

                  <div className="ml-announcement-card-footer">
                    <span className="ml-announcement-author">
                      🛡️ {isEn ? (ann.adminName ? (ann.adminName.includes("MarketLink") ? ann.adminName : "MarketLink Administrator") : "MarketLink Administrator") : (ann.adminName || "Quản trị viên MarketLink")}
                    </span>
                    <button
                      type="button"
                      className="ml-announcement-read-more"
                      onClick={(e) => { e.stopPropagation(); setSelectedAnnouncement(ann); }}
                    >
                      {isEn ? "Read more →" : "Xem chi tiết →"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAnnouncement && (
        <div
          className="ml-announcement-modal-overlay"
          onClick={() => setSelectedAnnouncement(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedAnnouncement.displayTitle}
        >
          <div
            className="ml-announcement-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ml-announcement-modal-header">
              <div className="ml-announcement-badges">
                {(() => {
                  const typeInfo = TYPE_LABELS[selectedAnnouncement.type] || TYPE_LABELS.GENERAL;
                  return (
                    <span
                      className="ml-announcement-type-badge"
                      style={{ background: `${typeInfo.color}18`, color: typeInfo.color, borderColor: `${typeInfo.color}33` }}
                    >
                      {typeInfo.icon} {isEn ? typeInfo.en : typeInfo.vi}
                    </span>
                  );
                })()}
                {selectedAnnouncement.priority === "HIGH" && (
                  <span className="ml-announcement-priority-badge">
                    🔴 {isEn ? "Important" : "Quan trọng"}
                  </span>
                )}
                {selectedAnnouncement.targetRole && selectedAnnouncement.targetRole !== "ALL" && (
                  <span className="ml-announcement-role-badge">
                    {selectedAnnouncement.targetRole === "FARMER"
                      ? (isEn ? "👨‍🌾 Farmers" : "👨‍🌾 Nông dân")
                      : (isEn ? "🛒 Customers" : "🛒 Khách hàng")}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="ml-announcement-modal-close"
                onClick={() => setSelectedAnnouncement(null)}
                aria-label={isEn ? "Close" : "Đóng"}
              >
                ✕
              </button>
            </div>

            <h2 className="ml-announcement-modal-title">{selectedAnnouncement.displayTitle}</h2>

            <div className="ml-announcement-modal-meta">
              <span>🛡️ {isEn ? "MarketLink Administrator" : (selectedAnnouncement.adminName || "Ban quản trị MarketLink")}</span>
              <span>🕐 {formatDate(selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt, isEn)}</span>
            </div>

            <div className="ml-announcement-modal-body">
              <p>{selectedAnnouncement.displayContent}</p>
            </div>

            <div className="ml-announcement-modal-footer">
              <button
                type="button"
                className="ml-btn ml-btn--outline ml-btn--md"
                onClick={() => setSelectedAnnouncement(null)}
              >
                {isEn ? "Close" : "Đóng"}
              </button>
              {onNavigate && (
                <button
                  type="button"
                  className="ml-btn ml-btn--primary ml-btn--md"
                  onClick={() => { setSelectedAnnouncement(null); onNavigate("markets"); }}
                >
                  {isEn ? "Explore Markets 🏪" : "Khám phá chợ phiên 🏪"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
