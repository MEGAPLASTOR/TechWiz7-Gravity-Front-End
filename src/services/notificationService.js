import { apiRequest } from "./apiClient";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
export function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.debug("Unable to play notification audio chime:", err);
  }
}
export const notificationService = {
  async getMyNotifications() {
    const res = await apiRequest("/notifications", {
      method: "GET",
    });
    return res?.data || [];
  },
  async getUnreadCount() {
    const res = await apiRequest("/notifications/unread-count", {
      method: "GET",
    });
    return res?.data?.unreadCount || 0;
  },
  async markAsRead(notificationId) {
    const res = await apiRequest(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
    return res?.data;
  },
  async markAllAsRead() {
    const res = await apiRequest("/notifications/read-all", {
      method: "PATCH",
    });
    return res?.data;
  },
  async sendTestPush(payload = {}) {
    const res = await apiRequest("/notifications/test-push", {
      method: "POST",
      body: payload,
    });
    return res?.data;
  },
  async requestBrowserPermission() {
    if (!("Notification" in window)) {
      console.warn("Trình duyệt này không hỗ trợ HTML5 Web Notification API.");
      return "unsupported";
    }
    if (Notification.permission === "granted") {
      return "granted";
    }
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return Notification.permission;
  },
  showBrowserNotification(title, options = {}) {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return null;
    }
    try {
      const defaultIcon =
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232E7D32"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>';
      const n = new Notification(title, {
        icon: options.icon || defaultIcon,
        badge: options.badge || defaultIcon,
        body: options.body || options.message || "",
        tag: options.tag || "marketlink-notification",
        renotify: true,
        ...options,
      });
      n.onclick = () => {
        window.focus();
        if (options.onClick) {
          options.onClick();
        }
        n.close();
      };
      return n;
    } catch (err) {
      console.warn("Failed to display native browser notification:", err);
      return null;
    }
  },
  subscribePushStream(token, { onNotification, onConnected, onError }) {
    if (!token) return () => {};
    const cleanBase = BASE_URL.startsWith("http")
      ? BASE_URL
      : `${window.location.origin}${BASE_URL.startsWith("/") ? "" : "/"}${BASE_URL}`;
    const sseUrl = `${cleanBase}/notifications/stream?token=${encodeURIComponent(token)}`;
    let eventSource = null;
    let reconnectTimeout = null;
    let isExplicitlyClosed = false;
    const connect = () => {
      if (isExplicitlyClosed) return;
      try {
        eventSource = new EventSource(sseUrl);
        eventSource.addEventListener("connected", (event) => {
          try {
            const data = JSON.parse(event.data);
            if (onConnected) onConnected(data);
          } catch (e) {
            if (onConnected) onConnected(event.data);
          }
        });
        eventSource.addEventListener("notification", (event) => {
          try {
            const notif = JSON.parse(event.data);
            playNotificationChime();
            notificationService.showBrowserNotification(
              notif.title || "MarketLink Thông Báo",
              {
                body: notif.message,
                data: notif,
              },
            );
            if (onNotification) onNotification(notif);
          } catch (e) {
            console.error("Error parsing notification SSE payload:", e);
          }
        });
        eventSource.onerror = (err) => {
          console.debug("SSE Push Stream disconnected or reconnecting...", err);
          if (onError) onError(err);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (!isExplicitlyClosed) {
            reconnectTimeout = setTimeout(connect, 5000);
          }
        };
      } catch (err) {
        console.error("Error establishing SSE Push connection:", err);
        if (onError) onError(err);
      }
    };
    connect();
    return () => {
      isExplicitlyClosed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  },
};
export default notificationService;
