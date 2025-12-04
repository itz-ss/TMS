// api.js for notifications
// Provides functions to fetch and mark notifications as read
// Author: GitHub Copilot (GPT-4.1)

import axios from 'axios';

// Fetch notifications for current user
export async function fetchNotifications() {
  try {
    const res = await axios.get('/api/notifications');
    return res.data;
  } catch (err) {
    return { success: false, error: err?.response?.data?.error || err.message };
  }
}

// Mark notification as read
export async function markNotificationRead(id) {
  try {
    const res = await axios.put(`/api/notifications/${id}/read`);
    return res.data;
  } catch (err) {
    return { success: false, error: err?.response?.data?.error || err.message };
  }
}
