import React from "react";
import CalendarDay from "./CalendarDay";

const CalendarGrid = ({ date, summary }) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="calendar-grid">
      {cells.map((day, i) => (
        <CalendarDay
          key={i}
          day={day}
          year={year}
          month={month}
          data={day ? summary[`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`] : null}
        />
      ))}
    </div>
  );
};

export default CalendarGrid;
