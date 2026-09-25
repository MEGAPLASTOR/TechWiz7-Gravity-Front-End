import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash2, RefreshCw, Lock, X } from 'lucide-react';
import { farmerApi } from '@/services';
import { useNotification } from '@/context/NotificationContext';

export const FarmerSlotsPage = () => {
  const [pickupSlots, setPickupSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [submittingSlot, setSubmittingSlot] = useState(false);

  const [slotForm, setSlotForm] = useState({
    slotDate: new Date().toISOString().split('T')[0],
    startTime: '07:00:00',
    endTime: '09:00:00',
    maxCapacity: 20,
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
        const sList = Array.isArray(slotsRes.value) ? slotsRes.value : (slotsRes.value?.content || slotsRes.value?.data || []);
        setPickupSlots(sList);
      } else {
        setPickupSlots([]);
      }
      if (kycRes.status === 'fulfilled' && kycRes.value) {
        const kData = kycRes.value?.data || kycRes.value;
        if (typeof kData?.isApproved === 'boolean') {
          setIsApproved(kData.isApproved);
        }
      }
    } catch (e) {
      console.error('Error loading slots data:', e);
      setPickupSlots([]);
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
    setEditingSlot(null);
    setSlotForm({
      slotDate: new Date().toISOString().split('T')[0],
      startTime: '07:00:00',
      endTime: '09:00:00',
      maxCapacity: 20,
    });
    setShowModal(true);
  };

  const handleOpenEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      slotDate: slot.slotDate || new Date().toISOString().split('T')[0],
      startTime: slot.startTime || '07:00:00',
      endTime: slot.endTime || '09:00:00',
      maxCapacity: slot.maxCapacity || 20,
    });
    setShowModal(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!isApproved) {
      error('Hồ sơ chưa được phê duyệt. Bạn chưa thể thao tác khung giờ nhận hàng.');
      return;
    }

    setSubmittingSlot(true);
    try {
      if (editingSlot) {
        const slotId = editingSlot.slotId || editingSlot.id;
        await farmerApi.updatePickupSlot(slotId, slotForm);
        success('Đã cập nhật khung giờ nhận hàng thành công!');
      } else {
        await farmerApi.createPickupSlot(slotForm);
        success('Đã tạo khung giờ đón khách mới thành công!');
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      error(err.message || 'Lỗi khi lưu khung giờ');
    } finally {
      setSubmittingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khung giờ nhận hàng này?')) return;
    try {
      await farmerApi.deletePickupSlot(slotId);
      success('Đã xóa khung giờ nhận hàng thành công!');
      await loadData();
    } catch (err) {
      error(err.message || 'Không thể xóa khung giờ');
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
              Danh sách các ca nhận nông sản đặt trước tại sạp phiên chợ
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setLoading(true);
                loadData();
              }}
              className="btn btn-secondary"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Tải lại</span>
            </button>
            <button
              onClick={handleOpenAddSlot}
              className={`btn ${isApproved ? 'btn-primary' : 'btn-secondary'}`}
              style={{ cursor: isApproved ? 'pointer' : 'not-allowed' }}
            >
              {isApproved ? <Plus size={14} /> : <Lock size={14} />}
              <span>Thêm Khung Giờ</span>
            </button>
          </div>
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
            {pickupSlots.map((slot, idx) => {
              const id = slot.slotId || slot.id || idx;
              return (
                <div
                  key={id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="var(--primary)" />
                      <span>{slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-light)', padding: '2px 8px', borderRadius: '999px' }}>
                        {slot.currentOrders || 0}/{slot.maxCapacity || 20} đơn
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Ngày đón khách: <strong style={{ color: '#ffffff' }}>{slot.slotDate}</strong> • Sức chứa tối đa: <strong>{slot.maxCapacity || 20} đơn</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleOpenEditSlot(slot)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      title="Chỉnh sửa khung giờ"
                    >
                      <Edit size={13} />
                      <span>Sửa</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSlot(id)}
                      className="btn btn-danger"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      title="Xóa khung giờ"
                    >
                      <Trash2 size={13} />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              );
            })}
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
          style={{ cursor: isApproved ? 'pointer' : 'not-allowed', width: '100%' }}
        >
          Lưu Cấu Hình Chốt Đơn
        </button>
      </div>

      {/* Modal Add / Edit Slot */}
      {showModal && (
        <div className="kyc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingSlot ? 'Chỉnh Sửa Khung Giờ' : 'Thêm Khung Giờ Nhận Hàng Mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                    value={slotForm.startTime?.slice(0, 5)}
                    onChange={(e) => setSlotForm({ ...slotForm, startTime: `${e.target.value}:00` })}
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
                    value={slotForm.endTime?.slice(0, 5)}
                    onChange={(e) => setSlotForm({ ...slotForm, endTime: `${e.target.value}:00` })}
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
                  min="1"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingSlot}
                  className="btn btn-primary"
                >
                  {submittingSlot ? 'Đang lưu...' : editingSlot ? 'Lưu Thay Đổi' : 'Tạo Khung Giờ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerSlotsPage;
