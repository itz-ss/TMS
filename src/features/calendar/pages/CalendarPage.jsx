import { useState } from "react";
import Calendar from "../components/Calendar";
import TaskList from "../../tasks/components/TaskList";
import "../styles/calendarPage.css"

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(null);

  // source of truth
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  return (
    <div className="calendar-page-layout">
      <Calendar 
        className="calendar-container"
        selectedDate={selectedDate}
        onDaySelect={setSelectedDate}
        employeeId={selectedEmployee}
      />

      <TaskList
        className="tasks-page"
        date={selectedDate}
        employeeId={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
      />
    </div>
  );
}
