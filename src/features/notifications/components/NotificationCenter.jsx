// src/features/notifications/components/NotificationCenter.jsx
// Full real-time + Redux-synced notification center

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

import {
  loadNotificationsThunk,
  markReadThunk,
  markReadLocal,
  receiveNotification,
} from "../../../store/notificationSlice";

import { socket } from "../../../services/socket";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NotificationCenter() {
  const dispatch = useAppDispatch();
  const { items: notifications, loading, error } = useAppSelector(
    (s) => s.notifications
  );
  const user = useAppSelector((s) => s.auth.user);

  /* -------------------------------------------------------
     Load notifications when user is ready
  ------------------------------------------------------- */
  useEffect(() => {
    if (!user?._id) return;
    dispatch(loadNotificationsThunk());
  }, [dispatch, user]);

  /* -------------------------------------------------------
     Subscribe to real-time notifications via socket
  ------------------------------------------------------- */
  useEffect(() => {
    if (!user?._id) return;

    console.log("[NotificationCenter] Listening for real-time notifications...");

    socket.on("notification", (notif) => {
      console.log("🔔 [Real-time] Notification received:", notif);

      // Toast popup
      toast.info(notif.message, { autoClose: 3000 });

      // Add to Redux store (prevents duplicates)
      dispatch(receiveNotification(notif));
    });

    return () => {
      socket.off("notification");
    };
  }, [dispatch, user]);

  /* -------------------------------------------------------
     Mark a notification as read
  ------------------------------------------------------- */
  const handleMarkRead = async (id) => {
    dispatch(markReadLocal(id));   // update instantly in UI
    dispatch(markReadThunk(id));   // sync with backend
  };

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */
  return (
    <div className="notification-center">
      <h2>Notifications</h2>

      {loading && <p>Loading…</p>}
      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={() => dispatch(loadNotificationsThunk())}>
            Retry
          </button>
        </div>
      )}
      {!loading && !error && notifications.length === 0 && (
        <p>No notifications.</p>
      )}

      <ul className="notification-list">
        {notifications.map((notif) => (
          <li
            key={notif._id}
            className={`notification-item ${notif.read ? "read" : "unread"}`}
          >
            <span className="notif-message">{notif.message}</span>

            {!notif.read && (
              <button
                className="mark-read-btn"
                onClick={() => handleMarkRead(notif._id)}
              >
                Mark as read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
