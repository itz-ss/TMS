// src/features/notifications/components/NotificationCenter.jsx
// Redux-driven Notification Center (no socket logic here)

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import "../styles/notificationCenter.css"

import {
  loadNotificationsThunk,
  markReadThunk,
  markReadLocal,
  markAllReadThunk,
} from "../../../store/notificationSlice";

import "react-toastify/dist/ReactToastify.css";

export default function NotificationCenter() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items: notifications, loading, error } = useAppSelector(
    (s) => s.notifications
  );
  const user = useAppSelector((s) => s.auth.user);

  /* -------------------------------------------------------
     Load notifications once user is available
  ------------------------------------------------------- */
  useEffect(() => {
    if (!user?._id) return;
    dispatch(loadNotificationsThunk());
  }, [dispatch, user]);

  /* -------------------------------------------------------
     Mark single notification as read
  ------------------------------------------------------- */
  const handleMarkRead = (id) => {
    dispatch(markReadLocal(id));   // instant UI update
    dispatch(markReadThunk(id));   // backend sync
  };

  /* -------------------------------------------------------
     Click notification → mark read → open task
  ------------------------------------------------------- */
  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      handleMarkRead(notif._id);
    }

    if (notif.metadata?.taskId) {
      navigate(`/tasks/${notif.metadata.taskId}`);
    }
  };

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */
 return (
    <div className="notification-center">
      <div className="notification-header">
        <h2>Notifications</h2>

        <button
          className="mark-all-btn"
          onClick={() => dispatch(markAllReadThunk())}
        >
          Mark All as Read
        </button>
      </div>

      {loading && <p className="notification-loading">Loading…</p>}

      {error && (
        <div className="notification-error">
          <p>{error}</p>
          <button onClick={() => dispatch(loadNotificationsThunk())}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <p className="notification-empty">No notifications.</p>
      )}

      <ul className="notification-list">
        {notifications.map((notif) => (
          <li
            key={notif._id}
            className={`notification-item ${
              notif.read ? "read" : "unread"
            } ${notif.metadata?.taskId ? "clickable" : ""}`}
            onClick={() => handleNotificationClick(notif)}
          >
            <span className="notif-message">{notif.message}</span>

            {!notif.read && (
              <button
                className="mark-read-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkRead(notif._id);
                }}
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