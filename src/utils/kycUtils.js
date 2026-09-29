/**
 * Utility functions for robust Farmer KYC status checking and synchronization.
 */

export function isFarmerKycApproved(kycData, profile) {
  // 1. Direct approval flag
  if (kycData?.isApproved === true) return true;
  if (profile?.isApproved === true) return true;
  if (profile?.profileDetails?.isApproved === true) return true;

  // 2. KYC status string
  const kycStatus = String(kycData?.kycStatus || "").toUpperCase();
  if (kycStatus === "VERIFIED" || kycStatus === "APPROVED") return true;

  const profKyc = String(profile?.kycStatus || "").toUpperCase();
  if (profKyc === "VERIFIED" || profKyc === "APPROVED") return true;

  // 3. Stored KYC status from recent approval/sync
  const stored = String(localStorage.getItem("ml_kyc_status") || "").toUpperCase();
  if (stored === "VERIFIED" || stored === "APPROVED") return true;

  return false;
}

export function getEffectiveKycStatus(kycData, profile) {
  if (isFarmerKycApproved(kycData, profile)) {
    return "VERIFIED";
  }

  const kycStatus = String(kycData?.kycStatus || "").toUpperCase();
  const profKyc = String(profile?.kycStatus || "").toUpperCase();

  if (kycStatus === "REJECTED" || profKyc === "REJECTED") {
    return "REJECTED";
  }
  if (
    kycStatus === "PENDING" ||
    profKyc === "PENDING" ||
    (kycData?.documents && kycData.documents.length > 0)
  ) {
    return "PENDING";
  }

  const stored = String(localStorage.getItem("ml_kyc_status") || "").toUpperCase();
  if (["VERIFIED", "PENDING", "REJECTED"].includes(stored)) {
    return stored;
  }

  return "UNVERIFIED";
}

export function syncKycStatus(status) {
  if (!status) return;
  const normalized = String(status).toUpperCase();
  const finalStatus = normalized === "APPROVED" ? "VERIFIED" : normalized;
  localStorage.setItem("ml_kyc_status", finalStatus);
  window.dispatchEvent(
    new CustomEvent("ml_kyc_changed", { detail: finalStatus })
  );
}
