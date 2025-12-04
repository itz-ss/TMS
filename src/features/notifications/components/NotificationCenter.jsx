// NotificationCenter.jsx
// Displays notifications for the current user
// Author: GitHub Copilot (GPT-4.1)

import React, { useEffect, useState } from 'react';
import { fetchNotifications, markNotificationRead } from '../pages/api';

/*
  NotificationCenter
  - Fetches notifications from backend
  - Displays notifications in a panel
  - Allows marking notifications as read
  - Well-commented for future edits
*/
export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      const res = await fetchNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setError(null);
      } else {
        setNotifications([]);
        setError(res.error);
      }
      setLoading(false);
    }
    loadNotifications();
  }, []);

  // Mark notification as read
  async function handleMarkRead(id) {
    const res = await markNotificationRead(id);
    if (res.success) {
      setNotifications((n) => n.map((notif) => notif._id === id ? { ...notif, read: true } : notif));
    } else {
      alert(res.error || 'Failed to mark as read');
    }
  }

  return (
    <div className="notification-center">
      <h3>Notifications</h3>
      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && notifications.length === 0 && <p>No notifications.</p>}
      <ul>
        {notifications.map((notif) => (
          <li key={notif._id} className={notif.read ? 'read' : 'unread'}>
            <span>{notif.message}</span>
            {!notif.read && (
              <button onClick={() => handleMarkRead(notif._id)} className="mark-read-btn">Mark as read</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
