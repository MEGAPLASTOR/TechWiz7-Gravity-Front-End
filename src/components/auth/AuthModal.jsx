import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  User,
  Store,
  ArrowRight,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { PATHS } from '@/routes/paths';

export const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { success, error } = useNotification();

  // Tab switch: true = Login, false = Register
  const [isLogin, setIsLogin] = useState(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [role, setRole] = useState('CUSTOMER');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const validatePhone = (val) => {
    return /^0[0-9]{9}$/.test(val.replace(/\s+/g, ''));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setFieldErrors({});

    const errors = {};
    if (!email.trim()) {
      errors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!validateEmail(email.trim())) {
      errors.email = 'Định dạng email không hợp lệ (VD: user@example.com).';
    }

    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        success(`Đăng nhập thành công! Chào mừng ${res.user?.fullName || 'bạn quay trở lại'}.`);
        onClose();

        // Redirect according to user role
        const userRoles = res.user?.roles || [];
        if (userRoles.includes('ROLE_ADMIN')) {
          navigate(PATHS.ADMIN.DASHBOARD);
        } else if (userRoles.includes('ROLE_FARMER')) {
          navigate(PATHS.FARMER.DASHBOARD);
        } else {
          // Normal customer
          if (
            window.location.pathname.startsWith('/admin') ||
            window.location.pathname.startsWith('/farmer')
          ) {
            navigate(PATHS.CUSTOMER.ORDERS);
          }
        }
      } else {
        const msg = res.message || 'Email hoặc mật khẩu không chính xác.';
        setServerError(msg);
        error(msg);
      }
    } catch (err) {
      const msg = err.message || 'Đăng nhập không thành công. Vui lòng thử lại.';
      setServerError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setFieldErrors({});

    const errors = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự.';
    }

    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Vui lòng nhập số điện thoại.';
    } else if (!validatePhone(phoneNumber.trim())) {
      errors.phoneNumber = 'Số điện thoại phải gồm 10 chữ số (bắt đầu bằng số 0).';
    }

    if (!regEmail.trim()) {
      errors.regEmail = 'Vui lòng nhập email.';
    } else if (!validateEmail(regEmail.trim())) {
      errors.regEmail = 'Định dạng email không hợp lệ.';
    }

    if (role === 'FARMER') {
      if (!farmName.trim()) {
        errors.farmName = 'Vui lòng nhập tên sạp hoặc tên trang trại.';
      }
      if (!farmAddress.trim()) {
        errors.farmAddress = 'Vui lòng nhập địa chỉ trang trại.';
      }
    }

    if (!regPassword) {
      errors.regPassword = 'Vui lòng đặt mật khẩu.';
    } else if (regPassword.length < 6) {
      errors.regPassword = 'Mật khẩu phải có tối thiểu 6 ký tự.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu.';
    } else if (regPassword !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    if (!agreeTerms) {
      errors.agreeTerms = 'Bạn cần đồng ý với Điều khoản dịch vụ để tiếp tục.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role,
        ...(role === 'FARMER'
          ? { farmName: farmName.trim(), farmAddress: farmAddress.trim() }
          : { deliveryAddress: 'Địa chỉ nhận hàng mặc định' }),
      };

      const res = await register(payload);
      if (res.success) {
        if (res.user) {
          success('Đăng ký và đăng nhập tài khoản thành công!');
          onClose();
          if (role === 'FARMER') {
            navigate(PATHS.FARMER.DASHBOARD);
          } else {
            navigate(PATHS.CUSTOMER.ORDERS);
          }
        } else {
          success(res.message || 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
          setIsLogin(true);
          setEmail(regEmail.trim());
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        const msg = res.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
        setServerError(msg);
        error(msg);
      }
    } catch (err) {
      const msg = err.message || 'Đăng ký thất bại. Vui lòng thử lại sau.';
      setServerError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-modal-header">
          <div>
            <h3 className="auth-modal-title">
              {isLogin ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}
            </h3>
            <p className="auth-modal-subtitle">
              {isLogin
                ? 'Hệ thống xác thực thành viên & sạp nông sản MarketLink'
                : 'Tham gia mạng lưới kết nối nông sản sạch từ nông trại đến bàn ăn'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="auth-modal-close"
            type="button"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="auth-role-tabs" style={{ margin: '16px 24px 0' }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setServerError('');
              setFieldErrors({});
            }}
            className={`auth-role-tab ${isLogin ? 'active' : ''}`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setServerError('');
              setFieldErrors({});
            }}
            className={`auth-role-tab ${!isLogin ? 'active' : ''}`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Form Body */}
        <div className="auth-modal-body">
          {/* Server Error Alert Banner */}
          {serverError && (
            <div className="auth-error-banner">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{serverError}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} noValidate>
              {/* Email */}
              <div className="auth-input-group">
                <label className="auth-label">Địa Chỉ Email</label>
                <div className="auth-input-box">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                    }}
                    placeholder="name@example.com"
                    className="auth-text-input"
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <div className="auth-field-error">
                    <AlertCircle size={13} />
                    <span>{fieldErrors.email}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <label className="auth-label">Mật Khẩu</label>
                <div className="auth-input-box">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    placeholder="Nhập mật khẩu..."
                    className="auth-text-input"
                    style={{ paddingRight: '42px' }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-eye-btn"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <div className="auth-field-error">
                    <AlertCircle size={13} />
                    <span>{fieldErrors.password}</span>
                  </div>
                )}
              </div>

              {/* Options: Remember me & Forgot Password */}
              <div className="auth-options-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setServerError(
                      'Nếu quên mật khẩu, vui lòng liên hệ Ban Quản Trị MarketLink qua hotline 1900 8888 để được hỗ trợ đặt lại mật khẩu an toàn.'
                    );
                  }}
                  className="auth-forgot-link"
                >
                  Quên mật khẩu?
                </a>
              </div>

              {/* Submit Button */}
              <button
                id="btn-auth-submit-login"
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? (
                  <>
                    <div className="auth-spinner" />
                    <span>Đang Xác Thực...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Đăng Nhập</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="auth-footer-toggle">
                <span>Chưa có tài khoản thành viên?</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setServerError('');
                    setFieldErrors({});
                  }}
                  className="auth-toggle-btn"
                >
                  Đăng ký ngay
                </button>
              </div>
            </form>
          ) : (
            /* 2. REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} noValidate>
              {/* Role selection tab */}
              <div className="auth-input-group">
                <label className="auth-label">Bạn Đăng Ký Với Vai Trò:</label>
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
                      gap: '8px',
                      padding: '10px',
                    }}
                  >
                    <User size={16} />
                    <span>Khách Hàng Mua Sắm</span>
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
                      gap: '8px',
                      padding: '10px',
                    }}
                  >
                    <Store size={16} />
                    <span>Nông Dân / Chủ Sạp</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="auth-input-group">
                <label className="auth-label">Họ và Tên</label>
                <div className="auth-input-box">
                  <User size={18} className="auth-input-icon" />
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' });
                    }}
                    placeholder="Nguyễn Văn An"
                    className="auth-text-input"
                    autoComplete="name"
                  />
                </div>
                {fieldErrors.fullName && (
                  <div className="auth-field-error">
                    <AlertCircle size={13} />
                    <span>{fieldErrors.fullName}</span>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="auth-input-group">
                <label className="auth-label">Số Điện Thoại</label>
                <div className="auth-input-box">
                  <Phone size={18} className="auth-input-icon" />
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (fieldErrors.phoneNumber) setFieldErrors({ ...fieldErrors, phoneNumber: '' });
                    }}
                    placeholder="0912345678"
                    className="auth-text-input"
                    autoComplete="tel"
                  />
                </div>
                {fieldErrors.phoneNumber && (
                  <div className="auth-field-error">
                    <AlertCircle size={13} />
                    <span>{fieldErrors.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="auth-input-group">
                <label className="auth-label">Địa Chỉ Email</label>
                <div className="auth-input-box">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      if (fieldErrors.regEmail) setFieldErrors({ ...fieldErrors, regEmail: '' });
                    }}
                    placeholder="an.nguyen@example.com"
                    className="auth-text-input"
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.regEmail && (
                  <div className="auth-field-error">
                    <AlertCircle size={13} />
                    <span>{fieldErrors.regEmail}</span>
                  </div>
                )}
              </div>

              {/* Additional fields if role === FARMER */}
              {role === 'FARMER' && (
                <>
                  <div className="auth-input-group">
                    <label className="auth-label">Tên Sạp / Tên Trang Trại</label>
                    <div className="auth-input-box">
                      <Store size={18} className="auth-input-icon" />
                      <input
                        id="reg-farmname"
                        type="text"
                        required
                        value={farmName}
                        onChange={(e) => {
                          setFarmName(e.target.value);
                          if (fieldErrors.farmName) setFieldErrors({ ...fieldErrors, farmName: '' });
                        }}
                        placeholder="Nông Trại Hữu Cơ Ba Vì"
                        className="auth-text-input"
                      />
                    </div>
                    {fieldErrors.farmName && (
                      <div className="auth-field-error">
                        <AlertCircle size={13} />
                        <span>{fieldErrors.farmName}</span>
                      </div>
                    )}
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label">Địa Chỉ Trang Trại</label>
                    <div className="auth-input-box">
                      <MapPin size={18} className="auth-input-icon" />
                      <input
                        id="reg-farmaddress"
                        type="text"
                        required
                        value={farmAddress}
                        onChange={(e) => {
                          setFarmAddress(e.target.value);
                          if (fieldErrors.farmAddress) setFieldErrors({ ...fieldErrors, farmAddress: '' });
                        }}
                        placeholder="Xã Vân Hòa, Ba Vì, Hà Nội"
                        className="auth-text-input"
                      />
                    </div>
                    {fieldErrors.farmAddress && (
                      <div className="auth-field-error">
                        <AlertCircle size={13} />
                        <span>{fieldErrors.farmAddress}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Password */}
              <div className="auth-input-group">
                <label className="auth-label">Mật Khẩu (Tối thiểu 6 ký tự)</label>
                <div className="auth-input-box">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (fieldErrors.regPassword) setFieldErrors({ ...fieldErrors, regPassword: '' });
                    }}
                    placeholder="••••••••"
                    className="auth-text-input"
                    style={{ paddingRight: '42px' }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="auth-eye-btn"
                    aria-label={showRegPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.regPassword && (
                  <div className="auth-field-error">
                    <AlertCircle size={13} />
                    <span>{fieldErrors.regPassword}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="auth-input-group">
                <label className="auth-label">Xác Nhận Mật Khẩu</label>
                <div className="auth-input-box">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="reg-confirm-password"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                    }}
                    placeholder="••••••••"
                    className="auth-text-input"
                    style={{ paddingRight: '42px' }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="auth-eye-btn"
                    aria-label={showRegConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showRegConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.confirmPassword ? (
                  <div className="auth-field-error">
                    <AlertCircle size={13} />
                    <span>{fieldErrors.confirmPassword}</span>
                  </div>
                ) : confirmPassword && regPassword === confirmPassword ? (
                  <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <CheckCircle2 size={13} />
                    <span>Mật khẩu xác nhận trùng khớp</span>
                  </div>
                ) : null}
              </div>

              {/* Terms Checkbox */}
              <div style={{ marginTop: '10px', marginBottom: '14px' }}>
                <label className="auth-checkbox-label" style={{ fontSize: '0.82rem' }}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (fieldErrors.agreeTerms) setFieldErrors({ ...fieldErrors, agreeTerms: '' });
                    }}
                  />
                  <span>
                    Tôi đồng ý với{' '}
                    <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Điều khoản sử dụng</span> &{' '}
                    <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Chính sách bảo mật</span> của MarketLink
                  </span>
                </label>
                {fieldErrors.agreeTerms && (
                  <div className="auth-field-error" style={{ marginTop: '4px' }}>
                    <AlertCircle size={13} />
                    <span>{fieldErrors.agreeTerms}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                id="btn-auth-submit-register"
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? (
                  <>
                    <div className="auth-spinner" />
                    <span>Đang Tạo Tài Khoản...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Tạo Tài Khoản</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="auth-footer-toggle">
                <span>Đã có tài khoản MarketLink?</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setServerError('');
                    setFieldErrors({});
                  }}
                  className="auth-toggle-btn"
                >
                  Đăng nhập tại đây
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
