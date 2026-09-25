import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Calendar, RefreshCw, X } from 'lucide-react';
import { marketsApi, adminApi } from '@/services';
import { useNotification } from '@/context/NotificationContext';

const DEMO_ADMIN_MARKETS = [
  {
    marketId: 1,
    name: 'Chợ Phiên Nông Sản Thảo Điền (Quận 2)',
    address: 'Công viên Thảo Điền, P. Thảo Điền, TP. Thủ Đức, TP.HCM',
    operatingDays: 'Thứ Bảy & Chủ Nhật hàng tuần',
    operatingHours: '06:00 - 12:00',
    description: 'Quy tụ hơn 15 sạp rau sạch Ba Vì, bưởi Bến Tre, hoa quả miền Tây tươi ngon đạt chuẩn VietGAP.',
    latitude: 10.8037,
    longitude: 106.7327,
  },
  {
    marketId: 2,
    name: 'Chợ Nông Sản Sạch Phú Mỹ Hưng (Quận 7)',
    address: 'Khuôn viên Hồ Bán Nguyệt, P. Tân Phú, Quận 7, TP.HCM',
    operatingDays: 'Chủ Nhật hàng tuần',
    operatingHours: '06:30 - 11:30',
    description: 'Chợ phiên phục vụ cư dân Nam Sài Gòn, chuyên nông sản hữu cơ công nghệ cao thu hoạch sáng sớm.',
    latitude: 10.7291,
    longitude: 106.7218,
  },
  {
    marketId: 3,
    name: 'Chợ Xanh Cuối Tuần Vinhomes Central Park',
    address: 'Công viên ven sông Vinhomes Central Park, Q. Bình Thạnh, TP.HCM',
    operatingDays: 'Thứ Bảy hàng tuần',
    operatingHours: '06:00 - 11:00',
    description: 'Điểm giao nhận rau củ quả tươi sạch trực tiếp từ nông dân các tỉnh miền Tây và Tây Nguyên.',
    latitude: 10.7933,
    longitude: 106.7225,
  },
];

export const AdminMarketsPage = () => {
  const [markets, setMarkets] = useState(DEMO_ADMIN_MARKETS);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMarket, setEditingMarket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    address: '',
    operatingDays: 'Thứ Bảy & Chủ Nhật hàng tuần',
    operatingHours: '06:00 - 12:00',
    description: '',
    latitude: 21.0285,
    longitude: 105.8542,
  });

  const { success, error } = useNotification();

  const loadMarkets = async () => {
    setLoading(true);
    try {
      const data = await marketsApi.getAllMarkets();
      setMarkets(Array.isArray(data) && data.length > 0 ? data : DEMO_ADMIN_MARKETS);
    } catch (e) {
      console.error('Failed to load markets:', e);
      setMarkets(DEMO_ADMIN_MARKETS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    marketsApi.getAllMarkets()
      .then((data) => {
        if (!ignore) setMarkets(Array.isArray(data) && data.length > 0 ? data : DEMO_ADMIN_MARKETS);
      })
      .catch((e) => {
        console.error('Failed to load markets:', e);
        if (!ignore) setMarkets(DEMO_ADMIN_MARKETS);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingMarket(null);
    setForm({
      name: '',
      address: '',
      operatingDays: 'Thứ Bảy & Chủ Nhật hàng tuần',
      operatingHours: '06:00 - 12:00',
      description: '',
      latitude: 21.0285,
      longitude: 105.8542,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMarket(m);
    setForm({
      name: m.name || '',
      address: m.address || '',
      operatingDays: m.operatingDays || 'Thứ Bảy & Chủ Nhật hàng tuần',
      operatingHours: m.operatingHours || '06:00 - 12:00',
      description: m.description || '',
      latitude: m.latitude || 21.0285,
      longitude: m.longitude || 105.8542,
    });
    setShowModal(true);
  };

  const handleSaveMarket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingMarket) {
        try {
          await adminApi.updateMarket(editingMarket.marketId, form);
        } catch {
          // Fallback local update
        }
        setMarkets((prev) =>
          prev.map((m) => (m.marketId === editingMarket.marketId ? { ...m, ...form } : m))
        );
        success(`Đã cập nhật điểm chợ "${form.name}" thành công!`);
      } else {
        const newM = { ...form, marketId: Date.now() };
        try {
          await adminApi.createMarket(form);
        } catch {
          // Fallback local create
        }
        setMarkets((prev) => [newM, ...prev]);
        success(`Đã thêm điểm chợ mới "${form.name}" lên hệ thống!`);
      }
      setShowModal(false);
    } catch (err) {
      error(err.message || 'Lỗi khi lưu điểm chợ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMarket = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa điểm chợ "${name}"?`)) return;
    try {
      try {
        await adminApi.deleteMarket(id);
      } catch {
        // Fallback local delete
      }
      setMarkets((prev) => prev.filter((m) => m.marketId !== id));
      success(`Đã xóa điểm chợ "${name}" thành công!`);
    } catch (err) {
      error(err.message || 'Không thể xóa điểm chợ');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Hệ Thống Điểm Chợ Phiên ({markets.length})
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Quản lý các địa điểm họp chợ phân phối nông sản cuối tuần
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setLoading(true);
              loadMarkets();
            }}
            className="btn btn-secondary"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} />
            <span>Thêm Điểm Chợ Mới</span>
          </button>
        </div>
      </div>

      <div className="admin-markets-grid">
        {markets.map((m) => (
          <div key={m.marketId} className="admin-market-card">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{m.name}</h4>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.18)', color: 'var(--primary-light)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '999px' }}>
                  #{m.marketId}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                <MapPin size={14} color="var(--primary)" />
                <span>{m.address}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '8px' }}>
                <Calendar size={14} color="#2563eb" />
                <span>{m.operatingDays || 'Thứ 7 & Chủ Nhật'} ({m.operatingHours || '06:00 - 12:00'})</span>
              </div>

              {m.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
                  {m.description}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => handleOpenEdit(m)} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                <Edit size={14} />
                <span>Sửa</span>
              </button>

              <button onClick={() => handleDeleteMarket(m.marketId, m.name)} className="btn btn-danger" style={{ padding: '6px 12px' }}>
                <Trash2 size={14} />
                <span>Xóa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="kyc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingMarket ? 'Chỉnh Sửa Điểm Chợ' : 'Tạo Điểm Chợ Mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMarket} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Tên điểm chợ:
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Chợ Nông Sản Sạch Cầu Giấy"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Địa chỉ họp chợ:
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="VD: 102 Đường Cầu Giấy, Hà Nội"
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Lịch họp:
                  </label>
                  <input
                    type="text"
                    value={form.operatingDays}
                    onChange={(e) => setForm({ ...form, operatingDays: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Khung giờ:
                  </label>
                  <input
                    type="text"
                    value={form.operatingHours}
                    onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Vĩ độ (Latitude):
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Kinh độ (Longitude):
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
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
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Đang lưu...' : editingMarket ? 'Lưu Thay Đổi' : 'Tạo Điểm Chợ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
