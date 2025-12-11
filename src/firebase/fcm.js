import { messaging } from "./firebase";
import { getToken, onMessage } from "firebase/messaging";
import { toast } from "react-toastify";

export async function requestFcmToken() {
  try {
    console.log("🔔 Requesting Notification Permission…");

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.warn("⚠️ Notification permission denied.");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!token) {
      console.warn("⚠️ No FCM token returned.");
      return null;
    }

    // console.log("✅ FCM Token:", token);
    return token;

  } catch (err) {
    console.error("❌ requestFcmToken ERROR:", err);
    return null;
  }
}


export function onForegroundFcmMessage(callback) {
  onMessage(messaging, (payload) => {
    console.log("📩 Foreground FCM message:", payload);

    toast.info(payload.notification?.title || "New Notification");

    if (callback) callback(payload);
  });
}

// Expose debug helpers for browser console testing
if (typeof window !== "undefined") {
  window.requestFcmToken = requestFcmToken;
  window.listenForegroundFcm = onForegroundFcmMessage;
}


// Expose debug helper for browser console testing
if (typeof window !== "undefined") {
  window._listenForegroundFcm = function (callback) {
    onMessage(messaging, callback);
    console.log("✓ Foreground FCM listener attached");
  };
}
