import React, { useState, useEffect, useMemo } from "react";
import "@/assets/styles/pages/admin/ContentModerationPage.css";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import adminService from "../../services/adminService";
import { useLanguage } from "../../context/LanguageContext";

export default function ContentModerationPage({ onNavigate }) {
  const { isEn } = useLanguage();
  const [activeTab, setActiveTab] = useState("reviews");
  const [reviewsPage, setReviewsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [announcementsPage, setAnnouncementsPage] = useState(1);
  const PAGE_SIZE = 15;
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("ALL");
  const [reviewSearch, setReviewSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    type: "GENERAL",
    targetRole: "ALL",
    isActive: true,
  });
  const [disputes, setDisputes] = useState([]);
  const [notification, setNotification] = useState({
    type: "",
    text: "",
  });
  const showToast = (type, text) => {
    setNotification({
      type,
      text,
    });
    setTimeout(
      () =>
        setNotification({
          type: "",
          text: "",
        }),
      4000,
    );
  };
  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const data = await adminService.getAllReviews({
        keyword: reviewSearch.trim(),
        filter: reviewFilter,
      });
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load reviews", err);
    } finally {
      setLoadingReviews(false);
    }
  };
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await adminService.getAllCategories(categorySearch.trim());
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load categories", err);
    } finally {
      setLoadingCategories(false);
    }
  };
  const loadAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const data = await adminService.getAllAnnouncements({
        keyword: announcementSearch.trim(),
      });
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load announcements", err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };
  useEffect(() => {
    if (activeTab === "reviews") {
      setReviewsPage(1);
      const timer = setTimeout(() => loadReviews(), 250);
      return () => clearTimeout(timer);
    }
    if (activeTab === "categories") {
      setCategoriesPage(1);
      const timer = setTimeout(() => loadCategories(), 250);
      return () => clearTimeout(timer);
    }
    if (activeTab === "announcements") {
      setAnnouncementsPage(1);
      const timer = setTimeout(() => loadAnnouncements(), 250);
      return () => clearTimeout(timer);
    }
  }, [
    activeTab,
    reviewSearch,
    reviewFilter,
    categorySearch,
    announcementSearch,
  ]);
  const handleToggleReviewVisibility = async (reviewId, currentIsHidden) => {
    const nextHidden = !currentIsHidden;
    try {
      await adminService.setReviewVisibility(reviewId, nextHidden);
      showToast(
        "success",
        nextHidden
          ? (isEn ? "Review hidden from public view." : "Đã ẩn đánh giá khỏi giao diện người xem.")
          : (isEn ? "Review restored to public view." : "Đã hiển thị lại đánh giá công khai."),
      );
      loadReviews();
    } catch (err) {
      showToast(
        "error",
        (isEn ? "Failed to change review status: " : "Lỗi thay đổi trạng thái đánh giá: ") +
          (err.response?.data?.message || err.message),
      );
    }
  };
  const filteredReviews = reviews;

  const paginatedReviews = useMemo(() => {
    const start = (reviewsPage - 1) * PAGE_SIZE;
    return filteredReviews.slice(start, start + PAGE_SIZE);
  }, [filteredReviews, reviewsPage]);

  const paginatedCategories = useMemo(() => {
    const start = (categoriesPage - 1) * PAGE_SIZE;
    return categories.slice(start, start + PAGE_SIZE);
  }, [categories, categoriesPage]);

  const paginatedAnnouncements = useMemo(() => {
    const start = (announcementsPage - 1) * PAGE_SIZE;
    return announcements.slice(start, start + PAGE_SIZE);
  }, [announcements, announcementsPage]);
  const handleOpenCategoryModal = (cat = null) => {
    setEditingCategory(cat);
    if (cat) {
      setCategoryForm({
        name: cat.name || "",
        slug: cat.slug || "",
        description: cat.description || "",
      });
    } else {
      setCategoryForm({
        name: "",
        slug: "",
        description: "",
      });
    }
    setIsCategoryModalOpen(true);
  };
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert(isEn ? "Please enter category name!" : "Vui lòng nhập tên danh mục!");
      return;
    }
    try {
      if (editingCategory) {
        await adminService.updateCategory(
          editingCategory.categoryId,
          categoryForm,
        );
        showToast(
          "success",
          isEn
            ? "Category updated successfully!"
            : "Cập nhật danh mục thành công!",
        );
      } else {
        await adminService.createCategory(categoryForm);
        showToast(
          "success",
          isEn
            ? "Created new produce category successfully!"
            : "Tạo danh mục sản phẩm mới thành công!",
        );
      }
      setIsCategoryModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast(
        "error",
        (isEn ? "Error saving category: " : "Lỗi lưu danh mục: ") +
          (err.response?.data?.message || err.message),
      );
    }
  };
  const handleDeleteCategory = async (id, name) => {
    if (
      !window.confirm(
        isEn
          ? `Confirm deleting category "${name}"? Products in this category will need reassignment.`
          : `Xác nhận xóa danh mục "${name}"? Hành động này sẽ yêu cầu các sản phẩm thuộc danh mục được chuyển sang phân loại khác.`,
      )
    ) {
      return;
    }
    try {
      await adminService.deleteCategory(id);
      showToast(
        "success",
        isEn
          ? `Deleted category "${name}" successfully.`
          : `Đã xóa danh mục "${name}" thành công.`,
      );
      loadCategories();
    } catch (err) {
      showToast(
        "error",
        (isEn ? "Error deleting category: " : "Lỗi xóa danh mục: ") +
          (err.response?.data?.message || err.message),
      );
    }
  };
  const handleOpenAnnouncementModal = (ann = null) => {
    setEditingAnnouncement(ann);
    if (ann) {
      setAnnouncementForm({
        title: ann.title || "",
        content: ann.content || "",
        type: ann.type || "GENERAL",
        targetRole: ann.targetRole || "ALL",
        isActive: ann.isActive !== undefined ? ann.isActive : true,
      });
    } else {
      setAnnouncementForm({
        title: "",
        content: "",
        type: "GENERAL",
        targetRole: "ALL",
        isActive: true,
      });
    }
    setIsAnnouncementModalOpen(true);
  };
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim()) {
      alert(
        isEn
          ? "Please enter announcement title!"
          : "Vui lòng nhập tiêu đề thông báo!",
      );
      return;
    }
    try {
      if (editingAnnouncement) {
        await adminService.updateAnnouncement(
          editingAnnouncement.announcementId || editingAnnouncement.id,
          announcementForm,
        );
        showToast(
          "success",
          isEn
            ? "Updated system announcement successfully!"
            : "Cập nhật thông báo hệ thống thành công!",
        );
      } else {
        await adminService.createAnnouncement(announcementForm);
        showToast(
          "success",
          isEn
            ? "Published new system announcement successfully!"
            : "Đăng thông báo hệ thống mới thành công!",
        );
      }
      setIsAnnouncementModalOpen(false);
      loadAnnouncements();
    } catch (err) {
      showToast(
        "error",
        (isEn ? "Error saving announcement: " : "Lỗi lưu thông báo: ") +
          (err.response?.data?.message || err.message),
      );
    }
  };
  const handleDeleteAnnouncement = async (id, title) => {
    if (
      !window.confirm(
        isEn
          ? `Confirm deleting announcement "${title}" from the system?`
          : `Xác nhận xóa bản tin "${title}" khỏi hệ thống?`,
      )
    )
      return;
    try {
      await adminService.deleteAnnouncement(id);
      showToast(
        "success",
        isEn
          ? "Deleted announcement successfully."
          : "Đã xóa bản tin thành công.",
      );
      loadAnnouncements();
    } catch (err) {
      showToast(
        "error",
        (isEn ? "Error deleting announcement: " : "Lỗi xóa bản tin: ") +
          (err.response?.data?.message || err.message),
      );
    }
  };
  const submitCategory = async (event) => {
    setSavingCategory(true);
    try {
      await handleSaveCategory(event);
    } finally {
      setSavingCategory(false);
    }
  };
  const submitAnnouncement = async (event) => {
    setSavingAnnouncement(true);
    try {
      await handleSaveAnnouncement(event);
    } finally {
      setSavingAnnouncement(false);
    }
  };
  return (
    <div className="ml-content-mod-page">
      {notification.text && (
        <div
          className={
            notification.type === "success"
              ? "ml-operation-toast ml-operation-toast--success"
              : "ml-operation-toast ml-operation-toast--error"
          }
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: "10px",
            fontWeight: 600,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            backgroundColor:
              notification.type === "success" ? "#15803d" : "#b91c1c",
            color: "#ffffff",
          }}
        >
          {notification.type === "success" ? "✓ " : "⚠️ "} {notification.text}
        </div>
      )}

      <div className="ml-mod-banner">
        <div className="ml-container ml-mod-banner-inner">
          <div>
            <span
              className="ml-section-subtitle"
              style={{
                color: "#86efac",
              }}
            >
              {isEn
                ? "MarketLink System Administration"
                : "Ban Quản Trị Hệ Thống MarketLink"}
            </span>
            <h1 className="ml-mod-title">
              {isEn
                ? "Content Moderation & Platform Operations"
                : "Kiểm Duyệt Nội Dung & Vận Hành Sàn"}
            </h1>
            <p className="ml-mod-desc">
              {isEn
                ? "Moderate reviews, manage produce categories, and publish announcements & market schedules across the platform."
                : "Kiểm duyệt đánh giá, quản lý danh mục phân loại nông sản và phát hành các bản tin, thông báo lịch chợ toàn sàn."}
            </p>
          </div>

          <div className="ml-mod-stats-strip">
            <div className="ml-mod-stat-pill">
              <span className="ml-mod-stat-num">{reviews.length}</span>
              <span className="ml-mod-stat-lbl">
                {isEn ? "Reviews" : "Đánh giá"}
              </span>
            </div>
            <div className="ml-mod-stat-pill">
              <span className="ml-mod-stat-num">{categories.length}</span>
              <span className="ml-mod-stat-lbl">
                {isEn ? "Categories" : "Danh mục"}
              </span>
            </div>
            <div className="ml-mod-stat-pill">
              <span className="ml-mod-stat-num">{announcements.length}</span>
              <span className="ml-mod-stat-lbl">
                {isEn ? "Announcements" : "Bản tin"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="ml-container ml-mod-content">
        <div
          className="ml-inv-main-tabs"
          style={{
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            className={`ml-inv-main-tab ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            {isEn
              ? `⭐ Product Reviews (${reviews.length})`
              : `⭐ Kiểm duyệt đánh giá (${reviews.length})`}
          </button>
          <button
            type="button"
            className={`ml-inv-main-tab ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            {isEn
              ? `🏷️ Produce Categories (${categories.length})`
              : `🏷️ Danh mục nông sản (${categories.length})`}
          </button>
          <button
            type="button"
            className={`ml-inv-main-tab ${activeTab === "announcements" ? "active" : ""}`}
            onClick={() => setActiveTab("announcements")}
          >
            {isEn
              ? `📢 News & Announcements (${announcements.length})`
              : `📢 Thông báo & Bản tin (${announcements.length})`}
          </button>
          <button
            type="button"
            className={`ml-inv-main-tab ${activeTab === "disputes" ? "active" : ""}`}
            onClick={() => setActiveTab("disputes")}
          >
            {isEn
              ? `⚖️ Disputes & Complaints (${disputes.length})`
              : `⚖️ Tranh chấp & Khiếu nại (${disputes.length})`}
          </button>
        </div>

        {activeTab === "reviews" && (
          <div className="ml-reviews-mod-box">
            <div
              className="ml-card ml-mod-controls"
              style={{
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#475569",
                    }}
                  >
                    {isEn ? "Filter by status:" : "Bộ lọc hiển thị:"}
                  </span>
                  <button
                    type="button"
                    className={`ml-filter-chip ${reviewFilter === "ALL" ? "active" : ""}`}
                    onClick={() => setReviewFilter("ALL")}
                  >
                    {isEn ? `All (${reviews.length})` : `Tất cả (${reviews.length})`}
                  </button>
                  <button
                    type="button"
                    className={`ml-filter-chip ${reviewFilter === "LOW_RATING" ? "active" : ""}`}
                    onClick={() => setReviewFilter("LOW_RATING")}
                  >
                    {isEn
                      ? `Low rating (1-2★) (${reviews.filter((r) => (r.rating || 5) <= 2).length})`
                      : `Đánh giá thấp (1-2★) (${reviews.filter((r) => (r.rating || 5) <= 2).length})`}
                  </button>
                  <button
                    type="button"
                    className={`ml-filter-chip ${reviewFilter === "HIDDEN" ? "active" : ""}`}
                    onClick={() => setReviewFilter("HIDDEN")}
                  >
                    {isEn
                      ? `Hidden (${reviews.filter((r) => r.isHidden).length})`
                      : `Đang bị ẩn (${reviews.filter((r) => r.isHidden).length})`}
                  </button>
                  <button
                    type="button"
                    className={`ml-filter-chip ${reviewFilter === "VISIBLE" ? "active" : ""}`}
                    onClick={() => setReviewFilter("VISIBLE")}
                  >
                    {isEn
                      ? `Visible (${reviews.filter((r) => !r.isHidden).length})`
                      : `Đang hiển thị (${reviews.filter((r) => !r.isHidden).length})`}
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <input
                    type="text"
                    className="ml-form-input"
                    style={{
                      minWidth: 260,
                    }}
                    placeholder={
                      isEn
                        ? "Search by customer, farmer, content..."
                        : "Tìm theo khách, nông dân, nội dung..."
                    }
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                  />
                  {reviewSearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReviewSearch("")}
                    >
                      ✕
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={loadReviews}>
                    🔄 {isEn ? "Refresh" : "Tải lại"}
                  </Button>
                </div>
              </div>
            </div>

            {loadingReviews ? (
              <div className="ml-inv-loading">
                {isEn ? "Loading reviews list..." : "Đang tải danh sách đánh giá..."}
              </div>
            ) : filteredReviews.length === 0 ? (
              <div
                className="ml-card"
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                {isEn
                  ? "No reviews matching the search filters."
                  : "Không có đánh giá nào phù hợp với bộ lọc."}
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                {paginatedReviews.map((r) => (
                  <div
                    key={r.reviewId}
                    className="ml-card"
                    style={{
                      borderLeft: r.isHidden
                        ? "4px solid #ef4444"
                        : "4px solid #22c55e",
                      backgroundColor: r.isHidden ? "#fef2f2" : "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 15,
                              color: "#1e293b",
                            }}
                          >
                            {r.customerName || (isEn ? "Customer" : "Khách hàng")}
                          </span>
                          <span
                            style={{
                              color: "#eab308",
                              fontSize: 15,
                            }}
                          >
                            {"★".repeat(r.rating || 5)}
                            {"☆".repeat(Math.max(0, 5 - (r.rating || 5)))}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              color: "#64748b",
                            }}
                          >
                            (
                            {r.createdAt
                              ? r.createdAt.replace("T", " ").substring(0, 16)
                              : ""}
                            )
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#475569",
                            marginTop: 2,
                          }}
                        >
                          {isEn ? "Review for stall: " : "Đánh giá cho sạp: "}
                          <strong>{r.stallName || r.farmerName}</strong>{" "}
                          {r.productName ? `• ${isEn ? "Produce" : "Sản phẩm"}: ${r.productName}` : ""}
                        </div>
                      </div>

                      <div>
                        {r.isHidden ? (
                          <Badge variant="cancelled" dot>
                            {isEn ? "Hidden" : "Đang bị ẩn"}
                          </Badge>
                        ) : (
                          <Badge variant="ready" dot>
                            {isEn ? "Public" : "Công khai"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        margin: "10px 0",
                        fontSize: 14,
                        color: "#1e293b",
                        fontStyle: "italic",
                      }}
                    >
                      "{r.comment || (isEn ? "No text comment." : "Không có bình luận chữ.")}"
                    </div>

                    {r.farmerReply && (
                      <div
                        style={{
                          backgroundColor: "#f0fdf4",
                          padding: "8px 12px",
                          borderRadius: 6,
                          fontSize: 13,
                          color: "#166534",
                          borderLeft: "3px solid #22c55e",
                        }}
                      >
                        <strong>{isEn ? "Reply from stall owner:" : "Phản hồi từ chủ sạp:"}</strong> "{r.farmerReply}"
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: 10,
                      }}
                    >
                      <Button
                        variant={r.isHidden ? "primary" : "outline"}
                        size="sm"
                        style={{
                          color: r.isHidden ? "#ffffff" : "#b91c1c",
                          borderColor: r.isHidden ? "#15803d" : "#fca5a5",
                        }}
                        onClick={() =>
                          handleToggleReviewVisibility(r.reviewId, r.isHidden)
                        }
                      >
                        {r.isHidden
                          ? (isEn ? "✓ Unhide Review" : "✓ Mở lại đánh giá")
                          : (isEn ? "👁️ Hide this Review" : "👁️ Ẩn đánh giá này")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={reviewsPage}
                totalItems={filteredReviews.length}
                pageSize={PAGE_SIZE}
                onPageChange={setReviewsPage}
              />
            </>
          )}
          </div>
        )}

        {activeTab === "categories" && (
          <div className="ml-categories-mod-box">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <input
                  type="text"
                  className="ml-form-input"
                  style={{
                    maxWidth: 320,
                  }}
                  placeholder={
                    isEn
                      ? "Search by category name, slug, description..."
                      : "Tìm theo tên danh mục, đường dẫn, mô tả..."
                  }
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
                {categorySearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCategorySearch("")}
                  >
                    ✕
                  </Button>
                )}
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleOpenCategoryModal()}
              >
                {isEn ? "+ Add New Category" : "+ Thêm danh mục mới"}
              </Button>
            </div>

            {loadingCategories ? (
              <div className="ml-inv-loading">
                {isEn ? "Loading categories..." : "Đang tải danh mục..."}
              </div>
            ) : categories.length === 0 ? (
              <div
                className="ml-card"
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                {isEn
                  ? "No categories found. Click '+ Add New Category' above."
                  : "Chưa có danh mục nào. Hãy bấm 'Thêm danh mục mới' ở trên."}
              </div>
            ) : (
              <>
                <div
                  className="ml-card"
                  style={{
                    overflowX: "auto",
                    padding: 0,
                  }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    fontSize: 13.5,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        color: "#475569",
                      }}
                    >
                      <th
                        style={{
                          padding: "12px 16px",
                        }}
                      >
                        {isEn ? "ID" : "Mã"}
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                        }}
                      >
                        {isEn ? "Category Name" : "Tên danh mục"}
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                        }}
                      >
                        {isEn ? "URL Slug" : "Đường dẫn (Slug)"}
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                        }}
                      >
                        {isEn ? "Detailed Description" : "Mô tả chi tiết"}
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                        }}
                      >
                        {isEn ? "Actions" : "Thao tác"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCategories.map((c) => (
                      <tr
                        key={c.categoryId}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 16px",
                            fontWeight: 600,
                            color: "#64748b",
                          }}
                        >
                          #{c.categoryId}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontWeight: 700,
                            color: "#166534",
                          }}
                        >
                          {c.name}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#334155",
                            fontFamily: "monospace",
                          }}
                        >
                          {c.slug}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#64748b",
                          }}
                        >
                          {c.description || (isEn ? "No description" : "Chưa có mô tả")}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            textAlign: "right",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-flex",
                              gap: 6,
                            }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenCategoryModal(c)}
                            >
                              ✏️ {isEn ? "Edit" : "Sửa"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              style={{
                                color: "#b91c1c",
                              }}
                              onClick={() =>
                                handleDeleteCategory(c.categoryId, c.name)
                              }
                            >
                              ✕ {isEn ? "Delete" : "Xóa"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={categoriesPage}
                totalItems={categories.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCategoriesPage}
              />
            </>
          )}
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="ml-announcements-mod-box">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <input
                  type="text"
                  className="ml-form-input"
                  style={{
                    maxWidth: 320,
                  }}
                  placeholder={
                    isEn
                      ? "Search by title, announcement content..."
                      : "Tìm theo tiêu đề, nội dung bản tin..."
                  }
                  value={announcementSearch}
                  onChange={(e) => setAnnouncementSearch(e.target.value)}
                />
                {announcementSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAnnouncementSearch("")}
                  >
                    ✕
                  </Button>
                )}
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleOpenAnnouncementModal()}
              >
                📢 {isEn ? "Publish New Announcement" : "Đăng bản tin mới"}
              </Button>
            </div>

            {loadingAnnouncements ? (
              <div className="ml-inv-loading">
                {isEn ? "Loading system announcements..." : "Đang tải bản tin hệ thống..."}
              </div>
            ) : announcements.length === 0 ? (
              <div
                className="ml-card"
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                {isEn
                  ? "No announcements yet. Click 'Publish New Announcement' to broadcast notices to the platform."
                  : "Chưa có bản tin nào. Hãy bấm 'Đăng bản tin mới' để phát thông báo tới toàn sàn."}
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: 16,
                  }}
                >
                {paginatedAnnouncements.map((a) => {
                  const annId = a.announcementId || a.id;
                  return (
                    <div
                      key={annId}
                      className="ml-card"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            margin: 0,
                            color: "#1e293b",
                          }}
                        >
                          {a.title}
                        </h3>
                        <Badge
                          variant={a.isActive !== false ? "ready" : "neutral"}
                          dot
                        >
                          {a.isActive !== false
                            ? (isEn ? "Active" : "Đang bật")
                            : (isEn ? "Hidden" : "Đã ẩn")}
                        </Badge>
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          display: "flex",
                          gap: 8,
                          color: "#64748b",
                        }}
                      >
                        <span>
                          {isEn ? "Type: " : "Loại: "}
                          <strong>{a.type || "GENERAL"}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          {isEn ? "Target: " : "Đối tượng: "}
                          <strong>{a.targetRole || "ALL"}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          {a.createdAt ? a.createdAt.substring(0, 10) : ""}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: 13.5,
                          color: "#475569",
                          margin: "4px 0",
                          lineHeight: 1.5,
                          flex: 1,
                        }}
                      >
                        {a.content}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 8,
                          borderTop: "1px solid #f1f5f9",
                          paddingTop: 8,
                        }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAnnouncementModal(a)}
                        >
                          ✏️ {isEn ? "Edit" : "Chỉnh sửa"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{
                            color: "#b91c1c",
                          }}
                          onClick={() =>
                            handleDeleteAnnouncement(annId, a.title)
                          }
                        >
                          ✕ {isEn ? "Delete" : "Xóa"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Pagination
                currentPage={announcementsPage}
                totalItems={announcements.length}
                pageSize={PAGE_SIZE}
                onPageChange={setAnnouncementsPage}
              />
            </>
          )}
          </div>
        )}

        {activeTab === "disputes" && (
          <div className="ml-disputes-mod-box">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {disputes.length === 0 ? (
                <div
                  className="ml-card"
                  style={{
                    padding: "48px 20px",
                    textAlign: "center",
                    color: "#64748b",
                    backgroundColor: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🤝</div>
                  <h4 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: 16 }}>
                    {isEn ? "No disputes or complaints reported" : "Không có khiếu nại hoặc tranh chấp nào"}
                  </h4>
                  <p style={{ margin: 0, fontSize: 14 }}>
                    {isEn
                      ? "Currently the system records no complaints requiring market management intervention."
                      : "Hiện tại hệ thống không ghi nhận phản ánh cần ban quản lý chợ can thiệp xử lý."}
                  </p>
                </div>
              ) : (
                disputes.map((d) => (
                  <div
                    key={d.id}
                    className="ml-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#1e293b",
                        }}
                      >
                        {isEn ? "Order #" : "Đơn hàng #"}{d.orderCode} • {d.marketName}
                      </div>
                      <Badge
                        variant={d.status === "RESOLVED" ? "ready" : "pending"}
                      >
                        {d.status === "RESOLVED"
                          ? (isEn ? "Resolved Satisfactorily" : "Đã giải quyết thỏa đáng")
                          : (isEn ? "Processing" : "Đang tiếp nhận")}
                      </Badge>
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: "#475569",
                      }}
                    >
                      {isEn ? "Buyer: " : "Người mua: "}<strong>{d.customerName}</strong>
                      {isEn ? " ↔ Stall owner: " : " ↔ Chủ sạp: "}<strong>{d.farmerName}</strong>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#fffbeb",
                        border: "1px solid #fef3c7",
                        padding: 10,
                        borderRadius: 6,
                        fontSize: 13,
                        color: "#92400e",
                      }}
                    >
                      ⚠️ <strong>{isEn ? "Reported issue: " : "Nội dung phản ánh: "}</strong>{d.issue}
                    </div>

                    {d.solution && (
                      <div
                        style={{
                          backgroundColor: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          padding: 10,
                          borderRadius: 6,
                          fontSize: 13,
                          color: "#166534",
                        }}
                      >
                        ✅ <strong>{isEn ? "Resolution: " : "Kết quả xử lý: "}</strong>{d.solution}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {isCategoryModalOpen && (
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          title={
            editingCategory
              ? (isEn ? "Edit Produce Category" : "Chỉnh Sửa Danh Mục Sản Phẩm")
              : (isEn ? "Add New Produce Category" : "Thêm Danh Mục Nông Sản Mới")
          }
          subtitle={
            isEn
              ? "Categories help customers classify and search fresh agricultural products easily"
              : "Danh mục giúp khách hàng phân loại và tìm kiếm nông sản tươi dễ dàng hơn"
          }
          maxWidth="520px"
        >
          <form
            onSubmit={submitCategory}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div className="ml-form-group">
              <label className="ml-form-label">
                {isEn ? "Category name:" : "Tên danh mục:"}
              </label>
              <input
                type="text"
                className="ml-form-input"
                placeholder={
                  isEn
                    ? "e.g.: Mushrooms & Herbs, Native Fruits..."
                    : "VD: Nấm & Thảo Dược, Trái Cây Bản Địa..."
                }
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="ml-form-group">
              <label className="ml-form-label">
                {isEn
                  ? "URL Slug (leave empty to generate automatically):"
                  : "Đường dẫn URL (Slug - để trống để tạo tự động):"}
              </label>
              <input
                type="text"
                className="ml-form-input"
                placeholder="VD: nam-thao-duoc"
                value={categoryForm.slug}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    slug: e.target.value,
                  })
                }
              />
            </div>

            <div className="ml-form-group">
              <label className="ml-form-label">
                {isEn ? "Category description:" : "Mô tả danh mục:"}
              </label>
              <textarea
                className="ml-form-textarea"
                rows={3}
                placeholder={
                  isEn
                    ? "Describe produce under this category..."
                    : "Mô tả các sản phẩm thuộc phân loại này..."
                }
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 8,
              }}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                {isEn ? "Cancel" : "Hủy"}
              </Button>
              <Button type="submit" variant="primary" loading={savingCategory}>
                {editingCategory
                  ? (isEn ? "Save Changes" : "Lưu thay đổi")
                  : (isEn ? "Create Category" : "Tạo danh mục")}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {isAnnouncementModalOpen && (
        <Modal
          isOpen={isAnnouncementModalOpen}
          onClose={() => setIsAnnouncementModalOpen(false)}
          title={
            editingAnnouncement
              ? (isEn ? "Edit System Announcement" : "Chỉnh Sửa Thông Báo Hệ Thống")
              : (isEn ? "Publish New Announcement" : "Phát Hành Thông Báo Mới")
          }
          subtitle={
            isEn
              ? "Announcements appear on the market newsboard and notify users"
              : "Bản tin sẽ hiển thị trên bảng tin chợ phiên và gửi thông báo tới người dùng"
          }
          maxWidth="560px"
        >
          <form
            onSubmit={submitAnnouncement}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div className="ml-form-group">
              <label className="ml-form-label">
                {isEn ? "Announcement title:" : "Tiêu đề thông báo:"}
              </label>
              <input
                type="text"
                className="ml-form-input"
                placeholder={
                  isEn
                    ? "e.g.: Weekend Farmers Market schedule announcement..."
                    : "VD: Thông báo lịch họp chợ phiên cuối tuần tại Ba Đình..."
                }
                value={announcementForm.title}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    title: e.target.value,
                  })
                }
                required
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="ml-form-group">
                <label className="ml-form-label">
                  {isEn ? "Classification:" : "Phân loại:"}
                </label>
                <select
                  className="ml-form-select"
                  value={announcementForm.type}
                  onChange={(e) =>
                    setAnnouncementForm({
                      ...announcementForm,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="GENERAL">
                    {isEn ? "General News (GENERAL)" : "Tin chung (GENERAL)"}
                  </option>
                  <option value="MARKET_EVENT">
                    {isEn ? "Market Event (MARKET_EVENT)" : "Sự kiện chợ phiên (MARKET_EVENT)"}
                  </option>
                  <option value="POLICY">
                    {isEn ? "Policy & Safety (POLICY)" : "Chính sách & An toàn (POLICY)"}
                  </option>
                  <option value="MAINTENANCE">
                    {isEn ? "System Maintenance (MAINTENANCE)" : "Bảo trì hệ thống (MAINTENANCE)"}
                  </option>
                </select>
              </div>

              <div className="ml-form-group">
                <label className="ml-form-label">
                  {isEn ? "Target Audience:" : "Đối tượng nhận:"}
                </label>
                <select
                  className="ml-form-select"
                  value={announcementForm.targetRole}
                  onChange={(e) =>
                    setAnnouncementForm({
                      ...announcementForm,
                      targetRole: e.target.value,
                    })
                  }
                >
                  <option value="ALL">
                    {isEn ? "Entire Platform (Everyone)" : "Toàn bộ sàn (Tất cả mọi người)"}
                  </option>
                  <option value="FARMER">
                    {isEn ? "Farmers / Stall Owners Only" : "Chỉ Nông Dân / Chủ sạp"}
                  </option>
                  <option value="CUSTOMER">
                    {isEn ? "Shoppers Only" : "Chỉ Khách Mua Hàng"}
                  </option>
                </select>
              </div>
            </div>

            <div className="ml-form-group">
              <label className="ml-form-label">
                {isEn ? "Detailed announcement content:" : "Nội dung chi tiết bản tin:"}
              </label>
              <textarea
                className="ml-form-textarea"
                rows={5}
                placeholder={
                  isEn
                    ? "Enter full announcement text..."
                    : "Nhập nội dung đầy đủ của thông báo..."
                }
                value={announcementForm.content}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    content: e.target.value,
                  })
                }
                required
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <input
                type="checkbox"
                id="annActive"
                checked={announcementForm.isActive}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    isActive: e.target.checked,
                  })
                }
              />
              <label
                htmlFor="annActive"
                style={{
                  fontSize: 13,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {isEn
                  ? "Publish immediately for public display"
                  : "Kích hoạt hiển thị công khai ngay sau khi đăng"}
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 8,
              }}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAnnouncementModalOpen(false)}
              >
                {isEn ? "Cancel" : "Hủy"}
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={savingAnnouncement}
              >
                {editingAnnouncement
                  ? (isEn ? "Save Changes" : "Lưu thay đổi")
                  : (isEn ? "Publish Announcement" : "Phát thông báo")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
