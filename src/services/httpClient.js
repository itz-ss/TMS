// src/services/httpClient.js

import axios from "axios";

// ===============================
// AXIOS INSTANCE
// ===============================
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://tmsbackend-psi.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

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
