import { apiClient } from './client';

export const notificationsService = {
  /** GET all notifications (sorted newest first) */
  getNotifications: async () => {
    const res = await apiClient('/notifications');
    return res?.data || res || [];
  },

  /** GET unread notification count (for badge display) */
  getUnreadCount: async () => {
    const res = await apiClient('/notifications/unread-count');
    // Returns { count: number }
    return res?.data?.count ?? res?.count ?? 0;
  },

  /** PATCH mark single notification as read */
  markAsRead: async (id) => {
    const res = await apiClient(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return res?.data || res;
  },

  /** PATCH mark all notifications as read */
  markAllAsRead: async () => {
    const res = await apiClient('/notifications/read-all', {
      method: 'PATCH',
    });
    return res?.data || res;
  },
};

export const notificationsApi = notificationsService;
export default notificationsService;
