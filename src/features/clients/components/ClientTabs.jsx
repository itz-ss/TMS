// src/features/clients/components/ClientTabs.jsx
import React, { useEffect, useRef, useState } from "react";
import "../styles/clientTabs.css";

export default function ClientTabs({
  clients = [],
  selectedClient,
  setSelectedClient,
  taskCounts = {},
}) {
  const containerRef = useRef(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current) return;
      const { scrollWidth, clientWidth } = containerRef.current;
      setIsOverflow(scrollWidth > clientWidth);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [clients]);

  const totalCount = Object.values(taskCounts).reduce((a, b) => a + b, 0);

  if (isOverflow) {
    // 📱 MOBILE DROPDOWN
    return (
      <select
        className="client-dropdown"
        value={selectedClient || ""}
        onChange={(e) => setSelectedClient(e.target.value)}
      >
        <option value="">All ({totalCount})</option>

        {clients.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name} ({taskCounts[c._id] || 0})
          </option>
        ))}
      </select>
    );
  }

  // 💻 DESKTOP TABS
  return (
    <div className="client-tabs-container" ref={containerRef}>
      <button
        className={`client-tab ${selectedClient === "" ? "active" : ""}`}
        onClick={() => setSelectedClient("")}
      >
        All ({totalCount})
      </button>

      {clients.map((c) => (
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
