import { apiClient } from './client';

export const customerService = {
  getProfileSummary: async () => {
    const res = await apiClient('/customer/profile-summary');
    return res?.data || res;
  },

  // ─── Profile ──────────────────────────────────────────────────────────────
  /** GET full profile — /api/users/profile */
  getProfile: async () => {
    const res = await apiClient('/users/profile');
    return res?.data || res;
  },

  /** PUT profile (name, phone, address, etc.) — /api/users/profile */
  updateProfile: async (profileData) => {
    const res = await apiClient('/users/profile', {
      method: 'PUT',
      body: profileData,
    });
    return res?.data || res;
  },

  /** PATCH avatar — /api/users/profile/avatar */
  updateAvatar: async (avatarUrl) => {
    const res = await apiClient('/users/profile/avatar', {
      method: 'PATCH',
      body: { avatarUrl },
    });
    return res?.data || res;
  },

  /** PUT change password — /api/users/profile/change-password */
  changePassword: async (currentPassword, newPassword) => {
    const res = await apiClient('/users/profile/change-password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
    });
    return res?.data || res;
  },

  // ─── Orders ───────────────────────────────────────────────────────────────
  getOrders: async () => {
    const res = await apiClient('/customer/orders');
    return res?.data || res || [];
  },

  getOrderDetail: async (id) => {
    const res = await apiClient(`/customer/orders/${id}`);
    return res?.data || res;
  },

  /** PUT cancel order (only before cutoff time) */
  cancelOrder: async (id) => {
    const res = await apiClient(`/customer/orders/${id}/cancel`, {
      method: 'PUT',
    });
    return res?.data || res;
  },

  /** PUT modify order (pickupDate + slotId + note) */
  modifyOrder: async (id, { pickupDate, slotId, note }) => {
    const res = await apiClient(`/customer/orders/${id}/modify`, {
      method: 'PUT',
      body: { pickupDate, slotId, note },
    });
    return res?.data || res;
  },

  /** POST reorder from history */
  reorder: async (id, { pickupDate, slotId }) => {
    const res = await apiClient(`/customer/orders/${id}/reorder`, {
      method: 'POST',
      body: { pickupDate, slotId },
    });
    return res?.data || res;
  },

  // ─── Favorites ────────────────────────────────────────────────────────────
  getFavorites: async (targetType) => {
    const qs = targetType ? `?targetType=${targetType}` : '';
    const res = await apiClient(`/customer/favorites${qs}`);
    return res?.data || res || [];
  },

  /** POST add favorite (targetType: FARMER | PRODUCT | MARKET) */
  addFavorite: async (targetType, targetId) => {
    const res = await apiClient('/customer/favorites', {
      method: 'POST',
      body: { targetType, targetId },
    });
    return res?.data || res;
  },

  /** DELETE remove favorite */
  removeFavorite: async (targetType, targetId) => {
    const res = await apiClient(`/customer/favorites?targetType=${targetType}&targetId=${targetId}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  checkFavorite: async (targetType, targetId) => {
    const res = await apiClient(`/customer/favorites/check?targetType=${targetType}&targetId=${targetId}`);
    return res?.data ?? false;
  },

  // ─── Family Account ───────────────────────────────────────────────────────
  getFamilyMembers: async () => {
    const res = await apiClient('/customer/family/members');
    return res?.data || res || [];
  },

  getFamilyInvitations: async () => {
    const res = await apiClient('/customer/family/invitations');
    return res?.data || res || [];
  },

  /** POST invite member via email */
  inviteFamilyMember: async (email) => {
    const res = await apiClient('/customer/family/invite', {
      method: 'POST',
      body: { email },
    });
    return res?.data || res;
  },

  /** POST accept invitation with token */
  acceptFamilyInvitation: async (token) => {
    const res = await apiClient('/customer/family/accept', {
      method: 'POST',
      body: { token },
    });
    return res?.data || res;
  },

  /** POST reject invitation with token */
  rejectFamilyInvitation: async (token) => {
    const res = await apiClient('/customer/family/reject', {
      method: 'POST',
      body: { token },
    });
    return res?.data || res;
  },

  /** DELETE remove member (head only) */
  removeFamilyMember: async (memberId) => {
    const res = await apiClient(`/customer/family/members/${memberId}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  /** DELETE leave family (self) */
  leaveFamily: async () => {
    const res = await apiClient('/customer/family/leave', {
      method: 'DELETE',
    });
    return res?.data || res;
  },

  // ─── Geofencing ───────────────────────────────────────────────────────────
  checkGeofence: async ({ latitude, longitude, targetMarketId }) => {
    const res = await apiClient('/customer/geofence/check-in', {
      method: 'POST',
      body: { latitude, longitude, targetMarketId },
    });
    return res?.data || res;
  },
};

export const customerApi = customerService;
export default customerService;
