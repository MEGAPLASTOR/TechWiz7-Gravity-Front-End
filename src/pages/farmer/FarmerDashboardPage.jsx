import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Clock,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';
import { farmerApi, ordersApi } from '@/services';
import { formatCurrency } from '@/utils/formatters';
import { PATHS } from '@/routes/paths';

export const FarmerDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [prodRes, ordRes, sumRes] = await Promise.allSettled([
          farmerApi.getProducts(),
          ordersApi.getFarmerOrders(),
          ordersApi.getFarmerSummary(),
        ]);

        const pList = prodRes.status === 'fulfilled' ? (Array.isArray(prodRes.value) ? prodRes.value : prodRes.value?.data || []) : [];
        const oList = ordRes.status === 'fulfilled' ? (Array.isArray(ordRes.value) ? ordRes.value : ordRes.value?.data || []) : [];
        const sData = sumRes.status === 'fulfilled' ? (sumRes.value?.data || sumRes.value) : {};

        setStats({
          totalProducts: pList.length,
          totalOrders: sData?.totalOrders || oList.length,
          pendingOrders: oList.filter((o) => o.orderStatus === 'PLACED').length,
          totalRevenue: sData?.totalRevenue || oList.reduce((acc, o) => acc + (o.totalAmount || 0), 0),
        });
      } catch (e) {
        console.error('Error loading farmer stats:', e);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <div className="farmer-stats-grid">
        <div className="farmer-stat-card">
          <span className="farmer-stat-label">Doanh Thu Dự Kiến</span>
          <div className="farmer-stat-val" style={{ color: 'var(--primary)' }}>
            {formatCurrency(stats.totalRevenue)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Thanh toán khi khách nhận tại sạp</span>
        </div>

        <div className="farmer-stat-card">
          <span className="farmer-stat-label">Đơn Chờ Tiếp Nhận</span>
          <div className="farmer-stat-val" style={{ color: '#ea580c' }}>
            {stats.pendingOrders} đơn
          </div>
          <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 700 }}>Cần xác nhận chuẩn bị</span>
        </div>

        <div className="farmer-stat-card">
          <span className="farmer-stat-label">Tổng Đơn Hàng</span>
          <div className="farmer-stat-val">
            {stats.totalOrders} đơn
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>Tất cả đơn đặt hàng</span>
        </div>

        <div className="farmer-stat-card">
          <span className="farmer-stat-label">Nông Sản Đang Quản Lý</span>
          <div className="farmer-stat-val">
            {stats.totalProducts} mặt hàng
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>Quản lý tồn kho</span>
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
        Lối Tắt Quản Trị & Nghiệp Vụ Sạp Hàng
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div
          onClick={() => navigate(PATHS.FARMER.PRODUCTS)}
          className="farmer-card-box"
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} color="var(--primary)" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>Quản Lý Nông Sản</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
            Thêm mới, sửa giá, điều chỉnh tồn kho và bật/tắt mở bán nông sản tại các phiên chợ.
          </p>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Đến trang Nông Sản</span>
            <ArrowRight size={14} />
          </div>
        </div>

        <div
          onClick={() => navigate(PATHS.FARMER.KYC)}
          className="farmer-card-box"
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck2 size={20} color="#d97706" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>Hồ Sơ KYC & VietGAP</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
            Tải lên CCCD, chứng nhận VietGAP và vệ sinh ATTP để Quản trị viên duyệt mở quyền bán hàng.
          </p>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Đến trang KYC</span>
            <ArrowRight size={14} />
          </div>
        </div>

        <div
          onClick={() => navigate(PATHS.FARMER.ORDERS)}
          className="farmer-card-box"
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} color="#2563eb" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>Điều Phối Đơn Đặt Trước</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
            Tiếp nhận đơn, đóng gói phần rau củ tươi và chuẩn bị giao cho khách theo đúng khung giờ.
          </p>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Đến trang Đơn Hàng</span>
            <ArrowRight size={14} />
          </div>
        </div>

        <div
          onClick={() => navigate(PATHS.FARMER.SLOTS)}
          className="farmer-card-box"
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="var(--text-main)" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>Khung Giờ Đón Khách</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
            Cấu hình thời hạn chốt đơn trước giờ họp chợ và tạo các khung giờ đón khách tại sạp.
          </p>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Đến trang Khung Giờ</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
