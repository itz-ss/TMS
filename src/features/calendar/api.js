// src/features/calendar/api.js
import api from "../../lib/axios";

export function fetchCalendarSummary(params) {
  return api
    .get("/calendar/summary", { params })
    .then((res) => res.data);
}
