import { useRef, useEffect, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core/index.js";
import { calendarInfo } from "../../resource/string/calendar";

export default function Calendarbar() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    addInitialEvents();
  }, []);

  const addInitialEvents = () => {
    // Instead of direct assignment, use setEvents function to update the state
    setEvents(calendarInfo);
    console.log(events);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarInfo.forEach((event) => {
        calendarApi.addEvent(event);
      });
    }
  };

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin]}
      initialView={"dayGridMonth"}
      headerToolbar={{ start: "title", end: "prev,next" }}
      eventTextColor='gray'
    />
  );
}
