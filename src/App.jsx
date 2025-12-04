import React, { useEffect, useRef } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { autoLoginThunk } from "./store/authSlice";

export default function App() {
  const dispatch = useAppDispatch();
  // Read current theme from the user settings in Redux
  const theme = useAppSelector((s) => s.auth.user?.settings?.theme || "light");
  const hasAutoLoggedIn = useRef(false);

  useEffect(() => {
    if (!hasAutoLoggedIn.current) {
      hasAutoLoggedIn.current = true;
      dispatch(autoLoginThunk());
    }
  }, [dispatch]);

  // Apply theme to document root (so CSS variables can be used). This runs whenever 'theme' changes.
  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.style.transition = "background-color 0.25s, color 0.25s";
    }
  }, [theme]);

  return <AppRoutes />;
}
