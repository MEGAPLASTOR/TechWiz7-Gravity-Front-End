import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  ExternalLink,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { farmerApi } from '@/services';
import { useNotification } from '@/context/NotificationContext';

export const FarmerKycPage = () => {
  const [kycData, setKycData] = useState({
    farmerId: null,
    isApproved: false,
    kycStatus: 'UNVERIFIED',
    latestRemark: '',
    documents: [],
    auditLogs: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newDoc, setNewDoc] = useState({
    documentType: 'ORGANIC_VIETGAP_CERT',
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
    documentNumber: 'VIETGAP-2026-HN-889',
    issuedDate: '2024-01-15',
    expiryDate: '2027-01-15',
  });

  const { success, error, warning } = useNotification();

  const loadKyc = async () => {
    setLoading(true);
    try {
      const res = await farmerApi.getMyKyc();
      const data = res?.data || res;
      if (data) {
        setKycData({
          farmerId: data.farmerId || 103,
          isApproved: Boolean(data.isApproved),
          kycStatus: data.kycStatus || 'UNVERIFIED',
          latestRemark: data.latestRemark || '',
          documents: Array.isArray(data.documents) ? data.documents : [],
          auditLogs: Array.isArray(data.auditLogs) ? data.auditLogs : [],
        });
      }
    } catch (e) {
      console.error('Error fetching KYC documents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    farmerApi.getMyKyc()
      .then((res) => {
        if (ignore) return;
        const data = res?.data || res;
        if (data) {
          setKycData({
            farmerId: data.farmerId || 103,
            isApproved: Boolean(data.isApproved),
            kycStatus: data.kycStatus || 'UNVERIFIED',
            latestRemark: data.latestRemark || '',
            documents: Array.isArray(data.documents) ? data.documents : [],
            auditLogs: Array.isArray(data.auditLogs) ? data.auditLogs : [],
          });
        }
      })
      .catch((e) => {
        console.error('Error fetching KYC documents:', e);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmitDocument = async (e) => {
    e.preventDefault();
    if (!newDoc.documentUrl || !newDoc.documentNumber) {
      warning('Vui lòng nhập đầy đủ mã chứng nhận và đường dẫn tài liệu');
      return;
    }

    setSubmitting(true);
    try {
      const payload = [
        ...kycData.documents,
        {
          documentType: newDoc.documentType,
          documentUrl: newDoc.documentUrl,
          documentNumber: newDoc.documentNumber,
          issuedDate: newDoc.issuedDate,
          expiryDate: newDoc.expiryDate,
        },
      ];

      await farmerApi.submitKyc(payload);
      success('Đã nộp tài liệu KYC thành công! Hồ sơ chuyển sang trạng thái PENDING để Quản trị viên duyệt.');
      loadKyc(true);
    } catch (err) {
      error(err.message || 'Lỗi khi gửi tài liệu KYC lên máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="farmer-slots-grid">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Danh Sách Hồ Sơ Đã Nộp ({kycData.documents.length})
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Tài liệu đã nộp cho Quản trị viên
            </span>
          </div>

          <button onClick={() => loadKyc(true)} className="btn btn-secondary">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Tải lại</span>
          </button>
        </div>

        {kycData.documents.length === 0 ? (
          <div className="customer-empty-state">
            <FileText size={40} className="customer-empty-icon" />
            <h4 style={{ color: 'var(--text-main)', fontWeight: 700 }}>Chưa nộp tài liệu KYC nào</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Hãy điền form bên phải để tải lên ảnh CCCD, chứng nhận VietGAP hoặc giấy phép ATTP.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {kycData.documents.map((doc, idx) => (
              <div key={idx} className="kyc-doc-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-main)', padding: '2px 8px', borderRadius: '6px' }}>
                      {doc.documentType}
                    </span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
                      Số: {doc.documentNumber || 'N/A'}
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: doc.isVerified ? '#34d399' : '#fbbf24',
                    background: doc.isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    border: `1px solid ${doc.isVerified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}>
                    {doc.isVerified ? '✓ Đã thẩm định' : 'Chờ duyệt'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ngày cấp: {doc.issuedDate || 'N/A'} • Hạn dùng: {doc.expiryDate || 'Vô thời hạn'}
                </div>

                {doc.documentUrl && (
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        color: 'var(--primary-light)',
                        textDecoration: 'underline',
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>Xem ảnh/tài liệu đính kèm</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {kycData.auditLogs?.length > 0 && (
          <div style={{ marginTop: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '18px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
              Lịch Sử Thẩm Định
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {kycData.auditLogs.map((log, lIdx) => (
                <div key={lIdx} style={{ fontSize: '0.8rem', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-main)' }}>
                  <span style={{ fontWeight: 700, color: log.action === 'APPROVE' ? '#34d399' : '#f87171' }}>
                    [{log.action}]
                  </span>{' '}
                  - {log.remark || 'Không có ghi chú'} ({log.createdAt || 'Mới đây'})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="farmer-card-box">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
          Nộp Hồ Sơ Định Danh (KYC)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Gửi giấy tờ chứng thực để Quản trị viên xem xét và phê duyệt mở quyền bán hàng cho bạn.
        </p>

        <form onSubmit={handleSubmitDocument} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              Loại chứng nhận / Giấy tờ:
            </label>
            <select
              value={newDoc.documentType}
              onChange={(e) => setNewDoc({ ...newDoc, documentType: e.target.value })}
              className="form-input"
            >
              <option value="ORGANIC_VIETGAP_CERT">Chứng nhận VietGAP / Hữu cơ (Khuyên dùng)</option>
              <option value="FOOD_SAFETY_CERT">Giấy chứng nhận Cơ sở đủ điều kiện ATTP</option>
              <option value="CITIZEN_ID_FRONT">Căn cước công dân (Mặt trước)</option>
              <option value="CITIZEN_ID_BACK">Căn cước công dân (Mặt sau)</option>
              <option value="BUSINESS_REGISTRATION">Giấy phép Đăng ký Kinh doanh</option>
              <option value="FARM_PHOTO">Hình ảnh thực tế trang trại / nhà vườn</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              Số hiệu chứng từ / Mã chứng nhận:
            </label>
            <input
              type="text"
              value={newDoc.documentNumber}
              onChange={(e) => setNewDoc({ ...newDoc, documentNumber: e.target.value })}
              placeholder="VD: VIETGAP-2026-HN-889 hoặc CCCD 079..."
              className="form-input"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              Đường dẫn hình ảnh / Tài liệu chứng thực (URL):
            </label>
            <input
              type="url"
              value={newDoc.documentUrl}
              onChange={(e) => setNewDoc({ ...newDoc, documentUrl: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                Ngày cấp:
              </label>
              <input
                type="date"
                value={newDoc.issuedDate}
                onChange={(e) => setNewDoc({ ...newDoc, issuedDate: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                Ngày hết hạn:
              </label>
              <input
                type="date"
                value={newDoc.expiryDate}
                onChange={(e) => setNewDoc({ ...newDoc, expiryDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{
              marginTop: '10px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <UploadCloud size={18} />
            <span>{submitting ? 'Đang gửi...' : 'Nộp Hồ Sơ Lên Quản Trị Viên'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
