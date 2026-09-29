import React, { useState, useEffect, useMemo } from "react";
import "@/assets/styles/pages/farmer/FarmerStallProfilePage.css";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Pagination from "../../components/common/Pagination";
import ImageUploadInput from "../../components/ImageUploadInput";
import farmerService from "../../services/farmerService";
import marketService from "../../services/marketService";
import { formatImageUrl } from "../../services/apiClient";
import { useLanguage } from "../../context/LanguageContext";
import {
  isFarmerKycApproved,
  getEffectiveKycStatus,
  syncKycStatus,
} from "../../utils/kycUtils";

const getDayOfWeekName = (day, isEn) => {
  const viMap = {
    1: "Thứ Hai",
    2: "Thứ Ba",
    3: "Thứ Tư",
    4: "Thứ Năm",
    5: "Thứ Sáu",
    6: "Thứ Bảy",
    7: "Chủ Nhật",
  };
  const enMap = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
  };
  return isEn ? (enMap[day] || `Day ${day}`) : (viMap[day] || `Thứ ${day}`);
};

export default function FarmerStallProfilePage({ initialTab = "profile" }) {
  const { isEn, localizeMarketName } = useLanguage();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState("");
  const [alertError, setAlertError] = useState("");
  const [profile, setProfile] = useState({
    farmName: "",
    fullName: "",
    phone: "",
    address: "",
    bio: "",
    avatarUrl: "",
    coverUrl: "",
    latitude: "",
    longitude: "",
    isApproved: false,
    kycStatus: "UNVERIFIED",
  });
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    farmName: "",
    fullName: "",
    phone: "",
    address: "",
    bio: "",
    avatarUrl: "",
    coverUrl: "",
    latitude: "",
    longitude: "",
  });
  const [cutoffSettings, setCutoffSettings] = useState([]);
  const [isCutoffModalOpen, setIsCutoffModalOpen] = useState(false);
  const [cutoffForm, setCutoffForm] = useState({
    marketId: "",
    dayOfWeek: "",
    cutoffHoursBefore: "",
  });
  const [pickupSlots, setPickupSlots] = useState([]);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    marketId: "",
    startTime: "",
    endTime: "",
    maxOrdersCapacity: "",
  });
  const [assignedMarkets, setAssignedMarkets] = useState([]);
  const [availableMarkets, setAvailableMarkets] = useState([]);
  const [marketsPage, setMarketsPage] = useState(1);
  const [slotsPage, setSlotsPage] = useState(1);
  const [cutoffPage, setCutoffPage] = useState(1);
  const PAGE_SIZE = 15;

  const paginatedAssignedMarkets = useMemo(() => {
    const start = (marketsPage - 1) * PAGE_SIZE;
    return assignedMarkets.slice(start, start + PAGE_SIZE);
  }, [assignedMarkets, marketsPage]);

  const paginatedPickupSlots = useMemo(() => {
    const start = (slotsPage - 1) * PAGE_SIZE;
    return pickupSlots.slice(start, start + PAGE_SIZE);
  }, [pickupSlots, slotsPage]);

  const paginatedCutoffSettings = useMemo(() => {
    const start = (cutoffPage - 1) * PAGE_SIZE;
    return cutoffSettings.slice(start, start + PAGE_SIZE);
  }, [cutoffSettings, cutoffPage]);

  const [isRegisterMarketModalOpen, setIsRegisterMarketModalOpen] =
    useState(false);
  const [registerMarketForm, setRegisterMarketForm] = useState({
    marketId: "",
    stallNumber: "",
  });
  const [kycData, setKycData] = useState(null);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycForm, setKycForm] = useState({
    citizenFrontUrl: "",
    citizenBackUrl: "",
    vietGapUrl: "",
    vietGapNumber: "",
    vietGapIssuedDate: "",
    vietGapExpiryDate: "",
  });
  const notifySuccess = (msg) => {
    setAlertSuccess(msg);
    setTimeout(() => setAlertSuccess(""), 4000);
  };
  const notifyError = (msg) => {
    setAlertError(msg);
    setTimeout(() => setAlertError(""), 4000);
  };
  const isKycVerified = isFarmerKycApproved(kycData, profile);

  useEffect(() => {
    const handleKycChange = () => {
      const stored = localStorage.getItem("ml_kyc_status");
      if (stored === "VERIFIED" || stored === "APPROVED") {
        setKycData((prev) => ({ ...(prev || {}), kycStatus: "VERIFIED", isApproved: true }));
        setProfile((prev) => ({ ...prev, isApproved: true, kycStatus: "VERIFIED" }));
      } else if (stored) {
        setKycData((prev) => ({ ...(prev || {}), kycStatus: stored }));
      }
    };
    window.addEventListener("ml_kyc_changed", handleKycChange);
    window.addEventListener("storage", handleKycChange);
    return () => {
      window.removeEventListener("ml_kyc_changed", handleKycChange);
      window.removeEventListener("storage", handleKycChange);
    };
  }, []);

  const requireVerifiedKyc = () => {
    if (isKycVerified) return true;
    notifyError(
      isEn
        ? "Please complete and wait for KYC verification before performing stall operations."
        : "Vui lòng hoàn tất và chờ duyệt KYC trước khi thực hiện thao tác bán hàng."
    );
    setActiveTab("kyc");
    return false;
  };
  const isAnyModalOpen = Boolean(
    isCutoffModalOpen ||
    isSlotModalOpen ||
    isRegisterMarketModalOpen ||
    isKycModalOpen ||
    isEditProfileModalOpen
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAnyModalOpen]);

  const goToProtectedTab = (tab) => {
    if (requireVerifiedKyc()) setActiveTab(tab);
  };
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [profRes, cutoffs, slots, assignments, markets, kyc] =
        await Promise.all([
          farmerService.getFarmerProfile(),
          farmerService.getFarmerCutoffSettings(),
          farmerService.getFarmerPickupSlots(),
          farmerService.getMyMarketAssignments(),
          marketService.getMarkets(),
          farmerService.getFarmerKycStatus(),
        ]);
      const isApprovedVal = isFarmerKycApproved(kyc, profRes);
      const effectiveKycStatus = isApprovedVal ? "VERIFIED" : getEffectiveKycStatus(kyc, profRes);
      syncKycStatus(effectiveKycStatus);

      if (profRes) {
        const details = profRes.profileDetails || {};
        const savedCover = localStorage.getItem("farmer_cover_url");
        setProfile((prev) => ({
          ...prev,
          farmName: details.stallName || profRes.stallName || prev.farmName,
          fullName: profRes.fullName || prev.fullName,
          phone: profRes.phoneNumber || profRes.phone || prev.phone,
          address: details.farmAddress || profRes.address || prev.address,
          bio: details.bio || profRes.bio || prev.bio,
          avatarUrl: profRes.avatarUrl || prev.avatarUrl,
          coverUrl: savedCover || prev.coverUrl,
          latitude:
            details.latitude != null ? String(details.latitude) : prev.latitude,
          longitude:
            details.longitude != null
              ? String(details.longitude)
              : prev.longitude,
          isApproved: isApprovedVal,
          kycStatus: effectiveKycStatus,
        }));
        if (profRes.avatarUrl) {
          localStorage.setItem("ml_avatar", profRes.avatarUrl);
          window.dispatchEvent(
            new CustomEvent("ml_avatar_changed", { detail: profRes.avatarUrl })
          );
        }
      }
      setCutoffSettings(cutoffs || []);
      setPickupSlots(slots || []);
      setAssignedMarkets(assignments || []);
      setAvailableMarkets(markets || []);
      const mergedKyc = {
        ...(kyc || {}),
        kycStatus: effectiveKycStatus,
        isApproved: isApprovedVal,
        documents: kyc?.documents || [],
      };
      setKycData(mergedKyc);
      if (markets && markets.length > 0) {
        setRegisterMarketForm((f) => ({
          ...f,
          marketId: markets[0].marketId || markets[0].id,
        }));
        setCutoffForm((f) => ({
          ...f,
          marketId: markets[0].marketId || markets[0].id,
        }));
        setSlotForm((f) => ({
          ...f,
          marketId: markets[0].marketId || markets[0].id,
        }));
      }
    } catch (err) {
      console.warn("Error loading stall profile data", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAllData();
  }, []);
  const handleOpenEditProfileModal = () => {
    setEditProfileForm({
      farmName: profile.farmName || "",
      fullName: profile.fullName || "",
      phone: profile.phone || "",
      address: profile.address || "",
      bio: profile.bio || "",
      avatarUrl: profile.avatarUrl || "",
      coverUrl: profile.coverUrl || "",
      latitude: profile.latitude || "",
      longitude: profile.longitude || "",
    });
    setIsEditProfileModalOpen(true);
  };
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await farmerService.updateFarmerProfile({
        fullName: editProfileForm.fullName,
        phoneNumber: editProfileForm.phone,
        stallName: editProfileForm.farmName,
        farmAddress: editProfileForm.address,
        bio: editProfileForm.bio,
        latitude: editProfileForm.latitude
          ? parseFloat(editProfileForm.latitude)
          : null,
        longitude: editProfileForm.longitude
          ? parseFloat(editProfileForm.longitude)
          : null,
      });
      if (
        editProfileForm.avatarUrl &&
        editProfileForm.avatarUrl !== profile.avatarUrl
      ) {
        await farmerService.updateAvatar(editProfileForm.avatarUrl);
      }
      if (editProfileForm.avatarUrl) {
        localStorage.setItem("ml_avatar", editProfileForm.avatarUrl);
        window.dispatchEvent(
          new CustomEvent("ml_avatar_changed", {
            detail: editProfileForm.avatarUrl,
          })
        );
      }
      if (editProfileForm.coverUrl) {
        localStorage.setItem("farmer_cover_url", editProfileForm.coverUrl);
      }
      setProfile((prev) => ({
        ...prev,
        farmName: editProfileForm.farmName,
        fullName: editProfileForm.fullName,
        phone: editProfileForm.phone,
        address: editProfileForm.address,
        bio: editProfileForm.bio,
        avatarUrl: editProfileForm.avatarUrl,
        coverUrl: editProfileForm.coverUrl,
        latitude: editProfileForm.latitude,
        longitude: editProfileForm.longitude,
      }));
      setIsEditProfileModalOpen(false);
      notifySuccess(
        isEn
          ? "Stall and farm profile updated successfully!"
          : "Đã cập nhật thông tin hồ sơ nhà vườn thành công!"
      );
    } catch (err) {
      notifyError(
        (isEn ? "Failed to update profile: " : "Cập nhật hồ sơ thất bại: ") +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setSavingProfile(false);
    }
  };
  const handleSaveCutoff = async (e) => {
    e.preventDefault();
    if (!requireVerifiedKyc()) return;
    try {
      await farmerService.saveFarmerCutoffSetting({
        marketId: Number(cutoffForm.marketId),
        dayOfWeek: Number(cutoffForm.dayOfWeek),
        cutoffHoursBefore: Number(cutoffForm.cutoffHoursBefore),
      });
      notifySuccess(
        isEn
          ? "Pre-order cutoff hours configured successfully!"
          : "Đã thiết lập khung giờ chốt đơn trước phiên họp chợ!"
      );
      setIsCutoffModalOpen(false);
      const updated = await farmerService.getFarmerCutoffSettings();
      setCutoffSettings(updated || []);
    } catch (err) {
      notifyError(
        (isEn ? "Failed to save cutoff rule: " : "Lưu hạn chốt đơn thất bại: ") +
          (err.response?.data?.message || err.message)
      );
    }
  };
  const handleDeleteCutoff = async (id) => {
    if (
      window.confirm(
        isEn
          ? "Are you sure you want to delete this cutoff setting?"
          : "Bạn có chắc muốn xóa cấu hình chốt đơn này?"
      )
    ) {
      try {
        await farmerService.deleteFarmerCutoffSetting(id);
        setCutoffSettings((prev) => prev.filter((c) => c.settingId !== id));
        notifySuccess(
          isEn ? "Cutoff setting removed." : "Đã xóa cấu hình chốt đơn."
        );
      } catch (err) {
        notifyError(
          (isEn ? "Failed to delete cutoff: " : "Xóa cấu hình thất bại: ") +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };
  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!requireVerifiedKyc()) return;
    try {
      await farmerService.createFarmerPickupSlot({
        marketId: Number(slotForm.marketId),
        startTime:
          slotForm.startTime.length === 5
            ? `${slotForm.startTime}:00`
            : slotForm.startTime,
        endTime:
          slotForm.endTime.length === 5
            ? `${slotForm.endTime}:00`
            : slotForm.endTime,
        maxOrdersCapacity: Number(slotForm.maxOrdersCapacity) || 15,
      });
      notifySuccess(
        isEn
          ? "New pickup slot added successfully!"
          : "Đã thêm ca đón khách mới tại sạp chợ!"
      );
      setIsSlotModalOpen(false);
      const updated = await farmerService.getFarmerPickupSlots();
      setPickupSlots(updated || []);
    } catch (err) {
      notifyError(
        (isEn ? "Failed to create pickup slot: " : "Tạo ca nhận hàng thất bại: ") +
          (err.response?.data?.message || err.message)
      );
    }
  };
  const handleDeleteSlot = async (id) => {
    if (
      window.confirm(
        isEn
          ? "Are you sure you want to delete this pickup slot?"
          : "Bạn có chắc muốn xóa ca đón khách này?"
      )
    ) {
      try {
        await farmerService.deleteFarmerPickupSlot(id);
        setPickupSlots((prev) => prev.filter((s) => s.slotId !== id));
        notifySuccess(
          isEn ? "Pickup slot removed." : "Đã xóa ca nhận hàng."
        );
      } catch (err) {
        notifyError(
          (isEn ? "Failed to delete slot: " : "Xóa ca nhận thất bại: ") +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };
  const handleRegisterMarket = async (e) => {
    e.preventDefault();
    if (!isKycVerified) {
      notifyError(
        isEn
          ? "You can only register for stall spaces after your KYC profile is verified."
          : "Bạn chỉ có thể đăng ký sạp sau khi hồ sơ KYC được duyệt."
      );
      setIsRegisterMarketModalOpen(false);
      setActiveTab("kyc");
      return;
    }
    try {
      await farmerService.registerMarket({
        marketId: Number(registerMarketForm.marketId),
        stallNumber: registerMarketForm.stallNumber || (isEn ? "Prospective Stall" : "Sạp Dự Kiến"),
      });
      notifySuccess(
        isEn
          ? "Stall registration submitted successfully!"
          : "Đã gửi đơn đăng ký tham gia sạp chợ thành công!"
      );
      setIsRegisterMarketModalOpen(false);
      const updated = await farmerService.getMyMarketAssignments();
      setAssignedMarkets(updated || []);
    } catch (err) {
      notifyError(
        (isEn ? "Market registration failed: " : "Đăng ký chợ thất bại: ") +
          (err.response?.data?.message || err.message)
      );
    }
  };
  const handleSubmitKyc = async (e) => {
    e.preventDefault();
    if (
      !kycForm.citizenFrontUrl ||
      !kycForm.citizenBackUrl ||
      !kycForm.vietGapUrl
    ) {
      notifyError(
        isEn
          ? "Please upload all 3 images: ID Front, ID Back, and VietGAP certificate."
          : "Vui lòng tải đủ 3 ảnh: CCCD mặt trước, CCCD mặt sau và VietGAP."
      );
      return;
    }
    if (
      !kycForm.vietGapNumber.trim() ||
      !kycForm.vietGapIssuedDate ||
      !kycForm.vietGapExpiryDate
    ) {
      notifyError(
        isEn
          ? "Please fill in certificate number, issue date, and expiry date."
          : "Vui lòng nhập đủ số giấy và ngày cấp, ngày hết hạn VietGAP."
      );
      return;
    }
    try {
      await farmerService.submitFarmerKyc({
        documents: [
          {
            documentUrl: kycForm.citizenFrontUrl,
          },
          {
            documentUrl: kycForm.citizenBackUrl,
          },
          {
            documentUrl: kycForm.vietGapUrl,
            documentNumber: kycForm.vietGapNumber.trim(),
            issuedDate: kycForm.vietGapIssuedDate,
            expiryDate: kycForm.vietGapExpiryDate,
          },
        ],
      });
      notifySuccess(
        isEn
          ? "KYC profile & certificate submitted. Awaiting Administrator verification!"
          : "Hồ sơ định danh KYC & Chứng nhận đã được nộp và chờ Quản trị viên duyệt!"
      );
      setIsKycModalOpen(false);
      const updatedKyc = await farmerService.getFarmerKycStatus();
      setKycData(updatedKyc);
      const newStatus =
        updatedKyc?.kycStatus || (updatedKyc?.isApproved ? "VERIFIED" : "PENDING");
      localStorage.setItem("ml_kyc_status", newStatus);
      window.dispatchEvent(
        new CustomEvent("ml_kyc_changed", { detail: newStatus })
      );
      if (newStatus === "VERIFIED") {
        setActiveTab("profile");
      }
    } catch (err) {
      notifyError(
        (isEn ? "Failed to submit KYC: " : "Nộp hồ sơ KYC thất bại: ") +
          (err.response?.data?.message || err.message)
      );
    }
  };
  const getKycBadge = (status) => {
    const s = String(status || "").toUpperCase();
    switch (s) {
      case "VERIFIED":
      case "APPROVED":
        return (
          <Badge variant="ready" dot>
            {isEn ? "Verified Identity (VERIFIED)" : "Đã xác thực định danh (VERIFIED)"}
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="pending" dot>
            {isEn ? "Pending Admin Approval (PENDING)" : "Đang chờ Ban Quản Trị duyệt (PENDING)"}
          </Badge>
        );
      case "REJECTED":
        return <Badge variant="cancelled">{isEn ? "Rejected (REJECTED)" : "Bị từ chối hồ sơ (REJECTED)"}</Badge>;
      default:
        return <Badge variant="neutral">{isEn ? "Unverified (UNVERIFIED)" : "Chưa định danh (UNVERIFIED)"}</Badge>;
    }
  };
  return (
    <div className="ml-stall-profile-page">
      <div className="ml-stall-banner">
        <div className="ml-container">
          <span className="ml-section-subtitle">
            {isEn ? "Stall & Farm Profile Management" : "Phân hệ Chủ Sạp & Nhà Vườn"}
          </span>
          <h1 className="ml-stall-page-title">
            {isEn ? "Manage Stall Profile & Market Operations" : "Quản Lý Hồ Sơ Gian Hàng & Vận Hành Chợ"}
          </h1>
          <p className="ml-stall-page-desc">
            {isEn
              ? "Update your organic farming story, set pre-order cutoff hours, configure shopper pickup slots, register for weekend markets, and monitor KYC certificates."
              : "Cập nhật câu chuyện canh tác hữu cơ, thiết lập giờ chốt đơn, các ca đón khách tại sạp, đăng ký chợ phiên và theo dõi chứng nhận KYC."}
          </p>
        </div>
      </div>

      <div className="ml-container">
        {alertSuccess && (
          <div className="ml-alert-success mb-4">✓ {alertSuccess}</div>
        )}
        {alertError && (
          <div className="ml-alert-danger mb-4">⚠️ {alertError}</div>
        )}

        <div className="ml-inv-main-tabs">
          <button
            type="button"
            className={`ml-inv-main-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            🏡 {isEn ? "Farm & Stall Profile" : "Hồ sơ nhà vườn"}
          </button>
          <button
            type="button"
            className={`ml-inv-main-tab ${activeTab === "cutoff" ? "active" : ""}`}
            onClick={() => {
              if (requireVerifiedKyc()) setActiveTab("cutoff");
            }}
          >
            ⏰ {isEn ? `Cutoff Hours (${cutoffSettings.length})` : `Giờ chốt đơn (${cutoffSettings.length})`}
          </button>
          <button
            type="button"
            className={`ml-inv-main-tab ${activeTab === "slots" ? "active" : ""}`}
            onClick={() => {
              if (requireVerifiedKyc()) setActiveTab("slots");
            }}
          >
            🕒 {isEn ? `Pickup Slots (${pickupSlots.length})` : `Ca đón khách (${pickupSlots.length})`}
          </button>
          <button
            type="button"
            className={`ml-inv-main-tab ${activeTab === "markets" ? "active" : ""}`}
            onClick={() => {
              if (requireVerifiedKyc()) setActiveTab("markets");
            }}
          >
            🎪 {isEn ? `Registered Stalls (${assignedMarkets.length})` : `Sạp chợ đã đăng ký (${assignedMarkets.length})`}
          </button>
          {!isKycVerified && (
            <button
              type="button"
              className={`ml-inv-main-tab ${activeTab === "kyc" ? "active" : ""}`}
              onClick={() => setActiveTab("kyc")}
            >
              🛡️ {isEn ? "KYC & VietGAP Verification" : "Định danh KYC & VietGAP"}
            </button>
          )}
        </div>

        {loading && (
          <div className="ml-inv-loading mb-4">
            Đang đồng bộ dữ liệu sạp từ máy chủ...
          </div>
        )}

        {activeTab === "profile" && (
          <div className="ml-profile-page-view">
            <div className="ml-profile-hero-card">
              <div
                className="ml-profile-hero-cover"
                style={{
                  backgroundImage: `url(${formatImageUrl(profile.coverUrl, "https://images.unsplash.com/photo-1500937386664-56d1dfef3854")})`,
                }}
              >
                <div className="ml-profile-cover-badge">
                  <span>📸 Ảnh bìa nhà vườn</span>
                </div>
              </div>

              <div className="ml-profile-hero-content">
                <div className="ml-profile-avatar-row">
                  <div className="ml-profile-avatar-wrapper">
                    <img
                      src={formatImageUrl(profile.avatarUrl)}
                      alt={profile.fullName}
                      className="ml-profile-avatar-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80";
                      }}
                    />
                    <div className="ml-profile-hero-text">
                      <div className="ml-profile-title-row">
                        <h2 className="ml-profile-farm-title">
                          {profile.farmName || (isEn ? "Family Farm Stall" : "Sạp Nông Trại")}
                        </h2>
                        {profile.isApproved && (
                          <span
                            className="ml-profile-verified-badge"
                            title={isEn ? "Verified by platform admin" : "Đã được ban quản trị xét duyệt"}
                          >
                            ✓ {isEn ? "Verified" : "Đã xác minh"}
                          </span>
                        )}
                      </div>
                      <p className="ml-profile-owner-sub">
                        👤 {isEn ? "Owner:" : "Chủ hộ:"} <strong>{profile.fullName}</strong> • 📞{" "}
                        <strong>{profile.phone}</strong> • 📍 {profile.address}
                      </p>
                    </div>
                  </div>

                  <div className="ml-profile-hero-actions">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleOpenEditProfileModal}
                    >
                      ✏️ {isEn ? "Edit Profile" : "Chỉnh sửa hồ sơ"}
                    </Button>
                  </div>
                </div>

                <div className="ml-profile-tags-row">
                  <span className="ml-profile-tag">🌱 {isEn ? "Organic Farming" : "Canh tác hữu cơ"}</span>
                  <span className="ml-profile-tag">🌾 {isEn ? "VietGAP Certified" : "Chứng nhận VietGAP"}</span>
                  <span className="ml-profile-tag">🚚 {isEn ? "Market Pickup" : "Giao tại phiên chợ"}</span>
                  <span className="ml-profile-tag">
                    ⭐ 4.9/5 ({isEn ? "120+ orders" : "120+ lượt mua"})
                  </span>
                </div>
              </div>
            </div>

            <div className="ml-profile-metrics-row">
              <div
                className="ml-profile-metric-card"
                onClick={() => goToProtectedTab("markets")}
                style={{
                  cursor: "pointer",
                }}
                title={isEn ? "View registered stalls" : "Xem danh sách sạp chợ"}
              >
                <div className="ml-profile-metric-icon">🎪</div>
                <div>
                  <div className="ml-profile-metric-label">
                    {isEn ? "Participating Markets" : "Sạp chợ tham gia"}
                  </div>
                  <div className="ml-profile-metric-val">
                    {assignedMarkets.length} {isEn ? "sessions" : "phiên chợ"}
                  </div>
                </div>
              </div>

              <div
                className="ml-profile-metric-card"
                onClick={() => goToProtectedTab("cutoff")}
                style={{
                  cursor: "pointer",
                }}
                title={isEn ? "Configure cutoff hours" : "Cài đặt giờ chốt đơn"}
              >
                <div className="ml-profile-metric-icon">⏰</div>
                <div>
                  <div className="ml-profile-metric-label">
                    {isEn ? "Cutoff Rules" : "Khung giờ chốt đơn"}
                  </div>
                  <div className="ml-profile-metric-val">
                    {cutoffSettings.length} {isEn ? "rules" : "cấu hình"}
                  </div>
                </div>
              </div>

              <div
                className="ml-profile-metric-card"
                onClick={() => goToProtectedTab("slots")}
                style={{
                  cursor: "pointer",
                }}
                title={isEn ? "Configure pickup slots" : "Cài đặt ca đón khách"}
              >
                <div className="ml-profile-metric-icon">🕒</div>
                <div>
                  <div className="ml-profile-metric-label">
                    {isEn ? "Pickup Slots" : "Ca đón khách tại sạp"}
                  </div>
                  <div className="ml-profile-metric-val">
                    {pickupSlots.length} {isEn ? "slots" : "khung giờ"}
                  </div>
                </div>
              </div>

              <div
                className="ml-profile-metric-card"
                onClick={() => {
                  if (!isKycVerified) setActiveTab("kyc");
                }}
                style={{
                  cursor: !isKycVerified ? "pointer" : "default",
                }}
                title={
                  !isKycVerified
                    ? (isEn ? "View KYC status" : "Xem trạng thái định danh")
                    : (isEn ? "KYC Verified" : "Đã duyệt KYC")
                }
              >
                <div className="ml-profile-metric-icon">🛡️</div>
                <div>
                  <div className="ml-profile-metric-label">
                    {isEn ? "Farm KYC" : "Định danh nhà vườn"}
                  </div>
                  <div className="ml-profile-metric-val">
                    {isKycVerified
                      ? (isEn ? "Verified" : "Đã duyệt KYC")
                      : (isEn ? "Processing" : "Đang xử lý")}
                  </div>
                </div>
              </div>
            </div>

            <div className="ml-profile-body-grid">
              <div className="ml-profile-main-col">
                <div className="ml-card ml-stall-card">
                  <div className="ml-card-header-flex">
                    <h3 className="ml-card-title">
                      🌱 {isEn ? "Farming Philosophy & Green Story" : "Câu chuyện canh tác & Triết lý xanh"}
                    </h3>
                    <button
                      type="button"
                      className="ml-btn-link-edit"
                      onClick={handleOpenEditProfileModal}
                    >
                      ✏️ {isEn ? "Edit" : "Chỉnh sửa"}
                    </button>
                  </div>

                  <div className="ml-profile-bio-box">
                    "
                    {profile.bio ||
                      (isEn
                        ? "Farming story not updated yet. Click Edit Profile to introduce your organic methods and produce traceability to shoppers!"
                        : "Chưa cập nhật câu chuyện canh tác. Hãy bấm Chỉnh sửa hồ sơ để giới thiệu phương pháp trồng trọt hữu cơ và nguồn gốc nông sản của bạn tới khách hàng!")}
                    "
                  </div>

                  <h4 className="ml-profile-section-sub">
                    {isEn ? "Produce Quality Commitments:" : "Cam kết chất lượng nông sản:"}
                  </h4>
                  <div className="ml-profile-commitments-grid">
                    <div className="ml-commitment-item">
                      <span className="ml-commitment-icon">🌿</span>
                      <span>{isEn ? "100% Free of chemical pesticides" : "100% Không thuốc BVTV hóa học"}</span>
                    </div>
                    <div className="ml-commitment-item">
                      <span className="ml-commitment-icon">💧</span>
                      <span>{isEn ? "Natural spring water & clean soil" : "Nước ngầm tự nhiên, đất sạch"}</span>
                    </div>
                    <div className="ml-commitment-item">
                      <span className="ml-commitment-icon">🚚</span>
                      <span>{isEn ? "Dawn harvested, fresh same-day" : "Thu hoạch sớm, tươi trong ngày"}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-card ml-stall-card">
                  <div className="ml-card-header-flex">
                    <h3 className="ml-card-title">
                      🎪 {isEn ? "Operating Market Stalls" : "Danh sách sạp chợ đang vận hành"}
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => goToProtectedTab("markets")}
                    >
                      {isEn ? "Manage Stalls →" : "Quản lý sạp →"}
                    </Button>
                  </div>

                  {assignedMarkets.length === 0 ? (
                    <div className="ml-empty-box">
                      <p>{isEn ? "No weekend market stalls registered yet." : "Chưa đăng ký sạp chợ phiên nào."}</p>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          if (!isKycVerified) {
                            notifyError(isEn ? "Please complete KYC verification before registering stalls." : "Vui lòng hoàn tất và chờ duyệt KYC trước khi đăng ký sạp.");
                            setActiveTab("kyc");
                            return;
                          }
                          setIsRegisterMarketModalOpen(true);
                        }}
                      >
                        {isEn ? "+ Register Stall Now" : "+ Đăng ký sạp chợ ngay"}
                      </Button>
                    </div>
                  ) : (
                    <div className="ml-profile-stalls-list">
                      {assignedMarkets.map((a) => (
                        <div
                          key={a.assignmentId || a.id}
                          className="ml-profile-stall-card"
                        >
                          <div className="ml-profile-stall-info">
                            <span className="ml-profile-stall-market">
                              🎪 {localizeMarketName(a.marketName || `Market #${a.marketId}`)}
                            </span>
                            <span className="ml-profile-stall-meta">
                              {isEn ? "Location:" : "Vị trí:"}{" "}
                              <strong>
                                {a.stallNumber || a.stallCode || (isEn ? "Allocating" : "Đang bố trí")}
                              </strong>{" "}
                              • {isEn ? "Session:" : "Phiên:"} {a.marketSchedule || (isEn ? "Weekend" : "Cuối tuần")}
                            </span>
                          </div>
                          <div>
                            {a.status === "APPROVED" || a.status === "ACTIVE" ? (
                              <Badge variant="ready" dot>
                                {isEn ? "Open for Sale" : "Đang mở bán"}
                              </Badge>
                            ) : (
                              <Badge variant="pending" dot>
                                {isEn ? "Pending Approval" : "Đang chờ duyệt"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-profile-side-col">
                <div className="ml-card ml-stall-card">
                  <div className="ml-card-header-flex">
                    <h3 className="ml-card-title">
                      📋 {isEn ? "Contact & Farm Region" : "Thông tin liên hệ & Vùng trồng"}
                    </h3>
                    <button
                      type="button"
                      className="ml-btn-link-edit"
                      onClick={handleOpenEditProfileModal}
                    >
                      ✏️ {isEn ? "Edit" : "Sửa"}
                    </button>
                  </div>

                  <div className="ml-profile-info-list">
                    <div className="ml-profile-info-row">
                      <span className="ml-profile-info-label">
                        {isEn ? "Representative / Household Head" : "Chủ hộ / Đại diện pháp lý"}
                      </span>
                      <strong className="ml-profile-info-value">
                        {profile.fullName}
                      </strong>
                    </div>

                    <div className="ml-profile-info-row">
                      <span className="ml-profile-info-label">
                        {isEn ? "Contact Phone Number" : "Số điện thoại liên hệ"}
                      </span>
                      <strong className="ml-profile-info-value">
                        📞 {profile.phone}
                      </strong>
                    </div>

                    <div className="ml-profile-info-row">
                      <span className="ml-profile-info-label">
                        {isEn ? "Farm Address / Location" : "Địa chỉ nông trại / Vùng trồng"}
                      </span>
                      <span className="ml-profile-info-value">
                        📍 {profile.address}
                      </span>
                    </div>

                    <div className="ml-profile-info-row">
                      <span className="ml-profile-info-label">
                        {isEn ? "GPS Coordinates" : "Tọa độ GPS bản đồ"}
                      </span>
                      <span className="ml-profile-info-value">
                        🌐{" "}
                        {profile.latitude && profile.longitude
                          ? `${profile.latitude}, ${profile.longitude}`
                          : "21.0823, 105.3512"}
                      </span>
                    </div>

                    <div className="ml-profile-info-row">
                      <span className="ml-profile-info-label">
                        {isEn ? "Farm Approval Status" : "Tình trạng xét duyệt nhà vườn"}
                      </span>
                      <div
                        style={{
                          marginTop: "4px",
                        }}
                      >
                        {profile.isApproved ? (
                          <Badge variant="ready" dot>
                            {isEn ? "Approved for Operations" : "Đã phê duyệt hoạt động"}
                          </Badge>
                        ) : (
                          <Badge variant="pending" dot>
                            {isEn ? "Pending Review" : "Chờ xét duyệt"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="ml-profile-info-row">
                      <span className="ml-profile-info-label">
                        {isEn ? "KYC & VietGAP Verification" : "Hồ sơ định danh KYC & VietGAP"}
                      </span>
                      <div
                        style={{
                          marginTop: "4px",
                        }}
                      >
                        {getKycBadge(isKycVerified ? "VERIFIED" : (kycData?.kycStatus || profile?.kycStatus || "PENDING"))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-card ml-stall-card ml-profile-shortcuts-card">
                  <h3 className="ml-card-title">⚡ {isEn ? "Quick Actions" : "Thao tác nhanh"}</h3>
                  <div className="ml-profile-shortcuts-list">
                    <button
                      type="button"
                      className="ml-profile-shortcut-btn"
                      onClick={handleOpenEditProfileModal}
                    >
                      <span>✏️ {isEn ? "Edit profile info & imagery" : "Chỉnh sửa thông tin hồ sơ & hình ảnh"}</span>
                      <span>→</span>
                    </button>
                    <button
                      type="button"
                      className="ml-profile-shortcut-btn"
                      onClick={() => goToProtectedTab("cutoff")}
                    >
                      <span>⏰ {isEn ? "Configure pre-order cutoff hours" : "Cài đặt giờ chốt đơn trước phiên chợ"}</span>
                      <span>→</span>
                    </button>
                    <button
                      type="button"
                      className="ml-profile-shortcut-btn"
                      onClick={() => goToProtectedTab("slots")}
                    >
                      <span>🕒 {isEn ? "Configure shopper pickup time slots" : "Cấu hình ca đón khách nhận hàng"}</span>
                      <span>→</span>
                    </button>
                    {!isKycVerified && (
                      <button
                        type="button"
                        className="ml-profile-shortcut-btn"
                        onClick={() => setActiveTab("kyc")}
                      >
                        <span>🛡️ {isEn ? "Upload VietGAP / Organic certificates" : "Cập nhật giấy tờ chứng nhận VietGAP"}</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cutoff" && (
          <div className="ml-card ml-templates-section">
            <div className="ml-templates-header">
              <div>
                <h3 className="ml-card-title">
                  ⏰ {isEn ? "Pre-order Cutoff Hours Configuration" : "Cấu hình khung giờ chốt đơn trước phiên họp chợ"}
                </h3>
                <p className="ml-templates-desc">
                  {isEn
                    ? "Set the order closing time before market sessions open (e.g. 12 hours prior). Customers cannot place new orders after cutoff so you have time to harvest and pack fresh produce."
                    : "Thiết lập thời gian đóng nhận đơn trước khi phiên chợ bắt đầu (ví dụ: Chốt trước 12 tiếng). Khách hàng sẽ không thể đặt thêm sau giờ chốt để bạn có thời gian hái rau và đóng gói."}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (requireVerifiedKyc()) setIsCutoffModalOpen(true);
                }}
              >
                + {isEn ? "Add Cutoff Time" : "Thêm giờ chốt đơn"}
              </Button>
            </div>

            {cutoffSettings.length === 0 ? (
              <div className="ml-templates-empty">
                <span className="ml-templates-empty-icon">⏰</span>
                <h4>{isEn ? "No cutoff configuration yet" : "Chưa có cấu hình chốt đơn nào"}</h4>
                <p>
                  {isEn
                    ? "Add cutoff times to ensure your farm has adequate time to harvest fresh produce."
                    : "Thêm giờ chốt đơn để đảm bảo nông trại có đủ thời gian thu hoạch nông sản tươi."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (requireVerifiedKyc()) setIsCutoffModalOpen(true);
                  }}
                >
                  {isEn ? "Configure First Cutoff" : "Thiết lập hạn chốt đầu tiên"}
                </Button>
              </div>
            ) : (
              <>
                <div className="ml-templates-table-wrap">
                  <table className="ml-templates-table">
                    <thead>
                      <tr>
                        <th>{isEn ? "Applied Market" : "Phiên chợ áp dụng"}</th>
                        <th>{isEn ? "Market Day" : "Thứ họp chợ"}</th>
                        <th>{isEn ? "Cutoff Hours Before Open" : "Hạn chốt đơn trước giờ mở"}</th>
                        <th className="text-right">{isEn ? "Actions" : "Thao tác"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCutoffSettings.map((c) => (
                        <tr key={c.settingId}>
                          <td>
                            <strong>
                              🎪 {c.marketName || (isEn ? `Market #${c.marketId}` : `Chợ #${c.marketId}`)}
                            </strong>
                          </td>
                          <td>
                            <span className="ml-day-badge">
                              {getDayOfWeekName(c.dayOfWeek, isEn)}
                            </span>
                          </td>
                          <td>
                            <strong className="text-accent">
                              {isEn
                                ? `Cut off ${c.cutoffHoursBefore}h before`
                                : `Chốt trước ${c.cutoffHoursBefore} tiếng`}
                            </strong>
                          </td>
                          <td className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="btn-danger-text"
                              onClick={() => handleDeleteCutoff(c.settingId)}
                            >
                              🗑️ {isEn ? "Delete" : "Xóa"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={cutoffPage}
                  totalItems={cutoffSettings.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCutoffPage}
                />
              </>
            )}
          </div>
        )}

        {activeTab === "slots" && (
          <div className="ml-card ml-templates-section">
            <div className="ml-templates-header">
              <div>
                <h3 className="ml-card-title">
                  🕒 {isEn ? "Stall Pickup Time Slots" : "Danh sách ca đón khách tại sạp chợ"}
                </h3>
                <p className="ml-templates-desc">
                  {isEn
                    ? "Time intervals when customers can visit your stall to pick up pre-ordered bags. Max order capacity per slot avoids crowding and ensures smooth service."
                    : "Các khung giờ khách có thể ghé sạp của bạn để nhận phần rau quả đã đặt trước. Giới hạn số đơn tối đa mỗi ca giúp sạp phục vụ chu đáo, tránh ùn ứ."}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (requireVerifiedKyc()) setIsSlotModalOpen(true);
                }}
              >
                + {isEn ? "Add New Pickup Slot" : "Thêm ca đón khách mới"}
              </Button>
            </div>

            {pickupSlots.length === 0 ? (
              <div className="ml-templates-empty">
                <span className="ml-templates-empty-icon">🕒</span>
                <h4>{isEn ? "No pickup slots yet" : "Chưa có ca nhận hàng nào"}</h4>
                <p>
                  {isEn
                    ? "Create morning slots (07:00 - 08:00, 08:00 - 09:00...) for shoppers to choose during checkout."
                    : "Tạo các ca sáng sớm (07:00 - 08:00, 08:00 - 09:00...) để khách lựa chọn khi đặt đơn."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (requireVerifiedKyc()) setIsSlotModalOpen(true);
                  }}
                >
                  {isEn ? "Create First Slot" : "Tạo ca nhận đầu tiên"}
                </Button>
              </div>
            ) : (
              <>
                <div className="ml-templates-table-wrap">
                  <table className="ml-templates-table">
                    <thead>
                      <tr>
                        <th>{isEn ? "Market" : "Phiên chợ"}</th>
                        <th>{isEn ? "Pickup Slot" : "Khung giờ nhận"}</th>
                        <th>{isEn ? "Max Capacity" : "Sức chứa đơn tối đa"}</th>
                        <th className="text-right">{isEn ? "Actions" : "Thao tác"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPickupSlots.map((s) => (
                        <tr key={s.slotId}>
                          <td>
                            <strong>
                              🎪 {s.marketName || (isEn ? `Market #${s.marketId}` : `Chợ #${s.marketId}`)}
                            </strong>
                          </td>
                          <td>
                            <span className="ml-day-badge">
                              ⏰ {s.startTime?.substring(0, 5)} -{" "}
                              {s.endTime?.substring(0, 5)}
                            </span>
                          </td>
                          <td>
                            <strong>
                              {s.maxOrdersCapacity} {isEn ? "orders / slot" : "đơn / ca"}
                            </strong>
                          </td>
                          <td className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="btn-danger-text"
                              onClick={() => handleDeleteSlot(s.slotId)}
                            >
                              🗑️ {isEn ? "Delete" : "Xóa"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={slotsPage}
                  totalItems={pickupSlots.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setSlotsPage}
                />
              </>
            )}
          </div>
        )}

        {activeTab === "markets" && (
          <div className="ml-card ml-templates-section">
            <div className="ml-templates-header">
              <div>
                <h3 className="ml-card-title">
                  🎪 {isEn ? "Active Market Stalls" : "Sạp chợ nông sản bạn đang tham gia bán"}
                </h3>
                <p className="ml-templates-desc">
                  {isEn
                    ? "List of market sessions where your farmer account has been granted stall access or submitted registration."
                    : "Danh sách các phiên chợ mà tài khoản nông dân của bạn đã được cấp phép sạp hoặc đã đăng ký mở bán."}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (!isKycVerified) {
                    notifyError(
                      isEn
                        ? "Please complete and wait for KYC verification before registering for stalls."
                        : "Vui lòng hoàn tất và chờ duyệt KYC trước khi đăng ký sạp."
                    );
                    setActiveTab("kyc");
                    return;
                  }
                  setIsRegisterMarketModalOpen(true);
                }}
              >
                + {isEn ? "Register New Market Stall" : "Đăng ký tham gia chợ mới"}
              </Button>
            </div>

            {assignedMarkets.length === 0 ? (
              <div className="ml-templates-empty">
                <span className="ml-templates-empty-icon">🎪</span>
                <h4>{isEn ? "You have not registered for any market yet" : "Bạn chưa đăng ký tham gia chợ nào"}</h4>
                <p>
                  {isEn
                    ? "Register for stalls at local fresh produce markets to expand your direct selling channels."
                    : "Đăng ký sạp tại các chợ phiên nông sản sạch trong khu vực để mở rộng kênh bán rau củ."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!isKycVerified) {
                      notifyError(
                        isEn
                          ? "Please complete and wait for KYC verification before registering for stalls."
                          : "Vui lòng hoàn tất và chờ duyệt KYC trước khi đăng ký sạp."
                      );
                      setActiveTab("kyc");
                      return;
                    }
                    setIsRegisterMarketModalOpen(true);
                  }}
                >
                  {isEn ? "Register First Market Stall" : "Đăng ký sạp chợ đầu tiên"}
                </Button>
              </div>
            ) : (
              <>
                <div className="ml-stall-items-list">
                  {paginatedAssignedMarkets.map((m) => (
                    <div
                      key={m.assignmentId || m.marketId}
                      className="ml-assigned-stall-item"
                    >
                      <div className="ml-stall-badge-top">
                        <span className="ml-stall-num-pill">
                          {m.stallNumber || (isEn ? "Main Stall" : "Sạp Chính")}
                        </span>
                        <Badge
                          variant={m.status === "ACTIVE" ? "ready" : "pending"}
                          size="sm"
                        >
                          {m.status === "ACTIVE"
                            ? (isEn ? "Approved" : "Đã duyệt bán")
                            : (isEn ? "Pending Approval" : "Đang chờ duyệt")}
                        </Badge>
                      </div>
                      <h4 className="ml-assigned-mname">
                        {m.marketName || (isEn ? `Farmers Market #${m.marketId}` : `Chợ Nông Sản #${m.marketId}`)}
                      </h4>
                      <div className="ml-assigned-maddr">
                        {isEn ? "Market Code:" : "Mã chợ:"} #{m.marketId}
                      </div>
                      <div className="ml-assigned-sched" style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                        <span>🕒 {isEn ? "Operating Status:" : "Trạng thái hoạt động:"}</span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11.5px",
                            fontWeight: "600",
                            backgroundColor:
                              m.status === "ACTIVE"
                                ? "rgba(34, 197, 94, 0.12)"
                                : "rgba(239, 68, 68, 0.12)",
                            color: m.status === "ACTIVE" ? "#16a34a" : "#dc2626",
                            border: `1px solid ${m.status === "ACTIVE" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                          }}
                        >
                          {m.status === "ACTIVE"
                            ? (isEn ? "🟢 Active" : "🟢 Đang hoạt động")
                            : (isEn ? "🔴 Paused" : "🔴 Tạm dừng")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination
                  currentPage={marketsPage}
                  totalItems={assignedMarkets.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setMarketsPage}
                />
              </>
            )}
          </div>
        )}

        {!isKycVerified && activeTab === "kyc" && (
          <div className="ml-card ml-templates-section">
            <div className="ml-templates-header">
              <div>
                <h3 className="ml-card-title">
                  🛡️ {isEn ? "KYC Identity & VietGAP / Organic Certification" : "Hồ sơ định danh KYC & Chứng nhận VietGAP / Hữu Cơ"}
                </h3>
                <p className="ml-templates-desc">
                  {isEn
                    ? "MarketLink requires 100% of farmers and stall owners to complete identity verification and submit clean farming certificates to protect consumer rights."
                    : "MarketLink yêu cầu 100% nông dân và chủ sạp hoàn tất định danh và nộp chứng nhận canh tác sạch nhằm bảo vệ quyền lợi người tiêu dùng."}
                </p>
              </div>
              {!isKycVerified && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsKycModalOpen(true)}
                >
                  📤 {isEn ? "Submit Identity Verification" : "Nộp hồ sơ định danh"}
                </Button>
              )}
            </div>

            <div className="ml-kyc-status-banner">
              <div className="ml-kyc-status-left">
                <span className="ml-kyc-status-label">
                  {isEn ? "Current KYC Status:" : "Trạng thái định danh hiện tại:"}
                </span>
                <div>{getKycBadge(isKycVerified ? "VERIFIED" : (kycData?.kycStatus || profile?.kycStatus || "UNVERIFIED"))}</div>
              </div>
              {isKycVerified && (
                <div className="ml-kyc-approved-badge">
                  ✓ {isEn ? "Pre-order sales and stall privileges: GRANTED" : "Quyền mở bán và nhận đơn đặt trước: ĐÃ ĐƯỢC CẤP"}
                </div>
              )}
            </div>

            <h4 className="ml-kyc-subheading">
              {isEn ? "Submitted Documents & Certificates:" : "Tài liệu và chứng chỉ đã nộp:"}
            </h4>
            {!kycData?.documents || kycData.documents.length === 0 ? (
              <div className="ml-templates-empty">
                <span className="ml-templates-empty-icon">📄</span>
                <h4>{isEn ? "No identification documents submitted yet" : "Chưa có tài liệu định danh nào được nộp"}</h4>
                <p>
                  {isEn
                    ? "Submit your ID card photos and VietGAP/Organic certificate to unlock full stall features."
                    : "Nộp ảnh CCCD và Giấy chứng nhận VietGAP/Hữu cơ để mở khóa đầy đủ tính năng sạp chợ."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsKycModalOpen(true)}
                >
                  {isEn ? "Submit Documents Now" : "Nộp tài liệu ngay"}
                </Button>
              </div>
            ) : (
              <div className="ml-kyc-docs-grid">
                {kycData.documents.map((doc, idx) => (
                  <div key={idx} className="ml-kyc-doc-card">
                    <img
                      src={doc.documentUrl}
                      alt="KYC Document"
                      className="ml-kyc-doc-img"
                    />
                    <div className="ml-kyc-doc-info">
                      <span className="ml-kyc-doc-num">
                        {isEn ? "Doc No.:" : "Số:"} {doc.documentNumber || "N/A"}
                      </span>
                      <span className="ml-kyc-doc-date">
                        {isEn ? "Issued Date:" : "Ngày cấp:"} {doc.issuedDate || "N/A"}
                      </span>
                      {doc.expiryDate && (
                        <span className="ml-kyc-doc-date">
                          {isEn ? "Expiry Date:" : "Hết hạn:"} {doc.expiryDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isCutoffModalOpen && (
        <div className="ml-modal-overlay">
          <div className="ml-modal-box">
            <div className="ml-modal-header">
              <h3>{isEn ? "Configure Pre-order Cutoff Hours" : "Thiết lập khung giờ chốt đơn trước phiên họp"}</h3>
              <button
                type="button"
                className="ml-modal-close"
                onClick={() => setIsCutoffModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCutoff} className="ml-modal-form">
              <div className="ml-modal-body">
                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Select Applied Market:" : "Chọn phiên chợ áp dụng:"}
                  </label>
                  <select
                    className="ml-form-input"
                    value={cutoffForm.marketId}
                    onChange={(e) =>
                      setCutoffForm({
                        ...cutoffForm,
                        marketId: e.target.value,
                      })
                    }
                    required
                  >
                    {availableMarkets.map((m) => (
                      <option
                        key={m.marketId || m.id}
                        value={m.marketId || m.id}
                      >
                        {m.name || (isEn ? `Market #${m.marketId || m.id}` : `Chợ #${m.marketId || m.id}`)} -{" "}
                        {m.address || "Hà Nội"}
                      </option>
                    ))}
                    {availableMarkets.length === 0 && (
                      <option value="" disabled>
                        {isEn ? "No available markets" : "Chưa có chợ khả dụng"}
                      </option>
                    )}
                  </select>
                </div>

                <div className="ml-form-grid-2">
                  <div className="ml-form-group">
                    <label className="ml-form-label">
                      {isEn ? "Market Day:" : "Thứ họp chợ:"}
                    </label>
                    <select
                      className="ml-form-input"
                      value={cutoffForm.dayOfWeek}
                      onChange={(e) =>
                        setCutoffForm({
                          ...cutoffForm,
                          dayOfWeek: Number(e.target.value),
                        })
                      }
                      required
                    >
                      <option value={6}>{isEn ? "Saturday" : "Thứ Bảy"}</option>
                      <option value={7}>{isEn ? "Sunday" : "Chủ Nhật"}</option>
                      <option value={1}>{isEn ? "Monday" : "Thứ Hai"}</option>
                      <option value={2}>{isEn ? "Tuesday" : "Thứ Ba"}</option>
                      <option value={3}>{isEn ? "Wednesday" : "Thứ Tư"}</option>
                      <option value={4}>{isEn ? "Thursday" : "Thứ Năm"}</option>
                      <option value={5}>{isEn ? "Friday" : "Thứ Sáu"}</option>
                    </select>
                  </div>

                  <div className="ml-form-group">
                    <label className="ml-form-label">
                      {isEn ? "Cutoff hours before opening:" : "Chốt trước bao nhiêu tiếng:"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="72"
                      step="1"
                      className="ml-form-input"
                      value={cutoffForm.cutoffHoursBefore}
                      onChange={(e) =>
                        setCutoffForm({
                          ...cutoffForm,
                          cutoffHoursBefore: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="ml-modal-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCutoffModalOpen(false)}
                >
                  {isEn ? "Cancel" : "Hủy"}
                </Button>
                <Button type="submit" variant="primary">
                  {isEn ? "Save Cutoff Hours" : "Lưu giờ chốt đơn"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSlotModalOpen && (
        <div className="ml-modal-overlay">
          <div className="ml-modal-box">
            <div className="ml-modal-header">
              <h3>{isEn ? "Add Stall Pickup Time Slot" : "Thêm ca đón khách tại sạp chợ"}</h3>
              <button
                type="button"
                className="ml-modal-close"
                onClick={() => setIsSlotModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="ml-modal-form">
              <div className="ml-modal-body">
                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Market Session:" : "Chợ họp phiên:"}
                  </label>
                  <select
                    className="ml-form-input"
                    value={slotForm.marketId}
                    onChange={(e) =>
                      setSlotForm({
                        ...slotForm,
                        marketId: e.target.value,
                      })
                    }
                    required
                  >
                    {availableMarkets.map((m) => (
                      <option
                        key={m.marketId || m.id}
                        value={m.marketId || m.id}
                      >
                        {m.name || (isEn ? `Market #${m.marketId || m.id}` : `Chợ #${m.marketId || m.id}`)}
                      </option>
                    ))}
                    {availableMarkets.length === 0 && (
                      <option value="" disabled>
                        {isEn ? "No available markets" : "Chưa có chợ khả dụng"}
                      </option>
                    )}
                  </select>
                </div>

                <div className="ml-form-grid-2">
                  <div className="ml-form-group">
                    <label className="ml-form-label">
                      {isEn ? "Slot Start Time:" : "Giờ bắt đầu ca:"}
                    </label>
                    <input
                      type="time"
                      className="ml-form-input"
                      value={slotForm.startTime.substring(0, 5)}
                      onChange={(e) =>
                        setSlotForm({
                          ...slotForm,
                          startTime: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="ml-form-group">
                    <label className="ml-form-label">
                      {isEn ? "Slot End Time:" : "Giờ kết thúc ca:"}
                    </label>
                    <input
                      type="time"
                      className="ml-form-input"
                      value={slotForm.endTime.substring(0, 5)}
                      onChange={(e) =>
                        setSlotForm({
                          ...slotForm,
                          endTime: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Max Capacity (orders/slot):" : "Sức chứa tối đa (số đơn/ca):"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="ml-form-input"
                    value={slotForm.maxOrdersCapacity}
                    onChange={(e) =>
                      setSlotForm({
                        ...slotForm,
                        maxOrdersCapacity: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="ml-modal-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsSlotModalOpen(false)}
                >
                  {isEn ? "Cancel" : "Hủy"}
                </Button>
                <Button type="submit" variant="primary">
                  {isEn ? "Create Pickup Slot" : "Tạo ca đón khách"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRegisterMarketModalOpen && (
        <div className="ml-modal-overlay">
          <div className="ml-modal-box">
            <div className="ml-modal-header">
              <h3>{isEn ? "Register Stall at New Market Session" : "Đăng ký tham gia sạp tại phiên chợ mới"}</h3>
              <button
                type="button"
                className="ml-modal-close"
                onClick={() => setIsRegisterMarketModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterMarket} className="ml-modal-form">
              <div className="ml-modal-body">
                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Select Market Session:" : "Chọn chợ phiên muốn mở sạp:"}
                  </label>
                  {availableMarkets.length === 0 ? (
                    <div
                      style={{
                        padding: "10px 12px",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "8px",
                        color: "var(--color-danger, #ef4444)",
                        fontSize: "13px",
                        lineHeight: 1.4,
                      }}
                    >
                      ⚠️ {isEn
                        ? "Currently there are no markets created in the system. An Administrator needs to create a Farmers' Market first."
                        : "Hiện chưa có phiên chợ nào được tạo trên hệ thống. Quản trị viên (Admin) cần tạo phiên chợ nông sản trước."}
                    </div>
                  ) : (
                    <select
                      className="ml-form-input"
                      value={registerMarketForm.marketId}
                      onChange={(e) =>
                        setRegisterMarketForm({
                          ...registerMarketForm,
                          marketId: e.target.value,
                        })
                      }
                      required
                    >
                      {availableMarkets.map((m) => (
                        <option
                          key={m.marketId || m.id}
                          value={m.marketId || m.id}
                        >
                          {m.name || (isEn ? `Market #${m.marketId || m.id}` : `Chợ #${m.marketId || m.id}`)} -{" "}
                          {m.address || "Hà Nội"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Preferred Stall Number (optional):" : "Số hiệu sạp mong muốn (nếu có):"}
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? "e.g. Stall A-08, Ba Vi Clean Produce..." : "Ví dụ: Sạp A-08, Gian Rau Sạch Ba Vì..."}
                    className="ml-form-input"
                    value={registerMarketForm.stallNumber}
                    onChange={(e) =>
                      setRegisterMarketForm({
                        ...registerMarketForm,
                        stallNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="ml-modal-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsRegisterMarketModalOpen(false)}
                >
                  {isEn ? "Cancel" : "Hủy"}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={availableMarkets.length === 0}
                >
                  {isEn ? "Submit Stall Application" : "Gửi đăng ký sạp"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!isKycVerified && isKycModalOpen && (
        <div className="ml-modal-overlay">
          <div className="ml-modal-box">
            <div className="ml-modal-header">
              <h3>{isEn ? "Submit KYC Verification & VietGAP Certificate" : "Nộp hồ sơ định danh KYC & Chứng nhận VietGAP"}</h3>
              <button
                type="button"
                className="ml-modal-close"
                onClick={() => setIsKycModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitKyc} className="ml-modal-form">
              <div className="ml-modal-body">
                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Citizen ID Front (*):" : "CCCD mặt trước (*):"}
                  </label>
                  <ImageUploadInput
                    folder="kyc"
                    value={kycForm.citizenFrontUrl}
                    onChange={(url) =>
                      setKycForm((prev) => ({
                        ...prev,
                        citizenFrontUrl: url,
                      }))
                    }
                    helpText={isEn ? "Upload clear front photo of Citizen ID without glare" : "Tải ảnh mặt trước CCCD, rõ nét và không bị che khuất"}
                  />
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Citizen ID Back (*):" : "CCCD mặt sau (*):"}
                  </label>
                  <ImageUploadInput
                    folder="kyc"
                    value={kycForm.citizenBackUrl}
                    onChange={(url) =>
                      setKycForm((prev) => ({
                        ...prev,
                        citizenBackUrl: url,
                      }))
                    }
                    helpText={isEn ? "Upload clear back photo of Citizen ID without glare" : "Tải ảnh mặt sau CCCD, rõ nét và không bị che khuất"}
                  />
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "VietGAP / Organic Certificate (*):" : "Giấy chứng nhận VietGAP (*):"}
                  </label>
                  <ImageUploadInput
                    folder="kyc"
                    value={kycForm.vietGapUrl}
                    onChange={(url) =>
                      setKycForm((prev) => ({
                        ...prev,
                        vietGapUrl: url,
                      }))
                    }
                    helpText={isEn ? "Upload clear certificate photo showing certificate number and validity" : "Tải ảnh giấy chứng nhận VietGAP, rõ đủ số giấy và thời hạn"}
                  />
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "VietGAP Certificate Number (*):" : "Số giấy chứng nhận VietGAP (*):"}
                  </label>
                  <input
                    type="text"
                    placeholder="VD: VG-2024-HANOI-88"
                    className="ml-form-input"
                    value={kycForm.vietGapNumber}
                    onChange={(e) =>
                      setKycForm({
                        ...kycForm,
                        vietGapNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="ml-form-grid-2">
                  <div className="ml-form-group">
                    <label className="ml-form-label">{isEn ? "VietGAP Issued Date (*):" : "Ngày cấp VietGAP (*):"}</label>
                    <input
                      type="date"
                      className="ml-form-input"
                      value={kycForm.vietGapIssuedDate}
                      onChange={(e) =>
                        setKycForm({
                          ...kycForm,
                          vietGapIssuedDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="ml-form-group">
                    <label className="ml-form-label">
                      {isEn ? "VietGAP Expiry Date (*):" : "Ngày hết hạn VietGAP (*):"}
                    </label>
                    <input
                      type="date"
                      className="ml-form-input"
                      value={kycForm.vietGapExpiryDate}
                      onChange={(e) =>
                        setKycForm({
                          ...kycForm,
                          vietGapExpiryDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="ml-modal-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsKycModalOpen(false)}
                >
                  {isEn ? "Cancel" : "Hủy"}
                </Button>
                <Button type="submit" variant="primary">
                  {isEn ? "Submit for Verification" : "Nộp hồ sơ xét duyệt"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditProfileModalOpen && (
        <div className="ml-modal-overlay">
          <div
            className="ml-modal-box"
            style={{
              maxWidth: "680px",
            }}
          >
            <div className="ml-modal-header">
              <div>
                <h3>✏️ {isEn ? "Edit Farm & Stall Profile" : "Chỉnh sửa hồ sơ nhà vườn & Nông hộ"}</h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "13px",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {isEn
                    ? "Update identity details, farming story, and stall imagery"
                    : "Cập nhật thông tin định danh, câu chuyện canh tác và hình ảnh đại diện của gian hàng"}
                </p>
              </div>
              <button
                type="button"
                className="ml-modal-close"
                onClick={() => setIsEditProfileModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="ml-modal-form">
              <div className="ml-modal-body">
                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Farm / Stall Name:" : "Tên nhà vườn / Hợp tác xã:"}
                  </label>
                  <input
                    type="text"
                    className="ml-form-input"
                    value={editProfileForm.farmName}
                    onChange={(e) =>
                      setEditProfileForm({
                        ...editProfileForm,
                        farmName: e.target.value,
                      })
                    }
                    placeholder={isEn ? "e.g. Ba Vi Clean Farm" : "VD: Vườn Nông Sản Sạch Ba Vì"}
                    required
                  />
                </div>

                <div className="ml-form-grid-2">
                  <div className="ml-form-group">
                    <label className="ml-form-label">
                      {isEn ? "Owner / Representative Name:" : "Tên chủ hộ / Người đại diện:"}
                    </label>
                    <input
                      type="text"
                      className="ml-form-input"
                      value={editProfileForm.fullName}
                      onChange={(e) =>
                        setEditProfileForm({
                          ...editProfileForm,
                          fullName: e.target.value,
                        })
                      }
                      placeholder={isEn ? "e.g. John Doe Farmer" : "VD: Nguyễn Văn Nông Dân"}
                      required
                    />
                  </div>

                  <div className="ml-form-group">
                    <label className="ml-form-label">
                      {isEn ? "Stall Contact Phone:" : "Số điện thoại liên hệ sạp:"}
                    </label>
                    <input
                      type="text"
                      className="ml-form-input"
                      value={editProfileForm.phone}
                      onChange={(e) =>
                        setEditProfileForm({
                          ...editProfileForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="VD: 0988123456"
                      required
                    />
                  </div>
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Farm Address / Growing Area:" : "Địa chỉ nông trại / Vùng trồng:"}
                  </label>
                  <input
                    type="text"
                    className="ml-form-input"
                    value={editProfileForm.address}
                    onChange={(e) =>
                      setEditProfileForm({
                        ...editProfileForm,
                        address: e.target.value,
                      })
                    }
                    placeholder={isEn ? "e.g. Van Hoa Commune, Ba Vi, Hanoi" : "VD: Xã Vân Hòa, Huyện Ba Vì, TP. Hà Nội"}
                    required
                  />
                </div>

                <div className="ml-form-grid-2">
                  <div className="ml-form-group">
                    <label className="ml-form-label">
                      {isEn ? "Latitude Coordinate:" : "Tọa độ Vĩ độ (Latitude):"}
                    </label>
                    <input
                      type="text"
                      className="ml-form-input"
                      value={editProfileForm.latitude}
                      onChange={(e) =>
                        setEditProfileForm({
                          ...editProfileForm,
                          latitude: e.target.value,
                        })
                      }
                      placeholder="VD: 21.0823"
                    />
                  </div>

                  <div className="ml-form-group">
                    <label className="ml-form-label">
                      {isEn ? "Longitude Coordinate:" : "Tọa độ Kinh độ (Longitude):"}
                    </label>
                    <input
                      type="text"
                      className="ml-form-input"
                      value={editProfileForm.longitude}
                      onChange={(e) =>
                        setEditProfileForm({
                          ...editProfileForm,
                          longitude: e.target.value,
                        })
                      }
                      placeholder="VD: 105.3512"
                    />
                  </div>
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Stall Owner Avatar:" : "Ảnh đại diện chủ sạp (Avatar):"}
                  </label>
                  <ImageUploadInput
                    folder="avatars"
                    value={editProfileForm.avatarUrl}
                    onChange={(url) =>
                      setEditProfileForm((prev) => ({
                        ...prev,
                        avatarUrl: url,
                      }))
                    }
                    onUploadSuccess={(url) =>
                      setEditProfileForm((prev) => ({
                        ...prev,
                        avatarUrl: url,
                      }))
                    }
                    helpText={isEn ? "Upload clear portrait of farm owner (Clear face)" : "Tải ảnh chân dung người nông dân / chủ hộ (Rõ mặt)"}
                  />
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Stall / Farm Cover Photo:" : "Ảnh bìa sạp / Vườn rau (Cover):"}
                  </label>
                  <ImageUploadInput
                    folder="stalls"
                    value={editProfileForm.coverUrl}
                    onChange={(url) =>
                      setEditProfileForm((prev) => ({
                        ...prev,
                        coverUrl: url,
                      }))
                    }
                    onUploadSuccess={(url) =>
                      setEditProfileForm((prev) => ({
                        ...prev,
                        coverUrl: url,
                      }))
                    }
                    helpText={isEn ? "Upload landscape photo of garden, vegetable beds, or market stall" : "Tải ảnh chụp quang cảnh vườn trồng, luống rau hoặc sạp chợ"}
                  />
                </div>

                <div className="ml-form-group">
                  <label className="ml-form-label">
                    {isEn ? "Farming Story & Quality Commitments:" : "Câu chuyện canh tác & Cam kết chất lượng:"}
                  </label>
                  <textarea
                    className="ml-form-textarea"
                    rows={4}
                    value={editProfileForm.bio}
                    onChange={(e) =>
                      setEditProfileForm({
                        ...editProfileForm,
                        bio: e.target.value,
                      })
                    }
                    placeholder={isEn ? "Share produce origins, clean farming methods, VietGAP certs..." : "Chia sẻ nguồn gốc nông sản, phương pháp canh tác sạch, chứng nhận VietGAP..."}
                  />
                </div>
              </div>

              <div className="ml-modal-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  disabled={savingProfile}
                >
                  {isEn ? "Cancel" : "Hủy bỏ"}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={savingProfile}
                >
                  {savingProfile ? (isEn ? "Saving..." : "Đang lưu...") : (isEn ? "Save Profile Info" : "Lưu thông tin hồ sơ")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
