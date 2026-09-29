import React, { useState, useEffect, useMemo } from "react";
import "@/assets/styles/components/farmer/FarmerProductModal.css";
import Modal from "../common/Modal";
import Button from "../common/Button";
import ImageUploadInput from "../ImageUploadInput";
import farmerService from "../../services/farmerService";
import productService from "../../services/productService";
import { useLanguage } from "../../context/LanguageContext";

export default function FarmerProductModal({
  isOpen,
  onClose,
  product = null,
  assignedMarkets = [],
  onSave,
  onNavigate,
}) {
  const { isEn, localizeCategoryName, localizeMarketName } = useLanguage();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedStallKey, setSelectedStallKey] = useState("");
  const [stallsList, setStallsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingStalls, setLoadingStalls] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const sellableStalls = useMemo(() => {
    if (!Array.isArray(stallsList)) return [];
    if (product) return stallsList;
    return stallsList.filter((stall) => {
      const st = String(stall?.status || "").toUpperCase();
      return !st || ["ACTIVE", "APPROVED", "PENDING", "OPEN"].includes(st);
    });
  }, [product, stallsList]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function loadData() {
      if (assignedMarkets && assignedMarkets.length > 0) {
        setStallsList(assignedMarkets);
      } else {
        setLoadingStalls(true);
        try {
          const res = await farmerService.getMyMarketAssignments();
          if (isMounted && Array.isArray(res)) {
            setStallsList(res);
          }
        } catch (err) {
          console.warn("Could not load farmer market assignments", err);
        } finally {
          if (isMounted) setLoadingStalls(false);
        }
      }

      try {
        const catRes = await productService.getCategories();
        if (isMounted && Array.isArray(catRes)) {
          setCategories(catRes);
        }
      } catch (err) {
        console.warn("Could not load categories", err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, assignedMarkets]);

  // Reset or initialize form fields only when modal opens or editing product changes
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg("");
    if (product) {
      setName(product.name || "");
      setCategoryId(product.categoryId || "");
      setPrice(product.price != null ? product.price : "");
      setUnit(product.unit || "kg");
      setStockQuantity(product.currentStock ?? product.stockQuantity ?? "");
      setDescription(product.description || "");
      setImageUrl(product.imageUrl || "");
      if (product.marketId) {
        setSelectedStallKey(
          `${product.marketId}|${product.stallNumber || product.stallCode || ""}`,
        );
      } else {
        setSelectedStallKey("");
      }
    } else {
      setName("");
      setCategoryId("");
      setPrice("");
      setUnit("");
      setStockQuantity("");
      setDescription("");
      setImageUrl("");
      setSelectedStallKey("");
    }
  }, [product, isOpen]);

  // Auto-select first available stall when creating a new product
  useEffect(() => {
    if (!product && !selectedStallKey && sellableStalls.length > 0) {
      const s = sellableStalls[0];
      setSelectedStallKey(`${s.marketId}|${s.stallNumber || ""}`);
    }
  }, [product, selectedStallKey, sellableStalls]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    if (!selectedStallKey) {
      setErrorMsg(
        isEn
          ? "Please select a stall and designated market to sell your produce."
          : "Vui lòng chọn sạp và phiên chợ chỉ định để đăng bán sản phẩm.",
      );
      setLoading(false);
      return;
    }
    const [mId, sNum] = selectedStallKey.split("|");
    const payload = {
      marketId: Number(mId),
      stallNumber: sNum || (isEn ? "Pending allocation" : "Chờ phân sạp"),
      categoryId: Number(categoryId),
      name: name.trim(),
      description: description.trim(),
      unit: unit.trim(),
      price: Number(price),
      currentStock: Number(stockQuantity),
      imageUrl: imageUrl.trim(),
    };
    try {
      if (onSave) {
        await onSave(payload);
      }
      onClose();
    } catch (err) {
      console.warn("Product save error", err);
      setErrorMsg(
        err?.message ||
          (isEn
            ? "Cannot save produce. Please verify provided fields."
            : "Không thể lưu sản phẩm. Vui lòng kiểm tra lại thông tin."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        product
          ? (isEn ? "Edit Stall Produce" : "Chỉnh Sửa Nông Sản Tại Sạp")
          : (isEn ? "Add New Produce for Farmers' Market" : "Thêm Nông Sản Mới Cho Phiên Chợ")
      }
      subtitle={
        isEn
          ? "Produce will be linked directly to your designated market stall"
          : "Sản phẩm sẽ được liên kết trực tiếp vào sạp chỉ định tại phiên chợ"
      }
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} className="ml-prod-form">
        {errorMsg && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              backgroundColor: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fecaca",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="ml-stall-assignment-box">
          <label className="ml-stall-assignment-label">
            <span>🏪</span> {isEn ? "Assigned Market & Stall (*):" : "Sạp & Phiên chợ bày bán chỉ định (*):"}
          </label>
          {loadingStalls ? (
            <div className="ml-stall-tip-msg">
              {isEn ? "Loading registered stalls..." : "Đang tải danh sách sạp đã đăng ký..."}
            </div>
          ) : sellableStalls.length === 0 ? (
            <div className="ml-stall-warning-msg">
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                ⚠️ {isEn
                  ? "You do not have any registered stalls yet."
                  : "Bạn chưa có sạp nào được cấp tại các phiên chợ."}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.45", opacity: 0.95 }}>
                {isEn
                  ? "Produce must be linked to a registered stall. Please verify KYC and register a stall in 'Stall & Market Profile'."
                  : "Nông sản đăng bán cần được liên kết với một sạp chợ cụ thể. Vui lòng hoàn tất xác minh KYC và đăng ký sạp tại mục 'Hồ sơ sạp & Chợ phiên'."}
              </div>
              <button
                type="button"
                className="ml-stall-warning-link"
                onClick={() => {
                  onClose();
                  if (onNavigate) {
                    onNavigate("farmer-stall", { tab: "markets" });
                  } else {
                    window.location.href = "/farmer/profile?tab=markets";
                  }
                }}
              >
                🏪 {isEn ? "Go to Market Stall Registration →" : "Đến trang Đăng ký sạp chợ ngay →"}
              </button>
            </div>
          ) : (
            <select
              className="ml-form-select"
              value={selectedStallKey}
              onChange={(e) => setSelectedStallKey(e.target.value)}
              required
            >
              <option value="">{isEn ? "-- Select designated market stall --" : "-- Chọn sạp chỉ định bày bán --"}</option>
              {sellableStalls.map((st, idx) => {
                const key = `${st.marketId}|${st.stallNumber || ""}`;
                const mName = localizeMarketName(st.marketName || `Market #${st.marketId}`);
                const label = `${st.stallNumber || (isEn ? "Pending stall" : "Sạp chờ phân")} — ${mName} ${st.status ? `[${st.status}]` : ""}`;
                return (
                  <option key={idx} value={key}>
                    {label}
                  </option>
                );
              })}
            </select>
          )}
          <small className="ml-stall-tip-msg">
            ℹ️ {isEn
              ? "When shoppers browse this stall online or at the market, this exact item will be shown."
              : "Khi khách hàng ghé thăm sạp này trên sàn hoặc tại điểm chợ, hệ thống sẽ hiển thị đúng sản phẩm này."}
          </small>
        </div>

        <div className="ml-form-group">
          <label className="ml-form-label">{isEn ? "Produce Name:" : "Tên nông sản:"}</label>
          <input
            type="text"
            className="ml-form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isEn ? "e.g. Ba Vi Organic Baby Spinach..." : "VD: Cải bó xôi hữu cơ Ba Vì..."}
            required
          />
        </div>

        <div className="ml-form-grid-2">
          <div className="ml-form-group">
            <label className="ml-form-label">{isEn ? "Produce Category:" : "Phân loại danh mục:"}</label>
            <select
              className="ml-form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
              required
            >
              <option value="">{isEn ? "-- Select category --" : "-- Chọn danh mục --"}</option>
              {categories.map((c) => {
                const cId = c.categoryId || c.id;
                return (
                  <option key={cId} value={cId}>
                    {localizeCategoryName(c.name)}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="ml-form-group">
            <label className="ml-form-label">{isEn ? "Packaging / Unit:" : "Đơn vị đóng gói / bán:"}</label>
            <input
              type="text"
              className="ml-form-input"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder={isEn ? "kg, bundle, 500g box..." : "kg, bó, hộp 500g..."}
              required
            />
          </div>
        </div>

        <div className="ml-form-grid-2">
          <div className="ml-form-group">
            <label className="ml-form-label">{isEn ? "Stall Unit Price (VND):" : "Đơn giá bán tại sạp (VNĐ):"}</label>
            <input
              type="number"
              className="ml-form-input"
              value={price}
              min="1000"
              step="1000"
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="ml-form-group">
            <label className="ml-form-label">
              {isEn ? "Available Pre-order Quantity:" : "Số lượng sẵn sàng đặt trước:"}
            </label>
            <input
              type="number"
              className="ml-form-input"
              value={stockQuantity}
              min="0"
              onChange={(e) => setStockQuantity(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="ml-form-group">
          <label className="ml-form-label">
            {isEn ? "Freshness & Farming Method Description:" : "Mô tả độ tươi & phương pháp chăm sóc:"}
          </label>
          <textarea
            className="ml-form-textarea"
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isEn ? "e.g. Harvested at 4:30 AM, grown with spring mountain water..." : "VD: Rau cắt lúc 4h30 sáng, tưới nước suối nguồn tự nhiên..."}
          />
        </div>

        <div className="ml-form-group">
          <label className="ml-form-label">{isEn ? "Actual Produce Photo:" : "Ảnh chụp thực tế nông sản:"}</label>
          <ImageUploadInput
            value={imageUrl}
            onChange={setImageUrl}
            folder="products"
            placeholder={isEn ? "Paste image URL or upload produce photo" : "Dán link ảnh hoặc tải ảnh nông sản lên"}
          />
        </div>

        <div className="ml-prod-actions">
          <Button variant="ghost" onClick={onClose} type="button">
            {isEn ? "Cancel" : "Hủy bỏ"}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={sellableStalls.length === 0 && !product}
          >
            {product
              ? (isEn ? "Update Produce" : "Cập nhật nông sản")
              : (isEn ? "Publish to Stall" : "Đăng bán vào sạp")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
