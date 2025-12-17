import React from "react";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_RENDER_ORDER,
} from "../constants";

export default function CalendarLegend() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
      {STATUS_RENDER_ORDER.map((status) => (
        <div
          key={status}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: STATUS_COLORS[status],
            }}
          />
          <span style={{ fontSize: 13 }}>
            {STATUS_LABELS[status]}
          </span>
        </div>
      ))}
    </div>
  );
}
