// src/features/clients/components/ClientTabs.jsx
import React, { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../store/hooks";   // ⬅️ ADD THIS
import "../styles/clientTabs.css";

export default function ClientTabs({
  clients = [],
  selectedClient,
  setSelectedClient,
  taskCounts = {},
}) {
  const containerRef = useRef(null);
  const [isOverflow, setIsOverflow] = useState(false);

  // ⬅️ GET USER ROLE
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role;

  // ⬅️ FILTER CLIENTS: admins & managers see all
  const filteredClients =
    role === "admin" || role === "manager"
      ? clients
      : clients.filter((c) => (taskCounts[c._id] || 0) > 0);

  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current) return;
      const { scrollWidth, clientWidth } = containerRef.current;
      setIsOverflow(scrollWidth > clientWidth);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [filteredClients]);

  const totalCount = Object.values(taskCounts).reduce((a, b) => a + b, 0);

  /* --------------------  MOBILE DROPDOWN -------------------- */
  if (isOverflow) {
    return (
      <select
        className="client-dropdown"
        value={selectedClient || ""}
        onChange={(e) => setSelectedClient(e.target.value)}
      >
        <option value="">All ({totalCount})</option>

        {filteredClients.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name} ({taskCounts[c._id] || 0})
          </option>
        ))}
      </select>
    );
  }

  /* -------------------- DESKTOP TABS -------------------- */
  return (
    <div className="client-tabs-container" ref={containerRef}>
      <button
        className={`client-tab ${selectedClient === "" ? "active" : ""}`}
        onClick={() => setSelectedClient("")}
      >
        All ({totalCount})
      </button>

      {filteredClients.map((c) => (
        <button
          key={c._id}
          className={`client-tab ${selectedClient === c._id ? "active" : ""}`}
          onClick={() => setSelectedClient(c._id)}
        >
          {c.name} ({taskCounts[c._id] || 0})
        </button>
      ))}
    </div>
  );
}
