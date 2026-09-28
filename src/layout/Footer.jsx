import React from "react";
import "@/assets/styles/layout/Footer.css";
import { useLanguage } from "@/context";

export default function Footer({ onNavigate }) {
  const { isEn, t } = useLanguage();

  return (
    <footer className="ml-footer">
      <div className="ml-footer-badges">
        <div className="ml-container ml-badges-grid">
          <div className="ml-badge-card">
            <span className="ml-badge-icon">🌱</span>
            <div>
              <div className="ml-badge-card-title">
                {isEn ? "100% Morning Harvest" : "100% Thu hoạch sớm"}
              </div>
              <div className="ml-badge-card-desc">
                {isEn
                  ? "Fresh produce harvested at dawn and delivered straight to market"
                  : "Nông sản tươi rói từ vườn đem ra sạp chợ sáng"}
              </div>
            </div>
          </div>
          <div className="ml-badge-card">
            <span className="ml-badge-icon">🧺</span>
            <div>
              <div className="ml-badge-card-title">
                {isEn ? "Pre-order - Reserve Freshness" : "Đặt trước - Giữ món ngon"}
              </div>
              <div className="ml-badge-card-desc">
                {isEn
                  ? "No sellout stress, stalls package and hold your favorites"
                  : "Không lo cháy hàng, sạp giữ sẵn phần cho bạn"}
              </div>
            </div>
          </div>
          <div className="ml-badge-card">
            <span className="ml-badge-icon">🤝</span>
            <div>
              <div className="ml-badge-card-title">
                {isEn ? "Support Local Farmers" : "Ủng hộ nông dân địa phương"}
              </div>
              <div className="ml-badge-card-desc">
                {isEn
                  ? "Direct trade without price-squeezing intermediate brokers"
                  : "Giao dịch trực tiếp, không qua tầng trung gian ép giá"}
              </div>
            </div>
          </div>
          <div className="ml-badge-card">
            <span className="ml-badge-icon">💵</span>
            <div>
              <div className="ml-badge-card-title">
                {isEn ? "Inspect & Pay at Stall" : "Nhận hàng rồi mới thanh toán"}
              </div>
              <div className="ml-badge-card-desc">
                {isEn
                  ? "Verify fresh quality firsthand before handing over payment"
                  : "Kiểm tra tận mắt độ tươi ngon ngay tại sạp"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ml-container ml-footer-main">
        <div className="ml-footer-grid">
          <div className="ml-footer-col ml-footer-brand-col">
            <div className="ml-brand">
              <div className="ml-brand-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M12 2a9 9 0 0 1 9 9v1a9 9 0 0 1-9 9 9 9 0 0 1-9-9v-1a9 9 0 0 1 9-9Z"
                    fill="#E8F5E9"
                    stroke="#2E7D32"
                  />
                  <path d="M12 21V11" stroke="#1B5E20" />
                </svg>
              </div>
              <div className="ml-brand-text">
                <span className="ml-brand-title">
                  Market<span className="ml-brand-title-accent">Link</span>
                </span>
                <span className="ml-brand-tagline">
                  {t("brandTaglineLong", "Nông sản sạch từ vườn đến chợ")}
                </span>
              </div>
            </div>
            <p className="ml-footer-desc">
              {t(
                "footerDesc",
                "MarketLink là nền tảng số hóa chợ nông sản địa phương, kết nối những người nông dân tâm huyết với cư dân đô thị, mang lại bữa ăn lành mạnh và giữ trọn nét đẹp văn hóa chợ phiên truyền thống."
              )}
            </p>
            <div className="ml-footer-meta">
              <span>📍 {t("footerHeadquarters", "Trụ sở: Tòa nhà TechWiz, Hà Nội")}</span>
              <span>✉️ lienhe@marketlink.vn</span>
            </div>
          </div>

          <div className="ml-footer-col">
            <h4 className="ml-footer-heading">
              {t("footerHeadCustomer", "Dành cho khách hàng")}
            </h4>
            <ul className="ml-footer-links">
              <li>
                <button type="button" onClick={() => onNavigate("markets")}>
                  {t("footerLinkFindMarket", "Tìm chợ nông sản gần đây")}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("products")}>
                  {t("footerLinkOrganicVeg", "Rau củ hữu cơ theo mùa")}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("home")}>
                  {t("footerLinkHowItWorks", "Cách thức đặt trước & nhận tại sạp")}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("farmers")}>
                  {t("footerLinkStallList", "Danh sách sạp nông dân uy tín")}
                </button>
              </li>
            </ul>
          </div>

          <div className="ml-footer-col">
            <h4 className="ml-footer-heading">
              {t("footerHeadFarmer", "Dành cho nông dân")}
            </h4>
            <ul className="ml-footer-links">
              <li>
                <button type="button" onClick={() => onNavigate("farmers")}>
                  {t("footerLinkRegisterStall", "Đăng ký mở sạp bán tại chợ")}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("home")}>
                  {t("footerLinkVerification", "Quy trình xác thực nông sản sạch")}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("home")}>
                  {t("footerLinkSupport", "Chính sách hỗ trợ nông hộ nhỏ lẻ")}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("home")}>
                  {t("footerLinkCalendar", "Lịch đăng ký chợ phiên cuối tuần")}
                </button>
              </li>
            </ul>
          </div>

          <div className="ml-footer-col">
            <h4 className="ml-footer-heading">
              {t("footerHeadMarkets", "Chợ phiên nổi bật")}
            </h4>
            <div className="ml-footer-tag-cloud">
              <span className="ml-footer-tag">
                {isEn ? "Yen Hoa Market" : "Chợ Phiên Yên Hòa"}
              </span>
              <span className="ml-footer-tag">
                {isEn ? "Thao Dien EcoMarket" : "Chợ Xanh Thảo Điền"}
              </span>
              <span className="ml-footer-tag">
                {isEn ? "Tay Ho Farmers Fair" : "Chợ Nông Sản Tây Hồ"}
              </span>
              <span className="ml-footer-tag">
                {isEn ? "Ba Vi Early Market" : "Chợ Sớm Ba Vì"}
              </span>
              <span className="ml-footer-tag">
                {isEn ? "Night Farm Market" : "Chợ Đêm Nông Sản"}
              </span>
            </div>
          </div>
        </div>

        <div className="ml-footer-bottom">
          <p>
            {t(
              "footerCopyright",
              "© 2026 MarketLink Platform. Dự án số hóa nông sản TechWiz 7. Bảo lưu mọi quyền."
            )}
          </p>
          <div className="ml-footer-bottom-links">
            <a href="#privacy">{t("footerPrivacy", "Chính sách bảo mật")}</a>
            <a href="#terms">{t("footerTerms", "Điều khoản sử dụng")}</a>
            <a
              href="http://172.16.2.89:8081/swagger-ui/index.html"
              target="_blank"
              rel="noopener noreferrer"
              title="Swagger UI API Documentation"
            >
              API Doc (Swagger)
            </a>
            <a href="#contact">{t("footerContact", "Liên hệ hỗ trợ")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
