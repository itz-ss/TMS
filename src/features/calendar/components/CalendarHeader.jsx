import React from "react";
import { useAppSelector } from "../../../store/hooks";

const CalendarHeader = ({
  date,
  onChange,
  employeeId,
  onEmployeeChange,
  employees,
}) => {
  // ✅ SINGLE SOURCE OF TRUTH
  const user = useAppSelector((s) => s.auth.user);

  const prevMonth = () =>
    onChange(new Date(date.getFullYear(), date.getMonth() - 1));

  const nextMonth = () =>
    onChange(new Date(date.getFullYear(), date.getMonth() + 1));

  return (
    <div className="calendar-header">
      <button onClick={prevMonth}>←</button>

      <h2>
        {date.toLocaleString("default", { month: "long" })}{" "}
        {date.getFullYear()}
      </h2>

      <button onClick={nextMonth}>→</button>

      {/* ✅ Admin / Manager only */}
      {user?.role !== "employeeId" && (
        <select
          value={employeeId}
          onChange={(e) => onEmployeeChange(e.target.value)}
          style={{ marginLeft: 12 }}
        >
          <option value="">All Employees</option>
          {employees.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CalendarHeader;
