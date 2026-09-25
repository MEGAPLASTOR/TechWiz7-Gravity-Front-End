import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Store,
  FileCheck2,
  Package,
  ShoppingBag,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { farmerService } from '@/services/farmer.service';
import { PATHS } from '@/routes/paths';

export const FarmerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [kycData, setKycData] = useState({
    isApproved: false,
    kycStatus: 'UNVERIFIED',
    latestRemark: '',
  });
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  useEffect(() => {
    async function fetchKyc() {
      try {
        const res = await farmerService.getMyKyc();
        const data = res?.data || res;
        if (data) {
          setKycData({
            isApproved: Boolean(data.isApproved),
            kycStatus: data.kycStatus || 'UNVERIFIED',
            latestRemark: data.latestRemark || '',
          });
        }
      } catch {
        // Handled silently
      }
    }
    fetchKyc();
  }, [location.pathname]);

  const navItems = [
    { to: PATHS.FARMER.DASHBOARD, label: 'Tổng Quan Sạp', icon: Store },
    { to: PATHS.FARMER.KYC, label: 'Hồ Sơ KYC & VietGAP', icon: FileCheck2 },
    { to: PATHS.FARMER.PRODUCTS, label: 'Nông Sản & Tồn Kho', icon: Package },
    { to: PATHS.FARMER.ORDERS, label: 'Đơn Đặt Trước', icon: ShoppingBag },
    { to: PATHS.FARMER.SLOTS, label: 'Khung Giờ & Giờ Chốt', icon: Clock },
  ];

  return (
    <div className="container farmer-container">
      <div className="farmer-header">
        <div>
          <div className="farmer-badge">
            <span>🌱 Cổng Quản Trị Sạp Nông Dân</span>
            <span className="farmer-api-pill">
              Hệ thống quản lý sạp hàng
            </span>
          </div>
          <h1 className="farmer-title">
            Quản Lý Gian Hàng & Định Danh KYC
          </h1>
          <p className="farmer-desc">
            Theo dõi kiểm duyệt giấy tờ VietGAP, quản lý sản phẩm, đơn đặt trước và khung giờ đón khách
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            id="btn-farmer-layout-to-customer"
            type="button"
            onClick={() => navigate(PATHS.CUSTOMER.ORDERS)}
            className="btn btn-secondary"
            style={{
              borderColor: 'rgba(16, 185, 129, 0.4)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--primary-light)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
            }}
          >
            <ShoppingBag size={18} />
            <span>Quay Lại Trang Khách Hàng</span>
          </button>

          <button onClick={() => setShowSecurityModal(true)} className="btn btn-secondary">
            <HelpCircle size={16} />
            <span>Hướng Dẫn Xác Minh Danh Tính</span>
          </button>
        </div>
      </div>

      <div
        className={`kyc-banner ${
          kycData.isApproved
            ? 'kyc-banner-verified'
            : kycData.kycStatus === 'PENDING'
            ? 'kyc-banner-pending'
            : kycData.kycStatus === 'REJECTED'
            ? 'kyc-banner-rejected'
            : 'kyc-banner-unverified'
        }`}
        style={{ marginBottom: '20px' }}
      >
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
          {kycData.isApproved ? (
            <CheckCircle2 size={24} color="#16a34a" />
          ) : kycData.kycStatus === 'PENDING' ? (
            <Clock3 size={24} color="#2563eb" />
          ) : kycData.kycStatus === 'REJECTED' ? (
            <XCircle size={24} color="#dc2626" />
          ) : (
            <AlertCircle size={24} color="#d97706" />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>
              {kycData.isApproved
                ? '✓ ĐÃ PHÊ DUYỆT KYC: Toàn quyền đăng bán nông sản'
                : kycData.kycStatus === 'PENDING'
                ? '⏳ HỒ SƠ ĐANG CHỜ QUẢN TRỊ VIÊN PHÊ DUYỆT'
                : kycData.kycStatus === 'REJECTED'
                ? '❌ HỒ SƠ BỊ TỪ CHỐI / CẦN SỬA ĐỔI'
                : '⚠️ TÀI KHOẢN CHƯA NỘP KYC - QUYỀN BÁN HÀNG ĐANG BỊ KHÓA'}
            </span>
            <span
              className={`kyc-badge ${
                kycData.isApproved
                  ? 'kyc-badge-verified'
                  : kycData.kycStatus === 'PENDING'
                  ? 'kyc-badge-pending'
                  : kycData.kycStatus === 'REJECTED'
                  ? 'kyc-badge-rejected'
                  : 'kyc-badge-unverified'
              }`}
            >
              Trạng thái: {kycData.isApproved ? 'Đã phê duyệt' : kycData.kycStatus === 'PENDING' ? 'Đang chờ duyệt' : 'Chưa xác minh'}
            </span>
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            {kycData.isApproved
              ? 'Tài khoản đã được Admin thẩm định thành công. Bạn có thể thêm sản phẩm, cập nhật tồn kho và mở bán tại các phiên chợ.'
              : kycData.kycStatus === 'PENDING'
              ? 'Hồ sơ của bạn đã được gửi đi và đang chờ Quản trị viên phê duyệt. Chức năng đăng bán sẽ được mở sau khi hồ sơ được duyệt.'
              : kycData.kycStatus === 'REJECTED'
              ? `Lý do phản hồi: "${kycData.latestRemark || 'Chưa cung cấp'}". Vui lòng vào tab Hồ Sơ KYC để nộp lại giấy tờ.`
              : 'Tài khoản của bạn chưa hoàn tất xác minh danh tính. Vui lòng nộp CCCD và chứng nhận VietGAP tại tab Hồ Sơ KYC.'}
          </div>
        </div>
      </div>

      <nav className="farmer-subnav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `farmer-subnav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {showSecurityModal && (
        <div className="kyc-modal-overlay" onClick={() => setShowSecurityModal(false)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Quy Trình Xác Minh Danh Tính Nông Dân
                </h3>
              </div>
              <button
                onClick={() => setShowSecurityModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <table className="kyc-rule-table">
              <thead>
                <tr>
                  <th>Hạng Mục</th>
                  <th>Trạng Thái</th>
                  <th>Giá Trị Hiện Tại</th>
                  <th>Ý Nghĩa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Quyền bán hàng</td>
                  <td>Phê duyệt kinh doanh</td>
                  <td><span style={{ color: '#dc2626', fontWeight: 700 }}>Chưa được cấp</span></td>
                  <td>Khóa toàn bộ quyền đăng bán. Không thể thêm sản phẩm.</td>
                </tr>
                <tr>
                  <td>Xác minh danh tính</td>
                  <td>Trạng thái hồ sơ</td>
                  <td><span style={{ color: '#d97706', fontWeight: 700 }}>Chưa xác minh / Đang chờ</span></td>
                  <td>Hồ sơ chưa được thẩm định hoặc đang chờ duyệt.</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: '16px', padding: '14px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                ✓ Nông dân ĐƯỢC LÀM khi chưa duyệt:
              </div>
              <div>• Đăng nhập vào hệ thống.</div>
              <div>• Xem và chỉnh sửa thông tin sạp hàng của mình.</div>
              <div>• Tải lên/Cập nhật chứng chỉ KYC (VietGAP, ATTP, CCCD).</div>
              <div>• Xem danh sách chợ nông sản.</div>

              <div style={{ fontWeight: 700, color: '#dc2626', marginTop: '10px', marginBottom: '4px' }}>
                ✗ Nông dân KHÔNG THỂ thực hiện khi chưa được duyệt:
              </div>
              <div>• Không thể đăng bán sản phẩm lên sàn.</div>
              <div>• Không thể tạo khung giờ nhận hàng.</div>
              <div>• Khách hàng không thể đặt hàng.</div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={() => setShowSecurityModal(false)} className="btn btn-primary">
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default FarmerLayout;
