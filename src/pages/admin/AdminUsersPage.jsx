import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Search,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  X,
  UserPlus,
  Shield,
  Phone,
  Mail,
} from 'lucide-react';
import { adminApi } from '@/services';
import { useNotification } from '@/context/NotificationContext';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal CRUD state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'ROLE_CUSTOMER',
    kycStatus: 'UNVERIFIED',
    status: 'ACTIVE',
    password: '',
  });

  const { success, error } = useNotification();

  const refreshUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(Array.isArray(data) ? data : (data?.content || data?.data || []));
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setForm({
      fullName: '',
      email: '',
      phoneNumber: '',
      role: 'ROLE_CUSTOMER',
      kycStatus: 'UNVERIFIED',
      status: 'ACTIVE',
      password: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    const roles = user.roles || [user.role || 'ROLE_CUSTOMER'];
    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      role: roles[0] || 'ROLE_CUSTOMER',
      kycStatus: user.kycStatus || 'UNVERIFIED',
      status: user.status || 'ACTIVE',
      password: '',
    });
    setShowModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        roles: [form.role],
        role: form.role,
        kycStatus: form.kycStatus,
        status: form.status,
      };
      if (form.password) {
        payload.password = form.password;
      }

      if (editingUser) {
        await adminApi.updateUser(editingUser.userId, payload);
        success(`Đã cập nhật thông tin tài khoản "${form.fullName}" thành công!`);
      } else {
        await adminApi.createUser(payload);
        success(`Đã tạo mới tài khoản "${form.fullName}" thành công!`);
      }
      setShowModal(false);
      await refreshUsers();
    } catch (err) {
      error(err.message || 'Lỗi khi lưu thông tin người dùng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userName}"?`)) return;
    try {
      await adminApi.deleteUser(userId);
      success(`Đã xóa tài khoản "${userName}" khỏi hệ thống!`);
      await refreshUsers();
    } catch (err) {
      error(err.message || 'Không thể xóa tài khoản');
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    try {
      await adminApi.updateUserStatus(user.userId, nextStatus, 'Thay đổi bởi Quản trị viên');
      success(`Đã chuyển trạng thái tài khoản "${user.fullName}" sang ${nextStatus === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}!`);
      await refreshUsers();
    } catch (err) {
      error(err.message || 'Không thể thay đổi trạng thái tài khoản');
    }
  };

  const filteredUsers = users.filter((u) => {
    // Role filter
    if (roleFilter !== 'ALL') {
      const roles = u.roles || [u.role || 'ROLE_CUSTOMER'];
      if (!roles.includes(roleFilter)) return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.fullName?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.phoneNumber?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Quản Lý Tài Khoản Người Dùng ({users.length})
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Kiểm soát tài khoản khách hàng, nông dân và phân quyền truy cập hệ thống
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={refreshUsers} className="btn btn-secondary">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <UserPlus size={16} />
            <span>Thêm Tài Khoản Mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: `Tất Cả (${users.length})` },
            { key: 'ROLE_ADMIN', label: 'Quản Trị Viên' },
            { key: 'ROLE_FARMER', label: 'Nông Dân' },
            { key: 'ROLE_CUSTOMER', label: 'Khách Hàng' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`customer-filter-pill ${roleFilter === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT..."
            className="form-input"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID & Họ Tên</th>
              <th>Email & Điện Thoại</th>
              <th>Vai Trò</th>
              <th>Xác Minh KYC</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Không tìm thấy tài khoản người dùng phù hợp.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isActive = u.status === 'ACTIVE' || !u.status;
                const roles = u.roles || [u.role || 'ROLE_CUSTOMER'];
                const isAdmin = roles.includes('ROLE_ADMIN');
                const isFarmer = roles.includes('ROLE_FARMER');

                return (
                  <tr key={u.userId}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#ffffff' }}>{u.fullName}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: #{u.userId}</span>
                    </td>
                    <td>
                      <div style={{ color: '#e2e8f0' }}>{u.email}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phoneNumber || 'Chưa cập nhật SĐT'}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isAdmin
                            ? 'rgba(239, 68, 68, 0.15)'
                            : isFarmer
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(59, 130, 246, 0.15)',
                          color: isAdmin
                            ? '#f87171'
                            : isFarmer
                            ? 'var(--primary-light)'
                            : '#60a5fa',
                          border: isAdmin
                            ? '1px solid rgba(239, 68, 68, 0.3)'
                            : isFarmer
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : '1px solid rgba(59, 130, 246, 0.3)',
                          padding: '3px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        {isAdmin ? 'Quản trị viên' : isFarmer ? 'Nông dân' : 'Khách hàng'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '999px',
                          background:
                            u.kycStatus === 'VERIFIED'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : u.kycStatus === 'PENDING'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(255, 255, 255, 0.05)',
                          color:
                            u.kycStatus === 'VERIFIED'
                              ? '#34d399'
                              : u.kycStatus === 'PENDING'
                              ? '#fbbf24'
                              : 'var(--text-muted)',
                          border:
                            u.kycStatus === 'VERIFIED'
                              ? '1px solid rgba(16, 185, 129, 0.3)'
                              : u.kycStatus === 'PENDING'
                              ? '1px solid rgba(245, 158, 11, 0.3)'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {u.kycStatus === 'VERIFIED' ? '✓ Đã xác minh' : u.kycStatus === 'PENDING' ? '⏳ Đang chờ duyệt' : 'Chưa xác minh'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isActive ? '#34d399' : '#f87171',
                          background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '3px 10px',
                          borderRadius: '999px',
                        }}
                      >
                        ● {isActive ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          title={isActive ? 'Khóa tài khoản' : 'Kích hoạt lại'}
                        >
                          {isActive ? <Lock size={12} /> : <Unlock size={12} />}
                          <span>{isActive ? 'Khóa' : 'Mở'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px' }}
                          title="Chỉnh sửa tài khoản"
                        >
                          <Edit size={13} />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.userId, u.fullName)}
                          className="btn btn-danger"
                          style={{ padding: '6px 10px' }}
                          title="Xóa tài khoản"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit User */}
      {showModal && (
        <div className="kyc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingUser ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Người Dùng Mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Họ và tên:
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="VD: Lê Thị Hồng"
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Email:
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@domain.vn"
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
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="0912 345 678"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Vai trò hệ thống:
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="form-input"
                  >
                    <option value="ROLE_CUSTOMER">Khách Hàng (Customer)</option>
                    <option value="ROLE_FARMER">Nông Dân (Farmer)</option>
                    <option value="ROLE_ADMIN">Quản Trị Viên (Admin)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Trạng thái KYC:
                  </label>
                  <select
                    value={form.kycStatus}
                    onChange={(e) => setForm({ ...form, kycStatus: e.target.value })}
                    className="form-input"
                  >
                    <option value="UNVERIFIED">Chưa xác minh</option>
                    <option value="PENDING">Chờ thẩm định</option>
                    <option value="VERIFIED">Đã xác minh (Verified)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Trạng thái kích hoạt:
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="ACTIVE">Hoạt động (Active)</option>
                    <option value="LOCKED">Bị khóa (Locked)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {editingUser ? 'Mật khẩu mới (bỏ trống nếu không đổi):' : 'Mật khẩu khởi tạo:'}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingUser ? '••••••••' : 'Nhập mật khẩu...'}
                    className="form-input"
                    required={!editingUser}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Đang lưu...' : editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
