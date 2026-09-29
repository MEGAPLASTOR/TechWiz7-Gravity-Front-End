import React, { useState, useRef } from "react";
import "@/assets/styles/components/ImageUploadInput.css";
import { formatImageUrl } from "../services/apiClient";

export default function ImageUploadInput({
  value,
  initialUrl,
  onChange,
  onUploadSuccess,
  folder = "general",
  label = "",
  helpText = "Hỗ trợ JPG, PNG, WEBP, GIF (Tối đa 15MB)",
  placeholder = "Nhập đường dẫn URL ảnh (https://...)",
}) {
  const [mode, setMode] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);
  const fileInputRef = useRef(null);
  const currentValue = value !== undefined ? value : initialUrl || "";

  const cleanUrl = (raw) => {
    if (!raw || typeof raw !== "string") return "";
    let trimmed = raw.trim();
    const uploadsIdx = trimmed.indexOf("/uploads/");
    if (uploadsIdx !== -1) {
      return trimmed.substring(uploadsIdx);
    }
    return trimmed;
  };

  const triggerChange = (newUrl) => {
    const cleaned = cleanUrl(newUrl);
    if (typeof onChange === "function") {
      onChange(cleaned);
    }
    if (typeof onUploadSuccess === "function") {
      onUploadSuccess(cleaned);
    }
  };
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setUploadError(
        "Tệp ảnh vượt quá dung lượng tối đa 15MB. Vui lòng chọn tệp nhỏ hơn!",
      );
      return;
    }
    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token =
        localStorage.getItem("ml_token") ||
        localStorage.getItem("accessToken");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const apiPrefix = import.meta.env.VITE_API_BASE_URL || "/api";
      const cleanPrefix = apiPrefix.endsWith("/") ? apiPrefix.slice(0, -1) : apiPrefix;
      const uploadUrl = `${cleanPrefix}/upload/image?folder=${encodeURIComponent(folder)}`;

      let res;
      try {
        res = await fetch(uploadUrl, {
          method: "POST",
          headers,
          body: formData,
        });
      } catch (proxyErr) {
        const backendTarget =
          import.meta.env.VITE_BACKEND_TARGET || "http://172.16.2.89:8081";
        const fallbackUrl = `${backendTarget.replace(/\/$/, "")}/api/upload/image?folder=${encodeURIComponent(folder)}`;
        res = await fetch(fallbackUrl, {
          method: "POST",
          headers,
          body: formData,
        });
      }

      let data = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      const rawUrl = data?.data?.url || data?.url || data?.data?.fullUrl || data?.fullUrl;
      const uploadedUrl = cleanUrl(rawUrl);
      if (res.ok && uploadedUrl) {
        triggerChange(uploadedUrl);
        setUploadSuccess(true);
        setFileDetails({
          name: data?.data?.originalFilename || file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
        });
      } else {
        setUploadError(
          data?.message ||
            data?.error ||
            `Không thể tải ảnh lên máy chủ (${res.status}).`,
        );
      }
    } catch (err) {
      setUploadError(
        "Lỗi kết nối khi tải ảnh: " + (err.message || "Vui lòng thử lại"),
      );
    } finally {
      setUploading(false);
    }
  };
  const handleClearImage = () => {
    triggerChange("");
    setFileDetails(null);
    setUploadSuccess(false);
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <div className="ml-image-upload-wrapper">
      <div className="ml-upload-header-row">
        {label ? <label className="ml-upload-label">{label}</label> : <div />}

        <div className="ml-upload-mode-switcher">
          <button
            type="button"
            className={`ml-upload-mode-btn ${mode === "upload" ? "active" : ""}`}
            onClick={() => setMode("upload")}
          >
            📁 Tải từ máy
          </button>
          <button
            type="button"
            className={`ml-upload-mode-btn ${mode === "url" ? "active" : ""}`}
            onClick={() => setMode("url")}
          >
            🔗 Nhập link URL
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div className="ml-upload-container">
          <div
            className={`ml-upload-dropzone ${uploading ? "is-uploading" : ""}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
              style={{
                display: "none",
              }}
              onChange={handleFileChange}
            />

            {uploading ? (
              <div className="ml-upload-busy">
                <span className="ml-upload-spinner"></span>
                <span>Đang tải ảnh lên máy chủ...</span>
              </div>
            ) : (
              <div className="ml-upload-idle">
                <div className="ml-upload-camera-badge">📷</div>
                <div className="ml-upload-title">
                  Bấm vào đây để chọn ảnh từ điện thoại / máy tính
                </div>
                <div className="ml-upload-hint">{helpText}</div>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="ml-upload-alert error">⚠️ {uploadError}</div>
          )}

          {uploadSuccess && fileDetails && (
            <div className="ml-upload-alert success">
              <span>✅ Đã tải lên máy chủ:</span>
              <strong>{fileDetails.name}</strong> ({fileDetails.size})
            </div>
          )}
        </div>
      ) : (
        <div className="ml-upload-url-mode">
          <input
            type="url"
            className="ml-upload-url-input"
            placeholder={placeholder}
            value={currentValue}
            onChange={(e) => triggerChange(e.target.value)}
          />
        </div>
      )}

      {currentValue && (
        <div className="ml-upload-preview-card">
          <div className="ml-upload-preview-thumb">
            <img
              src={formatImageUrl(currentValue)}
              alt="Preview"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80";
              }}
            />
          </div>
          <div className="ml-upload-preview-meta">
            <span className="ml-upload-preview-label">Ảnh đã chọn:</span>
            <span className="ml-upload-preview-url" title={currentValue}>
              {currentValue}
            </span>
          </div>
          <button
            type="button"
            className="ml-upload-remove-btn"
            onClick={handleClearImage}
            title="Xóa ảnh này"
          >
            ✕ Xóa ảnh
          </button>
        </div>
      )}
    </div>
  );
}
