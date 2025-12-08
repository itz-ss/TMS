// src/store/notificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  markNotificationRead,
  deleteNotification,
} from "../features/notifications/api";

const initialState = {
  items: [],
  unreadCount: 0,
  loading: true,
  error: null,
};

/* ------------------------------------------------------------
 * 1) LOAD ALL NOTIFICATIONS
 ------------------------------------------------------------ */
export const loadNotificationsThunk = createAsyncThunk(
  "notifications/load",
  async () => {
    const res = await fetchNotifications();
    if (res?.success === false) {
      throw new Error(res.error || "Failed to load notifications");
    }
    return res.notifications || [];
  }
);

/* ------------------------------------------------------------
 * 2) MARK AS READ (server + local)
 ------------------------------------------------------------ */
export const markReadThunk = createAsyncThunk(
  "notifications/markRead",
  async (notificationId) => {
    await markNotificationRead(notificationId);
    return notificationId;
  }
);

/* ------------------------------------------------------------
 * 3) DELETE NOTIFICATION
 ------------------------------------------------------------ */
export const deleteNotificationThunk = createAsyncThunk(
  "notifications/delete",
  async (notificationId) => {
    await deleteNotification(notificationId);
    return notificationId;
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    /* --------------------------------------------------------
     * REAL-TIME NOTIFICATION ARRIVED FROM SOCKET
     -------------------------------------------------------- */
    receiveNotification(state, action) {
      const incoming = action.payload;

      // Prevent duplicates (matches by _id)
      const exists = state.items.some((n) => n._id === incoming._id);
      if (!exists) {
        state.items.unshift(incoming);
        state.unreadCount += 1;
      }
    },

    /* --------------------------------------------------------
     * MARK READ LOCALLY (UI optimization)
     -------------------------------------------------------- */
    markReadLocal(state, action) {
      const id = action.payload;
      const notif = state.items.find((n) => n._id === id);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    /* --------------------------------------------------------
     * CLEAR ALL UNREAD (optional, rarely used)
     -------------------------------------------------------- */
    clearAllUnread(state) {
      state.items.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
  },

  extraReducers: (builder) => {
    /* --------------------------------------------------------
     * LOAD NOTIFICATIONS
     -------------------------------------------------------- */
    builder
      .addCase(loadNotificationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadNotificationsThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
        state.loading = false;
        state.error = null;
      })
      .addCase(loadNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error?.message || "Failed to load notifications. Please retry.";
      });

    /* --------------------------------------------------------
     * CONFIRM READ FROM BACKEND
     -------------------------------------------------------- */
    builder.addCase(markReadThunk.fulfilled, (state, action) => {
      const id = action.payload;
      const notif = state.items.find((n) => n._id === id);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    /* --------------------------------------------------------
     * DELETE NOTIFICATION
     -------------------------------------------------------- */
    builder.addCase(deleteNotificationThunk.fulfilled, (state, action) => {
      const id = action.payload;

      const notif = state.items.find((n) => n._id === id);
      if (notif && !notif.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }

      state.items = state.items.filter((n) => n._id !== id);
    });
  },
});

export const {
  receiveNotification,
  markReadLocal,
  clearAllUnread,
} = notificationSlice.actions;

export default notificationSlice.reducer;
