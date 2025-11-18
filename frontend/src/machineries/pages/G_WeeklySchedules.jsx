import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const G_WeeklySchedules = () => {
  const events = [
    {
      title: "4-Wheel Tractor - Brgy 1",
      start: new Date(2025, 1, 10, 8, 0),  // Feb = 1
      end: new Date(2025, 1, 10, 17, 0),
    },
    {
      title: "Hand Tractor - Brgy 2",
      start: new Date(2025, 1, 11, 8, 0),
      end: new Date(2025, 1, 11, 17, 0),
    },
  ];
  const [date, setDate] = useState(new Date());
  return (
    <div style={{ height: "90vh", padding: "20px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        defaultView="month"
        views={["month"]}
        date={date}
        onNavigate={(newDate) => setDate(newDate)}
        step={60}
        timeslots={1}
      />
    </div>
  )
}

export default G_WeeklySchedules