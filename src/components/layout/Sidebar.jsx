import React, { memo } from "react";
import "./styles/sidebar.css";
import { useAppSelector } from "../../store/hooks";
import { selectPendingTaskCount } from "../../store/taskSlice";

function Sidebar() {
  // Only read user once per auth update
  const user = useAppSelector((s) => s.auth.user);
  const pendingCount = useAppSelector(selectPendingTaskCount);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <aside className="sidebar">
      <h2 className="logo">TMS</h2>
      <nav>
        <a href="/dashboard" data-short="🏠">Dashboard</a>
        <a href="/dashboard/profile" data-short={initial}>{user?.name}</a>
        <a href="/dashboard/settings" data-short="⚙️">Settings</a>
        {/* Tasks and Notification links: routes registered in AppRoutes.jsx */}
        <a href="/dashboard/tasks" data-short="📋">
          Tasks
          {pendingCount > 0 && (
            <span className="sidebar-badge">{pendingCount}</span>
          )}
        </a>
        <a href="/dashboard/notifications" data-short="🔔">Notifications</a>
        {/* ✅ Register User — Visible ONLY for Admin */}
        {user?.role === "admin" && (
          <a href="/register" data-short="➕">Register User</a>
        )}
      </nav>
    </aside>
  );
}

export default memo(Sidebar);
