// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  // read auth state from redux store
  const user = useAppSelector((s) => s.auth.user);
  const loading = useAppSelector((s) => s.auth.loading);

  // 1) while loading — don't redirect; show a placeholder
  if (loading) {
    // Minimal UI; replace with a spinner component if available
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        Loading…
      </div>
    );
  }

  // 2) when loading finished, if no user — redirect to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3) otherwise, allow access
  return children;
}
