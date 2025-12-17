import { useState } from "react";
import Calendar from "../components/Calendar";
import TaskList from "../../tasks/components/TaskList";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(null);

  // source of truth
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <Calendar
        selectedDate={selectedDate}
        onDaySelect={setSelectedDate}
        employeeId={selectedEmployee}
      />

      <TaskList
        date={selectedDate}
        employeeId={selectedEmployee}
        onEmployeeChange={setSelectedEmployee} // ✅ RENAMED PROP
      />
    </div>
  );
}
