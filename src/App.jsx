import React, { useEffect, useRef } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { autoLoginThunk } from "./store/authSlice";

import { socket, registerUserSocket, onNotification } from "./services/socket";
import { receiveNotification } from "./store/notificationSlice";
import { ToastContainer } from "react-toastify";

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

  return (
    <>
      <AppRoutes />
      <ToastContainer position="bottom-right" />
    </>
  );
}
