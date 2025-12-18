import React, { useEffect, useState } from "react";
import { fetchCalendarSummary } from "../api";
import {
  STATUS_COLORS,
  STATUS_RENDER_ORDER,
} from "../constants";
import "../styles/calendar.css"

function getDotsForDay(daySummary) {
  if (!daySummary || typeof daySummary !== "object") return [];

  return STATUS_RENDER_ORDER
    .filter((status) => daySummary[status] === true)
    .map((status) => ({
      status,
      color: STATUS_COLORS[status],
    }));
}

/* =========================================================
   DATE HELPERS
========================================================= */
function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

export default function Calendar({ onDaySelect, selectedDate, employeeId }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summary, setSummary] = useState({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  /* =========================================================
     FETCH SUMMARY
  ========================================================= */
  useEffect(() => {
    const ym = `${year}-${String(month + 1).padStart(2, "0")}`;

    fetchCalendarSummary({ month: ym, employeeId })
      .then((res) => {
        setSummary(res.summary || {});
      })
      .catch(console.error);
  }, [year, month, employeeId]);

  /* =========================================================
     GRID LOGIC
  ========================================================= */
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="calendar-container">
      {/* ===== HEADER (DATE ON TOP) ===== */}
      <div className="calendar-header">
        <button
          className="calendar-nav-btn"
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
        >
          ◀
        </button>

        <h3 className="calendar-title">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h3>

        <button
          className="calendar-nav-btn"
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
        >
          ▶
        </button>
      </div>

      {/* ===== GRID ===== */}
      <div className="calendar-grid">
        {cells.map((day, index) => {
          if (!day) return <div key={index} className="calendar-empty-cell" />;

          const dateKey = toDateKey(year, month, day);
          const daySummary = summary[dateKey];
          const dots = getDotsForDay(daySummary);
          const isSelected = selectedDate === dateKey;

          return (
            <div
              key={dateKey}
              className={`calendar-day ${isSelected ? "selected" : ""}`}
              onClick={() => onDaySelect(dateKey)}
            >
              <div className="calendar-day-number">{day}</div>

              {/* ===== DOTS ===== */}
              {dots.length > 0 ? (
                <div className="calendar-dots">
                  {dots.map((dot) => (
                    <div
                      key={dot.status}
                      className="calendar-dot"
                      style={{ backgroundColor: dot.color }} // 🔑 MUST STAY INLINE
                    />
                  ))}
                </div>
              ) : (
                <div className="calendar-dot calendar-dot-empty" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
