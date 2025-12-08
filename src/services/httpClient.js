// src/services/httpClient.js
import axios from "axios";

/* ---------------------------------------------------------
   SMART BASE URL DETECTION (no .env required)
---------------------------------------------------------- */

// Your deployed backend base:
const PROD_BACKEND = "https://tmsbackend-production.up.railway.app/api";

// Detect production (ANY domain except localhost)
const isProduction =
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";

// Detect local dev
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// .env override
const envApi = import.meta.env.VITE_API_URL;

// 🎯 FINAL BASE URL
let BASE_URL;

if (envApi) {
  BASE_URL = envApi; // explicit override
} else if (isLocalhost) {
  BASE_URL = "http://localhost:5000/api";
} else if (isProduction) {
  BASE_URL = PROD_BACKEND; // ANY hosted frontend → Railway backend
} else {
  BASE_URL = PROD_BACKEND; // safety fallback
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
   REQUEST INTERCEPTOR – Add token
---------------------------------------------------------- */
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------------------------------------------------
   RESPONSE INTERCEPTOR – Handle expired tokens
---------------------------------------------------------- */
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default http;
