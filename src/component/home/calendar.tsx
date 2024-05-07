import { useRef, useEffect, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core/index.js";

import getCalendar from "../../utils/getCalendar";
import "./calendar.css";

export default function Calendarbar() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [month, setMonth] = useState<number>(undefined);
  const [year, setYear] = useState<number>(undefined);

  useEffect(() => {
    getCurrentMonth();
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

  const fetchCalendarData = async () => {
    try {
      const response = await getCalendar(year, month);
      console.log(response, "return 값");
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
      console.log("현재 month", month, year);
    }
  };

  const handleDateChange = () => {
    getCurrentMonth();
  };

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin]}
      initialView={"dayGridMonth"}
      headerToolbar={{ start: "title", end: "prev,next" }}
      eventTextColor="gray"
      datesSet={handleDateChange}
      events={events} 
    />
  );
}
