import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  X,
  Package,
  Eye,
  EyeOff,
} from 'lucide-react';
import { adminApi, productsApi } from '@/services';
import { useNotification } from '@/context/NotificationContext';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    icon: '🥬',
    description: '',
    displayOrder: 1,
    status: 'ACTIVE',
  });

  const { success, error } = useNotification();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getCategories();
      setCategories(Array.isArray(data) ? data : (data?.content || data?.data || []));
    } catch (e) {
      console.error('Failed to load categories:', e);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setForm({
      name: '',
      code: '',
      icon: '🥬',
      description: '',
      displayOrder: categories.length + 1,
      status: 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name || '',
      code: cat.code || '',
      icon: cat.icon || '🥬',
      description: cat.description || '',
      displayOrder: cat.displayOrder || 1,
      status: cat.status || 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || form.name.toLowerCase().replace(/\s+/g, '-'),
        icon: form.icon || '🥬',
        description: form.description.trim(),
        displayOrder: Number(form.displayOrder) || 1,
        status: form.status,
      };

      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.categoryId, payload);
        success(`Đã cập nhật danh mục "${form.name}" thành công!`);
      } else {
        await adminApi.createCategory(payload);
        success(`Đã tạo mới danh mục "${form.name}" thành công!`);
      }
      setShowModal(false);
      await loadCategories();
    } catch (err) {
      error(err.message || 'Lỗi khi lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"? Các nông sản thuộc danh mục này sẽ chuyển về chưa phân loại.`)) return;
    try {
      await adminApi.deleteCategory(id);
      success(`Đã xóa danh mục "${name}" thành công!`);
      await loadCategories();
    } catch (err) {
      error(err.message || 'Không thể xóa danh mục');
    }
  };

  const handleToggleStatus = async (cat) => {
    const nextStatus = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminApi.updateCategory(cat.categoryId, { ...cat, status: nextStatus });
      success(`Đã chuyển trạng thái danh mục sang ${nextStatus === 'ACTIVE' ? 'Đang hiển thị' : 'Đã ẩn'}!`);
      await loadCategories();
    } catch (err) {
      error(err.message || 'Không thể thay đổi trạng thái danh mục');
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Quản Lý Danh Mục Nông Sản ({categories.length})
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Cấu hình các nhóm ngành hàng rau củ, quả sạch và dược liệu trên toàn sàn
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setLoading(true);
              loadCategories();
            }}
            className="btn btn-secondary"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} />
            <span>Thêm Danh Mục Mới</span>
          </button>
        </div>
      </div>

      {/* Search and stats bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Tổng số mặt hàng đã phân loại:{' '}
            <strong style={{ color: 'var(--primary-light)' }}>
              {categories.reduce((acc, c) => acc + (c.productCount || 0), 0)} sản phẩm
            </strong>
          </span>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên danh mục..."
            className="form-input"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Category Grid Cards */}
      <div className="admin-markets-grid">
        {filteredCategories.map((c) => {
          const isActive = c.status === 'ACTIVE' || !c.status;
          return (
            <div key={c.categoryId} className="admin-market-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{c.icon || '🥬'}</span>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {c.name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Mã: <code>{c.code || `cat-${c.categoryId}`}</code>
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: isActive ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
                      color: isActive ? '#34d399' : '#f87171',
                      border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    ● {isActive ? 'Hiển thị' : 'Đã ẩn'}
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.5 }}>
                  {c.description || 'Chưa có mô tả chi tiết cho danh mục này.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '14px', fontSize: '0.8rem', color: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={14} color="var(--primary-light)" />
                    <span>Sản phẩm: <strong>{c.productCount || 0}</strong></span>
                  </div>
                  <div>
                    Thứ tự: <strong>#{c.displayOrder || 1}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleToggleStatus(c)}
                  className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                  title={isActive ? 'Ẩn danh mục khỏi menu' : 'Mở hiển thị lại'}
                >
                  {isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{isActive ? 'Ẩn' : 'Hiện'}</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(c)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px' }}
                  title="Chỉnh sửa danh mục"
                >
                  <Edit size={14} />
                  <span>Sửa</span>
                </button>

                <button
                  onClick={() => handleDeleteCategory(c.categoryId, c.name)}
                  className="btn btn-danger"
                  style={{ padding: '6px 12px' }}
                  title="Xóa danh mục"
                >
                  <Trash2 size={14} />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Category */}
      {showModal && (
        <div className="kyc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Nông Sản Mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Biểu tượng:
                  </label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="form-input"
                    style={{ fontSize: '1.3rem', textAlign: 'center' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Tên danh mục:
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Rau Củ Tươi Hữu Cơ"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Mã định danh (Slug):
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="VD: rau-cu-tuoi"
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Thứ tự hiển thị:
                  </label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="form-input"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Trạng thái kích hoạt:
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="form-input"
                >
                  <option value="ACTIVE">Hiển thị công khai (Active)</option>
                  <option value="INACTIVE">Tạm ẩn (Inactive)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Mô tả danh mục:
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả tiêu chuẩn nông sản trong danh mục này..."
                  className="form-input"
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
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Đang lưu...' : editingCategory ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
