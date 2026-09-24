import React, { useState, useEffect } from 'react';
import { Clock, Plus, RefreshCw, Lock, X } from 'lucide-react';
import { farmerApi } from '@/api/farmer.api';
import { useNotification } from '@/context/NotificationContext';

export const FarmerSlotsPage = () => {
  const [pickupSlots, setPickupSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [submittingSlot, setSubmittingSlot] = useState(false);

  const [slotForm, setSlotForm] = useState({
    slotDate: '2026-09-27',
    startTime: '07:00:00',
    endTime: '09:00:00',
    maxCapacity: 15,
  });

  const [cutoffHours, setCutoffHours] = useState('12');
  const [maxCapacity, setMaxCapacity] = useState(20);

  const { success, error, warning } = useNotification();

  const loadData = async () => {
    setLoading(true);
    try {
      const [slotsRes, kycRes] = await Promise.allSettled([
        farmerApi.getPickupSlots(),
        farmerApi.getMyKyc(),
      ]);

      if (slotsRes.status === 'fulfilled') {
        const sList = Array.isArray(slotsRes.value) ? slotsRes.value : slotsRes.value?.data || [];
        setPickupSlots(sList);
      }
      if (kycRes.status === 'fulfilled' && kycRes.value) {
        const kData = kycRes.value?.data || kycRes.value;
        setIsApproved(Boolean(kData?.isApproved));
      }
    } catch (e) {
      console.error('Error loading slots data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddSlot = () => {
    if (!isApproved) {
      warning('Hồ sơ của bạn chưa được phê duyệt. Vui lòng hoàn tất xác minh danh tính trước khi tạo khung giờ nhận hàng.');
      return;
    }
    setShowAddSlotModal(true);
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!isApproved) {
      error('Hồ sơ chưa được phê duyệt. Bạn chưa thể tạo khung giờ nhận hàng.');
      return;
    }

    setSubmittingSlot(true);
    try {
      await farmerApi.createPickupSlot(slotForm);
      success('Đã tạo khung giờ nhận hàng thành công!');
      setShowAddSlotModal(false);
      loadData();
    } catch (err) {
      error(err.message || 'Lỗi khi tạo khung giờ');
    } finally {
      setSubmittingSlot(false);
    }
  };

  const handleSaveCutoff = async () => {
    if (!isApproved) {
      warning('Hồ sơ chưa được duyệt KYC. Không thể cấu hình giờ chốt đơn!');
      return;
    }

    try {
      await farmerApi.saveCutoffSetting({
        cutoffHours: Number(cutoffHours),
        maxCapacity: Number(maxCapacity),
      });
      success('Đã lưu cấu hình thời gian chốt đơn thành công!');
      loadData();
    } catch (err) {
      error(err.message || 'Lỗi khi lưu cấu hình chốt đơn');
    }
  };

  return (
    <div className="farmer-slots-grid">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Khung Giờ Đón Khách Nhận Hàng ({pickupSlots.length})
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Danh sách khung giờ đã thiết lập
            </span>
          </div>

          <button
            onClick={handleOpenAddSlot}
            className={`btn ${isApproved ? 'btn-primary' : 'btn-secondary'}`}
            style={{ cursor: isApproved ? 'pointer' : 'not-allowed' }}
          >
            {isApproved ? <Plus size={14} /> : <Lock size={14} />}
            <span>Thêm Khung Giờ</span>
          </button>
        </div>

        {!isApproved && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', fontSize: '0.82rem', color: '#92400e' }}>
            🔒 <strong>Chức năng bị hạn chế:</strong> Quyền tạo khung giờ sẽ được mở sau khi hồ sơ của bạn được Quản trị viên phê duyệt.
          </div>
        )}

        {pickupSlots.length === 0 ? (
          <div className="customer-empty-state">
            <Clock size={40} className="customer-empty-icon" />
            <h4 style={{ color: 'var(--text-main)', fontWeight: 700 }}>Chưa thiết lập khung giờ nào</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Tạo khung giờ để khách đặt trước chọn thời điểm đến lấy rau củ tại sạp.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pickupSlots.map((slot, idx) => (
              <div
                key={slot.slotId || idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                    {slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Ngày: {slot.slotDate || 'Phiên chợ thứ Bảy'} • Sức chứa: <strong>{slot.maxCapacity || 15} đơn</strong>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#dcfce7', color: 'var(--primary)', padding: '3px 8px', borderRadius: '999px' }}>
                  ✓ Đang đón khách
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="farmer-card-box">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
          Cấu Hình Giờ Chốt Đơn
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Thời hạn khách hàng có thể tạo hoặc sửa đổi đơn đặt trước trước khi nông dân bắt đầu thu hoạch tại vườn.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
            Thời hạn chốt đơn trước giờ mở sạp:
          </label>
          <select
            value={cutoffHours}
            onChange={(e) => setCutoffHours(e.target.value)}
            className="form-input"
          >
            <option value="6">Trước 6 tiếng (Thu hoạch hỏa tốc)</option>
            <option value="12">Trước 12 tiếng (Tiêu chuẩn thu hoạch sớm)</option>
            <option value="24">Trước 24 tiếng (Cho nông sản sơ chế kỹ)</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
            Số đơn tối đa sạp tiếp nhận mỗi phiên:
          </label>
          <input
            type="number"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(Number(e.target.value))}
            className="form-input"
          />
        </div>

        <button
          onClick={handleSaveCutoff}
          className={`btn ${isApproved ? 'btn-primary' : 'btn-secondary'}`}
          style={{ cursor: isApproved ? 'pointer' : 'not-allowed' }}
        >
          Lưu Cấu Hình Chốt Đơn
        </button>
      </div>

      {showAddSlotModal && (
        <div className="kyc-modal-overlay" onClick={() => setShowAddSlotModal(false)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Thêm Khung Giờ Nhận Hàng Mới
              </h3>
              <button
                onClick={() => setShowAddSlotModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Ngày họp chợ đón khách:
                </label>
                <input
                  type="date"
                  value={slotForm.slotDate}
                  onChange={(e) => setSlotForm({ ...slotForm, slotDate: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Giờ bắt đầu:
                  </label>
                  <input
                    type="time"
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Giờ kết thúc:
                  </label>
                  <input
                    type="time"
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Sức chứa tối đa (Số đơn):
                </label>
                <input
                  type="number"
                  value={slotForm.maxCapacity}
                  onChange={(e) => setSlotForm({ ...slotForm, maxCapacity: Number(e.target.value) })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddSlotModal(false)}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingSlot}
                  className="btn btn-primary"
                >
                  {submittingSlot ? 'Đang tạo...' : 'Tạo Khung Giờ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
