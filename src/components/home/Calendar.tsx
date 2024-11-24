import styled from "styled-components";
import { useRef, useEffect, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core/index.js";
import { getSchedules } from "apis/schedules";

export default function Calendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [day, setDay] = useState<{ year: number; month: number }>({
    year: 0,
    month: 0,
  });
  const [hoveredEvent, setHoveredEvent] = useState<string | null>("");

  useEffect(() => {
    getCurrentMonth();
  }, []);

  useEffect(() => {
    if (day.year && day.month) {
      fetchCalendarData();
    }
  }, [day]);

  const fetchCalendarData = async () => {
    try {
      const response = await getSchedules(day.year, day.month);
      setEvents(response.data);
    } catch (error) {
      console.error("학사일정 가져오기 실패", error);
    }
  };

  const getCurrentMonth = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const currentDate = calendarApi.getDate();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      setDay({ year: year, month: month });
    }
  };

  const handleDateChange = () => {
    getCurrentMonth();
  };

  const handleEventMouseEnter = (event: EventInput) => {
    const element =
      event.el.children[0].children[0].children[0].children[0].innerText;
    setHoveredEvent(element);
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent("");
  };

  return (
    <CalendarWrapper>
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
    </CalendarWrapper>
  );
}

const CalendarWrapper = styled.div`
  height: 90%;
  display: flex;
  justify-content: center;
  position: relative;

  .fc {
    width: 100%;
    height: 100%;
  }

  .fc-header-toolbar {
    background-color: #fff !important;
  }

  .fc-toolbar-title {
    font-size: 28px;
    font-weight: 700;
    color: #0e4d9d;
  }

  .fc-prev-button,
  .fc-next-button {
    background-color: transparent;
    border: none;
    color: #0e4d9d !important;
    border-radius: 4px;
    padding: 5px 10px;
    transition: background-color 0.3s ease;
  }

  .fc-prev-button:hover,
  .fc-next-button:hover {
    background-color: transparent;
  }

  /* FullCalendar 이벤트 스타일 */
  .fc-event {
    background-color: #f9fafb;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 5px;
    margin-bottom: 4px;
  }

  /* FullCalendar 이벤트 타이틀 스타일 */
  .fc-event-title {
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }

  /* FullCalendar 이벤트 시간 스타일 */
  .fc-event-time {
    font-size: 12px;
    color: #666;
  }

  /* FullCalendar 날짜 셀 스타일 */
  .fc-day {
    padding: 10px;
    text-align: center;
  }

  /* FullCalendar 날짜 셀 내부 스타일 */
  .fc-day-content {
    font-size: 14px;
    color: #333;
  }

  /* FullCalendar 오늘 날짜 스타일 */
  .fc-today {
    background-color: #fff !important;
    border-radius: 50%;
  }
  .fc .fc-daygrid-day.fc-day-today {
    background-color: #fff !important;
    color: #356eff;
  }
  .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
    color: #f2a806;
    font-weight: bolder;
  }
  .important 

  /* FullCalendar 선택된 날짜 스타일 */
  .fc-highlight {
    background-color: #e92c2c !important;
  }

  /* FullCalendar 이벤트 배경색 스타일 */
  .fc-event-bg {
    background-color: #ff4081 !important;
    border-radius: 4px;
  }

  .fc-event {
    background-color: rgba(0, 133, 255, 0.1) !important;
  }

  .fc-event-title {
    color: rgba(0, 133, 255, 1) !important;
  }
  /* FullCalendar 이벤트 배경색에 대한 텍스트 스타일 */
  .fc-event-inner {
    color: #e92c2c;
    font-weight: bold;
  }

  .fc-day-sun a {
    color: red;
  }

  .event-tooltip {
    background: linear-gradient(
      to right,
      #eef4fc 0%,
      #c3dcfa 50%,
      #aac9ee 100%
    );
    width: 260px;
    border-radius: 8px;
    position: absolute;
    margin: 0 auto;
    text-align: center;
    bottom: -14%;
  }
`;
