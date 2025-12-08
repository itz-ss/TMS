// src/services/httpClient.js
import axios from "axios";

/* ---------------------------------------------------------
   SMART BASE URL DETECTION (no .env required)
---------------------------------------------------------- */

// Your deployed backend base:
const PROD_BACKEND = "https://tmsbackend-production.up.railway.app/api";

// 1) If running on Vercel frontend → ALWAYS use Railway backend
const isDeployed =
  typeof window !== "undefined" &&
  window.location.hostname.includes("vercel.app");

// 2) If running locally → use localhost backend
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// 3) If .env is provided manually → override
const envApi = import.meta.env.VITE_API_URL;

// 🎯 FINAL BASE URL DECISION
let BASE_URL;

if (envApi) {
  BASE_URL = envApi; // If user forces URL via .env
} else if (isDeployed) {
  BASE_URL = PROD_BACKEND; // Vercel → Railway backend
} else if (isLocalhost) {
  BASE_URL = "http://localhost:5000/api"; // Local dev
} else {
  // fallback for unexpected environments
  BASE_URL = PROD_BACKEND;
}

console.log("[httpClient] Using API:", BASE_URL);

/* ---------------------------------------------------------
   AXIOS INSTANCE
---------------------------------------------------------- */
const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("Unauthorized — clearing token");

      localStorage.removeItem("token");

      // Prevent infinite redirect loops
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default http;
