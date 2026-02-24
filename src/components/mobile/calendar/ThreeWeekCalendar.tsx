// Calendarbar.tsx → 3주치 전용으로 수정
import styled from "styled-components";
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";
import { useEffect, useState } from "react";
import { getSchedules } from "@/apis/schedules";
import { EventInput } from "@fullcalendar/core";

export default function ThreeWeekCalendar() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // 이번주 시작
  const startDate = addDays(weekStart, -7); // 지난주 시작
  const dates = Array.from({ length: 21 }, (_, i) => addDays(startDate, i)); // 3주치 날짜

  // 7일 단위로 잘라서 weeks 배열 생성
  const weeks = Array.from({ length: 3 }, (_, i) =>
    dates.slice(i * 7, i * 7 + 7),
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
      // 3주치에 걸친 달 정보 모으기
      const months = new Set<string>();
      dates.forEach((date) => {
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        months.add(`${y}-${m}`);
      });

      const events: EventInput[] = [];
      await Promise.all(
        Array.from(months).map(async (ym) => {
          const [year, month] = ym.split("-").map(Number);
          const res = await getSchedules(year, month);
          res.data.forEach((item: EventInput) => events.push(item));
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
          const start = parseISO(String(event.start));
          const end = parseISO(String(event.end));

          if (
            (isBefore(start, addDays(weekEndDate, 1)) ||
              isSameDay(start, weekEndDate)) &&
            (isAfter(end, addDays(weekStartDate, -1)) ||
              isSameDay(end, weekStartDate))
          ) {
            const startIdx = week.findIndex((d) =>
              isSameDay(
                d,
                isBefore(start, weekStartDate) ? weekStartDate : start,
              ),
            );
            const endIdx = week.findIndex((d) =>
              isSameDay(d, isAfter(end, weekEndDate) ? weekEndDate : end),
            );

            eventsInWeek.push({
              start: startIdx,
              end: endIdx,
              title: String(event.title),
            });
          }
        });

        // 이벤트 배치 (row 겹치지 않게)
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
  }, []);

  const maxRowsByWeek = weeks.map((_, weekIdx) => {
    const rows = eventsByWeek
      .filter((e) => e.weekIndex === weekIdx)
      .map((e) => e.row);
    return rows.length > 0 ? Math.max(...rows) + 1 : 1;
  });

  return (
    <CalendarContainer>
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
              return (
                <DayCell key={idx} $isToday={isToday}>
                  <DateNumber $isToday={isToday}>
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
