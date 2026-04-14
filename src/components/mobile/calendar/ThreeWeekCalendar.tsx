import { useEffect, useState } from "react";
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";
import styled from "styled-components";
import { getSchedules } from "@/apis/schedules";
import { Schedule } from "@/types/schedules";

export default function ThreeWeekCalendar() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const startDate = addDays(weekStart, -7);
  const dates = Array.from({ length: 21 }, (_, index) =>
    addDays(startDate, index),
  );

  const weeks = Array.from({ length: 3 }, (_, index) =>
    dates.slice(index * 7, index * 7 + 7),
  );

  const [eventsByWeek, setEventsByWeek] = useState<
    {
      weekIndex: number;
      start: number;
      end: number;
      title: string;
      row: number;
    }[]
  >([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const months = new Set<string>();

      dates.forEach((date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        months.add(`${year}-${month}`);
      });

      const events: Schedule[] = [];

      await Promise.all(
        Array.from(months).map(async (yearMonth) => {
          const [year, month] = yearMonth.split("-").map(Number);
          const response = await getSchedules(year, month);
          response.data.forEach((item) => events.push(item));
        }),
      );

      const parsedEvents: {
        weekIndex: number;
        start: number;
        end: number;
        title: string;
        row: number;
      }[] = [];

      weeks.forEach((week, weekIndex) => {
        const weekStartDate = week[0];
        const weekEndDate = week[6];

        const eventsInWeek: {
          start: number;
          end: number;
          title: string;
        }[] = [];

        events.forEach((event) => {
          const start = parseISO(event.start);
          const end = parseISO(event.end);

          if (
            (isBefore(start, addDays(weekEndDate, 1)) ||
              isSameDay(start, weekEndDate)) &&
            (isAfter(end, addDays(weekStartDate, -1)) ||
              isSameDay(end, weekStartDate))
          ) {
            const startIdx = week.findIndex((date) =>
              isSameDay(
                date,
                isBefore(start, weekStartDate) ? weekStartDate : start,
              ),
            );
            const endIdx = week.findIndex((date) =>
              isSameDay(date, isAfter(end, weekEndDate) ? weekEndDate : end),
            );

            eventsInWeek.push({
              start: startIdx,
              end: endIdx,
              title: event.title,
            });
          }
        });

        const placed: typeof parsedEvents = [];

        eventsInWeek.forEach((event) => {
          let row = 0;

          while (
            placed.some(
              (placedEvent) =>
                placedEvent.row === row &&
                event.start <= placedEvent.end &&
                event.end >= placedEvent.start,
            )
          ) {
            row++;
          }

          placed.push({ ...event, weekIndex, row });
        });

        parsedEvents.push(...placed);
      });

      setEventsByWeek(parsedEvents);
    };

    fetchEvents();
  }, []);

  const maxRowsByWeek = weeks.map((_, weekIndex) => {
    const rows = eventsByWeek
      .filter((event) => event.weekIndex === weekIndex)
      .map((event) => event.row);

    return rows.length > 0 ? Math.max(...rows) + 1 : 1;
  });

  return (
    <CalendarContainer>
      <Weekdays>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
          <div key={index}>{day}</div>
        ))}
      </Weekdays>

      {weeks.map((week, weekIndex) => {
        const maxRows = maxRowsByWeek[weekIndex];

        return (
          <WeekRow key={weekIndex} $maxRows={maxRows}>
            {week.map((date, index) => {
              const isToday = isSameDay(date, today);

              return (
                <DayCell key={index} $isToday={isToday}>
                  <DateNumber $isToday={isToday}>{format(date, "d")}</DateNumber>
                </DayCell>
              );
            })}

            {eventsByWeek
              .filter((event) => event.weekIndex === weekIndex)
              .map((event, index) => (
                <EventBar
                  key={index}
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
    </CalendarContainer>
  );
}

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
`;

const Weekdays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: #888;
  font-size: 14px;
`;

const WeekRow = styled.div<{ $maxRows: number }>`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
  min-height: ${({ $maxRows }) => 80 + ($maxRows - 1) * 24}px;
  border-top: 1px solid #ddd;
  border-left: 1px solid #ddd;

  & > div {
    border-right: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  }
`;

const DayCell = styled.div<{ $isToday: boolean }>`
  padding: 6px;
  background-color: ${({ $isToday }) => ($isToday ? "#e0f0ff" : "#fff")};
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DateNumber = styled.div<{ $isToday: boolean }>`
  font-weight: ${({ $isToday }) => ($isToday ? "bold" : "normal")};
  color: ${({ $isToday }) => ($isToday ? "#007aff" : "#000")};
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  color: white;
`;
