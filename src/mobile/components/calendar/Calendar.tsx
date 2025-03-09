import { useRef, useEffect, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core/index.js";
import { getSchedules } from "apis/schedules";
import styled from "styled-components";

export default function Calendarbar() {
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

  const handleEventMouseEnter = (event: any) => {
    const element =
      event.el?.children[0]?.children[0]?.children[0]?.children[0]?.innerText;
    setHoveredEvent(element);
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent(null);
  };

  const formatDate = (date?: Date | string | number): string => {
    if (date === undefined || date === null) return "";

    // Convert numeric date (timestamp) to Date
    if (typeof date === "number") {
      date = new Date(date);
    } else if (typeof date === "string") {
      date = new Date(date);
    } else if (!(date instanceof Date)) {
      return "";
    }

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const handleEventDate = (date: EventInput["start"]) => {
    if (
      typeof date === "string" ||
      typeof date === "number" ||
      date instanceof Date
    ) {
      return formatDate(date);
    }
    return "";
  };

  return (
    <CalendarWrapper>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin]}
        initialView={"dayGridMonth"}
        headerToolbar={{
          left: "prev",
          center: "title",
          right: "next",
        }}
        events={events}
        eventTextColor="gray"
        datesSet={handleDateChange}
        eventMouseEnter={handleEventMouseEnter}
        eventMouseLeave={handleEventMouseLeave}
        height="500px"
      />
      {hoveredEvent && (
        <div className="event-tooltip">
          <p>{hoveredEvent}</p>
        </div>
      )}
      <EventsList>
        {events.length > 0 ? (
          events.map((event, index) => (
            <EventItem key={index}>
              <div>
                <EventDot />
                <span>
                  {handleEventDate(event.start)} ~ {handleEventDate(event.end)}
                </span>
              </div>
              <strong>{event.title}</strong>
            </EventItem>
          ))
        ) : (
          <p>이벤트가 없습니다.</p>
        )}
      </EventsList>
    </CalendarWrapper>
  );
}

const CalendarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  .fc-event {
    background-color: rgba(26, 36, 44, 0.1) !important;
  }

  .fc-event-title {
    color: #151e27 !important;
  }
  .fc .fc-button-primary {
    padding-left: 0px;
  }
  .fc .fc-toolbar-title {
    font-size: 16px;
    font-weight: 600;
    color: #828282;
  }
  .fc .fc-button-primary {
    background-color: white;
    border: none;
    color: #828282 !important;
  }

  // 요일 폰트
  .fc-col-header-cell-cushion {
    font-family: Lato;
    font-weight: 500;
    font-size: 14px;
    text-transform: uppercase;
  }

  .fc-theme-standard td {
    border: none;
  }

  .fc-theme-standard th {
    border: none;
  }

  .fc-theme-standard .fc-scrollgrid {
    border: none;
  }

  // 날짜 내의 숫자
  .fc-daygrid-day-top {
    font-family: Lato;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // 다른 달의 날짜 보이지 않기
  .fc-day-other {
    color: transparent;
  }

  .event-tooltip {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    border: 1px solid #828282;
    border-radius: 4px;
    padding: 10px 0;
    p {
      margin: 0;
    }
  }
`;

const EventsList = styled.div`
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: auto;
`;

const EventItem = styled.div`
  margin-bottom: 1px solid black;
  div {
    display: flex;
  }
  strong {
    display: block;
    font-size: 16px;
    margin-bottom: 20px;
  }
  span {
    font-size: 11px;
    line-height: 8px;
    color: #535353;
    margin-bottom: 10px;
  }
`;

const EventDot = styled.div`
  width: 8px;
  height: 8px;
  background-color: #9cafe2;
  border-radius: 50%;
  margin-right: 10px;
`;
