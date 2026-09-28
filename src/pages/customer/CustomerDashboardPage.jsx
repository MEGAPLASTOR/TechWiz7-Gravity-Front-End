import React, { useState, useEffect } from "react";
import "@/assets/styles/pages/customer/CustomerDashboardPage.css";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import ImageUploadInput from "../../components/ImageUploadInput";
import customerService from "../../services/customerService";
import orderService from "../../services/orderService";
import marketService from "../../services/marketService";
import { useLanguage } from "../../context/LanguageContext";

export default function CustomerDashboardPage({
  userName: propUserName,
  userEmail: propUserEmail,
  onNavigate,
  onAddToCart,
}) {
  const { isEn, t, localizeProduceName, localizeMarketName, localizeStallName, localizeUnit } = useLanguage();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState(propUserName || "");
  const [phone, setPhone] = useState("");
  const [defaultAddress, setDefaultAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    defaultAddress: "",
    avatarUrl: "",
  });
  const [orders, setOrders] = useState([]);
  const [upcomingOrder, setUpcomingOrder] = useState(null);
  const [favoriteFarmers, setFavoriteFarmers] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyInvitations, setFamilyInvitations] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [acceptToken, setAcceptToken] = useState("");
  const [familyLoading, setFamilyLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [profData, myOrders, favFarmers, favProds, famMembers, famInvs] =
          await Promise.all([
            customerService.getProfile(),
            orderService.getMyOrders(),
            customerService.getFavorites("FARMER"),
            customerService.getFavorites("PRODUCT"),
            customerService.getFamilyMembers(),
            customerService.getFamilyInvitations(),
          ]);
        if (!isMounted) return;
        if (profData) {
          setProfile(profData);
          setFullName(profData.fullName || propUserName || "");
          setPhone(profData.phoneNumber || "");
          setDefaultAddress(profData.defaultAddress || "");
          setEditForm({
            fullName: profData.fullName || propUserName || "",
            phone: profData.phoneNumber || "",
            defaultAddress: profData.defaultAddress || "",
            avatarUrl: profData.avatarUrl || "",
          });
        }
        if (myOrders && myOrders.length > 0) {
          setOrders(myOrders);
          const upcoming = myOrders.find(
            (o) =>
              o.orderStatus === "READY_FOR_PICKUP" ||
              o.orderStatus === "READY" ||
              o.orderStatus === "ACCEPTED" ||
              o.orderStatus === "PLACED",
          );
          setUpcomingOrder(upcoming || null);
        }
        if (favFarmers) setFavoriteFarmers(favFarmers);
        if (favProds) setFavoriteProducts(favProds);
        if (famMembers) setFamilyMembers(famMembers);
        if (famInvs) setFamilyInvitations(famInvs);
      } catch (err) {
        console.warn("Dashboard data fetch warning", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [propUserName]);
  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4500);
  };
  const handleOpenEditProfileModal = () => {
    setEditForm({
      fullName: profile?.fullName || fullName || "",
      phone: profile?.phoneNumber || phone || "",
      defaultAddress: profile?.defaultAddress || defaultAddress || "",
      avatarUrl: profile?.avatarUrl || "",
    });
    setIsEditProfileModalOpen(true);
  };
  const handleSaveProfileModal = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updatePayload = {
        fullName: editForm.fullName.trim(),
        phoneNumber: editForm.phone.trim(),
        defaultAddress: editForm.defaultAddress.trim(),
        avatarUrl: editForm.avatarUrl ? editForm.avatarUrl.trim() : null,
      };
      const updated = await customerService.updateProfile(updatePayload);
      if (editForm.avatarUrl && editForm.avatarUrl !== profile?.avatarUrl) {
        try {
          await customerService.updateAvatar(editForm.avatarUrl.trim());
        } catch (avErr) {
          console.warn("Avatar update fallback note:", avErr);
        }
      }
      const nextAvatar = editForm.avatarUrl
        ? editForm.avatarUrl.trim()
        : updated?.avatarUrl || profile?.avatarUrl;
      const nextFullName = editForm.fullName.trim();
      const nextPhone = editForm.phone.trim();
      const nextAddress = editForm.defaultAddress.trim();
      setProfile((prev) => ({
        ...prev,
        ...(updated || {}),
        fullName: nextFullName,
        phoneNumber: nextPhone,
        defaultAddress: nextAddress,
        avatarUrl: nextAvatar,
      }));
      setFullName(nextFullName);
      setPhone(nextPhone);
      setDefaultAddress(nextAddress);
      if (nextFullName) {
        localStorage.setItem("ml_name", nextFullName);
      }
      if (nextAvatar) {
        localStorage.setItem("ml_avatar", nextAvatar);
      }
      setIsEditProfileModalOpen(false);
      showStatus(isEn ? "✓ Profile and avatar updated successfully!" : "✓ Đã cập nhật hồ sơ và ảnh đại diện thành công!");
    } catch (err) {
      console.error("Update profile error:", err);
      alert(err?.message || (isEn ? "Unable to update profile at this time." : "Không thể cập nhật hồ sơ lúc này."));
    } finally {
      setSavingProfile(false);
    }
  };
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await customerService.updateProfile({
        fullName,
        phoneNumber: phone,
        defaultAddress,
        avatarUrl: profile?.avatarUrl || null,
      });
      if (updated) {
        setProfile((prev) => ({
          ...prev,
          ...updated,
          fullName: updated.fullName || fullName,
        }));
        localStorage.setItem("ml_name", updated.fullName || fullName);
      }
      showStatus(isEn ? "✓ Personal information updated successfully!" : "✓ Đã cập nhật thông tin cá nhân thành công!");
    } catch (err) {
      alert(err?.message || (isEn ? "Unable to update profile at this time." : "Không thể cập nhật hồ sơ lúc này."));
    } finally {
      setSavingProfile(false);
    }
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage(isEn ? "New password confirmation does not match." : "Mật khẩu xác nhận không khớp.");
      return;
    }
    try {
      await customerService.changePassword(currentPassword, newPassword);
      setPasswordMessage(isEn ? "✓ Password changed successfully!" : "✓ Đã đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMessage(""), 4000);
    } catch (err) {
      setPasswordMessage(isEn ? `Error: ${err?.message || "Could not change password"}` : `Lỗi: ${err?.message || "Không thể đổi mật khẩu"}`);
    }
  };
  const handleSendFamilyInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setFamilyLoading(true);
    try {
      await customerService.inviteFamilyMember(inviteEmail);
      showStatus(isEn ? `✓ Family group invitation sent to ${inviteEmail}!` : `✓ Đã gửi lời mời tham gia nhóm gia đình tới ${inviteEmail}!`);
      setInviteEmail("");
      const invs = await customerService.getFamilyInvitations();
      setFamilyInvitations(invs || []);
    } catch (err) {
      alert(err?.message || (isEn ? "Could not send family invitation." : "Không thể gửi lời mời gia đình."));
    } finally {
      setFamilyLoading(false);
    }
  };
  const handleAcceptInvite = async (tokenVal) => {
    setFamilyLoading(true);
    try {
      await customerService.acceptFamilyInvitation(tokenVal);
      showStatus(isEn ? "✓ You joined the family group successfully!" : "✓ Bạn đã gia nhập nhóm gia đình thành công!");
      const [members, invs] = await Promise.all([
        customerService.getFamilyMembers(),
        customerService.getFamilyInvitations(),
      ]);
      setFamilyMembers(members || []);
      setFamilyInvitations(invs || []);
    } catch (err) {
      alert(err?.message || (isEn ? "Could not accept invitation." : "Không thể chấp nhận lời mời."));
    } finally {
      setFamilyLoading(false);
    }
  };
  const handleLeaveFamily = async () => {
    if (window.confirm(isEn ? "Are you sure you want to leave this family group?" : "Bạn có chắc chắn muốn rời khỏi nhóm gia đình này?")) {
      try {
        await customerService.leaveFamily();
        showStatus(isEn ? "✓ You have left the family group." : "✓ Bạn đã rời khỏi nhóm gia đình.");
        const members = await customerService.getFamilyMembers();
        setFamilyMembers(members || []);
      } catch (err) {
        alert(err?.message || (isEn ? "Could not leave family group." : "Không thể rời nhóm gia đình."));
      }
    }
  };
  const handleRemoveMember = async (memberId) => {
    if (
      window.confirm(isEn ? "Are you sure you want to remove this member from the family group?" : "Bạn có chắc muốn xóa thành viên này khỏi nhóm gia đình?")
    ) {
      try {
        await customerService.removeFamilyMember(memberId);
        showStatus(isEn ? "✓ Member removed from family group." : "✓ Đã xóa thành viên khỏi nhóm gia đình.");
        const members = await customerService.getFamilyMembers();
        setFamilyMembers(members || []);
      } catch (err) {
        alert(err?.message || (isEn ? "Could not remove member at this time." : "Không thể xóa thành viên lúc này."));
      }
    }
  };
  const handleRemoveFavorite = async (targetType, targetId) => {
    try {
      await customerService.removeFavorite(targetType, targetId);
      if (targetType === "FARMER") {
        setFavoriteFarmers((prev) =>
          prev.filter((f) => (f.targetId || f.id) !== targetId),
        );
      } else {
        setFavoriteProducts((prev) =>
          prev.filter((p) => (p.targetId || p.id) !== targetId),
        );
      }
      showStatus(isEn ? "✓ Removed from favorites." : "✓ Đã xóa khỏi danh sách yêu thích.");
    } catch (err) {
      console.warn("Failed to remove favorite", err);
    }
  };
  const formatCurrency = (val) => {
    if (isEn) return `${Number(val || 0).toLocaleString()} VND`;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };
  const activePickupCount = orders.filter(
    (o) =>
      o.orderStatus === "READY_FOR_PICKUP" ||
      o.orderStatus === "READY" ||
      o.orderStatus === "PLACED" ||
      o.orderStatus === "ACCEPTED",
  ).length;
  const completedCount = orders.filter(
    (o) => o.orderStatus === "COMPLETED",
  ).length;
  const displayUserEmail =
    profile?.email || propUserEmail || "customer@marketlink.vn";
  const displayUserName =
    profile?.fullName || fullName || propUserName || (isEn ? "MarketLink Customer" : "Khách Hàng MarketLink");
  return (
    <div className="ml-dashboard-page">
      <div className="ml-dashboard-banner">
        <div className="ml-container ml-dashboard-banner-inner">
          <div className="ml-user-profile-header">
            <div
              className="ml-dashboard-avatar ml-dashboard-avatar--clickable"
              onClick={handleOpenEditProfileModal}
              title={isEn ? "Click to change avatar & personal info" : "Nhấn để đổi ảnh đại diện & thông tin cá nhân"}
            >
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayUserName}
                  className="ml-dashboard-avatar-img"
                />
              ) : (
                <span className="ml-dashboard-avatar-fallback">🛒</span>
              )}
              <span
                className="ml-dashboard-avatar-badge"
                title={isEn ? "Change avatar" : "Đổi ảnh đại diện"}
              >
                📷
              </span>
            </div>
            <div>
              <div className="ml-dashboard-user-greeting">
                {t("dashUserGreeting", "Tài khoản khách hàng")}
              </div>
              <h1 className="ml-dashboard-user-name">{displayUserName}</h1>
              <div className="ml-dashboard-user-meta">
                <span>✉️ {displayUserEmail}</span>
                {phone && <span>📞 {phone}</span>}
                {defaultAddress && <span>📍 {defaultAddress}</span>}
              </div>
            </div>
          </div>

          <div className="ml-dashboard-quick-actions">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenEditProfileModal}
              className="ml-btn-header-edit-profile"
            >
              ✏️ {t("dashEditProfileBtn", "Chỉnh sửa hồ sơ")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("orders")}
            >
              📦 {t("dashOrderHistoryBtn", "Lịch sử đơn hàng")} ({orders.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("my-reviews")}
            >
              ⭐ {t("dashMyReviewsBtn", "Đánh giá của tôi")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("products")}
            >
              🥦 {t("dashBrowseMoreBtn", "Đặt thêm nông sản")}
            </Button>
          </div>
        </div>
      </div>

      <div className="ml-container">
        {statusMessage && (
          <div
            className="ml-orders-loading"
            style={{
              backgroundColor: "#ecfdf5",
              borderColor: "#a7f3d0",
              color: "#065f46",
            }}
          >
            {statusMessage}
          </div>
        )}

        <div className="ml-dashboard-metrics">
          <div className="ml-metric-card">
            <span className="ml-metric-icon">⏰</span>
            <div>
              <div className="ml-metric-val">
                {activePickupCount} {isEn ? (activePickupCount === 1 ? "Order" : "Orders") : "Đơn"}
              </div>
              <div className="ml-metric-label">{t("dashMetricPickup", "Đơn hẹn lấy tại chợ")}</div>
            </div>
          </div>

          <div className="ml-metric-card">
            <span className="ml-metric-icon">🧺</span>
            <div>
              <div className="ml-metric-val">
                {completedCount} {isEn ? (completedCount === 1 ? "Order" : "Orders") : "Đơn"}
              </div>
              <div className="ml-metric-label">{t("dashMetricCompleted", "Đã nhận & thanh toán")}</div>
            </div>
          </div>

          <div className="ml-metric-card">
            <span className="ml-metric-icon">💚</span>
            <div>
              <div className="ml-metric-val">
                {favoriteFarmers.length + favoriteProducts.length} {isEn ? "Items" : "Mục"}
              </div>
              <div className="ml-metric-label">{t("dashMetricSaved", "Nông dân & món đã lưu")}</div>
            </div>
          </div>

          <div className="ml-metric-card">
            <span className="ml-metric-icon">👨‍👩‍👧‍👦</span>
            <div>
              <div className="ml-metric-val">
                {familyMembers.length > 0
                  ? `${familyMembers.length} ${isEn ? "Members" : "Người"}`
                  : t("dashNoMembers", "Chưa có")}
              </div>
              <div className="ml-metric-label">{t("dashMetricFamily", "Thành viên nhóm gia đình")}</div>
            </div>
          </div>
        </div>

        {upcomingOrder && (
          <div className="ml-card ml-upcoming-card">
            <div className="ml-upcoming-header">
              <span className="ml-upcoming-badge">
                ⚡ {t("dashUpcomingTitle", "ĐƠN NÔNG SẢN ĐẶT TRƯỚC SẮP TỚI")}
              </span>
              <span className="ml-upcoming-time">
                {t("dashUpcomingPickupDate", "Ngày nhận:")} <strong>{upcomingOrder.pickupDate}</strong> (
                {upcomingOrder.slotTimeRange || t("dashUpcomingMorningSlot", "Ca sáng")})
              </span>
            </div>

            <div className="ml-upcoming-body">
              <div className="ml-upcoming-info">
                <h3 className="ml-upcoming-market">
                  🎪 {localizeMarketName(upcomingOrder.marketName || "Phiên Chợ Nông Sản")} •{" "}
                  {localizeStallName(upcomingOrder.stallName || "Sạp nông dân")}
                </h3>
                <p className="ml-upcoming-desc">
                  {t("dashUpcomingOrderCode", "Mã đơn:")}{" "}
                  <strong>
                    #{upcomingOrder.orderCode || upcomingOrder.orderId}
                  </strong>{" "}
                  • {t("dashUpcomingStatus", "Trạng thái:")}{" "}
                  <span
                    style={{
                      color: "#16a34a",
                      fontWeight: "bold",
                    }}
                  >
                    {upcomingOrder.orderStatus === "READY_FOR_PICKUP"
                      ? t("dashUpcomingReady", "Sẵn sàng tại sạp")
                      : t("dashUpcomingHarvesting", "Đang thu hoạch & đóng gói")}
                  </span>
                </p>
                <div className="ml-upcoming-stall-note">
                  {t("dashUpcomingOwner", "Chủ sạp:")}{" "}
                  <strong>
                    {localizeStallName(upcomingOrder.farmerName || "Nhà vườn hữu cơ")}
                  </strong>{" "}
                  • {t("dashUpcomingTotal", "Tổng thanh toán:")}{" "}
                  <strong>{formatCurrency(upcomingOrder.totalAmount)}</strong>{" "}
                  {t("dashUpcomingPayHint", "(Thanh toán tại sạp khi nhận hàng).")}
                </div>
              </div>

              <div className="ml-upcoming-actions">
                <Button
                  variant="accent"
                  size="md"
                  onClick={() => onNavigate("orders")}
                >
                  📱 {t("dashUpcomingQrBtn", "Xem mã lấy hàng QR")}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="ml-dashboard-tabs-section">
          <div className="ml-dashboard-tabs">
            <button
              type="button"
              className={`ml-dash-tab ${activeTab === "upcoming" ? "active" : ""}`}
              onClick={() => setActiveTab("upcoming")}
            >
              💚 {t("dashTabSavedFarms", "Sạp nông dân đã lưu")} ({favoriteFarmers.length})
            </button>
            <button
              type="button"
              className={`ml-dash-tab ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              🍓 {t("dashTabFavProducts", "Nông sản yêu thích")} ({favoriteProducts.length})
            </button>
            <button
              type="button"
              className={`ml-dash-tab ${activeTab === "family" ? "active" : ""}`}
              onClick={() => setActiveTab("family")}
            >
              👨‍👩‍👧‍👦 {t("dashTabFamily", "Gia đình đi chợ")} ({familyMembers.length})
            </button>
            <button
              type="button"
              className={`ml-dash-tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              ⚙️ {t("dashTabProfile", "Cài đặt hồ sơ & địa chỉ")}
            </button>
          </div>

          {activeTab === "upcoming" && (
            <div>
              {favoriteFarmers.length === 0 ? (
                <div className="ml-card ml-orders-empty">
                  <span className="ml-orders-empty-icon">💚</span>
                  <h3>{t("dashNoSavedFarms", "Chưa có nhà vườn yêu thích nào")}</h3>
                  <p>
                    {t(
                      "dashNoSavedFarmsDesc",
                      "Khi ghé các sạp nông dân ưng ý, hãy nhấn nút yêu thích để theo dõi lịch họp chợ của họ."
                    )}
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => onNavigate("farmers")}
                  >
                    {t("dashDiscoverFarmsBtn", "Khám phá nhà vườn")}
                  </Button>
                </div>
              ) : (
                <div className="ml-fav-farmers-grid">
                  {favoriteFarmers.map((f) => {
                    const fid = f.targetId || f.id;
                    return (
                      <div
                        key={f.favoriteId || fid}
                        className="ml-card ml-fav-farmer-card"
                      >
                        <img
                          src={
                            f.targetImageUrl ||
                            "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80"
                          }
                          alt={f.targetName}
                          className="ml-fav-avatar"
                        />
                        <div className="ml-fav-info">
                          <h4 className="ml-fav-name">{localizeStallName(f.targetName)}</h4>
                          <div className="ml-fav-market">
                            📍 {localizeMarketName(f.targetMeta || "Phiên chợ nông sản")}
                          </div>
                          <div className="ml-fav-produce">
                            🌿 {isEn ? "Green family farm with verified sustainable cultivation" : "Nông trại xanh canh tác chuẩn hữu cơ"}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "8px",
                          }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate("farmers")}
                          >
                            {t("dashViewStallBtn", "Xem sạp")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="btn-danger-text"
                            onClick={() => handleRemoveFavorite("FARMER", fid)}
                          >
                            {t("dashRemoveFavBtn", "Bỏ lưu")}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "products" && (
            <div>
              {favoriteProducts.length === 0 ? (
                <div className="ml-card ml-orders-empty">
                  <span className="ml-orders-empty-icon">🍓</span>
                  <h3>{t("dashNoFavProds", "Chưa có nông sản lưu sẵn")}</h3>
                  <p>
                    {t(
                      "dashNoFavProdsDesc",
                      "Hãy lưu các loại rau quả mùa vụ bạn muốn đặt trước để dễ dàng thêm vào giỏ khi chợ họp."
                    )}
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => onNavigate("products")}
                  >
                    {t("dashBrowseProdsBtn", "Duyệt nông sản tươi")}
                  </Button>
                </div>
              ) : (
                <div className="ml-fav-prods-grid">
                  {favoriteProducts.map((p) => {
                    const pid = p.targetId || p.id;
                    return (
                      <div
                        key={p.favoriteId || pid}
                        className="ml-card ml-fav-prod-card"
                      >
                        <img
                          src={
                            p.targetImageUrl ||
                            "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80"
                          }
                          alt={p.targetName}
                          className="ml-fav-prod-img"
                        />
                        <div className="ml-fav-prod-info">
                          <h4 className="ml-fav-prod-title">{localizeProduceName(p.targetName)}</h4>
                          <span className="ml-fav-prod-farmer">
                            🏡 {localizeStallName(p.targetMeta || "Sạp nông dân")}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "6px",
                          }}
                        >
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => {
                              if (onAddToCart) {
                                onAddToCart({
                                  id: pid,
                                  name: p.targetName,
                                  price: 35000,
                                  unit: "kg",
                                  imageUrl: p.targetImageUrl,
                                  farmerName:
                                    p.targetMeta || "Nông Trại Hữu Cơ",
                                });
                              }
                            }}
                          >
                            {isEn ? "+ Pre-order" : "+ Đặt trước"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="btn-danger-text"
                            onClick={() => handleRemoveFavorite("PRODUCT", pid)}
                          >
                            {t("dashRemoveFavBtn", "Xóa")}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "family" && (
            <div className="ml-family-section">
              <div className="ml-family-intro-card">
                <div className="ml-family-intro-icon">👨‍👩‍👧‍👦</div>
                <div>
                  <h3 className="ml-family-intro-title">
                    {t("dashFamilyTitle", "Nhóm Gia Đình Đi Chợ Chung (Family Account)")}
                  </h3>
                  <p className="ml-family-intro-desc">
                    {t(
                      "dashFamilyDesc",
                      "Tính năng đặc biệt cho phép các thành viên trong gia đình cùng xem đơn đặt trước, cùng nhận thông báo khi nông sản đã sẵn sàng tại sạp, và bất kỳ ai cũng có thể xuất trình mã QR để nhận rau củ giúp nhau."
                    )}
                  </p>
                </div>
              </div>

              <div className="ml-family-grid">
                <div className="ml-card ml-family-members-card">
                  <div className="ml-family-card-title">
                    <span>{t("dashFamilyMembersTitle", "Thành viên trong nhóm")} ({familyMembers.length})</span>
                    {familyMembers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="btn-danger-text"
                        onClick={handleLeaveFamily}
                      >
                        {t("dashFamilyLeaveBtn", "Rời nhóm")}
                      </Button>
                    )}
                  </div>

                  {familyMembers.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "24px",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <p>{t("dashFamilyNoMembers", "Bạn chưa liên kết tài khoản gia đình nào.")}</p>
                      <p
                        style={{
                          fontSize: "12px",
                        }}
                      >
                        {t(
                          "dashFamilyNoMembersHelp",
                          "Hãy gửi lời mời bằng email hoặc nhập mã lời mời bạn nhận được ở khung bên phải!"
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="ml-family-member-list">
                      {familyMembers.map((m) => (
                        <div
                          key={m.customerId || m.email}
                          className="ml-family-member-item"
                        >
                          <div className="ml-family-member-left">
                            <div className="ml-family-member-avatar">
                              {m.fullName
                                ? m.fullName.charAt(0).toUpperCase()
                                : "👤"}
                            </div>
                            <div>
                              <div className="ml-family-member-name">
                                {m.fullName || m.email}
                                {m.isHeadOfFamily && (
                                  <Badge variant="organic" size="sm">
                                    {t("dashFamilyLeaderBadge", "Chủ nhóm")}
                                  </Badge>
                                )}
                              </div>
                              <div className="ml-family-member-email">
                                ✉️ {m.email}{" "}
                                {m.phoneNumber ? `• 📞 ${m.phoneNumber}` : ""}
                              </div>
                            </div>
                          </div>

                          {!m.isHeadOfFamily && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="btn-danger-text"
                              onClick={() => handleRemoveMember(m.customerId)}
                            >
                              {isEn ? "Remove" : "Xóa"}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ml-card ml-family-invite-card">
                  <h4 className="ml-family-card-title">
                    {t("dashFamilyInviteTitle", "Mời người thân vào nhóm")}
                  </h4>
                  <form
                    onSubmit={handleSendFamilyInvite}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div className="ml-form-group">
                      <label className="ml-form-label">
                        {t("dashFamilyEmailLabel", "Email thành viên muốn mời:")}
                      </label>
                      <input
                        type="email"
                        className="ml-form-input"
                        placeholder={isEn ? "e.g. member@gmail.com" : "VD: vo_yeu@gmail.com"}
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      loading={familyLoading}
                    >
                      {isEn ? (familyLoading ? "Sending..." : "Send Invitation") : (familyLoading ? "Đang gửi..." : "Gửi lời mời tham gia")}
                    </Button>
                  </form>

                  <div className="ml-family-invitations-box">
                    <h5
                      style={{
                        fontSize: "13px",
                        fontWeight: "bold",
                        marginBottom: "8px",
                      }}
                    >
                      {t("dashFamilyTokenTitle", "Bạn có mã token lời mời gia đình?")}
                    </h5>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <input
                        type="text"
                        className="ml-form-input"
                        placeholder={t("dashFamilyTokenPlaceholder", "Nhập mã token lời mời...")}
                        value={acceptToken}
                        onChange={(e) => setAcceptToken(e.target.value)}
                      />
                      <Button
                        variant="accent"
                        size="md"
                        disabled={!acceptToken.trim()}
                        onClick={() => handleAcceptInvite(acceptToken.trim())}
                      >
                        {t("dashFamilyJoinBtn", "Gia nhập")}
                      </Button>
                    </div>
                  </div>

                  {familyInvitations && familyInvitations.length > 0 && (
                    <div className="ml-family-invitations-box">
                      <h5
                        style={{
                          fontSize: "13px",
                          fontWeight: "bold",
                          marginBottom: "8px",
                        }}
                      >
                        {t("dashFamilyPendingTitle", "Lời mời đang chờ")} ({familyInvitations.length})
                      </h5>
                      {familyInvitations.map((inv) => (
                        <div
                          key={inv.invitationId || inv.invitationToken}
                          className="ml-invitation-item"
                        >
                          <div>
                            {t("dashFamilySentTo", "Gửi tới:")} <strong>{inv.inviteeEmail}</strong>
                          </div>
                          <div>
                            {t("dashUpcomingStatus", "Trạng thái:")}{" "}
                            <Badge variant="pending" size="sm">
                              {inv.status}
                            </Badge>
                          </div>
                          <div className="ml-invitation-token-row">
                            <span>{isEn ? "Code: " : "Mã: "}{inv.invitationToken}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  inv.invitationToken,
                                );
                                showStatus(isEn ? "✓ Invitation token copied!" : "✓ Đã sao chép mã token lời mời!");
                              }}
                            >
                              {t("dashFamilyCopyToken", "Sao chép")}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="ml-card ml-profile-settings-card">
              <div className="ml-profile-settings-header-flex">
                <div>
                  <h3 className="ml-subcard-title">
                    {t("dashProfileTitle", "Cài đặt hồ sơ & địa chỉ nhận hàng")}
                  </h3>
                  <p className="ml-profile-settings-subdesc">
                    {t(
                      "dashProfileDesc",
                      "Quản lý thông tin tài khoản, ảnh đại diện và địa chỉ nhận hàng nông sản tại các phiên chợ"
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleOpenEditProfileModal}
                  className="ml-btn-open-modal-settings"
                >
                  {t("dashProfileOpenModalBtn", "✏️ Chỉnh sửa hồ sơ (Mở hộp thoại)")}
                </Button>
              </div>

              <div className="ml-profile-overview-box">
                <div
                  className="ml-overview-avatar-wrapper"
                  onClick={handleOpenEditProfileModal}
                  title={isEn ? "Click to change avatar" : "Nhấn để đổi ảnh đại diện"}
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={displayUserName}
                      className="ml-overview-avatar-img"
                    />
                  ) : (
                    <div className="ml-overview-avatar-placeholder">🛒</div>
                  )}
                  <span className="ml-overview-camera-icon">📷</span>
                </div>

                <div className="ml-overview-info">
                  <div className="ml-overview-name-row">
                    <h4 className="ml-overview-name">{displayUserName}</h4>
                    <span className="ml-overview-badge">
                      {t("dashProfileMemberBadge", "Khách hàng thành viên")}
                    </span>
                  </div>
                  <div className="ml-overview-meta-list">
                    <div className="ml-overview-meta-item">
                      <span className="ml-meta-label">{t("dashProfileEmailLabel", "Email tài khoản:")}</span>
                      <strong className="ml-meta-value">
                        ✉️ {displayUserEmail}
                      </strong>
                    </div>
                    <div className="ml-overview-meta-item">
                      <span className="ml-meta-label">
                        {t("dashProfilePhoneLabel", "Số điện thoại liên hệ:")}
                      </span>
                      <strong className="ml-meta-value">
                        📞 {phone || t("dashProfileNotProvided", "Chưa cập nhật")}
                      </strong>
                    </div>
                    <div className="ml-overview-meta-item">
                      <span className="ml-meta-label">
                        {t("dashProfileAddressLabel", "Địa chỉ nhận hàng mặc định:")}
                      </span>
                      <span className="ml-meta-value">
                        📍 {defaultAddress || t("dashProfileNoAddress", "Chưa thiết lập địa chỉ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-overview-actions">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenEditProfileModal}
                  >
                    ✏️ {isEn ? "Edit" : "Thay đổi"}
                  </Button>
                </div>
              </div>

              <div className="ml-profile-inline-form-wrap">
                <h4 className="ml-inline-form-title">
                  {t("dashProfileQuickTitle", "📝 Cập nhật nhanh thông tin:")}
                </h4>
                <form
                  onSubmit={handleUpdateProfile}
                  className="ml-profile-form"
                >
                  <div className="ml-form-group">
                    <label className="ml-form-label">{t("dashProfileFullNameLabel", "Họ và tên của bạn:")}</label>
                    <input
                      type="text"
                      className="ml-form-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="ml-form-group">
                    <label className="ml-form-label">
                      {t("dashProfilePhoneHelp", "Số điện thoại liên hệ (để nông dân liên hệ khi có rau):")}
                    </label>
                    <input
                      type="text"
                      className="ml-form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={isEn ? "e.g. 0912 345 678" : "VD: 0912 345 678"}
                    />
                  </div>

                  <div className="ml-form-group">
                    <label className="ml-form-label">{t("dashProfileAddressLabel", "Địa chỉ mặc định:")}</label>
                    <input
                      type="text"
                      className="ml-form-input"
                      value={defaultAddress}
                      onChange={(e) => setDefaultAddress(e.target.value)}
                      placeholder={isEn ? "e.g. 123 Main St, Hanoi" : "VD: 123 Đường Láng, Đống Đa, Hà Nội"}
                    />
                  </div>

                  <div className="ml-inline-form-actions">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      loading={savingProfile}
                    >
                      {savingProfile ? t("dashModalSaving", "Đang lưu...") : t("dashProfileSaveBtn", "Lưu thay đổi hồ sơ")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={handleOpenEditProfileModal}
                    >
                      {t("dashProfileChangeAvatarBtn", "🖼️ Đổi ảnh đại diện (Mở hộp thoại)")}
                    </Button>
                  </div>
                </form>
              </div>

              <div
                style={{
                  marginTop: "32px",
                  paddingTop: "24px",
                  borderTop: "1px solid var(--color-border-light)",
                }}
              >
                <h4
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                  }}
                >
                  {t("dashPasswordTitle", "Đổi mật khẩu tài khoản")}
                </h4>
                {passwordMessage && (
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      marginBottom: "12px",
                      backgroundColor: "#f0fdf4",
                      color: "#166534",
                    }}
                  >
                    {passwordMessage}
                  </div>
                )}
                <form
                  onSubmit={handleChangePassword}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div className="ml-form-group">
                    <label className="ml-form-label">{t("dashPasswordCurrent", "Mật khẩu hiện tại:")}</label>
                    <input
                      type="password"
                      className="ml-form-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ml-form-group">
                    <label className="ml-form-label">{t("dashPasswordNew", "Mật khẩu mới:")}</label>
                    <input
                      type="password"
                      className="ml-form-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ml-form-group">
                    <label className="ml-form-label">
                      {t("dashPasswordConfirm", "Nhập lại mật khẩu mới:")}
                    </label>
                    <input
                      type="password"
                      className="ml-form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" variant="outline" size="md">
                    {t("dashPasswordSubmit", "Cập nhật mật khẩu mới")}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditProfileModalOpen && (
        <div
          className="ml-modal-overlay"
          onClick={() => setIsEditProfileModalOpen(false)}
        >
          <div
            className="ml-modal-box ml-customer-edit-modal-box"
            style={{
              maxWidth: "640px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ml-modal-header">
              <div>
                <h3>{t("dashModalEditTitle", "✏️ Chỉnh sửa hồ sơ & Ảnh đại diện")}</h3>
                <p className="ml-modal-subtitle">
                  {t(
                    "dashModalEditSubtitle",
                    "Cập nhật họ và tên, số điện thoại, địa chỉ nhận hàng và hình ảnh đại diện của bạn"
                  )}
                </p>
              </div>
              <button
                type="button"
                className="ml-modal-close"
                onClick={() => setIsEditProfileModalOpen(false)}
                aria-label={isEn ? "Close dialog" : "Đóng hộp thoại"}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfileModal} className="ml-modal-form">
              <div className="ml-modal-body">
                <div className="ml-customer-modal-avatar-section">
                  <div className="ml-customer-modal-avatar-preview">
                    {editForm.avatarUrl ? (
                      <img
                        src={editForm.avatarUrl}
                        alt="Avatar Preview"
                        className="ml-customer-modal-avatar-img"
                      />
                    ) : (
                      <div className="ml-customer-modal-avatar-placeholder">
                        🛒
                      </div>
                    )}
                  </div>
                  <div className="ml-customer-modal-avatar-controls">
                    <label
                      className="ml-form-label"
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      {t("dashModalAvatarLabel", "Ảnh đại diện tài khoản (Avatar):")}
                    </label>
                    <ImageUploadInput
                      folder="avatars"
                      value={editForm.avatarUrl}
                      onChange={(url) =>
                        setEditForm((prev) => ({
                          ...prev,
                          avatarUrl: url,
                        }))
                      }
                      onUploadSuccess={(url) =>
                        setEditForm((prev) => ({
                          ...prev,
                          avatarUrl: url,
                        }))
                      }
                      helpText={t(
                        "dashModalAvatarHelp",
                        "Tải lên ảnh chân dung cá nhân (JPG, PNG, WebP) hoặc dán đường dẫn ảnh trực tiếp"
                      )}
                    />
                  </div>
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">{t("dashProfileFullNameLabel", "Họ và tên của bạn:")}</label>
                  <div className="ml-input-wrapper">
                    <span className="ml-input-icon">👤</span>
                    <input
                      type="text"
                      className="ml-form-input ml-form-input--icon"
                      value={editForm.fullName}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          fullName: e.target.value,
                        })
                      }
                      placeholder={isEn ? "e.g. John Doe" : "VD: Nguyễn Nhựt Quang"}
                      required
                    />
                  </div>
                </div>

                <div className="ml-form-grid-2">
                  <div className="ml-form-group">
                    <label className="ml-form-label">
                      {t("dashModalFixedEmail", "Email tài khoản (Cố định):")}
                    </label>
                    <div className="ml-input-wrapper">
                      <span className="ml-input-icon">✉️</span>
                      <input
                        type="email"
                        className="ml-form-input ml-form-input--icon"
                        value={displayUserEmail}
                        disabled
                        style={{
                          backgroundColor: "var(--color-bg-base)",
                          cursor: "not-allowed",
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  </div>

                  <div className="ml-form-group">
                    <label className="ml-form-label">
                      {t("dashProfilePhoneLabel", "Số điện thoại liên hệ:")}
                    </label>
                    <div className="ml-input-wrapper">
                      <span className="ml-input-icon">📞</span>
                      <input
                        type="text"
                        className="ml-form-input ml-form-input--icon"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder={isEn ? "e.g. 0901234567" : "VD: 0901234567"}
                      />
                    </div>
                  </div>
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {t("dashProfileAddressLabel", "Địa chỉ nhận hàng mặc định:")}
                  </label>
                  <div className="ml-input-wrapper">
                    <span className="ml-input-icon">📍</span>
                    <input
                      type="text"
                      className="ml-form-input ml-form-input--icon"
                      value={editForm.defaultAddress}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          defaultAddress: e.target.value,
                        })
                      }
                      placeholder={isEn ? "e.g. 123 Main St, Hanoi" : "VD: 123 Đường Láng, Đống Đa, Hà Nội"}
                    />
                  </div>
                  <span className="ml-form-help">
                    {t(
                      "dashModalAddressHelp",
                      "Địa chỉ này sẽ được dùng để tự động điền khi bạn đặt mua nông sản tại các sạp chợ."
                    )}
                  </span>
                </div>
              </div>

              <div className="ml-modal-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  disabled={savingProfile}
                >
                  {t("dashModalCancel", "Hủy bỏ")}
                </Button>
                <Button type="submit" variant="primary" loading={savingProfile}>
                  {savingProfile ? t("dashModalSaving", "Đang lưu...") : t("dashProfileSaveBtn", "Lưu thay đổi hồ sơ")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
