import { useRef, useEffect, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar, { EventInput } from "@fullcalendar/react";
import { getSchedules } from "../../../utils/API/Schedules";
import styled from "styled-components";

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
    if (year && month) {
      fetchCalendarData(); 
    }
  }, [year, month]);

  const fetchCalendarData = async () => {
    try {
      const response = await getSchedules(year, month);
      if (response.status === 200) {
        setEvents(response.body.data);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("일정 정보 조회 안됨", error);
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

  const handleEventMouseEnter = (event: any) => {
    const element = event.el?.children[0]?.children[0]?.children[0]?.children[0]?.innerText;
    setHoveredEvent(element);
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent("");
  };


  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); 
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
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
          right: "next"
        }}
        events={events}
        eventTextColor="gray"
        datesSet={handleDateChange}
        eventMouseEnter={handleEventMouseEnter}
        eventMouseLeave={handleEventMouseLeave}
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
                    <EventDot/>
                    <span>{formatDate(event.start)} ~ {formatDate(event.end)}
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
  padding: 20px;
  height: 60%;

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
    font-family: Lato;
    font-size: 16px;
    font-weight: 600;
    color: #828282;
  }
  .fc .fc-button-primary {
    background-color: white;
    border: none;
    color: #828282 !important;
  }
`;

const EventsList = styled.div`
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 40%;
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
    color:#535353;
    margin-bottom: 10px;
  }
`;

const EventDot = styled.div`
  width: 8px;
  height: 8px;
  background-color: #9CAFE2; 
  border-radius: 50%;
  margin-right: 10px;
`;