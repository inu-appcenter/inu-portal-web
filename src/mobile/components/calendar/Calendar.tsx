// Calendarbar.tsx
import styled from "styled-components";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useEffect, useState } from "react";
import { getSchedules } from "apis/schedules";
import { EventInput } from "@fullcalendar/core";

export default function Calendarbar() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(today, "yyyy-MM"),
  );
  const [monthEvents, setMonthEvents] = useState<EventInput[]>([]);
  const [weeks, setWeeks] = useState<Date[][]>([]);
  const [eventsByWeek, setEventsByWeek] = useState<
    {
      weekIndex: number;
      start: number;
      end: number;
      title: string;
      row: number;
    }[]
  >([]);

  // 1. 주(weeks) 계산
  useEffect(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const firstDay = startOfMonth(new Date(year, month - 1));
    const lastDay = endOfMonth(firstDay);

    const calendarStart = startOfWeek(firstDay, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(lastDay, { weekStartsOn: 6 });

    const totalDays =
      Math.ceil(
        (calendarEnd.getTime() - calendarStart.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    const dates = Array.from({ length: totalDays }, (_, i) =>
      addDays(calendarStart, i),
    );

    const weeksArr: Date[][] = [];
    for (let i = 0; i < dates.length; i += 7) {
      weeksArr.push(dates.slice(i, i + 7));
    }
    setWeeks(weeksArr);
  }, [selectedMonth]);

  // 2. 이벤트 불러와서 주별로 배치
  useEffect(() => {
    if (weeks.length === 0) return;

    const fetchEvents = async () => {
      const [year, month] = selectedMonth.split("-").map(Number);
      const res = await getSchedules(year, month);
      console.log(res);
      setMonthEvents(res.data);
      const events: EventInput[] = res.data;

      const parsedEvents: {
        weekIndex: number;
        start: number;
        end: number;
        title: string;
        row: number;
      }[] = [];

      weeks.forEach((week, weekIndex) => {
        const weekStart = week[0];
        const weekEnd = week[6];

        const eventsInWeek = events
          .map((event) => {
            const start = parseISO(String(event.start));
            const end = parseISO(String(event.end));
            if (
              (isBefore(start, addDays(weekEnd, 1)) ||
                isSameDay(start, weekEnd)) &&
              (isAfter(end, addDays(weekStart, -1)) ||
                isSameDay(end, weekStart))
            ) {
              const startIdx = week.findIndex((d) =>
                isSameDay(d, isBefore(start, weekStart) ? weekStart : start),
              );
              const endIdx = week.findIndex((d) =>
                isSameDay(d, isAfter(end, weekEnd) ? weekEnd : end),
              );
              return {
                start: startIdx,
                end: endIdx,
                title: String(event.title),
              };
            }
            return null;
          })
          .filter(Boolean) as { start: number; end: number; title: string }[];

        const placed: typeof parsedEvents = [];
        eventsInWeek.forEach((ev) => {
          let row = 0;
          while (
            placed.some(
              (p) => p.row === row && ev.start <= p.end && ev.end >= p.start,
            )
          ) {
            row++;
          }
          placed.push({ ...ev, weekIndex, row });
        });

        parsedEvents.push(...placed);
      });

      setEventsByWeek(parsedEvents);
    };

    fetchEvents();
  }, [weeks, selectedMonth]);

  const maxRowsByWeek = weeks.map((_, weekIdx) => {
    const rows = eventsByWeek
      .filter((e) => e.weekIndex === weekIdx)
      .map((e) => e.row);
    return rows.length > 0 ? Math.max(...rows) + 1 : 1;
  });
  const formatDate = (date?: Date | string | number): string => {
    if (date === undefined || date === null) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

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
    <CalendarContainer>
      <MonthSelector>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </MonthSelector>

      <Weekdays>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </Weekdays>

      {weeks.map((week, weekIdx) => {
        const maxRows = maxRowsByWeek[weekIdx];
        return (
          <WeekRow key={weekIdx} $maxRows={maxRows}>
            {week.map((date, idx) => {
              const isToday = isSameDay(date, today);
              const isCurrentMonth =
                date.getMonth() === new Date(selectedMonth).getMonth();
              return (
                <DayCell
                  key={idx}
                  $isToday={isToday}
                  $isCurrentMonth={isCurrentMonth}
                >
                  <DateNumber
                    $isToday={isToday}
                    $isCurrentMonth={isCurrentMonth}
                  >
                    {format(date, "d")}
                  </DateNumber>
                </DayCell>
              );
            })}
            {eventsByWeek
              .filter((e) => e.weekIndex === weekIdx)
              .map((event, i) => (
                <EventBar
                  key={i}
                  $start={event.start}
                  $end={event.end}
                  $row={event.row}
                >
                  {event.title}
                </EventBar>
              ))}
          </WeekRow>
        );
      })}
      <EventsList>
        {monthEvents.length > 0 ? (
          monthEvents.map((event, index) => (
            <EventItem key={index}>
              <div>
                <EventDot />
                <span>
                  {handleEventDate(event.start)} ~{handleEventDate(event.end)}
                </span>
              </div>
              <strong>{event.title}</strong>
            </EventItem>
          ))
        ) : (
          <p>이벤트가 없습니다.</p>
        )}{" "}
      </EventsList>
    </CalendarContainer>
  );
}

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
`;

const MonthSelector = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
`;

const Weekdays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: gray;
  font-size: 14px;
`;

const WeekRow = styled.div<{ $maxRows: number }>`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
  min-height: ${({ $maxRows }) => 80 + ($maxRows - 1) * 24}px;
  //border-top: 1px solid #ddd;
  //border-left: 1px solid #ddd;
  //& > div {
  //  border-right: 1px solid #ddd;
  //  border-bottom: 1px solid #ddd;
  //}
`;

const DayCell = styled.div<{ $isToday: boolean; $isCurrentMonth: boolean }>`
  padding: 6px;
  background-color: ${({ $isToday }) => ($isToday ? "#e0f0ff" : "#fff")};
  opacity: ${({ $isCurrentMonth }) => ($isCurrentMonth ? 1 : 0.4)};
  text-align: center;
`;

const DateNumber = styled.div<{ $isToday: boolean; $isCurrentMonth: boolean }>`
  font-weight: ${({ $isToday }) => ($isToday ? "bold" : "normal")};
  color: ${({ $isToday, $isCurrentMonth }) =>
    $isToday ? "#007aff" : $isCurrentMonth ? "#000" : "#888"};
`;

const EventBar = styled.div<{ $start: number; $end: number; $row: number }>`
  position: absolute;
  top: ${({ $row }) => 35 + $row * 24}px;
  left: ${({ $start }) => `calc(100% / 7 * ${$start})`};
  width: ${({ $start, $end }) => `calc(100% / 7 * (${$end - $start + 1}))`};
  height: 20px;
  background-color: rgba(64, 113, 185, 1);
  font-size: 11px;
  padding: 2px 6px;
  box-sizing: border-box;
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  color: white;
`;

const EventsList = styled.div`
  padding: 15px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const EventItem = styled.div`
  //border-bottom: 1px solid black;
  width: 100%;

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
