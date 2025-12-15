import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/layout/Layout";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ProfilePage from "../features/users/pages/ProfilePage";
import SettingsPage from "../features/settings/SettingsPage";
import NotificationCenter from "../features/notifications/components/NotificationCenter";
import TaskList from "../features/tasks/components/TaskList";
import CalendarPage from "../features/calendar/pages/CalendarPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected app layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        <Route path="/dashboard/notifications" element={<NotificationCenter />} />
        <Route path="/dashboard/tasks" element={<TaskList />} />

        {/* ✅ CALENDAR ROUTE */}
        <Route path="/dashboard/calendar" element={<CalendarPage />} />
        <Route path="/dashboard/calendar/:date" element={<TaskList />} />


      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
