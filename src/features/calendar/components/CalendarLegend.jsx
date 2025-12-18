import React from "react";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_RENDER_ORDER,
} from "../constants";
import "../styles/calendarLegend.css";


export default function CalendarLegend() {
  return (
    <div className="calendar-legend">
      {STATUS_RENDER_ORDER.map((status) => (
        <div key={status} className="calendar-legend-item">
          <div
            className="calendar-legend-dot"
            style={{ backgroundColor: STATUS_COLORS[status] }} // 🔑 MUST stay inline
          />
          <span className="calendar-legend-label">
            {STATUS_LABELS[status]}
          </span>
        </div>
      ))}
    </div>
  );
}
