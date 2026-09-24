import React, { useState } from 'react';
import { X, User, Store, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { success, error } = useNotification();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const res = await login(email, password);
      if (res.success) {
        success('Đăng nhập thành công! Chào mừng bạn quay trở lại.');
        onClose();
      } else {
        error(res.message || 'Email hoặc mật khẩu không chính xác.');
      }
    } else {
      const regData = {
        email,
        password,
        fullName,
        phoneNumber,
        role,
        ...(role === 'FARMER' ? { farmName, farmAddress } : { deliveryAddress: 'Địa chỉ nhận hàng mặc định' }),
      };

      const res = await register(regData);
      if (res.success) {
        success('Đăng ký tài khoản thành công!');
        onClose();
      } else {
        error(res.message || 'Đăng ký thất bại, vui lòng kiểm tra lại thông tin.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div>
            <h3 className="auth-modal-title">
              {isLogin ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản Mới'}
            </h3>
            <p className="auth-modal-subtitle">
              {isLogin ? 'Truy cập để quản lý đơn đặt trước hoặc sạp hàng' : 'Tham gia cộng đồng nông sản sạch MarketLink'}
            </p>
          </div>
          <button onClick={onClose} className="auth-modal-close" type="button" aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className="auth-role-tabs" style={{ margin: '16px 24px 0' }}>
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`auth-role-tab ${isLogin ? 'active' : ''}`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`auth-role-tab ${!isLogin ? 'active' : ''}`}
          >
            Đăng Ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-modal-body">
          {!isLogin && (
            <div className="auth-input-group">
              <label className="auth-label">
                Bạn tham gia với vai trò:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRole('CUSTOMER')}
                  className={`auth-role-tab ${role === 'CUSTOMER' ? 'active' : ''}`}
                  style={{
                    border: `1.5px solid ${role === 'CUSTOMER' ? 'var(--primary)' : 'var(--border-color)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                  }}
                >
                  <User size={16} />
                  <span>Khách Hàng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('FARMER')}
                  className={`auth-role-tab ${role === 'FARMER' ? 'active' : ''}`}
                  style={{
                    border: `1.5px solid ${role === 'FARMER' ? '#ea580c' : 'var(--border-color)'}`,
                    color: role === 'FARMER' ? '#ea580c' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                  }}
                >
                  <Store size={16} />
                  <span>Nông Dân / Sạp</span>
                </button>
              </div>
            </div>
          )}

          {!isLogin && (
            <>
              <div className="auth-input-group">
                <label className="auth-label">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="form-input"
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0912345678"
                  className="form-input"
                />
              </div>

              {role === 'FARMER' && (
                <>
                  <div className="auth-input-group">
                    <label className="auth-label">Tên Sạp / Tên Trang Trại</label>
                    <input
                      type="text"
                      required
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="Nông Trại Hữu Cơ Ba Vì"
                      className="form-input"
                    />
                  </div>
                  <div className="auth-input-group">
                    <label className="auth-label">Địa chỉ nông trại</label>
                    <input
                      type="text"
                      required
                      value={farmAddress}
                      onChange={(e) => setFarmAddress(e.target.value)}
                      placeholder="Ba Vì, Hà Nội"
                      className="form-input"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="auth-input-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@marketlink.com"
              className="form-input"
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            <span>{loading ? 'Đang xử lý...' : isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
