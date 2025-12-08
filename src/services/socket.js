import { io } from "socket.io-client";

// Resolve Socket.IO base URL.
// Priority:
// 1) VITE_SOCKET_URL (explicit)
// 2) VITE_API_URL with trailing "/api" stripped
// 3) window.location.origin (same host as the loaded UI)
const apiUrl = import.meta.env.VITE_API_URL;
const derivedFromApi =
  apiUrl && apiUrl.endsWith("/api") ? apiUrl.replace(/\/api$/, "") : apiUrl;

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  derivedFromApi ||
  window.location.origin;

console.log(`🔗 [Socket] Initializing Socket.IO connection to: ${SOCKET_URL}`);

// Create socket connection
export const socket = io(SOCKET_URL, {
  autoConnect: false, // don't connect instantly
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Debug loggers
socket.on("connect", () => {
  console.log("✅ [Socket] Connected to backend. Socket ID:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ [Socket] Disconnected from backend");
});

socket.on("connect_error", (error) => {
  console.error("⚠️ [Socket] Connection error:", error);
});

// ⭐ Register user into private socket room
export function registerUserSocket(userId) {
  if (!userId) {
    console.warn("⚠️ [Socket] registerUserSocket called with no userId");
    return;
  }

  if (!socket.connected) {
    console.log(`🔌 [Socket] Not connected, connecting now...`);
    socket.connect();
  }

  console.log(`📢 [Socket] Emitting 'register' event for user: ${userId}`);
  socket.emit("register", userId);
  console.log("🔌 Registered socket room for:", userId);
}

// ⭐ NEW — Subscribe to real-time notifications
export function onNotification(callback) {
  socket.on("notification", callback);

  // cleanup helper
  return () => socket.off("notification", callback);
}
