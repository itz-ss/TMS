// Notifications API
import http from "../../services/httpClient";

// Fetch all notifications
export async function fetchNotifications() {
  try {
    console.log("[NotificationsAPI] GET /users/notifications");
    const res = await http.get("/users/notifications");
    return res.data;
  } catch (err) {
    const status = err.response?.status;
    const url = err.response?.config?.url || "/users/notifications";
    console.error("[NotificationsAPI] Failed", { status, url, data: err.response?.data, message: err.message });
    const backendError = err.response?.data?.error;
    return {
      success: false,
      error:
        backendError ||
        (status ? `Failed to load notifications (HTTP ${status})` : "Failed to load notifications"),
    };
  }
}

// Mark a single notification as read
export async function markNotificationRead(id) {
  try {
    const res = await http.put(`/users/notifications/${id}/read`);
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error };
  }
}

// ⭐ ADD THIS — Delete one notification
export async function deleteNotification(id) {
  try {
    const res = await http.delete(`/users/notifications/${id}`);
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error };
  }
}

// ⭐ OPTIONAL — mark all notifications as read
export async function markAllNotificationsRead() {
  try {
    const res = await http.put("/users/notifications/read-all");
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error };
  }
}
