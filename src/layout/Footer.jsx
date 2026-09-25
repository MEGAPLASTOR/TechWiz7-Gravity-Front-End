import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck, ChevronRight, Store, ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '@/constants/appConfig';
import { PATHS } from '@/routes/paths';

export const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="container footer-inner">
        <div className="footer-grid">
          {/* Column 1: Brand & Identity */}
          <div>
            <Link to={PATHS.HOME} className="footer-brand-wrap">
              <div className="footer-brand-logo">🌱</div>
              <span className="footer-brand-title">{APP_CONFIG.APP_NAME}</span>
            </Link>
            <div className="footer-tagline">
              Nông Sản Thật Từ Vườn • Nhận Tại Sạp Chợ Phiên
            </div>
            <p className="footer-desc">
              Hệ thống đặt trước nông sản địa phương (Pre-order & Pay-at-pickup). Trực tiếp kết nối người tiêu dùng đô thị với bà con nông dân và hợp tác xã bản địa đạt chuẩn an toàn thực phẩm.
            </p>
            <div className="footer-badge-wrap">
              <span className="footer-badge footer-badge-green">
                <ShieldCheck size={13} />
                <span>Chuẩn VietGAP & GlobalGAP</span>
              </span>
              <span className="footer-badge footer-badge-orange">
                <Store size={13} />
                <span>Thanh Toán Khi Nhận Hàng</span>
              </span>
            </div>
          </div>

          {/* Column 2: Khám Phá & Điểm Chợ */}
          <div>
            <h4 className="footer-col-title">
              <span className="footer-col-title-bar"></span>
              <span>Khám Phá & Đặt Hàng</span>
            </h4>
            <ul className="footer-links-list">
              <li>
                <Link to={PATHS.HOME} className="footer-link-item">
                  <ChevronRight size={14} color="#10b981" />
                  <span>Tất Cả Nông Sản Tươi</span>
                </Link>
              </li>
              <li>
                <Link to={PATHS.MARKETS} className="footer-link-item">
                  <ChevronRight size={14} color="#10b981" />
                  <span>Bản Đồ Điểm Chợ Phiên</span>
                </Link>
              </li>
              <li>
                <Link to={PATHS.CUSTOMER.ORDERS} className="footer-link-item">
                  <ChevronRight size={14} color="#10b981" />
                  <span>Tra Cứu Đơn Đặt Trước</span>
                </Link>
              </li>
              <li>
                <Link to={PATHS.CUSTOMER.FAVORITES} className="footer-link-item">
                  <ChevronRight size={14} color="#10b981" />
                  <span>Nông Sản Yêu Thích</span>
                </Link>
              </li>
              <li>
                <Link to={PATHS.CUSTOMER.PROFILE} className="footer-link-item">
                  <ChevronRight size={14} color="#10b981" />
                  <span>Nhóm Nhận Hàng Gia Đình</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Dành Cho Nông Dân */}
          <div>
            <h4 className="footer-col-title">
              <span className="footer-col-title-bar"></span>
              <span>Dành Cho Nhà Vườn</span>
            </h4>
            <ul className="footer-links-list">
              <li>
                <Link to={PATHS.FARMER.DASHBOARD} className="footer-link-item">
                  <ChevronRight size={14} color="#10b981" />
                  <span>Kênh Bán Hàng Nông Dân</span>
                </Link>
              </li>
              <li>
                <Link to={PATHS.FARMER.KYC} className="footer-link-item">
                  <ChevronRight size={14} color="#10b981" />
                  <span>Đăng Ký & Xác Minh KYC</span>
                </Link>
              </li>
              <li>
                <Link to={PATHS.FARMER.PRODUCTS} className="footer-link-item">
                  <ChevronRight size={14} color="#10b981" />
                  <span>Quản Lý Sản Phẩm & Giá Bán</span>
                </Link>
              </li>
              <li>
                <Link to={PATHS.FARMER.SLOTS} className="footer-link-item">
                  <ChevronRight size={14} color="#10b981" />
                  <span>Cài Đặt Khung Giờ Nhận (Slots)</span>
                </Link>
              </li>
              <li>
                <Link to={PATHS.FARMER.ORDERS} className="footer-link-item">
                  <ChevronRight size={14} color="#10b981" />
                  <span>Tiếp Nhận Đơn Hàng Cuối Tuần</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Liên Hệ & Điểm Hẹn */}
          <div>
            <h4 className="footer-col-title">
              <span className="footer-col-title-bar"></span>
              <span>Liên Hệ & Hỗ Trợ</span>
            </h4>
            <div className="footer-contact-list">
              <div className="footer-contact-row">
                <div className="footer-contact-icon">
                  <Phone size={14} />
                </div>
                <div className="footer-contact-text">
                  <div>Hotline Hỗ Trợ: <strong>{APP_CONFIG.SUPPORT_PHONE}</strong></div>
                  <small style={{ color: '#64748b' }}>Hỗ trợ 06:00 - 21:00 hàng ngày</small>
                </div>
              </div>

              <div className="footer-contact-row">
                <div className="footer-contact-icon">
                  <Mail size={14} />
                </div>
                <div className="footer-contact-text">
                  <div>Email: <strong>{APP_CONFIG.SUPPORT_EMAIL}</strong></div>
                  <small style={{ color: '#64748b' }}>Tiếp nhận phản hồi chất lượng</small>
                </div>
              </div>

              <div className="footer-contact-row">
                <div className="footer-contact-icon">
                  <MapPin size={14} />
                </div>
                <div className="footer-contact-text">
                  <div>Điểm Chợ: <strong>Hà Nội & TP. Hồ Chí Minh</strong></div>
                  <small style={{ color: '#64748b' }}>Cầu Giấy, Tây Hồ, Thảo Điền, Phú Mỹ Hưng</small>
                </div>
              </div>

              <div className="footer-contact-row">
                <div className="footer-contact-icon">
                  <Clock size={14} />
                </div>
                <div className="footer-contact-text">
                  <div>Thời Gian Họp Chợ: <strong>Thứ Bảy & Chủ Nhật</strong></div>
                  <small style={{ color: '#64748b' }}>Mở sạp: 06:00 sáng đến 12:00 trưa</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-divider"></div>

        <div className="footer-bottom-row">
          <div>
            © 2026 <strong>MarketLink</strong> - Nền Tảng Đặt Trước Nông Sản Điểm Chợ. TechWiz 7 World Tech Championship.
          </div>
          <div className="footer-bottom-legal">
            <Link to={PATHS.HOME}>Trang Chủ</Link>
            <span>•</span>
            <Link to={PATHS.MARKETS}>Điểm Chợ Phiên</Link>
            <span>•</span>
            <Link to={PATHS.CUSTOMER.ORDERS}>Đơn Đặt Trước</Link>
            <span>•</span>
            <Link to={PATHS.FARMER.DASHBOARD}>Kênh Nhà Vườn</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
