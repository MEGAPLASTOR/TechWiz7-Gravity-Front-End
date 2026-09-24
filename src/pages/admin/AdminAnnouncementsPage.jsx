import React, { useState, useEffect } from 'react';
import { Megaphone, Trash2, RefreshCw } from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { useNotification } from '@/context/NotificationContext';
import { formatDateTime } from '@/utils/formatters';

export const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { success, error } = useNotification();

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load announcements:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await adminApi.createAnnouncement({ title: title.trim(), content: content.trim() });
      success('Đã phát hành thông báo toàn sàn thành công!');
      setTitle('');
      setContent('');
      loadAnnouncements();
    } catch (err) {
      error(err.message || 'Lỗi khi phát hành thông báo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ thông báo này?')) return;
    try {
      await adminApi.deleteAnnouncement(id);
      success('Đã gỡ thông báo thành công!');
      loadAnnouncements();
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
              Danh sách thông báo đã phát hành
            </span>
          </div>

          <button onClick={loadAnnouncements} className="admin-refresh-btn" type="button">
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
            {announcements.map((a) => (
              <div key={a.announcementId || a.id} className="admin-announcement-card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Megaphone size={16} color="#dc2626" />
                    <h4 className="admin-announcement-title">{a.title}</h4>
                  </div>
                  <p className="admin-announcement-content">{a.content}</p>
                  {a.createdAt && (
                    <div className="admin-announcement-date">
                      Phát hành: {formatDateTime(a.createdAt)}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(a.announcementId || a.id)}
                  className="admin-announcement-delete-btn"
                  title="Gỡ thông báo"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-form-box">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
          Phát Hành Thông Báo Mới
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Thông báo sẽ hiển thị trực tiếp trên trang chủ của khách hàng và sạp nông dân.
        </p>

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

          <button
            type="submit"
            disabled={submitting}
            className="admin-btn-danger-submit"
          >
            <Megaphone size={18} />
            <span>{submitting ? 'Đang phát hành...' : 'Phát Hành Thông Báo Toàn Sàn'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
