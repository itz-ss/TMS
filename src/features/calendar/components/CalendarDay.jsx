import React from "react";
import { useNavigate } from "react-router-dom";
import StatusDots from "./StatusDots";

const CalendarDay = ({ day, year, month, data }) => {
  const navigate = useNavigate();

  if (!day) {
    return <div className="calendar-day empty" />;
  }

  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const handleClick = () => {
    navigate(`/dashboard/calendar/${dateStr}`);
  };

  return (
    <div className="calendar-day" onClick={handleClick}>
      <span className="day-number">{day}</span>

      {/* ✅ THIS MUST STAY */}
      <StatusDots data={data} />
    </div>
  );
};

export default CalendarDay;
