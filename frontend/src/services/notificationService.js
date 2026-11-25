import apiClient, { API_CONFIG, allPages } from "./api/apiClient";
import { MOCK_NOTIFICATIONS } from "../mocks/notifications";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let devNotifications = [...MOCK_NOTIFICATIONS];

export const notificationService = {
  getUnreadCount: async () => {
    if (API_CONFIG.useMockApi) return devNotifications.filter((item) => !item.is_read).length;
    return (await apiClient.get("/me/notifications/unread-count")).data.unread_count;
  },

  getNotifications: async () => {
    if (API_CONFIG.useMockApi) {
      await wait(220);
      return [...devNotifications];
    }
    return allPages("/me/notifications");
  },

  markAsRead: async (id) => {
    if (API_CONFIG.useMockApi) {
      await wait(150);
      devNotifications = devNotifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      );
      return [...devNotifications];
    }
    await apiClient.patch(`/me/notifications/${id}/read`);
    return notificationService.getNotifications();
  },

  markAllAsRead: async () => {
    if (API_CONFIG.useMockApi) {
      await wait(200);
      devNotifications = devNotifications.map((n) => ({ ...n, is_read: true }));
      return [...devNotifications];
    }
    await apiClient.patch("/me/notifications/read-all");
    return notificationService.getNotifications();
  },
};