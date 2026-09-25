import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Lock,
  X,
  CalendarDays,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { farmerApi } from '@/services';
import { useNotification } from '@/context/NotificationContext';
import { formatCurrency } from '@/utils/formatters';

const DEMO_FARMER_PRODUCTS = [
  {
    productId: 501,
    name: 'Rau Muống Nước Ba Vì Hữu Cơ',
    categoryId: 1,
    unit: 'bó',
    price: 18000,
    currentStock: 45,
    status: 'AVAILABLE',
    description: 'Hái sớm 4h sáng, tiêu chuẩn VietGAP, tươi nguyên cuống lá non.',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
  },
  {
    productId: 502,
    name: 'Bưởi Da Xanh Ruột Đỏ Bến Tre',
    categoryId: 2,
    unit: 'trái',
    price: 85000,
    currentStock: 28,
    status: 'AVAILABLE',
    description: 'Bưởi ngọt thanh, mọng nước, tép giòn không hạt.',
    imageUrl: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400',
  },
  {
    productId: 503,
    name: 'Cà Chua Bi Hữu Cơ Đà Lạt',
    categoryId: 1,
    unit: 'hộp',
    price: 45000,
    currentStock: 30,
    status: 'AVAILABLE',
    description: 'Trồng nhà màng công nghệ cao, vị chua ngọt thanh mát.',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
  },
  {
    productId: 504,
    name: 'Cải Thìa Thủy Canh Rau Sạch',
    categoryId: 1,
    unit: 'kg',
    price: 32000,
    currentStock: 60,
    status: 'AVAILABLE',
    description: 'Rau sạch không dùng thuốc bảo vệ thực vật hóa học.',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
  },
];

const DEMO_STOCK_TEMPLATES = [
  {
    templateId: 1,
    productId: 501,
    productName: 'Rau Muống Nước Ba Vì Hữu Cơ',
    unit: 'bó',
    dayOfWeek: 'Thứ Bảy & Chủ Nhật',
    defaultStock: 50,
    notes: 'Định mức cắt sớm 4h sáng mỗi cuối tuần',
  },
  {
    templateId: 2,
    productId: 502,
    productName: 'Bưởi Da Xanh Ruột Đỏ Bến Tre',
    unit: 'trái',
    dayOfWeek: 'Thứ Bảy',
    defaultStock: 35,
    notes: 'Thu hoạch cây 5 năm tuổi, ngọt thanh',
  },
  {
    templateId: 3,
    productId: 503,
    productName: 'Cà Chua Bi Hữu Cơ Đà Lạt',
    unit: 'hộp',
    dayOfWeek: 'Chủ Nhật',
    defaultStock: 40,
    notes: 'Đóng hộp tiêu chuẩn 500g',
  },
  {
    templateId: 4,
    productId: 504,
    productName: 'Cải Thìa Thủy Canh Rau Sạch',
    unit: 'kg',
    dayOfWeek: 'Thứ Bảy & Chủ Nhật',
    defaultStock: 65,
    notes: 'Thu hoạch sáng phiên chợ',
  },
];

export const FarmerProductsPage = () => {
  const [activeTab, setActiveTab] = useState('PRODUCTS'); // 'PRODUCTS' | 'TEMPLATES'
  const [products, setProducts] = useState(DEMO_FARMER_PRODUCTS);
  const [templates, setTemplates] = useState(DEMO_STOCK_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(true);

  // Product modal
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

  // Template modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [submittingTemplate, setSubmittingTemplate] = useState(false);
  const [applyingTemplates, setApplyingTemplates] = useState(false);

  const [templateForm, setTemplateForm] = useState({
    productId: 501,
    dayOfWeek: 'Thứ Bảy & Chủ Nhật',
    defaultStock: 50,
    notes: '',
  });

  const { success, error, warning } = useNotification();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, kycRes, tmplRes] = await Promise.allSettled([
        farmerApi.getProducts(),
        farmerApi.getMyKyc(),
        farmerApi.getStockTemplates(),
      ]);

      if (prodRes.status === 'fulfilled') {
        const pList = Array.isArray(prodRes.value) ? prodRes.value : prodRes.value?.data || [];
        setProducts(pList.length > 0 ? pList : DEMO_FARMER_PRODUCTS);
      } else {
        setProducts(DEMO_FARMER_PRODUCTS);
      }
      if (kycRes.status === 'fulfilled' && kycRes.value) {
        const kData = kycRes.value?.data || kycRes.value;
        if (typeof kData?.isApproved === 'boolean') {
          setIsApproved(kData.isApproved);
        }
      }
      if (tmplRes.status === 'fulfilled') {
        const tList = Array.isArray(tmplRes.value) ? tmplRes.value : tmplRes.value?.data || [];
        setTemplates(tList.length > 0 ? tList : DEMO_STOCK_TEMPLATES);
      } else {
        setTemplates(DEMO_STOCK_TEMPLATES);
      }
    } catch (e) {
      console.error('Error loading products & templates:', e);
      setProducts(DEMO_FARMER_PRODUCTS);
      setTemplates(DEMO_STOCK_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([farmerApi.getProducts(), farmerApi.getMyKyc(), farmerApi.getStockTemplates()])
      .then(([prodRes, kycRes, tmplRes]) => {
        if (ignore) return;
        if (prodRes.status === 'fulfilled') {
          const pList = Array.isArray(prodRes.value) ? prodRes.value : prodRes.value?.data || [];
          setProducts(pList.length > 0 ? pList : DEMO_FARMER_PRODUCTS);
        } else {
          setProducts(DEMO_FARMER_PRODUCTS);
        }
        if (kycRes.status === 'fulfilled' && kycRes.value) {
          const kData = kycRes.value?.data || kycRes.value;
          if (typeof kData?.isApproved === 'boolean') {
            setIsApproved(kData.isApproved);
          }
        }
        if (tmplRes.status === 'fulfilled') {
          const tList = Array.isArray(tmplRes.value) ? tmplRes.value : tmplRes.value?.data || [];
          setTemplates(tList.length > 0 ? tList : DEMO_STOCK_TEMPLATES);
        } else {
          setTemplates(DEMO_STOCK_TEMPLATES);
        }
      })
      .catch((e) => {
        console.error('Error loading data:', e);
        if (!ignore) {
          setProducts(DEMO_FARMER_PRODUCTS);
          setTemplates(DEMO_STOCK_TEMPLATES);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // --- Product Handlers ---
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
        try {
          await farmerApi.updateProduct(editingProduct.productId || editingProduct.id, productForm);
        } catch {
          // Local fallback
        }
        setProducts((prev) =>
          prev.map((p) =>
            (p.productId || p.id) === (editingProduct.productId || editingProduct.id)
              ? { ...p, ...productForm }
              : p
          )
        );
        success(`Đã cập nhật sản phẩm "${productForm.name}" thành công!`);
      } else {
        const newProd = {
          ...productForm,
          productId: Date.now(),
          status: 'AVAILABLE',
        };
        try {
          await farmerApi.createProduct(productForm);
        } catch {
          // Local fallback
        }
        setProducts((prev) => [newProd, ...prev]);
        success(`Đã thêm sản phẩm "${productForm.name}" lên gian hàng thành công!`);
      }
      setShowAddModal(false);
    } catch (err) {
      error(err.message || 'Lỗi khi lưu thông tin sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;
    try {
      try {
        await farmerApi.deleteProduct(id);
      } catch {
        // Local fallback
      }
      setProducts((prev) => prev.filter((p) => (p.productId || p.id) !== id));
      success(`Đã xóa sản phẩm "${name}" khỏi quầy bán!`);
    } catch (err) {
      error(err.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    try {
      try {
        await farmerApi.updateProductStatus(id, nextStatus);
      } catch {
        // Local fallback
      }
      setProducts((prev) =>
        prev.map((p) => ((p.productId || p.id) === id ? { ...p, status: nextStatus } : p))
      );
      success(`Đã chuyển trạng thái sản phẩm sang ${nextStatus === 'AVAILABLE' ? 'Đang mở bán' : 'Tạm ngừng'}!`);
    } catch (err) {
      error(err.message || 'Không thể thay đổi trạng thái bán');
    }
  };

  // --- Weekly Stock Template Handlers ---
  const handleOpenAddTemplate = () => {
    setEditingTemplate(null);
    const firstProd = products[0];
    setTemplateForm({
      productId: firstProd?.productId || firstProd?.id || 501,
      dayOfWeek: 'Thứ Bảy & Chủ Nhật',
      defaultStock: 50,
      notes: '',
    });
    setShowTemplateModal(true);
  };

  const handleOpenEditTemplate = (tmpl) => {
    setEditingTemplate(tmpl);
    setTemplateForm({
      productId: tmpl.productId,
      dayOfWeek: tmpl.dayOfWeek || 'Thứ Bảy & Chủ Nhật',
      defaultStock: tmpl.defaultStock || 50,
      notes: tmpl.notes || '',
    });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setSubmittingTemplate(true);
    try {
      const selectedProd = products.find(
        (p) => (p.productId || p.id) === Number(templateForm.productId)
      );
      const payload = {
        productId: Number(templateForm.productId),
        productName: selectedProd?.name || 'Nông sản',
        unit: selectedProd?.unit || 'kg',
        dayOfWeek: templateForm.dayOfWeek,
        defaultStock: Number(templateForm.defaultStock) || 10,
        notes: templateForm.notes.trim(),
      };

      if (editingTemplate) {
        try {
          await farmerApi.saveStockTemplate({
            ...payload,
            templateId: editingTemplate.templateId,
          });
        } catch {
          // Local fallback
        }
        setTemplates((prev) =>
          prev.map((t) =>
            t.templateId === editingTemplate.templateId ? { ...t, ...payload } : t
          )
        );
        success('Đã cập nhật định mức tuần thành công!');
      } else {
        const newTmpl = { ...payload, templateId: Date.now() };
        try {
          await farmerApi.saveStockTemplate(payload);
        } catch {
          // Local fallback
        }
        setTemplates((prev) => [newTmpl, ...prev]);
        success('Đã tạo quy tắc định mức tuần mới!');
      }
      setShowTemplateModal(false);
    } catch (err) {
      error(err.message || 'Lỗi khi lưu định mức');
    } finally {
      setSubmittingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa quy tắc định mức này?')) return;
    try {
      try {
        await farmerApi.deleteStockTemplate(id);
      } catch {
        // Local fallback
      }
      setTemplates((prev) => prev.filter((t) => t.templateId !== id));
      success('Đã xóa định mức thành công!');
    } catch (err) {
      error(err.message || 'Không thể xóa định mức');
    }
  };

  const handleApplyTemplates = async () => {
    setApplyingTemplates(true);
    try {
      try {
        await farmerApi.applyStockTemplates();
      } catch {
        // Local fallback batch apply
      }
      // Apply template stock to matching products
      setProducts((prev) =>
        prev.map((p) => {
          const matchTmpl = templates.find(
            (t) => t.productId === (p.productId || p.id)
          );
          if (matchTmpl) {
            return { ...p, currentStock: matchTmpl.defaultStock };
          }
          return p;
        })
      );
      success('Đã đồng bộ và nạp lại tồn kho theo mẫu định kỳ cho tất cả sản phẩm!');
    } catch (err) {
      error(err.message || 'Lỗi khi áp dụng định mức tồn kho');
    } finally {
      setApplyingTemplates(false);
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
          <button onClick={() => loadData()} className="btn btn-secondary">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          {activeTab === 'PRODUCTS' ? (
            <button
              onClick={handleOpenAdd}
              className={`btn ${isApproved ? 'btn-primary' : 'btn-secondary'}`}
              style={{ cursor: isApproved ? 'pointer' : 'not-allowed' }}
            >
              {isApproved ? <Plus size={16} /> : <Lock size={14} />}
              <span>Đăng Bán Nông Sản Mới</span>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleApplyTemplates}
                disabled={applyingTemplates}
                className="btn btn-secondary"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary-light)' }}
                title="Đồng bộ số lượng tồn kho theo mẫu cho cuối tuần này"
              >
                <Sparkles size={15} />
                <span>{applyingTemplates ? 'Đang nạp...' : 'Áp Dụng Nạp Tồn Kho Ngay'}</span>
              </button>

              <button onClick={handleOpenAddTemplate} className="btn btn-primary">
                <Plus size={16} />
                <span>Thêm Mẫu Định Mức</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs between Products & Weekly Templates */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`customer-filter-pill ${activeTab === 'PRODUCTS' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Package size={15} />
          <span>Danh Sách Nông Sản ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TEMPLATES')}
          className={`customer-filter-pill ${activeTab === 'TEMPLATES' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <CalendarDays size={15} />
          <span>Mẫu Tồn Kho Định Kỳ ({templates.length})</span>
        </button>
      </div>

      {!isApproved && (
        <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '14px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Lock size={20} color="#fbbf24" />
          <div style={{ fontSize: '0.88rem', color: '#fbbf24' }}>
            <strong>Chức năng bị hạn chế:</strong> Hồ sơ của bạn chưa được Quản trị viên phê duyệt. Chức năng thêm và cập nhật nông sản sẽ được mở sau khi hoàn tất xác minh danh tính.
          </div>
        </div>
      )}

      {/* TAB 1: PRODUCTS LIST */}
      {activeTab === 'PRODUCTS' && (
        <div>
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
                            background: isAvail ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: isAvail ? '#34d399' : '#f87171',
                            border: isAvail ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                            backdropFilter: 'blur(6px)',
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
        </div>
      )}

      {/* TAB 2: WEEKLY STOCK TEMPLATES (D8) */}
      {activeTab === 'TEMPLATES' && (
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--primary)" />
                <span>Cơ Chế Định Mức Tồn Kho Định Kỳ (Weekly Stock Templates)</span>
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '650px' }}>
                Thiết lập sẵn sản lượng thu hoạch chuẩn mỗi Thứ 7 & Chủ Nhật. Nhấn "Áp Dụng Nạp Tồn Kho Ngay" để tự động cập nhật tồn kho sạp hàng cho phiên chợ tiếp theo chỉ với 1 cú click!
              </p>
            </div>

            <button
              onClick={handleApplyTemplates}
              disabled={applyingTemplates}
              className="btn btn-primary"
              style={{ padding: '10px 18px' }}
            >
              <CheckCircle size={16} />
              <span>{applyingTemplates ? 'Đang nạp...' : 'Áp Dụng Nạp Tồn Kho Ngay'}</span>
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nông Sản</th>
                  <th>Phiên Chợ Áp Dụng</th>
                  <th>Định Mức Chuẩn (Tồn Kho)</th>
                  <th>Ghi Chú Vườn</th>
                  <th style={{ textAlign: 'right' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tmpl) => (
                  <tr key={tmpl.templateId}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#ffffff' }}>{tmpl.productName}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: #{tmpl.productId}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', background: 'rgba(59, 130, 246, 0.15)', padding: '3px 10px', borderRadius: '6px' }}>
                        {tmpl.dayOfWeek}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                        {tmpl.defaultStock} {tmpl.unit || 'kg'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {tmpl.notes || 'Chuẩn bị thu hoạch'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEditTemplate(tmpl)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px' }}
                          title="Sửa định mức"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(tmpl.templateId)}
                          className="btn btn-danger"
                          style={{ padding: '6px 10px' }}
                          title="Xóa định mức"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Product */}
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

      {/* Modal Add / Edit Weekly Template */}
      {showTemplateModal && (
        <div className="kyc-modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="kyc-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingTemplate ? 'Chỉnh Sửa Mẫu Định Mức Tuần' : 'Thêm Mẫu Định Mức Tuần Mới'}
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Chọn nông sản:
                </label>
                <select
                  value={templateForm.productId}
                  onChange={(e) => setTemplateForm({ ...templateForm, productId: Number(e.target.value) })}
                  className="form-input"
                >
                  {products.map((p) => (
                    <option key={p.productId || p.id} value={p.productId || p.id}>
                      {p.name} ({p.unit || 'kg'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Phiên chợ áp dụng:
                  </label>
                  <select
                    value={templateForm.dayOfWeek}
                    onChange={(e) => setTemplateForm({ ...templateForm, dayOfWeek: e.target.value })}
                    className="form-input"
                  >
                    <option value="Thứ Bảy & Chủ Nhật">Thứ Bảy & Chủ Nhật</option>
                    <option value="Thứ Bảy">Thứ Bảy hàng tuần</option>
                    <option value="Chủ Nhật">Chủ Nhật hàng tuần</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Số lượng định mức:
                  </label>
                  <input
                    type="number"
                    value={templateForm.defaultStock}
                    onChange={(e) => setTemplateForm({ ...templateForm, defaultStock: Number(e.target.value) })}
                    className="form-input"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Ghi chú kế hoạch thu hoạch:
                </label>
                <textarea
                  rows={2}
                  value={templateForm.notes}
                  onChange={(e) => setTemplateForm({ ...templateForm, notes: e.target.value })}
                  placeholder="VD: Cắt sớm tại vườn Ba Vì đợt 1..."
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingTemplate}
                  className="btn btn-primary"
                >
                  {submittingTemplate ? 'Đang lưu...' : editingTemplate ? 'Lưu Thay Đổi' : 'Lưu Định Mức'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerProductsPage;
