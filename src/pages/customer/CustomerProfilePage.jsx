import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { customerApi } from '@/api/customer.api';

export const CustomerProfilePage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const [sumRes, famRes] = await Promise.allSettled([
          customerApi.getProfileSummary(),
          customerApi.getFamilyMembers(),
        ]);
        if (sumRes.status === 'fulfilled') setSummary(sumRes.value?.data || sumRes.value);
        if (famRes.status === 'fulfilled') setFamilyMembers(Array.isArray(famRes.value) ? famRes.value : []);
      } catch (err) {
        console.error('Error loading customer profile summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <div className="customer-profile-grid">
      <div className="customer-profile-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.fullName || 'Khách hàng'}
            style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
          />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {user?.fullName || 'Khách Hàng Thân Thiết'}
            </h3>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, background: '#dcfce7', color: 'var(--primary)', padding: '2px 8px', borderRadius: '999px' }}>
              ✓ Tài Khoản Tiêu Dùng Sạch
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
            <Mail size={16} color="var(--text-muted)" />
            <span>Email: <strong>{user?.email || 'customer@marketlink.com'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
            <Phone size={16} color="var(--text-muted)" />
            <span>Số điện thoại: <strong>{user?.phoneNumber || '0912 345 678'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
            <MapPin size={16} color="var(--text-muted)" />
            <span>Khu vực nhận hàng: <strong>Cầu Giấy, Hà Nội & Quận 2, TP.HCM</strong></span>
          </div>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đơn Đã Đặt</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {summary?.totalOrders || 3} đơn
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Điểm Xanh Tích Lũy</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              {summary?.greenPoints || 250} pts
            </div>
          </div>
        </div>
      </div>

      <div className="customer-profile-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Users size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Nhóm Gia Đình Cùng Đặt Nông Sản
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Chia sẻ giỏ đặt trước với người thân trong gia đình để cùng gom nông sản và nhận tại sạp một lần.
        </p>

        {familyMembers.length === 0 ? (
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Chưa có thành viên gia đình liên kết.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {familyMembers.map((m, idx) => (
              <div key={idx} style={{ padding: '12px', borderRadius: '12px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{m.fullName}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Thành viên gia đình</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
