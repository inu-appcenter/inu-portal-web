import  { useRef, useEffect, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core/index.js";

import getCalendar from "../../utils/getCalendar";
import "./calendar.css";

export default function Calendarbar() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [month, setMonth] = useState<number>(0);
  const [year, setYear] = useState<number>(0);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>("");

  useEffect(() => {
    getCurrentMonth();
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

  const fetchCalendarData = async () => {
    try {
      const response = await getCalendar(year, month);
      setEvents(response.data);
    } catch (error) {
      console.error("학식 정보 조회 안됨");
    }
  };

  const getCurrentMonth = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const currentDate = calendarApi.getDate();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      setYear(year);
      setMonth(month);
    }
  };

  const handleDateChange = () => {
    getCurrentMonth();
  };

  const handleEventMouseEnter = (event:EventInput) => {
    const element = event.el.children[0].children[0].children[0].children[0].innerText;
    
    setHoveredEvent(element);
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent("");
  };

  return (
    <div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin]}
        initialView={"dayGridMonth"}
        headerToolbar={{ start: "title", end: "prev,next" }}
        eventTextColor="gray"
        datesSet={handleDateChange}
        events={events}
        eventMouseEnter={handleEventMouseEnter}
        eventMouseLeave={handleEventMouseLeave}
      />
      {hoveredEvent && (
        <div className="event-tooltip">
          <p>{hoveredEvent}</p>
        </div>
      )}
    </div>
  );
}
