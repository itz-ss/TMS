import React, { useEffect, useCallback, useState, memo } from "react";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { fetchUsersThunk, fetchRolesThunk, changeUserRoleThunk, deleteUserThunk } from "../../../store/userSlice";
import { fetchUserStats } from "./api";
import "../styles/dashboard.css";

// DashboardPage
// - Displays user role, all users table, and user stats
// - Fetches stats from backend and displays in dashboard cards
// - Well-commented for future edits
function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const users = useAppSelector((state) => state.user.users);
  const roles = useAppSelector((state) => state.user.roles);
  const dispatch = useAppDispatch();
  // Local state for stats
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    // Fetch users/roles for admin/manager
    if (user?.role === "admin" || user?.role === "manager") {
      dispatch(fetchUsersThunk());
    }
    if (user?.role === "admin") {
      dispatch(fetchRolesThunk());
    }
    // Fetch stats for current user
    async function loadStats() {
      const res = await fetchUserStats();
      if (res.success) {
        setStats(res.stats);
        setStatsError(null);
      } else {
        setStats(null);
        setStatsError(res.error);
      }
    }
    if (user) loadStats();
  }, [dispatch, user]);

  const handleChangeRole = useCallback(async (userId, newRole) => {
    try {
      await dispatch(changeUserRoleThunk({ userId, role: newRole })).unwrap();
    } catch (err) {
      // show simple fallback alert; more advanced UI can use toast
      alert(err?.message || err || "Failed to update role");
    }
  }, [dispatch]);

  const handleDeleteUser = useCallback(async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    await dispatch(deleteUserThunk(userId));
  }, [dispatch]);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      {/* Dashboard cards: show role and stats */}
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Your Role</h3>
          <p className="dashboard-number">{user?.role}</p>
        </div>
        {/* Stats card: show stats if available */}
        <div className="dashboard-card">
          <h3>Your Stats</h3>
          {statsError && <p className="dashboard-error">{statsError}</p>}
          {!stats && !statsError && <p>Loading stats…</p>}
          {stats && (
            <ul>
              <li>Tasks Assigned: {stats.tasksAssigned ?? 0}</li>
              <li>Tasks In Revision: {stats.tasksInRevision ?? 0}</li>
              <li>Tasks Completed: {stats.tasksCompleted ?? 0}</li>
              <li>Avg Completion Time: {stats.avgCompletionTime ?? 0} hrs</li>
            </ul>
          )}
        </div>
      </div>

      {/* All users table for admin/manager */}
      {(user?.role === "admin" || user?.role === "manager") && (
        <div className="dashboard-table-container">
          <h3 className="dashboard-subtitle">All Users</h3>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                {user?.role === "admin" && <th style={{ textAlign: "right" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    {user?.role === "admin" ? (
                      <select
                        className="role-select"
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      u.role
                    )}
                  </td>

                  {user?.role === "admin" && (
                    <td style={{ textAlign: "right" }}>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteUser(u._id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default memo(DashboardPage);
