import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { useNotification } from '@/context/NotificationContext';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { success, error } = useNotification();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    try {
      await adminApi.updateUserStatus(user.userId, nextStatus, 'Thay đổi bởi Quản trị viên');
      success(`Đã chuyển trạng thái tài khoản "${user.fullName}" sang ${nextStatus === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}!`);
      loadUsers();
    } catch (err) {
      error(err.message || 'Không thể thay đổi trạng thái tài khoản');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Quản Lý Tài Khoản Người Dùng ({users.length})
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Kiểm soát tài khoản khách hàng, nông dân và điều hành quyền truy cập hệ thống
          </p>
        </div>

        <button onClick={loadUsers} className="btn btn-secondary">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '18px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table className="kyc-rule-table" style={{ margin: 0, border: 'none' }}>
          <thead>
            <tr>
              <th>ID & Họ Tên</th>
              <th>Email & Điện Thoại</th>
              <th>Vai Trò</th>
              <th>Xác Minh Danh Tính</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Chưa tải được danh sách người dùng từ máy chủ.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isActive = u.status === 'ACTIVE' || !u.status;
                return (
                  <tr key={u.userId}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{u.fullName}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>#{u.userId}</span>
                    </td>
                    <td>
                      <div>{u.email}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phoneNumber || 'Chưa cập nhật SĐT'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px' }}>
                        {(() => {
                          const roleMap = { 'ROLE_CUSTOMER': 'Khách hàng', 'ROLE_FARMER': 'Nông dân', 'ROLE_ADMIN': 'Quản trị viên' };
                          const roles = u.roles || [u.role || 'ROLE_CUSTOMER'];
                          return roles.map(r => roleMap[r] || r).join(', ');
                        })()}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color:
                            u.kycStatus === 'VERIFIED'
                              ? 'var(--primary)'
                              : u.kycStatus === 'PENDING'
                              ? '#2563eb'
                              : '#d97706',
                        }}
                      >
                        {u.kycStatus === 'VERIFIED' ? 'Đã xác minh' : u.kycStatus === 'PENDING' ? 'Đang chờ duyệt' : 'Chưa xác minh'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isActive ? 'var(--primary)' : '#dc2626',
                          background: isActive ? '#f0fdf4' : '#fef2f2',
                          padding: '3px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        ● {isActive ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`}
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        {isActive ? 'Khóa Tài Khoản' : 'Mở Khóa'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
