import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { APP_CONFIG } from '@/constants/appConfig';

export const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '26px' }}>🌱</span>
              <span className="footer-brand-title">
                {APP_CONFIG.APP_NAME}
              </span>
            </div>
            <p className="footer-desc">
              Hệ thống đặt trước nông sản địa phương (Pre-reservation & Pay-at-pickup). Kết nối trực tiếp người tiêu dùng đô thị với nông dân bản địa đạt chuẩn an toàn thực phẩm.
            </p>
            <div className="footer-badge-wrap">
              <span className="footer-badge footer-badge-green">
                ✓ VietGAP Certified
              </span>
              <span className="footer-badge footer-badge-orange">
                ✓ Pay-at-pickup
              </span>
            </div>
          </div>

          <div>
            <h4 className="footer-col-title">
              Hệ Thống Chợ Phiên
            </h4>
            <ul className="footer-links-list">
              <li>• Chợ Nông Sản Sạch Cầu Giấy (Hà Nội)</li>
              <li>• Phiên Chợ Hữu Cơ Thảo Điền EcoMarket (TP.HCM)</li>
              <li>• Hội Chợ Nông Sản Vùng Miền Tây Hồ (Hà Nội)</li>
              <li>• Chợ Phiên Nông Nghiệp Xanh Ecopark (Hưng Yên)</li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">
              Liên Hệ & Hỗ Trợ
            </h4>
            <div className="footer-contact-list">
              <div className="footer-contact-row">
                <Phone size={16} color="#4ade80" />
                <span>Hotline: {APP_CONFIG.SUPPORT_PHONE} (07:00 - 21:00)</span>
              </div>
              <div className="footer-contact-row">
                <Mail size={16} color="#4ade80" />
                <span>Email: {APP_CONFIG.SUPPORT_EMAIL}</span>
              </div>
              <div className="footer-contact-row">
                <MapPin size={16} color="#4ade80" />
                <span>Trụ sở: Cầu Giấy, Hà Nội & Quận 2, TP.HCM</span>
              </div>
              <div className="footer-contact-row">
                <Clock size={16} color="#4ade80" />
                <span>Phiên chợ: Thứ Bảy & Chủ Nhật hàng tuần</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-row">
          <div>
            © 2026 MarketLink - Theme eGreen Basket. TechWiz 7 World Tech Championship.
          </div>
          <div>
            <span>Phát triển với tinh thần nông nghiệp xanh và công nghệ 3D tương tác</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
