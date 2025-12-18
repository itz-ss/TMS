import React, { memo } from "react";
import "./styles/layout.css";
import { useAppSelector } from "../../store/hooks";
import { selectPendingTaskCount } from "../../store/taskSlice";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const user = useAppSelector((s) => s.auth.user);
  const pendingCount = useAppSelector(selectPendingTaskCount);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <aside className="sidebar">
  <h2 className="logo">TMS</h2>
  <nav>
    <NavLink to="/dashboard" data-short="🏠">Dashboard</NavLink>

    <NavLink to="/dashboard/profile" data-short={initial}>
      {user?.name}
    </NavLink>

    <NavLink to="/dashboard/settings" data-short="⚙️">
      Settings
    </NavLink>

    <NavLink to="/dashboard/tasks" data-short="📋">
      Tasks
      {pendingCount > 0 && (
        <span className="sidebar-badge">{pendingCount}</span>
      )}
    </NavLink>

    <NavLink to="/dashboard/calendar" data-short="📅">
      Calendar
    </NavLink>

    <NavLink to="/dashboard/notifications" data-short="🔔">
      Notifications
    </NavLink>

    {user?.role === "admin" && (
      <NavLink to="/register" data-short="➕">
        Register User
      </NavLink>
    )}
  </nav>
</aside>

  );
}

export default memo(Sidebar);
