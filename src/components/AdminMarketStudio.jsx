import React, { useState, useEffect, useMemo } from "react";
import ImageUploadInput from "./ImageUploadInput";
import Pagination from "./common/Pagination";
import { useLanguage } from "../context/LanguageContext";

export default function AdminMarketStudio({ callApi, role, token }) {
  const { isEn } = useLanguage();
  const [markets, setMarkets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMarketId, setCurrentMarketId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formLat, setFormLat] = useState("");
  const [formLng, setFormLng] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formSchedules, setFormSchedules] = useState([]);
  const [showStallModal, setShowStallModal] = useState(false);
  const [selectedMarketForStalls, setSelectedMarketForStalls] = useState(null);
  const [marketAssignments, setMarketAssignments] = useState([]);
  const [stallLoading, setStallLoading] = useState(false);
  const [assignFarmerId, setAssignFarmerId] = useState("");
  const [assignStallNumber, setAssignStallNumber] = useState("");
  const [assignStatus, setAssignStatus] = useState("ACTIVE");
  const loadMarkets = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter && statusFilter !== "ALL") {
        queryParams.append("status", statusFilter);
      }
      if (searchKeyword.trim()) {
        queryParams.append("search", searchKeyword.trim());
      }
      const url = `/api/admin/markets?${queryParams.toString()}`;
      const res = await callApi(url, "GET");
      if (res.status === 200 && res.data) {
        const list = res.data.data || res.data;
        setMarkets(Array.isArray(list) ? list : []);
      } else {
        setStatusMessage(
          `[HTTP ${res.status}] ${res.data?.message || (isEn ? "Failed to load markets list." : "Không thể tải danh sách chợ.")}`,
        );
      }
    } catch (err) {
      setStatusMessage((isEn ? "Connection error loading markets: " : "Lỗi kết nối khi tải chợ: ") + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadMarkets();
  }, [statusFilter]);

  const paginatedMarkets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return markets.slice(start, start + PAGE_SIZE);
  }, [markets, currentPage]);
  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentMarketId(null);
    setFormName("");
    setFormAddress("");
    setFormLat("");
    setFormLng("");
    setFormDesc("");
    setFormImage("");
    setFormStatus("ACTIVE");
    setFormSchedules([]);
    setShowModal(true);
  };
  const openEditModal = (market) => {
    setIsEditing(true);
    setCurrentMarketId(market.marketId);
    setFormName(market.name || "");
    setFormAddress(market.address || "");
    setFormLat(market.latitude ? String(market.latitude) : "");
    setFormLng(market.longitude ? String(market.longitude) : "");
    setFormDesc(market.description || "");
    setFormImage(market.imageUrl || "");
    setFormStatus(market.status || "ACTIVE");
    if (market.schedules && market.schedules.length > 0) {
      setFormSchedules(
        market.schedules.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          openTime: s.openTime ? s.openTime.substring(0, 5) : "",
          closeTime: s.closeTime ? s.closeTime.substring(0, 5) : "",
        })),
      );
    } else {
      setFormSchedules([]);
    }
    setShowModal(true);
  };
  const handleSaveMarket = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim()) {
      alert(isEn ? "Please fill in Market Name and Address!" : "Vui lòng điền đầy đủ Tên chợ và Địa chỉ!");
      return;
    }
    const payload = {
      name: formName.trim(),
      address: formAddress.trim(),
      latitude: parseFloat(formLat),
      longitude: parseFloat(formLng),
      description: formDesc.trim(),
      imageUrl: formImage.trim(),
      status: formStatus,
      schedules: formSchedules.map((s) => ({
        dayOfWeek: parseInt(s.dayOfWeek),
        openTime: s.openTime ? s.openTime.substring(0, 5) : "06:00",
        closeTime: s.closeTime ? s.closeTime.substring(0, 5) : "12:00",
      })),
    };
    if (isEditing) {
      const res = await callApi(
        `/api/admin/markets/${currentMarketId}`,
        "PUT",
        payload,
      );
      if (res.status === 200) {
        alert(isEn ? "Market updated successfully!" : "Cập nhật chợ nông sản thành công!");
        setShowModal(false);
        loadMarkets();
      } else {
        alert(
          (isEn ? "Update failed: " : "Cập nhật thất bại: ") +
            (res.data?.message || JSON.stringify(res.data)),
        );
      }
    } else {
      const res = await callApi("/api/admin/markets", "POST", payload);
      if (res.status === 201 || res.status === 200) {
        alert(isEn ? "Created new farmers market successfully!" : "Tạo chợ nông sản mới thành công!");
        setShowModal(false);
        loadMarkets();
      } else {
        alert(
          (isEn ? "Creation failed: " : "Tạo chợ thất bại: ") +
            (res.data?.message || JSON.stringify(res.data)),
        );
      }
    }
  };
  const handleToggleStatus = async (market) => {
    const newStatus = market.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const actionName =
      newStatus === "ACTIVE"
        ? (isEn ? "reactivate" : "Mở lại hoạt động")
        : (isEn ? "pause" : "Tạm dừng hoạt động");
    if (
      !window.confirm(
        isEn
          ? `Are you sure you want to ${actionName} market "${market.name}"?`
          : `Bạn có chắc muốn ${actionName} cho chợ "${market.name}"?`,
      )
    )
      return;
    const res = await callApi(
      `/api/admin/markets/${market.marketId}/status?status=${newStatus}`,
      "PATCH",
    );
    if (res.status === 200) {
      loadMarkets();
    } else {
      alert(
        (isEn ? "Status change failed: " : "Đổi trạng thái thất bại: ") +
          (res.data?.message || JSON.stringify(res.data)),
      );
    }
  };
  const handleSoftDelete = async (market) => {
    if (
      !window.confirm(
        isEn
          ? `Confirm PAUSING (soft deleting) market "${market.name}"? Market will be hidden from map but past order data is kept.`
          : `Xác nhận TẠM DỪNG (Xóa mềm) chợ "${market.name}"? Chợ sẽ ẩn khỏi bản đồ nhưng dữ liệu đơn hàng vẫn được bảo toàn.`,
      )
    )
      return;
    const res = await callApi(
      `/api/admin/markets/${market.marketId}`,
      "DELETE",
    );
    if (res.status === 200) {
      alert(isEn ? "Market suspended successfully!" : "Đã tạm dừng hoạt động chợ thành công!");
      loadMarkets();
    } else {
      alert((isEn ? "Error: " : "Lỗi: ") + (res.data?.message || JSON.stringify(res.data)));
    }
  };
  const handlePermanentDelete = async (market) => {
    const confirmMsg = prompt(
      isEn
        ? `DANGER WARNING: You are about to PERMANENTLY DELETE market "${market.name}"!\nIf this market has past orders, the system will prevent deletion to protect financial records.\n\nType "DELETE" below to confirm:`
        : `CẢNH BÁO NGUY HIỂM: Bạn đang chuẩn bị XÓA VĨNH VIỄN chợ "${market.name}"!\n` +
          `Nếu chợ đã có đơn hàng trong quá khứ, hệ thống sẽ từ chối để tránh mất mát dữ liệu kế toán.\n\n` +
          `Nhập chữ "XOA" vào ô bên dưới để xác nhận xóa vĩnh viễn:`,
    );
    if (confirmMsg !== "DELETE" && confirmMsg !== "XOA") {
      alert(isEn ? "Permanent deletion cancelled." : "Đã hủy thao tác xóa vĩnh viễn.");
      return;
    }
    const res = await callApi(
      `/api/admin/markets/${market.marketId}/permanent`,
      "DELETE",
    );
    if (res.status === 200) {
      alert(isEn ? "Market permanently deleted successfully!" : "Đã xóa vĩnh viễn chợ nông sản thành công!");
      loadMarkets();
    } else {
      alert(
        (isEn ? "Cannot permanently delete: " : "Không thể xóa vĩnh viễn: ") +
          (res.data?.message || JSON.stringify(res.data)),
      );
    }
  };
  const addScheduleRow = () => {
    setFormSchedules([
      ...formSchedules,
      {
        dayOfWeek: 7,
        openTime: "06:00",
        closeTime: "11:30",
      },
    ]);
  };
  const removeScheduleRow = (idx) => {
    setFormSchedules(formSchedules.filter((_, i) => i !== idx));
  };
  const updateScheduleRow = (idx, field, val) => {
    const updated = [...formSchedules];
    updated[idx][field] = val;
    setFormSchedules(updated);
  };
  const openStallModal = async (market) => {
    setSelectedMarketForStalls(market);
    setShowStallModal(true);
    setStallLoading(true);
    try {
      const res = await callApi(
        `/api/admin/markets/${market.marketId}/assignments`,
        "GET",
      );
      if (res.status === 200 && res.data) {
        const list = res.data.data || res.data;
        setMarketAssignments(Array.isArray(list) ? list : []);
      } else {
        setMarketAssignments([]);
      }
    } catch {
      setMarketAssignments([]);
    } finally {
      setStallLoading(false);
    }
  };
  const handleAssignFarmer = async (e) => {
    e.preventDefault();
    if (!assignFarmerId || !assignStallNumber.trim()) {
      alert(isEn ? "Please enter Farmer User ID and Stall Number!" : "Vui lòng nhập ID nông dân và Tên sạp!");
      return;
    }
    const payload = {
      farmerId: parseInt(assignFarmerId),
      marketId: selectedMarketForStalls.marketId,
      stallNumber: assignStallNumber.trim(),
      status: assignStatus,
    };
    const res = await callApi(
      "/api/admin/markets/assignments",
      "POST",
      payload,
    );
    if (res.status === 200 || res.status === 201) {
      alert(isEn ? "Stall allocated to farmer successfully!" : "Phân sạp cho nông dân thành công!");
      setAssignFarmerId("");
      setAssignStallNumber("");
      openStallModal(selectedMarketForStalls);
      loadMarkets();
    } else {
      alert((isEn ? "Stall allocation error: " : "Lỗi phân sạp: ") + (res.data?.message || JSON.stringify(res.data)));
    }
  };
  const handleUpdateStallStatus = async (assignmentId, newStatus) => {
    const res = await callApi(
      `/api/admin/markets/assignments/${assignmentId}/status?status=${newStatus}`,
      "PATCH",
    );
    if (res.status === 200) {
      openStallModal(selectedMarketForStalls);
    } else {
      alert(
        (isEn ? "Stall update error: " : "Lỗi cập nhật sạp: ") + (res.data?.message || JSON.stringify(res.data)),
      );
    }
  };
  const handleDeleteStall = async (assignmentId, stallNum) => {
    if (!window.confirm(isEn ? `Confirm deleting stall assignment "${stallNum}"?` : `Xác nhận xóa phân bổ sạp "${stallNum}"?`)) return;
    const res = await callApi(
      `/api/admin/markets/assignments/${assignmentId}`,
      "DELETE",
    );
    if (res.status === 200) {
      openStallModal(selectedMarketForStalls);
      loadMarkets();
    } else {
      alert((isEn ? "Stall deletion error: " : "Lỗi xóa sạp: ") + (res.data?.message || JSON.stringify(res.data)));
    }
  };
  const getDayName = (d) => {
    switch (parseInt(d)) {
      case 1:
        return isEn ? "Monday" : "Thứ 2";
      case 2:
        return isEn ? "Tuesday" : "Thứ 3";
      case 3:
        return isEn ? "Wednesday" : "Thứ 4";
      case 4:
        return isEn ? "Thursday" : "Thứ 5";
      case 5:
        return isEn ? "Friday" : "Thứ 6";
      case 6:
        return isEn ? "Saturday" : "Thứ 7";
      case 7:
        return isEn ? "Sunday" : "Chủ Nhật";
      default:
        return isEn ? `Day ${d}` : `Thứ ${d}`;
    }
  };
  return (
    <div
      className="admin-market-container"
      style={{
        marginTop: 24,
      }}
    >
      <div
        className="card"
        style={{
          marginBottom: 20,
        }}
      >
        <div
          className="card-top"
          style={{
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              className="card-heading"
              style={{
                fontSize: "1.25rem",
              }}
            >
              {isEn
                ? "🏪 Farmers Market Management"
                : "🏪 Quản Lý Chợ Nông Sản (Market Management CRUD)"}
            </div>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginTop: 4,
              }}
            >
              {isEn
                ? "Establish, schedule, allocate stalls to farmers, and manage market operating status."
                : "Hệ thống tạo lập, điều phối lịch họp định kỳ, cấp phát sạp nông dân và kiểm soát trạng thái phiên chợ."}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button className="btn btn-primary" onClick={openCreateModal}>
              {isEn ? "➕ Add New Market" : "➕ Thêm Điểm Chợ Mới"}
            </button>
            <button className="btn btn-outline" onClick={loadMarkets}>
              {isEn ? "🔄 Refresh" : "🔄 Làm Mới"}
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginTop: 14,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 6,
            }}
          >
            <button
              className={`btn btn-sm ${statusFilter === "ALL" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setStatusFilter("ALL")}
            >
              {isEn ? `All (${markets.length})` : `Tất Cả (${markets.length})`}
            </button>
            <button
              className={`btn btn-sm ${statusFilter === "ACTIVE" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setStatusFilter("ACTIVE")}
            >
              {isEn ? "🟢 Active" : "🟢 Đang Hoạt Động"}
            </button>
            <button
              className={`btn btn-sm ${statusFilter === "INACTIVE" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setStatusFilter("INACTIVE")}
            >
              {isEn ? "🔴 Inactive" : "🔴 Đã Tạm Dừng"}
            </button>
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 260,
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              className="input-control"
              placeholder={
                isEn
                  ? "🔍 Search by market name, district, address..."
                  : "🔍 Tìm kiếm theo tên chợ, quận huyện, địa chỉ..."
              }
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentPage(1);
                  loadMarkets();
                }
              }}
            />
            <button
              className="btn btn-outline"
              onClick={() => {
                setCurrentPage(1);
                loadMarkets();
              }}
            >
              {isEn ? "Search" : "Tìm"}
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            style={{
              marginTop: 10,
              fontSize: "0.85rem",
              color: "#f87171",
            }}
          >
            ⚠️ {statusMessage}
          </div>
        )}
      </div>

      {loading ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: 40,
          }}
        >
          <div
            style={{
              fontSize: "1.2rem",
              color: "var(--text-muted)",
            }}
          >
            {isEn ? "⏳ Loading markets..." : "⏳ Đang tải danh sách chợ..."}
          </div>
        </div>
      ) : markets.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: 40,
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              marginBottom: 10,
            }}
          >
            🌾
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: "1.1rem",
            }}
          >
            {isEn ? "No markets matching the filters" : "Chưa có chợ nào phù hợp với bộ lọc"}
          </div>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              marginTop: 6,
            }}
          >
            {isEn
              ? "Click 'Add New Market' to create the first market on the platform."
              : "Bấm 'Thêm Điểm Chợ Mới' để tạo phiên chợ đầu tiên trên hệ thống."}
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: 18,
            }}
          >
            {paginatedMarkets.map((m) => (
            <div
              key={m.marketId}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: 140,
                  borderRadius: "10px 10px 0 0",
                  overflow: "hidden",
                  margin: "-18px -18px 14px -18px",
                }}
              >
                <img
                  src={
                    m.imageUrl ||
                    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&auto=format&fit=crop&q=80"
                  }
                  alt={m.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&auto=format&fit=crop&q=80";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    display: "flex",
                    gap: 6,
                  }}
                >
                  <span
                    className={`badge-tag ${m.status === "ACTIVE" ? "badge-active" : "badge-inactive"}`}
                    style={{
                      background:
                        m.status === "ACTIVE"
                          ? "rgba(16, 185, 129, 0.9)"
                          : "rgba(239, 68, 68, 0.9)",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    {m.status === "ACTIVE"
                      ? (isEn ? "🟢 ACTIVE" : "🟢 HOẠT ĐỘNG")
                      : (isEn ? "🔴 INACTIVE" : "🔴 TẠM DỪNG")}
                  </span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 10,
                    background: "rgba(15, 23, 42, 0.85)",
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#94a3b8",
                  }}
                >
                  ID #{m.marketId}
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    margin: "0 0 6px 0",
                    color: "#f1f5f9",
                  }}
                >
                  {m.name}
                </h3>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#cbd5e1",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  <span>📍</span>
                  <span>{m.address}</span>
                </div>

                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#94a3b8",
                    display: "flex",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <span>
                    🗺️ Lat: <b>{Number(m.latitude).toFixed(4)}</b>
                  </span>
                  <span>
                    Long: <b>{Number(m.longitude).toFixed(4)}</b>
                  </span>
                </div>

                {m.description && (
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-muted)",
                      lineHeight: 1.4,
                      margin: "0 0 12px 0",
                    }}
                  >
                    {m.description.length > 110
                      ? m.description.substring(0, 110) + "..."
                      : m.description}
                  </p>
                )}

                <div
                  style={{
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {isEn ? "RECURRING MARKET SCHEDULE:" : "LỊCH HỌP CHỢ ĐỊNH KỲ:"}
                  </div>
                  {m.schedules && m.schedules.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      {m.schedules.map((s, idx) => (
                        <span
                          key={idx}
                          className="badge-tag"
                          style={{
                            background: "rgba(51, 65, 85, 0.8)",
                            fontSize: "0.72rem",
                          }}
                        >
                          📅 {getDayName(s.dayOfWeek)} (
                          {s.openTime ? s.openTime.substring(0, 5) : "06:00"} -{" "}
                          {s.closeTime ? s.closeTime.substring(0, 5) : "12:00"})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        fontStyle: "italic",
                      }}
                    >
                      {isEn ? "Schedule not set" : "Chưa thiết lập lịch"}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <span
                    className="badge-tag"
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#34d399",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    👨‍🌾 {m.activeFarmersCount || 0} {isEn ? "Farmers with active stalls" : "Nông dân có sạp hoạt động"}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 8,
                  borderTop: "1px solid var(--card-border)",
                  paddingTop: 12,
                  marginTop: "auto",
                }}
              >
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => openEditModal(m)}
                >
                  ✏️ {isEn ? "Edit" : "Chỉnh Sửa"}
                </button>

                <button
                  className={`btn btn-sm ${m.status === "ACTIVE" ? "btn-outline" : "btn-primary"}`}
                  onClick={() => handleToggleStatus(m)}
                >
                  {m.status === "ACTIVE"
                    ? (isEn ? "⏸️ Pause" : "⏸️ Tạm Dừng")
                    : (isEn ? "▶️ Activate" : "▶️ Kích Hoạt")}
                </button>

                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => openStallModal(m)}
                >
                  🏪 {isEn ? "Manage Stalls" : "Quản Lý Sạp"}
                </button>

                <div
                  style={{
                    display: "flex",
                    gap: 4,
                  }}
                >
                  <button
                    className="btn btn-danger btn-sm"
                    style={{
                      flex: 1,
                      padding: "4px 6px",
                      fontSize: "0.75rem",
                    }}
                    onClick={() => handleSoftDelete(m)}
                    title={
                      isEn
                        ? "Soft delete (switch to INACTIVE to preserve data)"
                        : "Xóa mềm (chuyển sang INACTIVE để bảo toàn dữ liệu)"
                    }
                  >
                    🗑️ {isEn ? "Hide" : "Ẩn Chợ"}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{
                      background: "#450a0a",
                      borderColor: "#b91c1c",
                      padding: "4px 6px",
                      fontSize: "0.75rem",
                    }}
                    onClick={() => handlePermanentDelete(m)}
                    title={
                      isEn
                        ? "Permanent delete (only possible if no orders exist)"
                        : "Xóa vĩnh viễn (Chỉ xóa được nếu chưa có đơn hàng)"
                    }
                  >
                    ❌ {isEn ? "Delete" : "Xóa Hẳn"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={markets.length}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => {
            setCurrentPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </>
    )}

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 650,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className="card-top">
              <div className="card-heading">
                {isEditing
                  ? (isEn
                      ? `✏️ Update Market (ID #${currentMarketId})`
                      : `✏️ Cập Nhật Chợ Nông Sản (ID #${currentMarketId})`)
                  : (isEn ? "➕ Create New Farmers Market" : "➕ Tạo Mới Chợ Nông Sản")}
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowModal(false)}
                style={{
                  padding: "2px 8px",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMarket}>
              <div className="form-item">
                <label>
                  {isEn ? "Market Name (*):" : "Tên Chợ Nông Sản (*):"}
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder={
                    isEn
                      ? "e.g.: Ba Dinh Farmers Weekend Market"
                      : "Ví dụ: Chợ Phiên Nông Sản Ba Đình"
                  }
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="form-item">
                <label>
                  {isEn ? "Physical Address (*):" : "Địa Chỉ Thực Tế (*):"}
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder={
                    isEn
                      ? "e.g.: Quan Ngua Sports Complex, Van Cao, Ba Dinh, Hanoi"
                      : "Ví dụ: Cung Thể Thao Quần Ngựa, Văn Cao, Liễu Giai, Ba Đình, Hà Nội"
                  }
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-item">
                <label>
                  {isEn
                    ? "GPS Coordinates (Latitude, Longitude):"
                    : "Tọa Độ GPS (Vĩ độ Lat, Kinh độ Long):"}
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <input
                    type="number"
                    step="0.000001"
                    className="input-control"
                    placeholder="Latitude"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    step="0.000001"
                    className="input-control"
                    placeholder="Longitude"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    required
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginTop: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {isEn ? "Suggested coordinates:" : "Gợi ý tọa độ:"}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{
                      fontSize: "0.72rem",
                      padding: "2px 8px",
                    }}
                    onClick={() => {
                      setFormLat("21.038234");
                      setFormLng("105.817456");
                    }}
                  >
                    📍 Ba Đình (HN)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{
                      fontSize: "0.72rem",
                      padding: "2px 8px",
                    }}
                    onClick={() => {
                      setFormLat("21.036882");
                      setFormLng("105.783115");
                    }}
                  >
                    📍 Cầu Giấy (HN)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{
                      fontSize: "0.72rem",
                      padding: "2px 8px",
                    }}
                    onClick={() => {
                      setFormLat("10.776889");
                      setFormLng("106.700806");
                    }}
                  >
                    📍 Quận 1 (HCM)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{
                      fontSize: "0.72rem",
                      padding: "2px 8px",
                    }}
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setFormLat(pos.coords.latitude.toFixed(6));
                            setFormLng(pos.coords.longitude.toFixed(6));
                            alert(isEn ? "Acquired device GPS coordinates!" : "Đã lấy tọa độ thực từ thiết bị!");
                          },
                          (err) => alert((isEn ? "GPS error: " : "Không lấy được GPS: ") + err.message),
                        );
                      }
                    }}
                  >
                    🎯 {isEn ? "Device GPS" : "GPS Thiết Bị"}
                  </button>
                </div>
              </div>

              <div className="form-item">
                <label>{isEn ? "Market Description:" : "Mô Tả Chợ:"}</label>
                <textarea
                  className="input-control"
                  style={{
                    minHeight: 70,
                  }}
                  placeholder={
                    isEn
                      ? "Describe the market, types of fresh produce sold..."
                      : "Mô tả phiên chợ, loại đặc sản bày bán..."
                  }
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <ImageUploadInput
                value={formImage}
                onChange={setFormImage}
                folder="markets"
                label={isEn ? "Market Cover Photo:" : "Ảnh Bìa Chợ Nông Sản:"}
                helpText={
                  isEn
                    ? "Upload real market photo from computer/phone (or paste URL)"
                    : "Chọn ảnh chụp thực tế chợ từ máy tính hoặc điện thoại (hoặc nhập URL)"
                }
              />

              <div className="form-item">
                <label>{isEn ? "Initial Status:" : "Trạng Thái Ban Đầu:"}</label>
                <select
                  className="input-control"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                >
                  <option value="ACTIVE">
                    {isEn ? "🟢 ACTIVE (Operational)" : "🟢 ACTIVE (Đang hoạt động)"}
                  </option>
                  <option value="INACTIVE">
                    {isEn ? "🔴 INACTIVE (Suspended)" : "🔴 INACTIVE (Tạm ngưng hoạt động)"}
                  </option>
                </select>
              </div>

              <div
                style={{
                  marginTop: 16,
                  marginBottom: 16,
                  borderTop: "1px solid var(--card-border)",
                  paddingTop: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <label
                    style={{
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: "#34d399",
                    }}
                  >
                    {isEn
                      ? "📅 Weekly Market Session Schedule:"
                      : "📅 Cấu Hình Lịch Họp Chợ Trong Tuần:"}
                  </label>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={addScheduleRow}
                  >
                    {isEn ? "➕ Add Session" : "➕ Thêm Buổi Họp"}
                  </button>
                </div>

                {formSchedules.map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <select
                      className="input-control"
                      style={{
                        flex: 1.2,
                      }}
                      value={row.dayOfWeek}
                      onChange={(e) =>
                        updateScheduleRow(idx, "dayOfWeek", e.target.value)
                      }
                    >
                      <option value={1}>{isEn ? "Monday" : "Thứ 2"}</option>
                      <option value={2}>{isEn ? "Tuesday" : "Thứ 3"}</option>
                      <option value={3}>{isEn ? "Wednesday" : "Thứ 4"}</option>
                      <option value={4}>{isEn ? "Thursday" : "Thứ 5"}</option>
                      <option value={5}>{isEn ? "Friday" : "Thứ 6"}</option>
                      <option value={6}>{isEn ? "Saturday" : "Thứ 7"}</option>
                      <option value={7}>{isEn ? "Sunday" : "Chủ Nhật"}</option>
                    </select>

                    <input
                      type="time"
                      className="input-control"
                      style={{
                        flex: 1,
                      }}
                      value={row.openTime}
                      onChange={(e) =>
                        updateScheduleRow(idx, "openTime", e.target.value)
                      }
                      required
                    />

                    <span
                      style={{
                        color: "var(--text-muted)",
                      }}
                    >
                      {isEn ? "to" : "đến"}
                    </span>

                    <input
                      type="time"
                      className="input-control"
                      style={{
                        flex: 1,
                      }}
                      value={row.closeTime}
                      onChange={(e) =>
                        updateScheduleRow(idx, "closeTime", e.target.value)
                      }
                      required
                    />

                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeScheduleRow(idx)}
                      style={{
                        padding: "6px 10px",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 20,
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  {isEn ? "Cancel" : "Hủy Bỏ"}
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing
                    ? (isEn ? "Save Changes" : "Lưu Thay Đổi (PUT)")
                    : (isEn ? "Create Market" : "Tạo Chợ (POST)")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStallModal && selectedMarketForStalls && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 750,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className="card-top">
              <div>
                <div className="card-heading">
                  {isEn ? "🏪 Farmer Stall Allocations" : "🏪 Quản Lý Phân Sạp Nông Dân"}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {isEn ? "Market: " : "Chợ: "}<b>{selectedMarketForStalls.name}</b> (ID #
                  {selectedMarketForStalls.marketId})
                </div>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowStallModal(false)}
                style={{
                  padding: "2px 8px",
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleAssignFarmer}
              style={{
                background: "rgba(15, 23, 42, 0.6)",
                padding: 14,
                borderRadius: 8,
                border: "1px solid var(--card-border)",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "#38bdf8",
                  marginBottom: 10,
                }}
              >
                {isEn
                  ? "➕ Assign Farmer to New Stall:"
                  : "➕ Chỉ Định Nông Dân Vào Gian Hàng / Sạp Mới:"}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr auto",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <input
                  type="number"
                  className="input-control"
                  placeholder={isEn ? "Farmer User ID" : "User ID Nông Dân"}
                  value={assignFarmerId}
                  onChange={(e) => setAssignFarmerId(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="input-control"
                  placeholder={isEn ? "Stall number (e.g. Stall A-08)" : "Mã số sạp (vd: Sạp A-08)"}
                  value={assignStallNumber}
                  onChange={(e) => setAssignStallNumber(e.target.value)}
                  required
                />
                <select
                  className="input-control"
                  value={assignStatus}
                  onChange={(e) => setAssignStatus(e.target.value)}
                >
                  <option value="ACTIVE">
                    {isEn ? "ACTIVE (Operational)" : "ACTIVE (Hoạt động)"}
                  </option>
                  <option value="REGISTERED">
                    {isEn ? "REGISTERED (Pending)" : "REGISTERED (Chờ duyệt)"}
                  </option>
                  <option value="REVOKED">
                    {isEn ? "REVOKED" : "REVOKED (Thu hồi)"}
                  </option>
                </select>
                <button type="submit" className="btn btn-primary">
                  {isEn ? "Assign Stall" : "Gán Sạp"}
                </button>
              </div>
            </form>

            <div
              style={{
                fontWeight: 600,
                fontSize: "0.9rem",
                marginBottom: 10,
              }}
            >
              {isEn
                ? `📋 Allocated Stalls (${marketAssignments.length}):`
                : `📋 Danh Sách Sạp Đã Phân Bổ (${marketAssignments.length}):`}
            </div>

            {stallLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "var(--text-muted)",
                }}
              >
                {isEn ? "Loading stalls..." : "Đang tải danh sách sạp..."}
              </div>
            ) : marketAssignments.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 24,
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                }}
              >
                {isEn
                  ? "No farmers allocated to stalls at this market yet."
                  : "Chưa có nông dân nào được phân sạp tại chợ này."}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {marketAssignments.map((a) => (
                  <div
                    key={a.assignmentId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(30, 41, 59, 0.5)",
                      border: "1px solid var(--card-border)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      flexWrap: "wrap",
                      gap: 8,
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
                            color: "#f1f5f9",
                            fontSize: "0.95rem",
                          }}
                        >
                          🎪 {a.stallNumber || (isEn ? "Stall unassigned" : "Chưa đặt số sạp")}
                        </span>
                        <span
                          className="badge-tag"
                          style={{
                            background:
                              a.status === "ACTIVE"
                                ? "rgba(16, 185, 129, 0.2)"
                                : "rgba(239, 68, 68, 0.2)",
                            color:
                              a.status === "ACTIVE" ? "#34d399" : "#f87171",
                            fontSize: "0.72rem",
                          }}
                        >
                          {a.status}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "#94a3b8",
                          marginTop: 2,
                        }}
                      >
                        👨‍🌾 {a.farmerName || (isEn ? "Farmer" : "Nông dân")} (ID: #{a.farmerId}) •
                        {" "}{isEn ? "Phone: " : "SĐT: "}{a.phoneNumber || "N/A"}{isEn ? " • Stall: " : " • Gian hàng: "}
                        {a.stallName || (isEn ? "Unnamed stall" : "Chưa đặt tên")}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                      }}
                    >
                      {a.status !== "ACTIVE" ? (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() =>
                            handleUpdateStallStatus(a.assignmentId, "ACTIVE")
                          }
                          style={{
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                          }}
                        >
                          ✅ {isEn ? "Approve Stall" : "Duyệt Sạp"}
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() =>
                            handleUpdateStallStatus(a.assignmentId, "REVOKED")
                          }
                          style={{
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            color: "#fca5a5",
                          }}
                        >
                          ⛔ {isEn ? "Revoke" : "Thu Hồi"}
                        </button>
                      )}

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          handleDeleteStall(a.assignmentId, a.stallNumber)
                        }
                        style={{
                          fontSize: "0.75rem",
                          padding: "4px 8px",
                        }}
                      >
                        🗑️ {isEn ? "Delete" : "Xóa"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                marginTop: 20,
                textAlign: "right",
              }}
            >
              <button
                className="btn btn-primary"
                onClick={() => setShowStallModal(false)}
              >
                {isEn ? "Close" : "Đóng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
