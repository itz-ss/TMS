import React, { useEffect, useState } from "react";
import { useCalendar } from "../hooks";
import CalendarHeader from "../components/CalendarHeader";
import CalendarGrid from "../components/CalendarGrid";

import http from "../../../services/httpClient";
import { useAppSelector } from "../../../store/hooks";

import "../styles/calendar.css";

const CalendarPage = () => {
  const { getSummary } = useCalendar();

  // 🔐 Logged-in user
  const user = useAppSelector((s) => s.auth.user);

  // 👥 Employees (admin / manager only)
  const [employees, setEmployees] = useState([]);

  // 📅 Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  // 👤 Selected employee
  // "" = all employees (admin / manager)
  // user._id = own calendar (employee)
  const [employeeId, setEmployeeId] = useState("");

  // 📊 Calendar summary (dots data)
  const [summary, setSummary] = useState({});

  // YYYY-MM (month key)
  const monthKey = currentDate.toISOString().slice(0, 7);

  /* ============================================================
     1) FORCE EMPLOYEE VIEW TO OWN CALENDAR
  ============================================================ */
  useEffect(() => {
    if (user?.role === "employee") {
      setEmployeeId(user._id);
    }
  }, [user]);

  /* ============================================================
     2) LOAD CALENDAR SUMMARY (MONTH + EMPLOYEE)
  ============================================================ */
  useEffect(() => {
    getSummary({ month: monthKey, employeeId })
      .then((data) => setSummary(data || {}))
      .catch((err) => {
        console.error("Calendar summary error:", err);
        setSummary({});
      });
  }, [monthKey, employeeId]);

  /* ============================================================
     3) LOAD EMPLOYEES (ADMIN / MANAGER ONLY)
  ============================================================ */
  useEffect(() => {
    if (user?.role === "admin" || user?.role === "manager") {
      loadEmployees();
    }
  }, [user]);

  async function loadEmployees() {
    try {
      const res = await http.get("/users");
      const list = Array.isArray(res.data) ? res.data : [];
      // Optional: hide admins from dropdown
      setEmployees(list.filter((u) => u.role !== "admin"));
    } catch (err) {
      console.warn("Failed to load employees");
      setEmployees([]);
    }
  }

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <div className="calendar-page">

    {user?.role !== "employee" && !employeeId && (
      <p className="calendar-subtitle">
        Showing combined status for all employees
      </p>
    )}


      {/* HEADER: month navigation + employee filter */}
      <CalendarHeader
        date={currentDate}
        onChange={setCurrentDate}
        employeeId={employeeId}
        onEmployeeChange={setEmployeeId}
        employees={employees}
      />

      {/* GRID: days + status dots */}
      <CalendarGrid
        date={currentDate}
        summary={summary}
        employeeId={employeeId}
      />
    </div>
  );
};

export default CalendarPage;
