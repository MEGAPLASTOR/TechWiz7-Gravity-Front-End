import apiClient from "./apiClient";

/**
 * AnnouncementService
 * Public:  GET /api/announcements        – View active system announcements
 *          GET /api/announcements/{id}   – View detailed announcement article
 * Admin:   managed via adminService (CRUD on /api/admin/announcements)
 */
export const announcementService = {
  /** Lấy danh sách bảng tin đang active (public – không cần token) */
  async getActiveAnnouncements() {
    try {
      const res = await apiClient.get("/announcements");
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (res && Array.isArray(res.data)) list = res.data;
      else if (res && Array.isArray(res.value)) list = res.value;
      return list;
    } catch (err) {
      console.warn("Failed to fetch active announcements", err);
      return [];
    }
  },

  /** Lấy chi tiết một bài bảng tin (public) */
  async getAnnouncementById(id) {
    try {
      const res = await apiClient.get(`/announcements/${id}`);
      return res.data || res;
    } catch (err) {
      console.warn(`Failed to fetch announcement ${id}`, err);
      return null;
    }
  },
};

export default announcementService;
