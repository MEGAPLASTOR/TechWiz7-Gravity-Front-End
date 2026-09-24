import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Lock,
  X,
} from 'lucide-react';
import { farmerApi } from '@/api/farmer.api';
import { useNotification } from '@/context/NotificationContext';
import { formatCurrency } from '@/utils/formatters';

export const FarmerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: 1,
    unit: 'kg',
    price: 45000,
    currentStock: 50,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
  });

  const { success, error, warning } = useNotification();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, kycRes] = await Promise.allSettled([
        farmerApi.getProducts(),
        farmerApi.getMyKyc(),
      ]);

      if (prodRes.status === 'fulfilled') {
        const pList = Array.isArray(prodRes.value) ? prodRes.value : prodRes.value?.data || [];
        setProducts(pList);
      }
      if (kycRes.status === 'fulfilled' && kycRes.value) {
        const kData = kycRes.value?.data || kycRes.value;
        setIsApproved(Boolean(kData?.isApproved));
      }
    } catch (e) {
      console.error('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    if (!isApproved) {
      warning('Hồ sơ của bạn chưa được Quản trị viên phê duyệt. Vui lòng hoàn tất xác minh danh tính trước khi đăng bán sản phẩm.');
      return;
    }
    setEditingProduct(null);
    setProductForm({
      name: '',
      categoryId: 1,
      unit: 'kg',
      price: 45000,
      currentStock: 50,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || '',
      categoryId: prod.categoryId || 1,
      unit: prod.unit || 'kg',
      price: prod.price || 40000,
      currentStock: prod.currentStock || 0,
      description: prod.description || '',
      imageUrl: prod.imageUrl || '',
    });
    setShowAddModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!isApproved) {
      error('Hồ sơ Nông dân chưa được Quản trị viên duyệt KYC. Bạn chưa có quyền đăng bán sản phẩm.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await farmerApi.updateProduct(editingProduct.productId || editingProduct.id, productForm);
        success(`Đã cập nhật sản phẩm "${productForm.name}" thành công!`);
      } else {
        await farmerApi.createProduct(productForm);
        success(`Đã thêm sản phẩm "${productForm.name}" lên gian hàng thành công!`);
      }
      setShowAddModal(false);
      loadData();
    } catch (err) {
      error(err.message || 'Lỗi khi lưu thông tin sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;
    try {
      await farmerApi.deleteProduct(id);
      success(`Đã xóa sản phẩm "${name}" khỏi quầy bán!`);
      loadData();
    } catch (err) {
      error(err.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    try {
      await farmerApi.updateProductStatus(id, nextStatus);
      success(`Đã chuyển trạng thái sản phẩm sang ${nextStatus === 'AVAILABLE' ? 'Đang mở bán' : 'Tạm ngừng'}!`);
      loadData();
    } catch (err) {
      error(err.message || 'Không thể thay đổi trạng thái bán');
    }
  };

  return (
    <div>
      <div className="farmer-header">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Nông Sản & Quản Lý Tồn Kho ({products.length})
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Toàn bộ các mặt hàng rau, củ, quả nông dân đăng bán tại sạp chợ phiên
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadData} className="btn btn-secondary">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className={`btn ${isApproved ? 'btn-primary' : 'btn-secondary'}`}
            style={{ cursor: isApproved ? 'pointer' : 'not-allowed' }}
          >
            {isApproved ? <Plus size={16} /> : <Lock size={14} />}
            <span>Đăng Bán Nông Sản Mới</span>
          </button>
        </div>
      </div>

      {!isApproved && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Lock size={20} color="#b45309" />
          <div style={{ fontSize: '0.88rem', color: '#92400e' }}>
            <strong>Chức năng bị hạn chế:</strong> Hồ sơ của bạn chưa được Quản trị viên phê duyệt. Chức năng thêm và cập nhật nông sản sẽ được mở sau khi hoàn tất xác minh danh tính.
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="customer-empty-state">
          <Package size={48} className="customer-empty-icon" />
          <h3 className="customer-empty-title">
            Chưa có nông sản nào trên sạp
          </h3>
          <p className="customer-empty-desc">
            {isApproved
              ? 'Bấm nút "Đăng Bán Nông Sản Mới" phía trên để đưa sản phẩm lên phục vụ khách đặt trước.'
              : 'Sau khi được Quản trị viên phê duyệt hồ sơ, bạn sẽ được toàn quyền đăng bán nông sản tại đây.'}
          </p>
        </div>
      ) : (
        <div className="farmer-products-grid">
          {products.map((p) => {
            const isAvail = p.status === 'AVAILABLE';
            return (
              <div key={p.productId || p.id} className="farmer-product-card">
                <div>
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300'}
                      alt={p.name}
                      className="farmer-product-img"
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: isAvail ? 'rgba(240, 253, 244, 0.95)' : 'rgba(254, 242, 242, 0.95)',
                        color: isAvail ? 'var(--primary)' : '#dc2626',
                        border: isAvail ? '1px solid #bbf7d0' : '1px solid #fecaca',
                      }}
                    >
                      {isAvail ? '● Đang mở bán' : '● Tạm ngừng'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{p.name}</h4>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>
                    {formatCurrency(p.price)} /{p.unit || 'kg'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Tồn kho sẵn sàng: <strong style={{ color: 'var(--text-main)' }}>{p.currentStock || 0} {p.unit || 'kg'}</strong>
                  </div>
                  {p.description && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
                      {p.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <button
                    onClick={() => handleToggleStatus(p.productId || p.id, p.status)}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.78rem' }}
                  >
                    {isAvail ? 'Ẩn Mặt Hàng' : 'Mở Bán Lại'}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px' }}
                    title="Chỉnh sửa nông sản"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(p.productId || p.id, p.name)}
                    className="btn btn-danger"
                    style={{ padding: '8px 12px' }}
                    title="Xóa nông sản"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="kyc-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingProduct ? 'Chỉnh Sửa Thông Tin Nông Sản' : 'Đăng Bán Nông Sản Mới'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Tên nông sản:
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="VD: Cà chua bi hữu cơ Ba Vì"
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Giá bán (VNĐ):
                  </label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Đơn vị tính:
                  </label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="form-input"
                  >
                    <option value="kg">kg</option>
                    <option value="bó">bó</option>
                    <option value="hộp">hộp</option>
                    <option value="gói">gói</option>
                    <option value="trái">trái</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Số lượng sẵn sàng thu hoạch (Tồn kho):
                </label>
                <input
                  type="number"
                  value={productForm.currentStock}
                  onChange={(e) => setProductForm({ ...productForm, currentStock: Number(e.target.value) })}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Ảnh nông sản (URL):
                </label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Mô tả & cam kết chuẩn VietGAP:
                </label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Thu hoạch sáng sớm trong ngày, không sử dụng thuốc trừ sâu..."
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Đang lưu...' : editingProduct ? 'Cập Nhật Nông Sản' : 'Đăng Bán Lên Sàn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
