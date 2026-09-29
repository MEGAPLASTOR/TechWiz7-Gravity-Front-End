import React, { useState, useEffect, useMemo } from "react";
import "@/assets/styles/pages/admin/UserModerationPage.css";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import adminService from "../../services/adminService";
import { formatImageUrl } from "../../services/apiClient";
import { useLanguage } from "../../context/LanguageContext";
import {
  isValidVietnamesePhone,
  normalizeVietnamesePhone,
} from "../../utils/validationUtils";

export default function UserModerationPage() {
  const { isEn } = useLanguage();
  const [mainTab, setMainTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [kycPage, setKycPage] = useState(1);
  const PAGE_SIZE = 15;
  const [userFilters, setUserFilters] = useState({
    keyword: "",
    role: "ALL",
    status: "ALL",
    kycStatus: "ALL",
  });
  const handleResetUserFilters = () => {
    setUserFilters({
      keyword: "",
      role: "ALL",
      status: "ALL",
      kycStatus: "ALL",
    });
  };
  const hasActiveFilters = Boolean(
    (userFilters.keyword && userFilters.keyword.trim() !== "") ||
    userFilters.role !== "ALL" ||
    userFilters.status !== "ALL" ||
    userFilters.kycStatus !== "ALL",
  );
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
  const [isUserStatusModalOpen, setIsUserStatusModalOpen] = useState(false);
  const [userStatusTarget, setUserStatusTarget] = useState(null);
  const [userStatusReason, setUserStatusReason] = useState("");

  // Create User State
  const initialCreateForm = {
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "CUSTOMER",
    status: "ACTIVE",
    address: "",
    farmName: "",
    farmAddress: "",
    kycStatus: "UNVERIFIED",
  };
  const [createUserForm, setCreateUserForm] = useState(initialCreateForm);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [savingCreateUser, setSavingCreateUser] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Edit User State
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "CUSTOMER",
    status: "ACTIVE",
    kycStatus: "UNVERIFIED",
    address: "",
    farmName: "",
    farmAddress: "",
    note: "",
  });
  const [savingEditUser, setSavingEditUser] = useState(false);

  // Delete User State
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deletingUser, setDeletingUser] = useState(false);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [kycList, setKycList] = useState([]);
  const [kycSearch, setKycSearch] = useState("");
  const [selectedFarmerKyc, setSelectedFarmerKyc] = useState(null);
  const [farmerKycDetail, setFarmerKycDetail] = useState(null);
  const [isKycDetailModalOpen, setIsKycDetailModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loadingKyc, setLoadingKyc] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    type: "",
    text: "",
  });
  const showToast = (type, text) => {
    setToastMsg({
      type,
      text,
    });
    setTimeout(
      () =>
        setToastMsg({
          type: "",
          text: "",
        }),
      4000,
    );
  };
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminService.getUsers(userFilters);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load users", err);
      showToast(
        "error",
        isEn
          ? "Failed to load users list from server."
          : "Không thể tải danh sách người dùng từ máy chủ.",
      );
    } finally {
      setLoadingUsers(false);
    }
  };
  const loadKyc = async (kw = kycSearch) => {
    setLoadingKyc(true);
    try {
      const data = await adminService.getPendingKycList(kw ? kw.trim() : "");
      setKycList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load KYC pending list", err);
      showToast(
        "error",
        isEn
          ? "Failed to load pending KYC documents list."
          : "Không thể tải danh sách hồ sơ KYC chờ duyệt.",
      );
    } finally {
      setLoadingKyc(false);
    }
  };
  useEffect(() => {
    if (mainTab === "users") {
      setUsersPage(1);
      const timer = setTimeout(() => {
        loadUsers();
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setKycPage(1);
      const timer = setTimeout(() => {
        loadKyc(kycSearch);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [mainTab, userFilters, kycSearch]);
  const handleViewUserDetail = async (userId) => {
    try {
      const detail = await adminService.getUserDetail(userId);
      setSelectedUserDetail(detail);
      setIsUserDetailModalOpen(true);
    } catch (err) {
      showToast(
        "error",
        (isEn ? "Failed to load user details: " : "Không thể tải chi tiết người dùng: ") +
          (err.message || ""),
      );
    }
  };
  const handleOpenStatusModal = (user) => {
    setUserStatusTarget(user);
    setUserStatusReason("");
    setIsUserStatusModalOpen(true);
  };
  const handleConfirmUserStatus = async () => {
    if (!userStatusTarget) return;
    const newStatus =
      userStatusTarget.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await adminService.updateUserStatus(
        userStatusTarget.userId,
        newStatus,
        userStatusReason,
      );
      showToast(
        "success",
        isEn
          ? `Successfully ${newStatus === "ACTIVE" ? "reactivated" : "suspended"} account #${userStatusTarget.userId}.`
          : `Đã ${newStatus === "ACTIVE" ? "kích hoạt lại" : "tạm khóa"} tài khoản #${userStatusTarget.userId} thành công.`,
      );
      setIsUserStatusModalOpen(false);
      loadUsers();
    } catch (err) {
      showToast(
        "error",
        (isEn ? "Status update error: " : "Lỗi cập nhật trạng thái: ") +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleOpenCreateUserModal = () => {
    setCreateUserForm(initialCreateForm);
    setShowCreatePassword(false);
    setIsCreateUserModalOpen(true);
  };

  const handleSaveCreateUser = async (e) => {
    e.preventDefault();
    if (
      !createUserForm.fullName.trim() ||
      !createUserForm.email.trim() ||
      !createUserForm.password.trim()
    ) {
      showToast(
        "error",
        isEn
          ? "Please fill in all required fields (Name, Email, Password)!"
          : "Vui lòng điền đầy đủ các trường bắt buộc (Họ tên, Email, Mật khẩu)!",
      );
      return;
    }
    if (createUserForm.password.length < 6) {
      showToast(
        "error",
        isEn
          ? "Password must be at least 6 characters!"
          : "Mật khẩu phải có ít nhất 6 ký tự!",
      );
      return;
    }
    if (createUserForm.phoneNumber && createUserForm.phoneNumber.trim()) {
      if (!isValidVietnamesePhone(createUserForm.phoneNumber)) {
        showToast(
          "error",
          isEn
            ? "Invalid phone number format! Must be 10 digits starting with 03, 05, 07, 08, 09."
            : "Số điện thoại không đúng định dạng! Vui lòng nhập số điện thoại Việt Nam gồm 10 số (đầu số 03, 05, 07, 08, 09).",
        );
        return;
      }
    }
    setSavingCreateUser(true);
    try {
      const payload = {
        ...createUserForm,
        phoneNumber: createUserForm.phoneNumber
          ? normalizeVietnamesePhone(createUserForm.phoneNumber)
          : "",
      };
      await adminService.createUser(payload);
      showToast(
        "success",
        isEn
          ? `Created account for ${createUserForm.fullName} successfully.`
          : `Đã tạo tài khoản cho ${createUserForm.fullName} thành công.`,
      );
      setIsCreateUserModalOpen(false);
      loadUsers();
    } catch (err) {
      showToast(
        "error",
        (isEn ? "Failed to create user: " : "Lỗi tạo người dùng: ") +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setSavingCreateUser(false);
    }
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    const role =
      user.roles && user.roles.length > 0
        ? String(user.roles[0]).replace(/^ROLE_/, "")
        : "CUSTOMER";
    setEditUserForm({
      fullName: user.fullName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      role: role,
      status: user.status || "ACTIVE",
      kycStatus: user.kycStatus || "UNVERIFIED",
      address: user.defaultAddress || user.address || "",
      farmName: user.stallName || user.farmName || "",
      farmAddress: user.farmAddress || "",
      note: "",
    });
    setIsEditUserModalOpen(true);
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editUserForm.fullName.trim()) {
      showToast(
        "error",
        isEn ? "Full name cannot be blank!" : "Họ và tên không được để trống!",
      );
      return;
    }
    if (editUserForm.phoneNumber && editUserForm.phoneNumber.trim()) {
      if (!isValidVietnamesePhone(editUserForm.phoneNumber)) {
        showToast(
          "error",
          isEn
            ? "Invalid phone number format! Must be 10 digits starting with 03, 05, 07, 08, 09."
            : "Số điện thoại không đúng định dạng! Vui lòng nhập số điện thoại Việt Nam gồm 10 số (đầu số 03, 05, 07, 08, 09).",
        );
        return;
      }
    }
    setSavingEditUser(true);
    try {
      const updateData = {
        ...editUserForm,
        phoneNumber: editUserForm.phoneNumber
          ? normalizeVietnamesePhone(editUserForm.phoneNumber)
          : "",
      };
      // 1. Update user info / status
      await adminService.updateUser(editingUser.userId, updateData);

      // 2. If farmer KYC status changed from previous value, sync KYC review
      if (
        editUserForm.role === "FARMER" &&
        editUserForm.kycStatus !== editingUser.kycStatus
      ) {
        const farmerId = editingUser.farmerId ?? editingUser.userId ?? editingUser.id;
        if (editUserForm.kycStatus === "VERIFIED") {
          try {
            await adminService.reviewFarmerKyc(
              farmerId,
              "APPROVE",
              editUserForm.note ||
                (isEn
                  ? "Admin manually verified KYC"
                  : "Quản trị viên đã xác thực KYC"),
            );
            const currentStoredUserId = localStorage.getItem("ml_user_id");
            if (currentStoredUserId && String(currentStoredUserId) === String(farmerId)) {
              localStorage.setItem("ml_kyc_status", "VERIFIED");
              window.dispatchEvent(new CustomEvent("ml_kyc_changed", { detail: "VERIFIED" }));
            }
          } catch (kycErr) {
            console.warn("KYC review sync skipped:", kycErr.message);
          }
        } else if (editUserForm.kycStatus === "REJECTED") {
          try {
            await adminService.reviewFarmerKyc(
              farmerId,
              "REJECT",
              editUserForm.note ||
                (isEn
                  ? "Admin rejected KYC"
                  : "Quản trị viên từ chối KYC"),
            );
            const currentStoredUserId = localStorage.getItem("ml_user_id");
            if (currentStoredUserId && String(currentStoredUserId) === String(farmerId)) {
              localStorage.setItem("ml_kyc_status", "REJECTED");
              window.dispatchEvent(new CustomEvent("ml_kyc_changed", { detail: "REJECTED" }));
            }
          } catch (kycErr) {
            console.warn("KYC reject sync skipped:", kycErr.message);
          }
        }
      }

      // Update local state immediately for instant responsive feedback
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === editingUser.userId
            ? {
                ...u,
                fullName: editUserForm.fullName,
                phoneNumber: editUserForm.phoneNumber,
                roles: [editUserForm.role],
                status: editUserForm.status,
                kycStatus: editUserForm.kycStatus,
                stallName: editUserForm.farmName,
                farmAddress: editUserForm.farmAddress,
              }
            : u,
        ),
      );

      showToast(
        "success",
        isEn
          ? `Updated user #${editingUser.userId} successfully.`
          : `Cập nhật thông tin người dùng #${editingUser.userId} thành công.`,
      );
      setIsEditUserModalOpen(false);
      loadUsers();
      loadKyc();
    } catch (err) {
      showToast(
        "error",
        (isEn ? "Failed to update user: " : "Lỗi cập nhật người dùng: ") +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setSavingEditUser(false);
    }
  };

  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteReason(
      isEn
        ? "Account deleted/deactivated by Administrator"
        : "Tài khoản bị xóa/vô hiệu hóa bởi Quản trị viên",
    );
    setIsDeleteUserModalOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);
    try {
      await adminService.deleteUser(userToDelete.userId, deleteReason);

      // Remove / update local state immediately
      setUsers((prev) => prev.filter((u) => u.userId !== userToDelete.userId));

      showToast(
        "success",
        isEn
          ? `Successfully deleted / deactivated user #${userToDelete.userId}.`
          : `Đã xóa / vô hiệu hóa tài khoản #${userToDelete.userId} thành công.`,
      );
      setIsDeleteUserModalOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      showToast(
        "error",
        (isEn ? "Failed to delete user: " : "Lỗi xóa người dùng: ") +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setDeletingUser(false);
    }
  };

  const handleViewKycDetail = async (farmer) => {
    setSelectedFarmerKyc(farmer);
    setIsKycDetailModalOpen(true);
    const farmerId = farmer.farmerId ?? farmer.userId ?? farmer.id;
    try {
      const detail = await adminService.getFarmerKycDetail(farmerId);
      setFarmerKycDetail(detail);
    } catch (err) {
      console.warn("Failed to fetch detailed kyc", err);
    }
  };
  const extractErrorMessage = (err) => {
    if (err.response?.data?.errors) {
      const errMap = err.response.data.errors;
      if (typeof errMap === "object") {
        return Object.values(errMap).join("; ");
      }
    }
    return (
      err.response?.data?.message ||
      err.message ||
      (isEn ? "Unknown error" : "Lỗi không xác định")
    );
  };
  const handleOpenApproveModal = (farmer) => {
    setApproveTarget(farmer);
    setIsApproveModalOpen(true);
  };
  const handleApproveKyc = async () => {
    if (!approveTarget) return;
    const farmerId = approveTarget.farmerId ?? approveTarget.userId ?? approveTarget.id;
    try {
      await adminService.reviewFarmerKyc(
        farmerId,
        "APPROVE",
        isEn
          ? "Valid VietGAP certification document."
          : "Hồ sơ chứng nhận VietGAP hợp lệ.",
      );
      showToast(
        "success",
        isEn
          ? `Successfully approved KYC for farmer #${farmerId}. Market stall is now activated!`
          : `Đã phê duyệt KYC thành công cho nông dân #${farmerId}. Sạp hàng đã được kích hoạt!`,
      );

      // Sync if the current session or localStorage holds this user id
      const currentStoredUserId = localStorage.getItem("ml_user_id");
      if (currentStoredUserId && String(currentStoredUserId) === String(farmerId)) {
        localStorage.setItem("ml_kyc_status", "VERIFIED");
        window.dispatchEvent(new CustomEvent("ml_kyc_changed", { detail: "VERIFIED" }));
      }

      // Update local users table state immediately
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === farmerId || u.farmerId === farmerId
            ? { ...u, kycStatus: "VERIFIED", isApproved: true }
            : u,
        ),
      );

      setIsApproveModalOpen(false);
      setApproveTarget(null);
      setIsKycDetailModalOpen(false);
      loadKyc();
      loadUsers();
    } catch (err) {
      showToast(
        "error",
        (isEn ? "Approval error: " : "Lỗi phê duyệt: ") +
          extractErrorMessage(err),
      );
    }
  };
  const handleOpenRejectModal = (farmer) => {
    setSelectedFarmerKyc(farmer);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };
  const handleConfirmRejectKyc = async (actionType = "REJECT") => {
    if (!selectedFarmerKyc) return;
    if (!rejectReason.trim()) {
      showToast(
        "error",
        isEn
          ? "Please enter a reason to provide feedback to the farmer!"
          : "Vui lòng nhập lý do để phản hồi cho nông dân!",
      );
      return;
    }
    const farmerId = selectedFarmerKyc.farmerId ?? selectedFarmerKyc.userId ?? selectedFarmerKyc.id;
    try {
      await adminService.reviewFarmerKyc(
        farmerId,
        actionType,
        rejectReason.trim(),
      );
      showToast(
        "success",
        isEn
          ? `Sent [${actionType}] result to farmer #${farmerId}.`
          : `Đã gửi kết quả [${actionType}] hồ sơ tới nông dân #${farmerId}.`,
      );

      const currentStoredUserId = localStorage.getItem("ml_user_id");
      if (currentStoredUserId && String(currentStoredUserId) === String(farmerId)) {
        localStorage.setItem("ml_kyc_status", "REJECTED");
        window.dispatchEvent(new CustomEvent("ml_kyc_changed", { detail: "REJECTED" }));
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.userId === farmerId || u.farmerId === farmerId
            ? { ...u, kycStatus: "REJECTED" }
            : u,
        ),
      );

      setIsRejectModalOpen(false);
      setIsKycDetailModalOpen(false);
      loadKyc();
      loadUsers();
    } catch (err) {
      showToast(
        "error",
        (isEn ? "Document processing error: " : "Lỗi xử lý hồ sơ: ") +
          extractErrorMessage(err),
      );
    }
  };
  const renderRoleBadges = (roles = []) => {
    if (!roles || roles.length === 0)
      return <Badge variant="neutral">{isEn ? "Customer" : "Khách hàng"}</Badge>;
    return roles.map((r, i) => {
      if (r === "ROLE_ADMIN" || r === "ADMIN")
        return (
          <Badge key={i} variant="accent">
            🛡️ {isEn ? "Admin" : "Quản trị viên"}
          </Badge>
        );
      if (r === "ROLE_FARMER" || r === "FARMER")
        return (
          <Badge key={i} variant="organic">
            👨‍🌾 {isEn ? "Farmer" : "Nông dân"}
          </Badge>
        );
      return (
        <Badge key={i} variant="primary">
          🛒 {isEn ? "Customer" : "Khách hàng"}
        </Badge>
      );
    });
  };
  const renderStatusBadge = (status) => {
    if (status === "ACTIVE")
      return (
        <Badge variant="ready" dot>
          {isEn ? "Active" : "Đang hoạt động"}
        </Badge>
      );
    return (
      <Badge variant="cancelled" dot>
        {isEn ? "Suspended" : "Tạm khóa"}
      </Badge>
    );
  };
  const renderKycBadge = (kycStatus) => {
    switch (kycStatus) {
      case "VERIFIED":
        return (
          <Badge variant="ready">
            {isEn ? "✓ Verified (VERIFIED)" : "✓ Đã định danh (VERIFIED)"}
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="pending">
            {isEn ? "⏳ Pending (PENDING)" : "⏳ Chờ duyệt (PENDING)"}
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="cancelled">
            {isEn ? "✕ Rejected (REJECTED)" : "✕ Bị từ chối (REJECTED)"}
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral">
            {isEn ? "Unverified" : "Chưa định danh"}
          </Badge>
        );
    }
  };
  const filteredKycList = kycList;

  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * PAGE_SIZE;
    return users.slice(start, start + PAGE_SIZE);
  }, [users, usersPage]);

  const paginatedKycList = useMemo(() => {
    const start = (kycPage - 1) * PAGE_SIZE;
    return filteredKycList.slice(start, start + PAGE_SIZE);
  }, [filteredKycList, kycPage]);

  return (
    <div className="ml-mod-page">
      {toastMsg.text && (
        <div
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
              toastMsg.type === "success" ? "#15803d" : "#b91c1c",
            color: "#ffffff",
          }}
        >
          {toastMsg.type === "success" ? "✓ " : "⚠️ "} {toastMsg.text}
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
                ? "User Management & Farmer Moderation"
                : "Quản Lý Người Dùng & Thẩm Định Nông Hộ"}
            </h1>
            <p className="ml-mod-desc">
              {isEn
                ? "Search platform accounts, regulate access permissions, verify VietGAP / Organic certifications, and authorize market stall operations."
                : "Tra cứu tài khoản toàn sàn, kiểm soát quyền truy cập, xác thực giấy tờ chứng nhận VietGAP / Hữu cơ và cấp quyền mở sạp chợ phiên."}
            </p>
          </div>

          <div className="ml-mod-stats-strip">
            <div className="ml-mod-stat-pill">
              <span className="ml-mod-stat-num">{users.length}</span>
              <span className="ml-mod-stat-lbl">
                {isEn ? "Accounts" : "Tài khoản"}
              </span>
            </div>
            <div className="ml-mod-stat-pill">
              <span className="ml-mod-stat-num">{kycList.length}</span>
              <span className="ml-mod-stat-lbl">
                {isEn ? "Pending KYC" : "Hồ sơ chờ duyệt"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="ml-container ml-mod-content">
        <div className="ml-user-mod-tabs-container">
          <div className="ml-user-mod-tabs">
            <button
              type="button"
              className={`ml-user-mod-tab ${mainTab === "users" ? "active" : ""}`}
              onClick={() => setMainTab("users")}
            >
              <span className="ml-user-mod-tab-icon">👥</span>
              <span className="ml-user-mod-tab-label">
                {isEn ? "System Users" : "Người dùng hệ thống"}
              </span>
              <span className="ml-tab-badge ml-tab-badge-users">
                {users.length}
              </span>
            </button>
            <button
              type="button"
              className={`ml-user-mod-tab ${mainTab === "kyc" ? "active" : ""}`}
              onClick={() => setMainTab("kyc")}
            >
              <span className="ml-user-mod-tab-icon">📜</span>
              <span className="ml-user-mod-tab-label">
                {isEn
                  ? "VietGAP KYC Verification"
                  : "Thẩm định hồ sơ VietGAP"}
              </span>
              <span
                className={`ml-tab-badge ${kycList.length > 0 ? "ml-tab-badge-kyc-alert" : "ml-tab-badge-kyc"}`}
              >
                {isEn
                  ? `${kycList.length} pending`
                  : `${kycList.length} chờ duyệt`}
              </span>
            </button>
          </div>
        </div>

        {mainTab === "users" && (
          <div className="ml-users-management-box">
            <div className="ml-user-filter-card">
              <div className="ml-filter-card-header">
                <div className="ml-filter-card-title-group">
                  <div className="ml-filter-card-icon-badge">🔍</div>
                  <div>
                    <h3 className="ml-filter-card-title">
                      {isEn
                        ? "Filter & Search Accounts"
                        : "Bộ Lọc & Tra Cứu Tài Khoản"}
                    </h3>
                    <p className="ml-filter-card-subtitle">
                      {loadingUsers
                        ? isEn
                          ? "Searching data..."
                          : "Đang tìm kiếm dữ liệu..."
                        : isEn
                          ? `Found ${users.length} accounts matching filters`
                          : `Tìm thấy ${users.length} tài khoản phù hợp với điều kiện`}
                    </p>
                  </div>
                </div>

                <div className="ml-filter-card-actions">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="ml-filter-reset-btn"
                      onClick={handleResetUserFilters}
                      title={
                        isEn
                          ? "Clear all filters to default"
                          : "Xóa tất cả bộ lọc về mặc định"
                      }
                    >
                      <span className="ml-reset-icon">✕</span>
                      <span>{isEn ? "Clear filters" : "Xóa bộ lọc"}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="ml-filter-reload-btn"
                    onClick={loadUsers}
                    title={isEn ? "Reload data" : "Tải lại dữ liệu"}
                    disabled={loadingUsers}
                  >
                    <span className={loadingUsers ? "ml-spin" : ""}>🔄</span>
                    <span>{isEn ? "Refresh" : "Làm mới"}</span>
                  </button>
                  <Button
                    variant="primary"
                    onClick={handleOpenCreateUserModal}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontWeight: 600,
                      backgroundColor: "#16a34a",
                      borderColor: "#16a34a",
                    }}
                  >
                    <span>➕</span>
                    <span>{isEn ? "Add User" : "Thêm người dùng"}</span>
                  </Button>
                </div>
              </div>

              <div className="ml-user-filter-grid">
                <div className="ml-filter-field ml-filter-field-search">
                  <label className="ml-filter-label">
                    <span className="ml-label-icon">🔎</span>{" "}
                    {isEn ? "Search users" : "Tìm kiếm người dùng"}
                  </label>
                  <div className="ml-search-input-wrapper">
                    <span className="ml-search-leading-icon">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </span>
                    <input
                      type="text"
                      className="ml-filter-input"
                      placeholder={
                        isEn
                          ? "Enter name, email, phone..."
                          : "Nhập tên, email, SĐT..."
                      }
                      value={userFilters.keyword}
                      onChange={(e) =>
                        setUserFilters({
                          ...userFilters,
                          keyword: e.target.value,
                        })
                      }
                    />
                    {userFilters.keyword && (
                      <button
                        type="button"
                        className="ml-input-clear-btn"
                        onClick={() =>
                          setUserFilters({
                            ...userFilters,
                            keyword: "",
                          })
                        }
                        title={isEn ? "Clear search" : "Xóa tìm kiếm"}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="ml-filter-field">
                  <label className="ml-filter-label">
                    <span className="ml-label-icon">🎭</span>{" "}
                    {isEn ? "Account role" : "Vai trò tài khoản"}
                  </label>
                  <div className="ml-select-wrapper">
                    <select
                      className="ml-filter-select"
                      value={
                        userFilters.role
                          ? userFilters.role.replace(/^ROLE_/, "")
                          : "ALL"
                      }
                      onChange={(e) =>
                        setUserFilters({
                          ...userFilters,
                          role: e.target.value,
                        })
                      }
                    >
                      <option value="ALL">
                        {isEn ? "All roles" : "Tất cả vai trò"}
                      </option>
                      <option value="FARMER">
                        {isEn
                          ? "👨‍🌾 Farmer (FARMER)"
                          : "👨‍🌾 Nông dân (FARMER)"}
                      </option>
                      <option value="CUSTOMER">
                        {isEn
                          ? "🛒 Customer (CUSTOMER)"
                          : "🛒 Khách hàng (CUSTOMER)"}
                      </option>
                      <option value="ADMIN">
                        {isEn
                          ? "🛡️ Administrator (ADMIN)"
                          : "🛡️ Quản trị viên (ADMIN)"}
                      </option>
                    </select>
                    <span className="ml-select-arrow">▼</span>
                  </div>
                </div>

                <div className="ml-filter-field">
                  <label className="ml-filter-label">
                    <span className="ml-label-icon">⚡</span>{" "}
                    {isEn ? "Account status" : "Trạng thái tài khoản"}
                  </label>
                  <div className="ml-select-wrapper">
                    <select
                      className="ml-filter-select"
                      value={userFilters.status}
                      onChange={(e) =>
                        setUserFilters({
                          ...userFilters,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="ALL">
                        {isEn ? "All statuses" : "Tất cả trạng thái"}
                      </option>
                      <option value="ACTIVE">
                        {isEn
                          ? "🟢 Active (ACTIVE)"
                          : "🟢 Đang hoạt động (ACTIVE)"}
                      </option>
                      <option value="SUSPENDED">
                        {isEn
                          ? "🔴 Suspended (SUSPENDED)"
                          : "🔴 Bị tạm khóa (SUSPENDED)"}
                      </option>
                    </select>
                    <span className="ml-select-arrow">▼</span>
                  </div>
                </div>

                <div className="ml-filter-field">
                  <label className="ml-filter-label">
                    <span className="ml-label-icon">🛡️</span>{" "}
                    {isEn ? "KYC Verification" : "Định danh KYC"}
                  </label>
                  <div className="ml-select-wrapper">
                    <select
                      className="ml-filter-select"
                      value={userFilters.kycStatus}
                      onChange={(e) =>
                        setUserFilters({
                          ...userFilters,
                          kycStatus: e.target.value,
                        })
                      }
                    >
                      <option value="ALL">
                        {isEn ? "All KYC" : "Tất cả KYC"}
                      </option>
                      <option value="VERIFIED">
                        {isEn
                          ? "✅ Verified (VERIFIED)"
                          : "✅ Đã xác thực (VERIFIED)"}
                      </option>
                      <option value="PENDING">
                        {isEn
                          ? "⏳ Pending (PENDING)"
                          : "⏳ Chờ duyệt (PENDING)"}
                      </option>
                      <option value="UNVERIFIED">
                        {isEn
                          ? "⚪ Unverified (UNVERIFIED)"
                          : "⚪ Chưa nộp (UNVERIFIED)"}
                      </option>
                      <option value="REJECTED">
                        {isEn
                          ? "❌ Rejected (REJECTED)"
                          : "❌ Bị từ chối (REJECTED)"}
                      </option>
                    </select>
                    <span className="ml-select-arrow">▼</span>
                  </div>
                </div>
              </div>

              <div className="ml-quick-filters-row">
                <span className="ml-quick-filters-title">
                  {isEn ? "Quick filter:" : "Lọc nhanh:"}
                </span>
                <div className="ml-quick-chips-list">
                  <button
                    type="button"
                    className={`ml-filter-chip ${!hasActiveFilters ? "active" : ""}`}
                    onClick={handleResetUserFilters}
                  >
                    {isEn ? "All" : "Tất cả"}
                  </button>
                  <button
                    type="button"
                    className={`ml-filter-chip ${userFilters.role === "FARMER" || userFilters.role === "ROLE_FARMER" ? "active" : ""}`}
                    onClick={() => {
                      const isSelected =
                        userFilters.role === "FARMER" ||
                        userFilters.role === "ROLE_FARMER";
                      setUserFilters({
                        ...userFilters,
                        role: isSelected ? "ALL" : "FARMER",
                      });
                    }}
                  >
                    {isEn ? "👨‍🌾 Farmers" : "👨‍🌾 Nông dân"}
                  </button>
                  <button
                    type="button"
                    className={`ml-filter-chip ${userFilters.role === "CUSTOMER" || userFilters.role === "ROLE_CUSTOMER" ? "active" : ""}`}
                    onClick={() => {
                      const isSelected =
                        userFilters.role === "CUSTOMER" ||
                        userFilters.role === "ROLE_CUSTOMER";
                      setUserFilters({
                        ...userFilters,
                        role: isSelected ? "ALL" : "CUSTOMER",
                      });
                    }}
                  >
                    {isEn ? "🛒 Customers" : "🛒 Khách hàng"}
                  </button>
                  <button
                    type="button"
                    className={`ml-filter-chip ${userFilters.role === "ADMIN" || userFilters.role === "ROLE_ADMIN" ? "active" : ""}`}
                    onClick={() => {
                      const isSelected =
                        userFilters.role === "ADMIN" ||
                        userFilters.role === "ROLE_ADMIN";
                      setUserFilters({
                        ...userFilters,
                        role: isSelected ? "ALL" : "ADMIN",
                      });
                    }}
                  >
                    {isEn ? "🛡️ Admins" : "🛡️ Quản trị viên"}
                  </button>
                  <button
                    type="button"
                    className={`ml-filter-chip ${userFilters.kycStatus === "PENDING" ? "active warning" : ""}`}
                    onClick={() =>
                      setUserFilters({
                        ...userFilters,
                        kycStatus:
                          userFilters.kycStatus === "PENDING"
                            ? "ALL"
                            : "PENDING",
                      })
                    }
                  >
                    {isEn ? "⏳ Pending KYC" : "⏳ Chờ duyệt KYC"}
                  </button>
                  <button
                    type="button"
                    className={`ml-filter-chip ${userFilters.status === "SUSPENDED" ? "active danger" : ""}`}
                    onClick={() =>
                      setUserFilters({
                        ...userFilters,
                        status:
                          userFilters.status === "SUSPENDED"
                            ? "ALL"
                            : "SUSPENDED",
                      })
                    }
                  >
                    {isEn ? "🔴 Suspended" : "🔴 Bị tạm khóa"}
                  </button>
                </div>
              </div>
            </div>

            {loadingUsers ? (
              <div className="ml-inv-loading">
                {isEn
                  ? "Loading users list from server..."
                  : "Đang tải danh sách người dùng từ máy chủ..."}
              </div>
            ) : users.length === 0 ? (
              <div
                className="ml-card"
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                {isEn
                  ? "No users found matching the search filters."
                  : "Không tìm thấy người dùng nào phù hợp với bộ lọc tìm kiếm."}
              </div>
            ) : (
              <>
                <div
                  className="ml-card"
                  style={{
                    padding: 0,
                    overflow: "hidden",
                  }}
              >
                <div style={{ overflowX: "auto" }}>
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
                        {isEn ? "ID & User" : "Mã & Người dùng"}
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                        }}
                      >
                        {isEn ? "Contact (Email / Phone)" : "Liên hệ (Email / SĐT)"}
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                        }}
                      >
                        {isEn ? "Role" : "Vai trò"}
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                        }}
                      >
                        {isEn ? "Status" : "Trạng thái"}
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                        }}
                      >
                        {isEn ? "KYC Verification" : "Định danh KYC"}
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                        }}
                      >
                        {isEn ? "Created Date" : "Ngày tạo"}
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
                    {paginatedUsers.map((u) => (
                      <tr
                        key={u.userId}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 16px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: "50%",
                                backgroundColor: "#e2e8f0",
                                backgroundImage: u.avatarUrl
                                  ? `url(${formatImageUrl(u.avatarUrl)})`
                                  : "none",
                                backgroundSize: "cover",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                color: "#334155",
                              }}
                            >
                              {!u.avatarUrl &&
                                (u.fullName
                                  ? u.fullName.charAt(0).toUpperCase()
                                  : "U")}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "#1e293b",
                                }}
                              >
                                {u.fullName || (isEn ? "Unnamed user" : "Chưa cập nhật tên")}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#64748b",
                                }}
                              >
                                ID: #{u.userId}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td
                          style={{
                            padding: "12px 16px",
                          }}
                        >
                          <div
                            style={{
                              color: "#1e293b",
                            }}
                          >
                            {u.email}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#64748b",
                            }}
                          >
                            {u.phoneNumber || (isEn ? "No phone" : "Chưa có SĐT")}
                          </div>
                        </td>

                        <td
                          style={{
                            padding: "12px 16px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              flexWrap: "wrap",
                            }}
                          >
                            {renderRoleBadges(u.roles)}
                          </div>
                        </td>

                        <td
                          style={{
                            padding: "12px 16px",
                          }}
                        >
                          {renderStatusBadge(u.status)}
                        </td>

                        <td
                          style={{
                            padding: "12px 16px",
                          }}
                        >
                          {renderKycBadge(u.kycStatus)}
                        </td>

                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#64748b",
                            fontSize: 12.5,
                          }}
                        >
                          {u.createdAt
                            ? u.createdAt.replace("T", " ").substring(0, 16)
                            : isEn ? "New" : "Mới tạo"}
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
                              gap: 4,
                              alignItems: "center",
                            }}
                          >
                            <button
                              onClick={() => handleViewUserDetail(u.userId)}
                              title={isEn ? "View details" : "Xem chi tiết"}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                                background: "#f8fafc",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 15,
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = "#e0f2fe";
                                e.currentTarget.style.borderColor = "#7dd3fc";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = "#f8fafc";
                                e.currentTarget.style.borderColor = "#e2e8f0";
                              }}
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              title={isEn ? "Edit user" : "Sửa người dùng"}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: "1px solid #bae6fd",
                                background: "#f0f9ff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 15,
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = "#bae6fd";
                                e.currentTarget.style.borderColor = "#38bdf8";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = "#f0f9ff";
                                e.currentTarget.style.borderColor = "#bae6fd";
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleOpenStatusModal(u)}
                              title={
                                u.status === "ACTIVE"
                                  ? isEn ? "Suspend account" : "Khóa tài khoản"
                                  : isEn ? "Unsuspend account" : "Mở khóa tài khoản"
                              }
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: `1px solid ${u.status === "ACTIVE" ? "#fca5a5" : "#86efac"}`,
                                background: u.status === "ACTIVE" ? "#fff1f2" : "#f0fdf4",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 15,
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = u.status === "ACTIVE" ? "#fecaca" : "#bbf7d0";
                                e.currentTarget.style.borderColor = u.status === "ACTIVE" ? "#f87171" : "#4ade80";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = u.status === "ACTIVE" ? "#fff1f2" : "#f0fdf4";
                                e.currentTarget.style.borderColor = u.status === "ACTIVE" ? "#fca5a5" : "#86efac";
                              }}
                            >
                              {u.status === "ACTIVE" ? "🔒" : "🔓"}
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(u)}
                              title={isEn ? "Delete user" : "Xóa người dùng"}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: "1px solid #fecaca",
                                background: "#fff1f2",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 15,
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = "#fecaca";
                                e.currentTarget.style.borderColor = "#f87171";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = "#fff1f2";
                                e.currentTarget.style.borderColor = "#fecaca";
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>

              <Pagination
                currentPage={usersPage}
                totalItems={users.length}
                pageSize={PAGE_SIZE}
                onPageChange={setUsersPage}
              />
            </>
          )}
          </div>
        )}

        {mainTab === "kyc" && (
          <div className="ml-kyc-management-box">
            <div
              className="ml-user-filter-card"
              style={{
                marginBottom: 24,
              }}
            >
              <div className="ml-filter-card-header">
                <div className="ml-filter-card-title-group">
                  <div
                    className="ml-filter-card-icon-badge"
                    style={{
                      background: "#fef3c7",
                      color: "#b45309",
                    }}
                  >
                    📜
                  </div>
                  <div>
                    <h3 className="ml-filter-card-title">
                      {isEn
                        ? "Pending VietGAP KYC Applications"
                        : "Tra Cứu Hồ Sơ VietGAP Chờ Thẩm Định"}
                    </h3>
                    <p className="ml-filter-card-subtitle">
                      {loadingKyc
                        ? (isEn ? "Loading applications..." : "Đang tải hồ sơ...")
                        : (isEn
                            ? `${filteredKycList.length} farmer applications pending verification`
                            : `Có ${filteredKycList.length} hồ sơ nông hộ đang chờ duyệt`)}
                    </p>
                  </div>
                </div>

                <div className="ml-filter-card-actions">
                  <button
                    type="button"
                    className="ml-filter-reload-btn"
                    onClick={() => loadKyc(kycSearch)}
                    title={isEn ? "Reload data" : "Tải lại dữ liệu"}
                    disabled={loadingKyc}
                  >
                    <span className={loadingKyc ? "ml-spin" : ""}>🔄</span>
                    <span>{isEn ? "Refresh list" : "Làm mới danh sách"}</span>
                  </button>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                }}
              >
                <div
                  className="ml-search-input-wrapper"
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                  }}
                >
                  <span className="ml-search-leading-icon">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="ml-filter-input"
                    placeholder={
                      isEn
                        ? "Quick search by farmer name, stall name, phone number..."
                        : "Tìm kiếm nhanh theo tên nông dân, tên gian hàng / sạp, số điện thoại..."
                    }
                    value={kycSearch}
                    onChange={(e) => setKycSearch(e.target.value)}
                  />
                  {kycSearch && (
                    <button
                      type="button"
                      className="ml-input-clear-btn"
                      onClick={() => setKycSearch("")}
                      title={isEn ? "Clear search" : "Xóa tìm kiếm"}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loadingKyc ? (
              <div className="ml-inv-loading">
                {isEn ? "Loading applications for verification..." : "Đang tải hồ sơ thẩm định..."}
              </div>
            ) : filteredKycList.length === 0 ? (
              <div
                className="ml-card"
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                {isEn
                  ? "🎉 Excellent! There are currently no pending farmer applications."
                  : "🎉 Tuyệt vời! Hiện không có hồ sơ nông hộ nào đang chờ thẩm định."}
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                    gap: 16,
                  }}
                >
                {paginatedKycList.map((k) => (
                  <div
                    key={k.farmerId}
                    className="ml-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            margin: "0 0 4px",
                            color: "#1e293b",
                          }}
                        >
                          🏡 {k.stallName || (isEn ? "Registered Farm" : "Nông Trại Đăng Ký")}
                        </h3>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                          }}
                        >
                          {isEn ? "Stall owner: " : "Chủ sạp: "}<strong>{k.fullName}</strong> • ID: #{k.farmerId}
                        </div>
                      </div>
                      <Badge variant="pending">
                        {isEn ? "Pending Review" : "Chờ thẩm định"}
                      </Badge>
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        color: "#334155",
                        backgroundColor: "#f8fafc",
                        padding: 10,
                        borderRadius: 8,
                      }}
                    >
                      <div>
                        📞 <strong>{isEn ? "Phone:" : "Điện thoại:"}</strong>{" "}
                        {k.phoneNumber || (isEn ? "Not provided" : "Chưa cung cấp")}
                      </div>
                      <div>
                        ✉️ <strong>Email:</strong> {k.email || (isEn ? "Not provided" : "Chưa cung cấp")}
                      </div>
                      <div>
                        📍 <strong>{isEn ? "Farm address:" : "Địa chỉ vườn:"}</strong>{" "}
                        {k.farmAddress || (isEn ? "Not updated" : "Chưa cập nhật")}
                      </div>
                      <div>
                        📜 <strong>{isEn ? "Documents submitted:" : "Tài liệu đã nộp:"}</strong>{" "}
                        {k.documentCount || 0} {isEn ? "certificate files" : "tệp ảnh chứng nhận"}
                      </div>
                      <div>
                        ⏰ <strong>{isEn ? "Submitted at:" : "Gửi lúc:"}</strong>{" "}
                        {k.lastSubmittedAt
                          ? k.lastSubmittedAt.replace("T", " ").substring(0, 16)
                          : isEn ? "Just submitted" : "Mới nộp"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: "auto",
                        paddingTop: 8,
                      }}
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        style={{
                          flex: 1,
                        }}
                        onClick={() => handleViewKycDetail(k)}
                      >
                        🔎 {isEn ? "View Details" : "Thẩm định chi tiết"}
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleOpenApproveModal(k)}
                      >
                        ✓ {isEn ? "Quick Approve" : "Duyệt nhanh"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{
                          color: "#b91c1c",
                        }}
                        onClick={() => handleOpenRejectModal(k)}
                      >
                        ✕ {isEn ? "Reject" : "Từ chối"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={kycPage}
                totalItems={filteredKycList.length}
                pageSize={PAGE_SIZE}
                onPageChange={setKycPage}
              />
            </>
          )}
          </div>
        )}
      </div>

      {isUserDetailModalOpen && selectedUserDetail && (
        <Modal
          isOpen={isUserDetailModalOpen}
          onClose={() => setIsUserDetailModalOpen(false)}
          title={
            isEn
              ? `User Profile Details #${selectedUserDetail.userId}`
              : `Hồ Sơ Chi Tiết Người Dùng #${selectedUserDetail.userId}`
          }
          subtitle={
            isEn
              ? "Account information, permissions, and moderation history on MarketLink"
              : "Thông tin tài khoản, phân quyền và lịch sử kiểm duyệt trên MarketLink"
          }
          maxWidth="680px"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                backgroundColor: "#f8fafc",
                padding: 14,
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "#cbd5e1",
                  backgroundImage: selectedUserDetail.avatarUrl
                    ? `url(${formatImageUrl(selectedUserDetail.avatarUrl)})`
                    : "none",
                  backgroundSize: "cover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                {!selectedUserDetail.avatarUrl &&
                  (selectedUserDetail.fullName
                    ? selectedUserDetail.fullName.charAt(0)
                    : "U")}
              </div>
              <div
                style={{
                  flex: 1,
                }}
              >
                <h3
                  style={{
                    margin: "0 0 4px",
                    fontSize: 18,
                    color: "#1e293b",
                  }}
                >
                  {selectedUserDetail.fullName}
                </h3>
                <div
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                  }}
                >
                  {selectedUserDetail.email} • 📞{" "}
                  {selectedUserDetail.phoneNumber ||
                    (isEn ? "No phone" : "Chưa có SĐT")}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 6,
                  }}
                >
                  {renderRoleBadges(selectedUserDetail.roles)}
                  {renderStatusBadge(selectedUserDetail.status)}
                  {renderKycBadge(selectedUserDetail.kycStatus)}
                </div>
              </div>
            </div>

            {selectedUserDetail.farmerProfile && (
              <div
                className="ml-card"
                style={{
                  padding: 14,
                }}
              >
                <h4
                  style={{
                    margin: "0 0 8px",
                    fontSize: 14,
                    color: "#166534",
                  }}
                >
                  {isEn
                    ? "🏡 Farm & Stall Information:"
                    : "🏡 Thông tin Nông trại / Sạp hàng:"}
                </h4>
                <div
                  style={{
                    fontSize: 13,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <div>
                    <strong>{isEn ? "Stall name:" : "Tên sạp:"}</strong>{" "}
                    {selectedUserDetail.farmerProfile.stallName}
                  </div>
                  <div>
                    <strong>{isEn ? "Address:" : "Địa chỉ:"}</strong>{" "}
                    {selectedUserDetail.farmerProfile.farmAddress}
                  </div>
                  <div>
                    <strong>{isEn ? "Approval status:" : "Trạng thái phê duyệt:"}</strong>{" "}
                    {selectedUserDetail.farmerProfile.isApproved
                      ? (isEn ? "✅ Stall activated" : "✅ Đã kích hoạt sạp")
                      : (isEn ? "⏳ Not activated" : "⏳ Chưa kích hoạt")}
                  </div>
                  <div
                    style={{
                      gridColumn: "1 / -1",
                    }}
                  >
                    <strong>{isEn ? "Bio:" : "Giới thiệu:"}</strong>{" "}
                    {selectedUserDetail.farmerProfile.bio}
                  </div>
                </div>
              </div>
            )}

            {selectedUserDetail.customerProfile && (
              <div
                className="ml-card"
                style={{
                  padding: 14,
                }}
              >
                <h4
                  style={{
                    margin: "0 0 8px",
                    fontSize: 14,
                    color: "#1e40af",
                  }}
                >
                  {isEn
                    ? "🛒 Customer Pre-order Information:"
                    : "🛒 Thông tin Khách hàng đặt trước:"}
                </h4>
                <div
                  style={{
                    fontSize: 13,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <div>
                    <strong>{isEn ? "Default address:" : "Địa chỉ mặc định:"}</strong>{" "}
                    {selectedUserDetail.customerProfile.defaultAddress ||
                      (isEn ? "Not provided" : "Chưa cung cấp")}
                  </div>
                  <div>
                    <strong>{isEn ? "Family account:" : "Tài khoản gia đình:"}</strong>{" "}
                    {selectedUserDetail.customerProfile.familyAccountId
                      ? `#${selectedUserDetail.customerProfile.familyAccountId}`
                      : (isEn ? "Independent" : "Độc lập")}
                  </div>
                </div>
              </div>
            )}

            <div
              className="ml-card"
              style={{
                padding: 14,
              }}
            >
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: 14,
                  color: "#334155",
                }}
              >
                {isEn
                  ? "📋 Moderation History (Audit Logs):"
                  : "📋 Lịch sử kiểm duyệt (Audit Logs):"}
              </h4>
              {!selectedUserDetail.auditLogs ||
              selectedUserDetail.auditLogs.length === 0 ? (
                <div
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                  }}
                >
                  {isEn
                    ? "No moderation history recorded for this account."
                    : "Chưa có nhật ký kiểm duyệt nào cho tài khoản này."}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    maxHeight: 160,
                    overflowY: "auto",
                  }}
                >
                  {selectedUserDetail.auditLogs.map((log, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 12.5,
                        backgroundColor: "#f8fafc",
                        padding: 8,
                        borderRadius: 6,
                        borderLeft: "3px solid #2e7d32",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: 600,
                        }}
                      >
                        <span>
                          {isEn ? "Action:" : "Hành động:"} {log.action} ({log.decision})
                        </span>
                        <span
                          style={{
                            color: "#64748b",
                          }}
                        >
                          {log.reviewedAt
                            ? log.reviewedAt.replace("T", " ").substring(0, 16)
                            : ""}
                        </span>
                      </div>
                      <div
                        style={{
                          color: "#475569",
                          marginTop: 2,
                        }}
                      >
                        {log.notes || (isEn ? "No additional notes." : "Không có ghi chú thêm.")}
                      </div>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        {isEn ? "Executed by: " : "Thực hiện bởi: "}
                        {log.adminName || `Admin #${log.adminId}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                variant="ghost"
                onClick={() => setIsUserDetailModalOpen(false)}
              >
                {isEn ? "Close" : "Đóng"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isUserStatusModalOpen && userStatusTarget && (
        <Modal
          isOpen={isUserStatusModalOpen}
          onClose={() => setIsUserStatusModalOpen(false)}
          title={
            userStatusTarget.status === "ACTIVE"
              ? isEn
                ? `Suspend Account #${userStatusTarget.userId}`
                : `Khóa Tài Khoản #${userStatusTarget.userId}`
              : isEn
                ? `Unsuspend Account #${userStatusTarget.userId}`
                : `Mở Khóa Tài Khoản #${userStatusTarget.userId}`
          }
          subtitle={
            isEn
              ? `User: ${userStatusTarget.fullName} (${userStatusTarget.email})`
              : `Người dùng: ${userStatusTarget.fullName} (${userStatusTarget.email})`
          }
          maxWidth="500px"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <p
              style={{
                fontSize: 13.5,
                color: "#334155",
                margin: 0,
              }}
            >
              {userStatusTarget.status === "ACTIVE"
                ? isEn
                  ? "When suspended, the user cannot log in or perform any transactions on the platform."
                  : "Khi khóa tài khoản, người dùng sẽ không thể đăng nhập hoặc thực hiện bất kỳ giao dịch nào trên sàn."
                : isEn
                  ? "Unsuspending will restore full access and platform privileges for this user."
                  : "Mở khóa sẽ khôi phục lại toàn bộ quyền sử dụng tài khoản cho người dùng."}
            </p>

            <div className="ml-form-group">
              <label className="ml-form-label">
                {isEn
                  ? "Reason (Saved in moderation audit logs):"
                  : "Lý do xử lý (Lưu vào nhật ký kiểm duyệt):"}
              </label>
              <textarea
                className="ml-form-textarea"
                rows={3}
                placeholder={
                  isEn
                    ? "Enter reason for suspension/unsuspension (e.g., Policy violation, dispute resolution...)"
                    : "Nhập lý do khóa / mở khóa (vd: Vi phạm quy định chợ, giải quyết khiếu nại...)"
                }
                value={userStatusReason}
                onChange={(e) => setUserStatusReason(e.target.value)}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <Button
                variant="ghost"
                onClick={() => setIsUserStatusModalOpen(false)}
              >
                {isEn ? "Cancel" : "Hủy"}
              </Button>
              <Button
                variant={
                  userStatusTarget.status === "ACTIVE" ? "primary" : "accent"
                }
                style={{
                  backgroundColor:
                    userStatusTarget.status === "ACTIVE"
                      ? "#b91c1c"
                      : "#15803d",
                }}
                onClick={handleConfirmUserStatus}
              >
                {userStatusTarget.status === "ACTIVE"
                  ? isEn
                    ? "Confirm Suspension"
                    : "Xác nhận khóa tài khoản"
                  : isEn
                    ? "Confirm Unsuspension"
                    : "Xác nhận mở khóa"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isKycDetailModalOpen && selectedFarmerKyc && (
        <Modal
          isOpen={isKycDetailModalOpen}
          onClose={() => setIsKycDetailModalOpen(false)}
          title={
            isEn
              ? `Farmer Application Review: ${selectedFarmerKyc.stallName || selectedFarmerKyc.fullName}`
              : `Thẩm Định Hồ Sơ Nông Hộ: ${selectedFarmerKyc.stallName || selectedFarmerKyc.fullName}`
          }
          subtitle={
            isEn
              ? `Stall owner: ${selectedFarmerKyc.fullName} • Phone: ${selectedFarmerKyc.phoneNumber || "N/A"}`
              : `Chủ sạp: ${selectedFarmerKyc.fullName} • SĐT: ${selectedFarmerKyc.phoneNumber || "N/A"}`
          }
          maxWidth="760px"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                backgroundColor: "#f8fafc",
                padding: 14,
                borderRadius: 8,
                fontSize: 13.5,
              }}
            >
              <div>
                <strong>{isEn ? "Farm / Cooperative name:" : "Tên nhà vườn / Hợp tác xã:"}</strong>{" "}
                {selectedFarmerKyc.stallName || (isEn ? "Registered Farm" : "Nông Trại Đăng Ký")}
              </div>
              <div>
                <strong>{isEn ? "Representative:" : "Đại diện:"}</strong> {selectedFarmerKyc.fullName}
              </div>
              <div>
                <strong>{isEn ? "Phone number:" : "Số điện thoại:"}</strong>{" "}
                {selectedFarmerKyc.phoneNumber || (isEn ? "Not provided" : "Chưa cung cấp")}
              </div>
              <div>
                <strong>Email:</strong> {selectedFarmerKyc.email}
              </div>
              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <strong>{isEn ? "Cultivation address:" : "Địa chỉ vùng trồng:"}</strong>{" "}
                {selectedFarmerKyc.farmAddress || (isEn ? "Not updated" : "Chưa cập nhật")}
              </div>
            </div>

            <div
              className="ml-card"
              style={{
                padding: 14,
              }}
            >
              <h4
                style={{
                  margin: "0 0 10px",
                  fontSize: 15,
                  color: "#166534",
                }}
              >
                {isEn
                  ? "📜 Certification Documents & Attached Images:"
                  : "📜 Giấy tờ chứng nhận & Ảnh chụp tài liệu đính kèm:"}
              </h4>

              {farmerKycDetail?.documents &&
              farmerKycDetail.documents.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  {farmerKycDetail.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                          fontSize: 13,
                        }}
                      >
                        <span>
                          {isEn ? "Document code: " : "Mã giấy tờ: "}
                          <strong>
                            {doc.documentNumber || `DOC-${idx + 1}`}
                          </strong>
                        </span>
                        <span
                          style={{
                            color: "#64748b",
                          }}
                        >
                          {isEn ? "Issued: " : "Ngày cấp: "}{doc.issuedDate || "N/A"} - {isEn ? "Expiry: " : "Hạn dùng: "}{doc.expiryDate || "N/A"}
                        </span>
                      </div>
                      <div
                        style={{
                          borderRadius: 6,
                          overflow: "hidden",
                          maxHeight: 300,
                          backgroundColor: "#f1f5f9",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={formatImageUrl(doc.documentUrl)}
                          alt="Giấy chứng nhận"
                          style={{
                            maxWidth: "100%",
                            maxHeight: 300,
                            objectFit: "contain",
                          }}
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: "#64748b",
                        }}
                      >
                        {isEn ? "🔗 Image URL: " : "🔗 Đường dẫn ảnh: "}
                        <a
                          href={formatImageUrl(doc.documentUrl)}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#2e7d32",
                          }}
                        >
                          {doc.documentUrl}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: 20,
                    color: "#64748b",
                    fontSize: 13.5,
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80"
                    alt="Chứng nhận mẫu"
                    style={{
                      maxHeight: 220,
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  />
                  <div>
                    {isEn
                      ? "Application submitted quality certificates. Please verify authenticity before approving."
                      : "Hồ sơ đã nộp ảnh chứng chỉ chất lượng nông sản. Hãy kiểm tra tính xác thực trước khi duyệt."}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #e2e8f0",
                paddingTop: 14,
              }}
            >
              <Button
                variant="ghost"
                onClick={() => setIsKycDetailModalOpen(false)}
              >
                {isEn ? "Close" : "Đóng lại"}
              </Button>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                }}
              >
                <Button
                  variant="outline"
                  style={{
                    color: "#d97706",
                    borderColor: "#fcd34d",
                  }}
                  onClick={() => handleOpenRejectModal(selectedFarmerKyc)}
                >
                  {isEn ? "🔄 Request Revision" : "🔄 Yêu cầu chỉnh sửa"}
                </Button>
                <Button
                  variant="ghost"
                  style={{
                    color: "#b91c1c",
                  }}
                  onClick={() => handleOpenRejectModal(selectedFarmerKyc)}
                >
                  {isEn ? "✕ Reject Application" : "✕ Từ chối hồ sơ"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleOpenApproveModal(selectedFarmerKyc)}
                >
                  {isEn
                    ? "✓ Approve Application (Authorize Stall)"
                    : "✓ Phê duyệt hồ sơ (Cấp quyền mở sạp)"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {isApproveModalOpen && approveTarget && (
        <Modal
          isOpen={isApproveModalOpen}
          onClose={() => {
            setIsApproveModalOpen(false);
            setApproveTarget(null);
          }}
          title={isEn ? "Confirm KYC Approval" : "Xác nhận phê duyệt hồ sơ KYC"}
          subtitle={`${isEn ? "Farmer:" : "Nông hộ:"} ${approveTarget.stallName || approveTarget.fullName || `#${approveTarget.farmerId}`}`}
          maxWidth="520px"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                padding: 14,
                borderRadius: 8,
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                lineHeight: 1.6,
              }}
            >
              {isEn
                ? "Valid documents will transition to verified status. The farmer will be granted privileges to register market stalls and list fresh produce."
                : "Hồ sơ hợp lệ sẽ được chuyển sang trạng thái đã xác minh. Nông dân sẽ được cấp quyền đăng ký sạp và đăng bán sản phẩm."}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <Button
                variant="ghost"
                onClick={() => {
                  setIsApproveModalOpen(false);
                  setApproveTarget(null);
                }}
              >
                {isEn ? "Cancel" : "Hủy"}
              </Button>
              <Button variant="primary" onClick={handleApproveKyc}>
                {isEn ? "✓ Confirm Approval" : "✓ Xác nhận phê duyệt"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isRejectModalOpen && selectedFarmerKyc && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title={
            isEn
              ? `Process Application Rejection / Revision: ${selectedFarmerKyc.stallName || selectedFarmerKyc.fullName}`
              : `Xử Lý Từ Chối / Bổ Sung Hồ Sơ: ${selectedFarmerKyc.stallName || selectedFarmerKyc.fullName}`
          }
          subtitle={
            isEn
              ? "The farmer will receive a notification with detailed reasons to make corrections"
              : "Nông dân sẽ nhận được thông báo kèm lý do chi tiết để khắc phục"
          }
          maxWidth="520px"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div className="ml-form-group">
              <label className="ml-form-label">
                {isEn
                  ? "Reason for rejection or revision instructions:"
                  : "Lý do từ chối hoặc hướng dẫn bổ sung:"}
              </label>
              <textarea
                className="ml-form-textarea"
                rows={4}
                placeholder={
                  isEn
                    ? "Example: Certificate expired, blurred image unreadable, please provide both sides..."
                    : "Ví dụ: Giấy chứng nhận đã hết hạn, ảnh chụp mờ không thấy rõ mã số VietGAP, vui lòng chụp lại 2 mặt..."
                }
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <Button
                variant="ghost"
                onClick={() => setIsRejectModalOpen(false)}
              >
                {isEn ? "Cancel" : "Hủy bỏ"}
              </Button>
              <Button
                variant="outline"
                style={{
                  color: "#d97706",
                  borderColor: "#fcd34d",
                }}
                onClick={() => handleConfirmRejectKyc("REQUEST_REVISION")}
              >
                {isEn ? "Request Revision" : "Gửi yêu cầu bổ sung"}
              </Button>
              <Button
                variant="primary"
                style={{
                  backgroundColor: "#b91c1c",
                }}
                onClick={() => handleConfirmRejectKyc("REJECT")}
              >
                {isEn ? "Confirm Rejection" : "Xác nhận từ chối hồ sơ"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL THÊM NGƯỜI DÙNG MỚI ================= */}
      {isCreateUserModalOpen && (
        <Modal
          isOpen={isCreateUserModalOpen}
          onClose={() => setIsCreateUserModalOpen(false)}
          title={
            isEn ? "Add New User Account" : "Thêm Tài Khoản Người Dùng Mới"
          }
          subtitle={
            isEn
              ? "Create system account with roles (Customer, Farmer, Admin)"
              : "Khởi tạo tài khoản hệ thống với các vai trò Khách hàng, Nông dân hoặc Quản trị viên"
          }
          maxWidth="640px"
        >
          <form onSubmit={handleSaveCreateUser} className="ml-user-modal-form">
            <div className="ml-user-form-grid">
              <div className="ml-user-form-group">
                <label className="ml-user-form-label">
                  <span>👤</span> {isEn ? "Full Name" : "Họ và tên"}{" "}
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="ml-user-form-input"
                  placeholder={
                    isEn ? "e.g.: Nguyen Van An" : "VD: Nguyễn Văn An"
                  }
                  value={createUserForm.fullName}
                  onChange={(e) =>
                    setCreateUserForm({
                      ...createUserForm,
                      fullName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="ml-user-form-group">
                <label className="ml-user-form-label">
                  <span>✉️</span> {isEn ? "Email Address" : "Email đăng nhập"}{" "}
                  <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className="ml-user-form-input"
                  placeholder="an.nguyen@marketlink.vn"
                  value={createUserForm.email}
                  onChange={(e) =>
                    setCreateUserForm({
                      ...createUserForm,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="ml-user-form-group">
                <label className="ml-user-form-label">
                  <span>🔑</span> {isEn ? "Password" : "Mật khẩu khởi tạo"}{" "}
                  <span className="required">*</span>
                </label>
                <div className="ml-user-password-input-wrapper">
                  <input
                    type={showCreatePassword ? "text" : "password"}
                    className="ml-user-form-input"
                    placeholder={
                      isEn ? "Minimum 6 characters" : "Tối thiểu 6 ký tự"
                    }
                    value={createUserForm.password}
                    onChange={(e) =>
                      setCreateUserForm({
                        ...createUserForm,
                        password: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="ml-user-pwd-toggle-btn"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    title={
                      showCreatePassword
                        ? isEn
                          ? "Hide password"
                          : "Ẩn mật khẩu"
                        : isEn
                          ? "Show password"
                          : "Hiện mật khẩu"
                    }
                  >
                    {showCreatePassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <div className="ml-user-form-group">
                <label className="ml-user-form-label">
                  <span>📱</span> {isEn ? "Phone Number" : "Số điện thoại"}
                </label>
                <input
                  type="tel"
                  className="ml-user-form-input"
                  placeholder="0987654321"
                  value={createUserForm.phoneNumber}
                  onChange={(e) =>
                    setCreateUserForm({
                      ...createUserForm,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div className="ml-user-form-group">
                <label className="ml-user-form-label">
                  <span>🎭</span> {isEn ? "User Role" : "Vai trò tài khoản"}{" "}
                  <span className="required">*</span>
                </label>
                <select
                  className="ml-user-form-select"
                  value={createUserForm.role}
                  onChange={(e) =>
                    setCreateUserForm({
                      ...createUserForm,
                      role: e.target.value,
                    })
                  }
                >
                  <option value="CUSTOMER">
                    🛒 {isEn ? "Customer" : "Khách hàng mua sắm"}
                  </option>
                  <option value="FARMER">
                    👨‍🌾 {isEn ? "Farmer / Producer" : "Nông dân / Nhà vườn"}
                  </option>
                  <option value="ADMIN">
                    🛡️ {isEn ? "System Administrator" : "Quản trị viên hệ thống"}
                  </option>
                </select>
              </div>

              <div className="ml-user-form-group">
                <label className="ml-user-form-label">
                  <span>⚡</span> {isEn ? "Account Status" : "Trạng thái ban đầu"}
                </label>
                <select
                  className="ml-user-form-select"
                  value={createUserForm.status}
                  onChange={(e) =>
                    setCreateUserForm({
                      ...createUserForm,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="ACTIVE">
                    🟢 {isEn ? "Active" : "Đang hoạt động"}
                  </option>
                  <option value="SUSPENDED">
                    🔴 {isEn ? "Suspended" : "Bị tạm khóa"}
                  </option>
                  <option value="PENDING">
                    ⏳ {isEn ? "Pending" : "Chờ kích hoạt"}
                  </option>
                </select>
              </div>

              <div className="ml-user-form-group full-width">
                <label className="ml-user-form-label">
                  <span>📍</span> {isEn ? "Contact / Address" : "Địa chỉ liên hệ / Giao hàng"}
                </label>
                <input
                  type="text"
                  className="ml-user-form-input"
                  placeholder={
                    isEn
                      ? "e.g.: 123 Cau Giay Street, Hanoi"
                      : "VD: Số 123 Đường Cầu Giấy, Hà Nội"
                  }
                  value={createUserForm.address}
                  onChange={(e) =>
                    setCreateUserForm({
                      ...createUserForm,
                      address: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {createUserForm.role === "FARMER" && (
              <div className="ml-user-section-divider">
                <div className="ml-user-section-title">
                  👨‍🌾 {isEn ? "Farmer & Stall Details" : "Thông Tin Nông Hộ & Sạp Hàng"}
                </div>
                <div className="ml-user-form-grid">
                  <div className="ml-user-form-group">
                    <label className="ml-user-form-label">
                      <span>🏡</span> {isEn ? "Farm / Stall Name" : "Tên Trang trại / Hợp tác xã"}
                    </label>
                    <input
                      type="text"
                      className="ml-user-form-input"
                      placeholder={
                        isEn
                          ? "e.g.: Ba Vi Organic Farm"
                          : "VD: Hợp tác xã Nông sản Hữu cơ Ba Vì"
                      }
                      value={createUserForm.farmName}
                      onChange={(e) =>
                        setCreateUserForm({
                          ...createUserForm,
                          farmName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="ml-user-form-group">
                    <label className="ml-user-form-label">
                      <span>📜</span> {isEn ? "Initial KYC Status" : "Định danh KYC ban đầu"}
                    </label>
                    <select
                      className="ml-user-form-select"
                      value={createUserForm.kycStatus}
                      onChange={(e) =>
                        setCreateUserForm({
                          ...createUserForm,
                          kycStatus: e.target.value,
                        })
                      }
                    >
                      <option value="UNVERIFIED">
                        ⚪ {isEn ? "Unverified (UNVERIFIED)" : "Chưa nộp KYC (UNVERIFIED)"}
                      </option>
                      <option value="PENDING">
                        ⏳ {isEn ? "Pending Review (PENDING)" : "Chờ thẩm định (PENDING)"}
                      </option>
                      <option value="VERIFIED">
                        ✅ {isEn ? "Verified & Granted Stall (VERIFIED)" : "Đã xác thực & Cấp quyền sạp (VERIFIED)"}
                      </option>
                    </select>
                  </div>

                  <div className="ml-user-form-group full-width">
                    <label className="ml-user-form-label">
                      <span>🌾</span> {isEn ? "Farm Production Address" : "Địa chỉ vùng canh tác / Vườn"}
                    </label>
                    <input
                      type="text"
                      className="ml-user-form-input"
                      placeholder={
                        isEn
                          ? "e.g.: Hamlet 3, Van Hoa, Ba Vi, Hanoi"
                          : "VD: Thôn 3, Xã Vân Hòa, Ba Vì, Hà Nội"
                      }
                      value={createUserForm.farmAddress}
                      onChange={(e) =>
                        setCreateUserForm({
                          ...createUserForm,
                          farmAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="ml-user-modal-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateUserModalOpen(false)}
              >
                {isEn ? "Cancel" : "Hủy bỏ"}
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={savingCreateUser}
                style={{
                  backgroundColor: "#16a34a",
                  borderColor: "#16a34a",
                }}
              >
                {isEn ? "Create Account" : "Tạo tài khoản"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL CHỈNH SỬA NGƯỜI DÙNG ================= */}
      {isEditUserModalOpen && editingUser && (
        <Modal
          isOpen={isEditUserModalOpen}
          onClose={() => setIsEditUserModalOpen(false)}
          title={
            isEn
              ? `Edit User Account #${editingUser.userId}`
              : `Chỉnh Sửa Tài Khoản #${editingUser.userId}`
          }
          subtitle={`${editingUser.fullName || (isEn ? "Unnamed" : "Chưa đặt tên")} (${editingUser.email})`}
          maxWidth="640px"
        >
          <form onSubmit={handleSaveEditUser} className="ml-user-modal-form">
            <div className="ml-user-info-summary">
              <div className="ml-user-summary-avatar">
                {editingUser.avatarUrl ? (
                  <img
                    src={editingUser.avatarUrl}
                    alt="avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : editingUser.fullName ? (
                  editingUser.fullName.charAt(0).toUpperCase()
                ) : (
                  "U"
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>
                  {editingUser.fullName || (isEn ? "Unnamed user" : "Chưa cập nhật tên")}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {editingUser.email} • ID: #{editingUser.userId}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {renderRoleBadges(editingUser.roles)}
              </div>
            </div>

            <div className="ml-user-form-grid">
              <div className="ml-user-form-group">
                <label className="ml-user-form-label">
                  <span>👤</span> {isEn ? "Full Name" : "Họ và tên"}{" "}
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="ml-user-form-input"
                  value={editUserForm.fullName}
                  onChange={(e) =>
                    setEditUserForm({
                      ...editUserForm,
                      fullName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="ml-user-form-group">
                <label className="ml-user-form-label">
                  <span>📱</span> {isEn ? "Phone Number" : "Số điện thoại"}
                </label>
                <input
                  type="tel"
                  className="ml-user-form-input"
                  placeholder="0987654321"
                  value={editUserForm.phoneNumber}
                  onChange={(e) =>
                    setEditUserForm({
                      ...editUserForm,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div className="ml-user-form-group">
                <label className="ml-user-form-label">
                  <span>🎭</span> {isEn ? "Account Role" : "Vai trò tài khoản"}
                </label>
                <select
                  className="ml-user-form-select"
                  value={editUserForm.role}
                  onChange={(e) =>
                    setEditUserForm({
                      ...editUserForm,
                      role: e.target.value,
                    })
                  }
                >
                  <option value="CUSTOMER">
                    🛒 {isEn ? "Customer" : "Khách hàng"}
                  </option>
                  <option value="FARMER">
                    👨‍🌾 {isEn ? "Farmer" : "Nông dân"}
                  </option>
                  <option value="ADMIN">
                    🛡️ {isEn ? "Administrator" : "Quản trị viên"}
                  </option>
                </select>
              </div>

              <div className="ml-user-form-group">
                <label className="ml-user-form-label">
                  <span>⚡</span> {isEn ? "Account Status" : "Trạng thái hoạt động"}
                </label>
                <select
                  className="ml-user-form-select"
                  value={editUserForm.status}
                  onChange={(e) =>
                    setEditUserForm({
                      ...editUserForm,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="ACTIVE">
                    🟢 {isEn ? "Active (ACTIVE)" : "Đang hoạt động (ACTIVE)"}
                  </option>
                  <option value="SUSPENDED">
                    🔴 {isEn ? "Suspended (SUSPENDED)" : "Bị tạm khóa (SUSPENDED)"}
                  </option>
                  <option value="PENDING">
                    ⏳ {isEn ? "Pending (PENDING)" : "Chờ kích hoạt (PENDING)"}
                  </option>
                </select>
              </div>

              <div className="ml-user-form-group">
                <label className="ml-user-form-label">
                  <span>🛡️</span> {isEn ? "KYC Verification" : "Định danh KYC"}
                </label>
                <select
                  className="ml-user-form-select"
                  value={editUserForm.kycStatus}
                  onChange={(e) =>
                    setEditUserForm({
                      ...editUserForm,
                      kycStatus: e.target.value,
                    })
                  }
                >
                  <option value="UNVERIFIED">
                    ⚪ {isEn ? "Unverified" : "Chưa định danh"}
                  </option>
                  <option value="PENDING">
                    ⏳ {isEn ? "Pending Review" : "Chờ thẩm định"}
                  </option>
                  <option value="VERIFIED">
                    ✅ {isEn ? "Verified" : "Đã xác thực"}
                  </option>
                  <option value="REJECTED">
                    ❌ {isEn ? "Rejected" : "Bị từ chối"}
                  </option>
                </select>
              </div>

              <div className="ml-user-form-group">
                <label className="ml-user-form-label">
                  <span>📍</span> {isEn ? "Address" : "Địa chỉ liên hệ"}
                </label>
                <input
                  type="text"
                  className="ml-user-form-input"
                  value={editUserForm.address}
                  onChange={(e) =>
                    setEditUserForm({
                      ...editUserForm,
                      address: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {editUserForm.role === "FARMER" && (
              <div className="ml-user-section-divider">
                <div className="ml-user-section-title">
                  👨‍🌾 {isEn ? "Farmer Stall Information" : "Thông Tin Gian Hàng Nông Hộ"}
                </div>
                <div className="ml-user-form-grid">
                  <div className="ml-user-form-group">
                    <label className="ml-user-form-label">
                      <span>🏡</span> {isEn ? "Stall / Farm Name" : "Tên sạp / Trang trại"}
                    </label>
                    <input
                      type="text"
                      className="ml-user-form-input"
                      value={editUserForm.farmName}
                      onChange={(e) =>
                        setEditUserForm({
                          ...editUserForm,
                          farmName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="ml-user-form-group">
                    <label className="ml-user-form-label">
                      <span>🌾</span> {isEn ? "Farm Address" : "Địa chỉ vườn / Canh tác"}
                    </label>
                    <input
                      type="text"
                      className="ml-user-form-input"
                      value={editUserForm.farmAddress}
                      onChange={(e) =>
                        setEditUserForm({
                          ...editUserForm,
                          farmAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="ml-user-form-group full-width">
              <label className="ml-user-form-label">
                <span>📝</span> {isEn ? "Audit Note / Reason for update:" : "Lý do / Ghi chú kiểm duyệt cập nhật:"}
              </label>
              <textarea
                className="ml-user-form-textarea"
                rows={2}
                placeholder={
                  isEn
                    ? "Enter reason or change note (saved in audit trail)..."
                    : "Nhập lý do thay đổi hoặc ghi chú kiểm duyệt..."
                }
                value={editUserForm.note}
                onChange={(e) =>
                  setEditUserForm({
                    ...editUserForm,
                    note: e.target.value,
                  })
                }
              />
            </div>

            <div className="ml-user-modal-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditUserModalOpen(false)}
              >
                {isEn ? "Cancel" : "Hủy bỏ"}
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={savingEditUser}
                style={{
                  backgroundColor: "#0284c7",
                  borderColor: "#0284c7",
                }}
              >
                {isEn ? "Save Changes" : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL XÁC NHẬN XÓA NGƯỜI DÙNG ================= */}
      {isDeleteUserModalOpen && userToDelete && (
        <Modal
          isOpen={isDeleteUserModalOpen}
          onClose={() => {
            setIsDeleteUserModalOpen(false);
            setUserToDelete(null);
          }}
          title={
            isEn
              ? `Confirm Deletion of User #${userToDelete.userId}`
              : `Xác Nhận Xóa Tài Khoản #${userToDelete.userId}`
          }
          subtitle={`${userToDelete.fullName || (isEn ? "Unnamed user" : "Chưa có tên")} (${userToDelete.email})`}
          maxWidth="520px"
        >
          <div className="ml-user-modal-form">
            <div className="ml-user-warning-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                <span>⚠️</span>
                <span>{isEn ? "Security & Integrity Notice:" : "Cảnh báo an toàn dữ liệu:"}</span>
              </div>
              <div>
                {isEn
                  ? `Are you sure you want to delete / deactivate user #${userToDelete.userId} (${userToDelete.fullName})? To protect transactional integrity (orders, reviews, financial settlement), the account will be safely deactivated and suspended from platform access.`
                  : `Bạn có chắc chắn muốn xóa / vô hiệu hóa tài khoản #${userToDelete.userId} (${userToDelete.fullName})? Nhằm đảm bảo toàn vẹn dữ liệu hệ thống (lịch sử đơn hàng, đánh giá, kiểm toán doanh thu), tài khoản sẽ được chuyển sang trạng thái tạm khóa vô hiệu hóa an toàn.`}
              </div>
            </div>

            <div className="ml-user-form-group">
              <label className="ml-user-form-label">
                <span>📝</span> {isEn ? "Deletion / Deactivation Reason:" : "Lý do xóa / vô hiệu hóa:"}
              </label>
              <textarea
                className="ml-user-form-textarea"
                rows={3}
                placeholder={
                  isEn
                    ? "Enter reason for account deletion..."
                    : "Nhập lý do xóa hoặc vô hiệu hóa tài khoản..."
                }
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>

            <div className="ml-user-modal-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsDeleteUserModalOpen(false);
                  setUserToDelete(null);
                }}
              >
                {isEn ? "Cancel" : "Hủy bỏ"}
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={deletingUser}
                style={{
                  backgroundColor: "#dc2626",
                  borderColor: "#dc2626",
                }}
                onClick={handleConfirmDeleteUser}
              >
                🗑️ {isEn ? "Confirm Delete" : "Xác nhận xóa"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
