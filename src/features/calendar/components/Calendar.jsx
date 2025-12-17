import React, { useEffect, useState } from "react";
import { fetchCalendarSummary } from "../api";
import {
  STATUS_COLORS,
  STATUS_RENDER_ORDER,
} from "../constants";

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
   DATE HELPERS (LOCAL TO CALENDAR)
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
     FETCH CALENDAR SUMMARY
  ========================================================= */
  useEffect(() => {
    const ym = `${year}-${String(month + 1).padStart(2, "0")}`;

    fetchCalendarSummary({ month: ym, employeeId })
      .then((res) => {
        setSummary(res.summary || {});
      })
      .catch(console.error);
  }, [year, month, employeeId]);

  useEffect(() => {
    console.log("🟢 Calendar summary for employee:", employeeId, summary);
  }, [summary, employeeId]);

  /* =========================================================
     CALENDAR GRID LOGIC
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
    <div>
      {/* ===== Header ===== */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
          ◀
        </button>

        <h3>
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h3>

        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
          ▶
        </button>
      </div>

      {/* ===== Calendar Grid ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 10,
          marginTop: 12,
        }}
      >
        {cells.map((day, index) => {
          if (!day) return <div key={index} />;

          const dateKey = toDateKey(year, month, day);
          const daySummary = summary[dateKey];

          // ✅ DEBUG LOG — CORRECT PLACE
          if (daySummary) {
            console.log(
              "📅",
              dateKey,
              "STATUS KEYS:",
              Object.keys(daySummary)
            );
          }

          const dots = getDotsForDay(daySummary);
          const isSelected = selectedDate === dateKey;

          return (
            <div
              key={dateKey}
              onClick={() => onDaySelect(dateKey)}
              style={{
                border: isSelected ? "2px solid #2563eb" : "1px solid #ddd",
                backgroundColor: isSelected ? "#e8f0ff" : "white",
                padding: 8,
                textAlign: "center",
                cursor: "pointer",
                borderRadius: 6,
                transition: "all 0.15s ease",
              }}
            >
              <div>{day}</div>

              {/* ===== DOTS ===== */}
              {dots.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 4,
                    marginTop: 6,
                    maxHeight: 16,
                    overflow: "hidden",
                  }}
                >
                  {dots.map((dot) => (
                    <div
                      key={dot.status}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: dot.color,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "black",
                    margin: "6px auto 0",
                    opacity: 0.6,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
