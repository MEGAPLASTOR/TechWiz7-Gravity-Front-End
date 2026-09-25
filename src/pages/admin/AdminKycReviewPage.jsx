import React, { useState, useEffect } from 'react';
import {
  Eye,
  Check,
  X,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { adminApi } from '@/services';
import { useNotification } from '@/context/NotificationContext';

export const AdminKycReviewPage = () => {
  const [pendingKyc, setPendingKyc] = useState([]);
  const [loading, setLoading] = useState(true);

  const [inspectFarmer, setInspectFarmer] = useState(null);
  const [farmerDetail, setFarmerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reviewReason, setReviewReason] = useState('Hồ sơ hợp lệ, đã đối chiếu mã số chứng nhận VietGAP thành công.');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { success, error, info } = useNotification();

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPendingKyc();
      setPendingKyc(Array.isArray(data) ? data : (data?.content || data?.data || []));
    } catch (err) {
      console.error('Failed to load pending KYC list:', err);
      setPendingKyc([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleOpenInspect = async (farmer) => {
    setInspectFarmer(farmer);
    setLoadingDetail(true);
    setReviewReason('Hồ sơ hợp lệ, đã đối chiếu mã số chứng nhận VietGAP thành công.');
    try {
      const res = await adminApi.getFarmerKycDetail(farmer.farmerId);
      setFarmerDetail(res?.data || res);
    } catch (err) {
      error(err.message || 'Không thể tải chi tiết hồ sơ KYC');
      setFarmerDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleExecuteReview = async (action) => {
    if (!inspectFarmer) return;
    setSubmittingReview(true);
    try {
      await adminApi.reviewKyc(inspectFarmer.farmerId, {
        action,
        reason: reviewReason,
      });

      if (action === 'APPROVE') {
        success(
          `Đã PHÊ DUYỆT thành công Nông Dân #${inspectFarmer.farmerId}! ` +
          `Quyền bán hàng đã được kích hoạt!`
        );
      } else if (action === 'REQUEST_REVISION') {
        info(`Đã gửi yêu cầu nộp lại giấy tờ đến Nông Dân #${inspectFarmer.farmerId}!`);
      } else {
        error(`Đã từ chối hồ sơ KYC Nông Dân #${inspectFarmer.farmerId}!`);
      }

      setInspectFarmer(null);
      setFarmerDetail(null);
      await loadPending();
    } catch (err) {
      error(err.message || 'Lỗi khi xử lý thẩm định KYC');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Hồ Sơ KYC Nông Dân Chờ Thẩm Định ({pendingKyc.length})
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Kiểm tra đối chiếu chứng chỉ VietGAP, ATTP và cấp quyền mở sạp cho nông dân
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            loadPending();
          }}
          className="btn btn-secondary"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {pendingKyc.length === 0 ? (
        <div className="customer-empty-state">
          <CheckCircle size={48} style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
          <h3 className="customer-empty-title">
            Hiện tại không có hồ sơ KYC nào chờ duyệt
          </h3>
          <p className="customer-empty-desc">
            Tất cả sạp nông dân đã nộp giấy tờ đều đã được xử lý thẩm định.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pendingKyc.map((k) => (
            <div key={k.farmerId} className="farmer-order-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem' }}>
                    {k.fullName}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: '999px' }}>
                    {k.kycStatus === 'PENDING' ? '⏳ Đang chờ duyệt' : k.kycStatus || 'Chưa xác minh'}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: '999px' }}>
                    Chưa cấp quyền bán hàng
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 700 }}>
                  Sạp hàng: {k.stallName || 'Chưa đặt tên'}
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Địa chỉ: {k.farmAddress || 'N/A'} • SĐT: {k.phoneNumber || 'N/A'} • Email: {k.email || 'N/A'}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '4px', fontWeight: 600 }}>
                  📄 Đã nộp {k.documentCount || 0} tài liệu • Ngày gửi: {k.lastSubmittedAt || 'Mới đây'}
                </div>
              </div>

              <button
                onClick={() => handleOpenInspect(k)}
                className="btn btn-primary"
                style={{ background: 'var(--text-main)', borderColor: 'var(--text-main)' }}
              >
                <Eye size={16} />
                <span>Xem Hồ Sơ & Thẩm Định</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {inspectFarmer && (
        <div className="kyc-modal-overlay" onClick={() => setInspectFarmer(null)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Thẩm Định Hồ Sơ Nông Dân: {inspectFarmer.fullName}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Chi tiết hồ sơ nông dân #{inspectFarmer.farmerId}
                </span>
              </div>
              <button
                onClick={() => setInspectFarmer(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingDetail ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <RefreshCw size={28} className="animate-spin" style={{ color: '#dc2626', margin: '0 auto 10px' }} />
                <div>Đang tải tài liệu chi tiết từ máy chủ...</div>
              </div>
            ) : (
              <div>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Sạp hàng: {inspectFarmer.stallName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Địa chỉ: {inspectFarmer.farmAddress} • SĐT: {inspectFarmer.phoneNumber}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 700, marginTop: '6px' }}>
                    Trạng thái hiện tại: Chưa cấp quyền bán hàng
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
                  Tài Liệu Chứng Thực Đính Kèm ({farmerDetail?.documents?.length || 0})
                </h4>

                {farmerDetail?.documents?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {farmerDetail.documents.map((d, dIdx) => (
                      <div key={dIdx} style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '10px', background: 'var(--bg-card)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-light)' }}>
                            {d.documentType}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Số: {d.documentNumber || 'N/A'}
                          </span>
                        </div>
                        {d.documentUrl && (
                          <div style={{ marginTop: '6px' }}>
                            <a
                              href={d.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.8rem', color: 'var(--primary-light)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                            >
                              <ExternalLink size={12} />
                              <span>Xem chứng từ gốc</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '14px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', fontSize: '0.82rem', color: '#fbbf24', marginBottom: '16px' }}>
                    Nông dân này đã nộp {inspectFarmer.documentCount || 0} tài liệu nhưng chưa load được URL chi tiết hoặc nộp trực tiếp.
                  </div>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Ghi chú thẩm định / Lý do phản hồi:
                  </label>
                  <textarea
                    rows={2}
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button
                    disabled={submittingReview}
                    onClick={() => handleExecuteReview('REJECT')}
                    className="btn btn-danger"
                  >
                    <X size={16} />
                    <span>Từ Chối</span>
                  </button>

                  <button
                    disabled={submittingReview}
                    onClick={() => handleExecuteReview('REQUEST_REVISION')}
                    className="btn btn-warning"
                  >
                    <RotateCcw size={16} />
                    <span>Yêu Cầu Nộp Lại</span>
                  </button>

                  <button
                    disabled={submittingReview}
                    onClick={() => handleExecuteReview('APPROVE')}
                    className="btn btn-primary"
                  >
                    <Check size={18} />
                    <span>Phê Duyệt - Mở Quyền Bán</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
