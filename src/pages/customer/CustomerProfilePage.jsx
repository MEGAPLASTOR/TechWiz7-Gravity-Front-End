import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Users,
  Edit,
  UserPlus,
  Trash2,
  X,
  Check,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { customerApi } from '@/services';
import { useNotification } from '@/context/NotificationContext';

export const CustomerProfilePage = () => {
  const { user, login } = useAuth();
  const { success, error } = useNotification();

  const [summary, setSummary] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: 'Cầu Giấy, Hà Nội & Quận 2, TP.HCM',
  });

  // Family Member Modal State
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [submittingFamily, setSubmittingFamily] = useState(false);
  const [familyForm, setFamilyForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    relationship: 'Vợ/Chồng',
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [sumRes, famRes] = await Promise.allSettled([
        customerApi.getProfileSummary(),
        customerApi.getFamilyMembers(),
      ]);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value?.data || sumRes.value);
      if (famRes.status === 'fulfilled') {
        const famList = Array.isArray(famRes.value) ? famRes.value : famRes.value?.data || [];
        setFamilyMembers(famList);
      }
    } catch (err) {
      console.error('Error loading customer profile summary:', err);
      setFamilyMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleOpenEditProfile = () => {
    setProfileForm({
      fullName: user?.fullName || '',
      phoneNumber: user?.phoneNumber || '',
      email: user?.email || '',
      address: user?.address || '',
    });
    setShowProfileModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    try {
      await customerApi.updateProfile(profileForm);
      if (user) {
        const updated = { ...user, ...profileForm };
        localStorage.setItem('marketlink_user', JSON.stringify(updated));
      }
      success('Đã cập nhật thông tin tài khoản thành công!');
      setShowProfileModal(false);
      await loadProfile();
    } catch (err) {
      error(err.message || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleOpenAddFamily = () => {
    setFamilyForm({
      fullName: '',
      phoneNumber: '',
      email: '',
      relationship: 'Vợ/Chồng',
    });
    setShowFamilyModal(true);
  };

  const handleSaveFamilyMember = async (e) => {
    e.preventDefault();
    setSubmittingFamily(true);
    try {
      await customerApi.addFamilyMember(familyForm);
      success(`Đã thêm "${familyForm.fullName}" vào nhóm gia đình!`);
      setShowFamilyModal(false);
      await loadProfile();
    } catch (err) {
      error(err.message || 'Lỗi khi thêm thành viên gia đình');
    } finally {
      setSubmittingFamily(false);
    }
  };

  const handleRemoveFamilyMember = async (memberId, memberName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${memberName}" khỏi nhóm gia đình?`)) return;
    try {
      await customerApi.removeFamilyMember(memberId);
      success(`Đã xóa "${memberName}" khỏi nhóm gia đình!`);
      await loadProfile();
    } catch (err) {
      error(err.message || 'Không thể xóa thành viên');
    }
  };

  return (
    <div className="customer-profile-grid">
      {/* CỘT 1: THÔNG TIN TÀI KHOẢN */}
      <div className="customer-profile-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.fullName || 'Khách hàng'}
              style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
            />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {user?.fullName || profileForm.fullName || 'Khách Hàng Thân Thiết'}
              </h3>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-light)', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                ✓ Tài Khoản Tiêu Dùng Sạch
              </span>
            </div>
          </div>

          <button onClick={handleOpenEditProfile} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <Edit size={13} />
            <span>Sửa Hồ Sơ</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
            <Mail size={16} color="var(--text-muted)" />
            <span>Email: <strong>{user?.email || profileForm.email || 'customer@marketlink.com'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
            <Phone size={16} color="var(--text-muted)" />
            <span>Số điện thoại: <strong>{user?.phoneNumber || profileForm.phoneNumber || '0912 345 678'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
            <MapPin size={16} color="var(--text-muted)" />
            <span>Khu vực nhận hàng: <strong>{profileForm.address}</strong></span>
          </div>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đơn Đã Đặt Trước</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {summary?.totalOrders || 3} đơn
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Điểm Xanh Tích Lũy</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '4px' }}>
              {summary?.greenPoints || 250} pts
            </div>
          </div>
        </div>
      </div>

      {/* CỘT 2: NHÓM GIA ĐÌNH CÙNG ĐẶT HÀNG (D12: family_accounts) */}
      <div className="customer-profile-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Nhóm Gia Đình ({familyMembers.length})
            </h3>
          </div>

          <button onClick={handleOpenAddFamily} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <UserPlus size={14} />
            <span>Mời Thành Viên</span>
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Chia sẻ giỏ đặt trước với người thân trong gia đình để cùng gom nông sản và nhận tại sạp một lần.
        </p>

        {familyMembers.length === 0 ? (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Chưa có thành viên gia đình nào được liên kết. Bấm nút "Mời Thành Viên" để tạo nhóm mua sắm cùng gia đình.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {familyMembers.map((m, idx) => {
              const id = m.id || m.memberId || idx;
              return (
                <div
                  key={id}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {m.fullName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {m.phoneNumber} • Quan hệ: <strong style={{ color: 'var(--primary-light)' }}>{m.relationship || 'Người thân'}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFamilyMember(id, m.fullName)}
                    className="btn btn-danger"
                    style={{ padding: '6px 10px' }}
                    title="Xóa khỏi nhóm gia đình"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Edit Customer Profile */}
      {showProfileModal && (
        <div className="kyc-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Chỉnh Sửa Thông Tin Cá Nhân
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Họ và tên:
                </label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Số điện thoại:
                </label>
                <input
                  type="tel"
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Địa chỉ / Khu vực nhận hàng ưu tiên:
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingProfile}
                  className="btn btn-primary"
                >
                  {submittingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Family Member */}
      {showFamilyModal && (
        <div className="kyc-modal-overlay" onClick={() => setShowFamilyModal(false)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Mời Thành Viên Vào Nhóm Gia Đình
              </h3>
              <button
                onClick={() => setShowFamilyModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFamilyMember} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Họ tên thành viên:
                </label>
                <input
                  type="text"
                  value={familyForm.fullName}
                  onChange={(e) => setFamilyForm({ ...familyForm, fullName: e.target.value })}
                  placeholder="VD: Nguyễn Văn Hoàng"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Số điện thoại người thân:
                </label>
                <input
                  type="tel"
                  value={familyForm.phoneNumber}
                  onChange={(e) => setFamilyForm({ ...familyForm, phoneNumber: e.target.value })}
                  placeholder="0988 123 456"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Mối quan hệ trong gia đình:
                </label>
                <select
                  value={familyForm.relationship}
                  onChange={(e) => setFamilyForm({ ...familyForm, relationship: e.target.value })}
                  className="form-input"
                >
                  <option value="Vợ/Chồng">Vợ / Chồng</option>
                  <option value="Bố/Mẹ">Bố / Mẹ</option>
                  <option value="Con cái">Con cái</option>
                  <option value="Anh/Chị/Em">Anh / Chị / Em</option>
                  <option value="Người thân">Người thân khác</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowFamilyModal(false)}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingFamily}
                  className="btn btn-primary"
                >
                  {submittingFamily ? 'Đang gửi...' : 'Gửi Lời Mời'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfilePage;
