// src/services/httpClient.js
import axios from "axios";

/* ---------------------------------------------------------
   SMART BASE URL DETECTION (no .env required)
---------------------------------------------------------- */

// Your deployed backend base:
const PROD_BACKEND = "https://tmsbackend-production.up.railway.app/api";

// Detect local development
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// Detect production (any hosted domain)
const isProduction =
  typeof window !== "undefined" &&
  !isLocalhost;

// Optional .env override
const envApi = import.meta.env.VITE_API_URL;

// 🎯 FINAL BASE URL resolution
let BASE_URL;

if (envApi) {
  BASE_URL = envApi;
} else if (isLocalhost) {
  BASE_URL = "http://localhost:5000/api";
} else if (isProduction) {
  BASE_URL = PROD_BACKEND;
} else {
  BASE_URL = PROD_BACKEND; // fallback
}

console.log("[httpClient] Using API:", BASE_URL);

/* ---------------------------------------------------------
   AXIOS INSTANCE
---------------------------------------------------------- */
const http = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/* ---------------------------------------------------------
   REQUEST INTERCEPTOR — Add token
   BUT SKIP for /auth/login and /auth/register
---------------------------------------------------------- */
http.interceptors.request.use(
  (config) => {
    // Skip token ONLY for login
    if (config.url.includes("/auth/login")) {
      return config;
    }

    // Register MUST send token so admin can register users
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


/* ---------------------------------------------------------
   RESPONSE INTERCEPTOR — Handle expired tokens
   BUT DO NOT FORCE LOGOUT for:
   - /auth/register  (admin adding user)
   - /auth/profile   (admin dashboard auto-load)
---------------------------------------------------------- */
http.interceptors.response.use(
  (response) => response,

  (error) => {
    const url = error?.config?.url || "";

    // ❌ Do NOT log out user during register or profile checks
    if (
      url.includes("/auth/register") ||
      url.includes("/auth/profile")
    ) {
      return Promise.reject(error);
    }

    // Normal unauthorized logic
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default http;
