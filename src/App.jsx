import React, { useEffect, useRef } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { autoLoginThunk } from "./store/authSlice";

import { socket, registerUserSocket, onNotification } from "./services/socket";
import { receiveNotification, loadNotificationsThunk } from "./store/notificationSlice";
import { ToastContainer } from "react-toastify";
import { onForegroundFcmMessage } from "./firebase/fcm";

export default function App() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const theme = useAppSelector((s) => s.auth.user?.settings?.theme || "light");

  const hasAutoLoggedIn = useRef(false);

  /* -----------------------------------------
   * 1) AUTO LOGIN ON FIRST LOAD
   ----------------------------------------- */
  useEffect(() => {
    if (!hasAutoLoggedIn.current) {
      hasAutoLoggedIn.current = true;
      dispatch(autoLoginThunk());
    }
  }, [dispatch]);

  /* -----------------------------------------
   * 2) APPLY THEME
   ----------------------------------------- */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.transition =
      "background-color 0.25s, color 0.25s";
  }, [theme]);

  /* -----------------------------------------
   * 3) SOCKET.IO: Register user + listen for notifications
   ----------------------------------------- */
  useEffect(() => {
    if (!user?._id) {
      console.log("⚠️ [App] No user logged in — skipping socket setup");
      return;
    }

    console.log(`🔌 [App] Registering socket for user: ${user._id}`);

    // Join user's private room
    registerUserSocket(user._id);

    // Subscribe to real-time notifications
    const unsubscribe = onNotification((notif) => {
      console.log("🔔 [App] Notification received:", notif);
      dispatch(receiveNotification(notif));
    });

    console.log("📡 [App] Notification listener attached");

    // Cleanup when user logs out or component unmounts
    return () => {
      console.log("🗑️ [App] Cleaning up notification listener");
      unsubscribe();
    };
  }, [user, dispatch]);

  /* -----------------------------------------
 * 4) FIREBASE FCM: Foreground push notifications
 ----------------------------------------- */
useEffect(() => {
  if (!user?._id) return;

  console.log("📡 [App] Initializing Firebase foreground listener...");

  const unsubscribeFcm = onForegroundFcmMessage((payload) => {
    console.log("🔔 [FCM Foreground] Notification received:", payload);

    // Create a unified notification object
    const notif = {
      _id: payload.messageId || Date.now(), // fallback ID
      message: payload.notification?.body,
      type: payload.data?.type || "general",
      read: false,
      createdAt: new Date().toISOString(),
    };

    dispatch(receiveNotification(notif));
  });

  return () => {
    console.log("🗑️ Cleaning up Firebase FCM listener");
    if (unsubscribeFcm) unsubscribeFcm();
  };
}, [user, dispatch]);

/* -----------------------------------------
 * 5) APP VISIBILITY / FOCUS RESYNC (iOS SAFE)
 ----------------------------------------- */
useEffect(() => {
  if (!user?._id) return;

  const handleAppResume = () => {
    console.log("🔄 [App] App resumed — resyncing notifications");

    // Re-register socket room (safe to call multiple times)
    registerUserSocket(user._id);

    // Reload authoritative notifications from backend
    dispatch(loadNotificationsThunk());
  };

  // iOS + browser tab resume
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      handleAppResume();
    }
  });

  // Desktop + PWA focus
  window.addEventListener("focus", handleAppResume);

  return () => {
    window.removeEventListener("focus", handleAppResume);
  };
}, [user, dispatch]);


  return (
    <>
      <AppRoutes />
      <ToastContainer position="bottom-right" />
    </>
  );
}
