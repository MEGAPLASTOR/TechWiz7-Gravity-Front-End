import React, { useState, useEffect } from 'react';
import { Megaphone, Trash2, Edit, RefreshCw, X, Check } from 'lucide-react';
import { adminApi } from '@/services';
import { useNotification } from '@/context/NotificationContext';
import { formatDateTime } from '@/utils/formatters';

export const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { success, error } = useNotification();

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : (data?.content || data?.data || []));
    } catch (e) {
      console.error('Failed to load announcements:', e);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleStartEdit = (a) => {
    const id = a.announcementId || a.id;
    setEditingId(id);
    setTitle(a.title || '');
    setContent(a.content || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const payload = { title: title.trim(), content: content.trim() };
      if (editingId) {
        await adminApi.updateAnnouncement(editingId, payload);
        success('Đã cập nhật thông báo thành công!');
        handleCancelEdit();
      } else {
        await adminApi.createAnnouncement(payload);
        success('Đã phát hành thông báo toàn sàn thành công!');
        setTitle('');
        setContent('');
      }
      await loadAnnouncements();
    } catch (err) {
      error(err.message || 'Lỗi khi lưu thông báo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ thông báo này?')) return;
    try {
      await adminApi.deleteAnnouncement(id);
      if (editingId === id) {
        handleCancelEdit();
      }
      success('Đã gỡ thông báo thành công!');
      await loadAnnouncements();
    } catch (err) {
      error(err.message || 'Không thể xóa thông báo');
    }
  };

  return (
    <div className="admin-announcements-layout">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Thông Báo Đang Hoạt Động ({announcements.length})
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Danh sách thông báo đã phát hành tới khách hàng và sạp nông dân
            </span>
          </div>

          <button onClick={() => loadAnnouncements()} className="admin-refresh-btn" type="button">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>

        {announcements.length === 0 ? (
          <div className="admin-empty-state">
            <Megaphone size={40} style={{ color: '#cbd5e1', margin: '0 auto 10px' }} />
            <h4 style={{ color: 'var(--text-main)', fontWeight: 700 }}>Chưa có thông báo nào</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Phát hành thông báo mới bên cạnh để gửi tin tức đến toàn sàn.
            </p>
          </div>
        ) : (
          <div>
            {announcements.map((a) => {
              const id = a.announcementId || a.id;
              const isSelected = editingId === id;
              return (
                <div
                  key={id}
                  className="admin-announcement-card"
                  style={{
                    borderColor: isSelected ? 'var(--primary)' : undefined,
                    boxShadow: isSelected ? '0 0 0 1px var(--primary)' : undefined,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Megaphone size={16} color="#dc2626" />
                      <h4 className="admin-announcement-title">{a.title}</h4>
                      {isSelected && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-light)', padding: '2px 8px', borderRadius: '999px' }}>
                          Đang sửa
                        </span>
                      )}
                    </div>
                    <p className="admin-announcement-content">{a.content}</p>
                    {a.createdAt && (
                      <div className="admin-announcement-date">
                        Phát hành: {formatDateTime(a.createdAt)}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: '12px' }}>
                    <button
                      onClick={() => handleStartEdit(a)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px' }}
                      title="Chỉnh sửa thông báo"
                      type="button"
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      onClick={() => handleDelete(id)}
                      className="admin-announcement-delete-btn"
                      title="Gỡ thông báo"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="admin-form-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {editingId ? 'Chỉnh Sửa Thông Báo' : 'Phát Hành Thông Báo Mới'}
          </h3>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              type="button"
            >
              <X size={13} />
              <span>Hủy sửa</span>
            </button>
          )}
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {editingId
            ? 'Thay đổi tiêu đề hoặc nội dung thông báo đã phát hành.'
            : 'Thông báo sẽ hiển thị trực tiếp trên trang chủ của khách hàng và sạp nông dân.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              Tiêu đề thông báo:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Cập nhật thời tiết và khung giờ họp chợ Tây Hồ"
              className="form-input"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              Nội dung thông báo:
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung thông báo chi tiết..."
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className={editingId ? 'btn btn-primary' : 'admin-btn-danger-submit'}
              style={{ flex: editingId ? 2 : 1 }}
            >
              {editingId ? <Check size={18} /> : <Megaphone size={18} />}
              <span>
                {submitting
                  ? 'Đang lưu...'
                  : editingId
                  ? 'Lưu Thay Đổi Thông Báo'
                  : 'Phát Hành Thông Báo Toàn Sàn'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAnnouncementsPage;
