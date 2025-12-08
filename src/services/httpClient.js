// src/services/httpClient.js

import axios from "axios";

// ===============================
// AXIOS INSTANCE
// ===============================
// Resolve API base URL with sensible fallbacks:
// 1) VITE_API_URL (preferred)
// 2) Derive from VITE_SOCKET_URL by appending "/api" (if provided)
// 3) Fallback to current origin + "/api" (useful when frontend served by backend)
const apiFromEnv = import.meta.env.VITE_API_URL;
const socketUrl = import.meta.env.VITE_SOCKET_URL;
const derivedFromSocket =
  socketUrl && socketUrl.endsWith("/api")
    ? socketUrl
    : socketUrl
    ? `${socketUrl.replace(/\/$/, "")}/api`
    : null;
const fallbackOrigin = `${window.location.origin}/api`;

const http = axios.create({
  baseURL: apiFromEnv || derivedFromSocket || fallbackOrigin,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("[httpClient] Base URL:", http.defaults.baseURL);

// ===============================
// REQUEST INTERCEPTOR
// - Attach Authorization token
// ===============================
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// RESPONSE INTERCEPTOR
// - Handle expired token (401)
// - Unified error handling
// ===============================
http.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    // If token is invalid or expired → logout user
    if (status === 401) {
      console.warn("Token expired or unauthorized. Logging out...");

      localStorage.removeItem("token");

      // Redirect only if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default http;
