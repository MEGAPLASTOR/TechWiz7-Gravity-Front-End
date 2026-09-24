import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Users,
  Store,
  Megaphone,
  Database,
  ArrowRight,
} from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { marketsApi } from '@/api/markets.api';
import { PATHS } from '@/routes/paths';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingKyc: 0,
    users: 0,
    markets: 0,
    announcements: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [kycRes, userRes, mkRes, annRes] = await Promise.allSettled([
          adminApi.getPendingKyc(),
          adminApi.getUsers(),
          marketsApi.getAllMarkets(),
          adminApi.getAnnouncements(),
        ]);

        setStats({
          pendingKyc: kycRes.status === 'fulfilled' ? (Array.isArray(kycRes.value) ? kycRes.value.length : 0) : 0,
          users: userRes.status === 'fulfilled' ? (Array.isArray(userRes.value) ? userRes.value.length : 0) : 0,
          markets: mkRes.status === 'fulfilled' ? (Array.isArray(mkRes.value) ? mkRes.value.length : 0) : 0,
          announcements: annRes.status === 'fulfilled' ? (Array.isArray(annRes.value) ? annRes.value.length : 0) : 0,
        });
      } catch (e) {
        console.error('Error loading admin dashboard:', e);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hồ Sơ KYC Chờ Duyệt</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ea580c', margin: '4px 0' }}>
            {stats.pendingKyc} sạp
          </div>
          <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 700 }}>Cần xử lý</span>
        </div>

        <div className="admin-stat-card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tài Khoản Người Dùng</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
            {stats.users} tài khoản
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>Toàn hệ thống</span>
        </div>

        <div className="admin-stat-card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Điểm Chợ Hoạt Động</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>
            {stats.markets} điểm chợ
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>Đang hoạt động</span>
        </div>

        <div className="admin-stat-card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Thông Báo Toàn Sàn</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
            {stats.announcements} tin
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đã phát hành</span>
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
        Các Phân Hệ Quản Trị Nghiệp Vụ
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div
          onClick={() => navigate(PATHS.ADMIN.KYC)}
          className="admin-card-box"
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck2 size={20} color="#dc2626" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>Thẩm Định KYC Nông Dân</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
            Duyệt hồ sơ đăng ký bán hàng: Xem ảnh CCCD, chứng nhận VietGAP và kích hoạt quyền bán hàng cho nông dân.
          </p>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Đến trang Thẩm Định KYC</span>
            <ArrowRight size={14} />
          </div>
        </div>

        <div
          onClick={() => navigate(PATHS.ADMIN.USERS)}
          className="admin-card-box"
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="var(--text-main)" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>Quản Lý Người Dùng</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
            Kiểm tra trạng thái tài khoản nông dân và khách hàng, khóa hoặc mở khóa tài khoản người dùng vi phạm.
          </p>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Đến trang Người Dùng</span>
            <ArrowRight size={14} />
          </div>
        </div>

        <div
          onClick={() => navigate(PATHS.ADMIN.MARKETS)}
          className="admin-card-box"
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={20} color="var(--primary)" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>Điểm Chợ Phiên</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
            Tạo mới, chỉnh sửa tọa độ bản đồ, cập nhật lịch họp chợ và địa chỉ điểm phân phối nông sản cuối tuần.
          </p>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Đến trang Điểm Chợ</span>
            <ArrowRight size={14} />
          </div>
        </div>

        <div
          onClick={() => navigate(PATHS.ADMIN.ANNOUNCEMENTS)}
          className="admin-card-box"
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={20} color="#d97706" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>Thông Báo Toàn Sàn</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
            Phát hành các thông báo điều chỉnh khung giờ, thời tiết hoặc lưu ý họp chợ đến toàn bộ khách và nông dân.
          </p>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Đến trang Thông Báo</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      <div className="admin-card-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Database size={20} color="#dc2626" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Quy Trình Kiểm Soát & Phê Duyệt Nông Dân (4 Bước)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '6px' }}>
              1. Nông dân đăng ký tài khoản
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Nông dân tạo tài khoản và nộp các giấy tờ chứng thực như CCCD và chứng nhận VietGAP để Quản trị viên xem xét.
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '6px' }}>
              2. Quyền bán hàng bị khóa
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Trước khi được phê duyệt, nông dân không thể đăng bán sản phẩm hoặc tạo khung giờ nhận hàng.
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '6px' }}>
              3. Quản trị viên thẩm định
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Quản trị viên xem xét giấy tờ, đối chiếu thông tin và ra quyết định phê duyệt hoặc từ chối.
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '6px' }}>
              4. Khi phê duyệt thành công
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Nông dân được mở toàn quyền bán hàng, đăng sản phẩm và nhận đơn đặt hàng từ khách.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
