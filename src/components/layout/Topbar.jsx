import React, { memo, useCallback, useRef } from "react";
import "./styles/layout.css";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/authSlice";

function Topbar() {
  // Only read user once per auth change
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const listenerAttachedRef = useRef(false);

  const toggleSidebar = useCallback(() => {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    const isOpen = sidebar.classList.toggle("open");

    // attach listener once
    if (isOpen && !listenerAttachedRef.current) {
      document.addEventListener("click", closeOnOutsideClick);
      listenerAttachedRef.current = true;
    }
  }, []);

  const closeOnOutsideClick = useCallback((e) => {
    const sidebar = document.querySelector(".sidebar");
    const toggleBtn = document.querySelector(".sidebar-toggle");

    if (!sidebar) return;

    const clickedToggle = toggleBtn?.contains(e.target);
    const clickedInsideSidebar = sidebar.contains(e.target);

    if (!clickedInsideSidebar && !clickedToggle) {
      sidebar.classList.remove("open");
      document.removeEventListener("click", closeOnOutsideClick);
      listenerAttachedRef.current = false;
    }
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>
        <h3>Dashboard</h3>
      </div>

      <div className="topbar-right">
        <span className="topbar-username">{user?.name}</span>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}

export default memo(Topbar);
