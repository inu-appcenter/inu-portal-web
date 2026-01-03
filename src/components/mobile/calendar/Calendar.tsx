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
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from "date-fns";
import { useEffect, useState } from "react";
import { getSchedules } from "@/apis/schedules";
import { EventInput } from "@fullcalendar/core";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";

// 아이콘 컴포넌트
const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 6L9 12L15 18"
      stroke="#333"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 18L15 12L9 6"
      stroke="#333"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface CalendarbarProps {
  mode?: "monthly" | "weekly";
  baseDate?: Date;
}

export default function Calendar({
  mode = "monthly",
  baseDate = new Date(),
}: CalendarbarProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(baseDate);
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

  const selectedMonthStr = format(currentDate, "yyyy-MM");

  // 주차 및 날짜 계산
  useEffect(() => {
    const weeksArr: Date[][] = [];

    if (mode === "weekly") {
      // 주간 모드: 이전 주, 현재 주, 다음 주 계산
      const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const prevWeekStart = subWeeks(currentWeekStart, 1);
      const nextWeekStart = addWeeks(currentWeekStart, 1);

      [prevWeekStart, currentWeekStart, nextWeekStart].forEach((start) => {
        const week = Array.from({ length: 7 }, (_, i) => addDays(start, i));
        weeksArr.push(week);
      });
    } else {
      // 월간 모드: 한 달 전체 계산
      const firstDay = startOfMonth(currentDate);
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

      for (let i = 0; i < dates.length; i += 7) {
        weeksArr.push(dates.slice(i, i + 7));
      }
    }
    setWeeks(weeksArr);
  }, [currentDate, mode]);

  // 이벤트 데이터 로드 및 배치
  useEffect(() => {
    if (weeks.length === 0) return;

    const fetchEvents = async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const res = await getSchedules(year, month);
      const events: EventInput[] = res.data;
      setMonthEvents(events);

      const parsedEvents: typeof eventsByWeek = [];

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
  }, [weeks, selectedMonthStr]);

  // 주차별 최대 행 계산
  const maxRowsByWeek = weeks.map((_, weekIdx) => {
    const rows = eventsByWeek
      .filter((e) => e.weekIndex === weekIdx)
      .map((e) => e.row);
    return rows.length > 0 ? Math.max(...rows) + 1 : 1;
  });

  const formatDateRange = (start?: any, end?: any) => {
    const s = format(parseISO(String(start)), "yyyy.MM.dd");
    const e = format(parseISO(String(end)), "yyyy.MM.dd");
    return `${s} ~ ${e}`;
  };

  const goToNext = () => setCurrentDate((prev) => addMonths(prev, 1));
  const goToPrev = () => setCurrentDate((prev) => subMonths(prev, 1));

  return (
    <CalendarContainer>
      <LayoutWrapper>
        <LeftSection>
          {/* 모드에 따른 헤더 노출 제어 */}
          {mode === "monthly" && (
            <CalendarHeader>
              <ArrowButton onClick={goToPrev}>
                <ChevronLeft />
              </ArrowButton>
              <MonthDisplay>{format(currentDate, "yyyy년 MM월")}</MonthDisplay>
              <ArrowButton onClick={goToNext}>
                <ChevronRight />
              </ArrowButton>
            </CalendarHeader>
          )}

          <Box>
            <Weekdays>
              {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                <WeekdayCell key={i} $index={i}>
                  {d}
                </WeekdayCell>
              ))}
            </Weekdays>

            <CalendarBody>
              {weeks.map((week, weekIdx) => {
                const maxRows = maxRowsByWeek[weekIdx];
                return (
                  <WeekRow key={weekIdx} $maxRows={maxRows}>
                    {week.map((date, idx) => {
                      const isToday = isSameDay(date, today);
                      // 모드에 따라 날짜 투명도 처리 기준 변경
                      const isActive =
                        mode === "weekly"
                          ? true
                          : date.getMonth() === currentDate.getMonth();
                      return (
                        <DayCell key={idx} $isCurrentMonth={isActive}>
                          {isToday && <TodayCircle />}
                          <DateNumber
                            $isToday={isToday}
                            $isCurrentMonth={isActive}
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
            </CalendarBody>
          </Box>
        </LeftSection>

        {mode === "monthly" && (
          <RightSection>
            <TitleContentArea
              title={
                mode === "monthly"
                  ? `${format(currentDate, "yyyy년 MM월")} 일정`
                  : "최근 일정"
              }
            >
              <Box>
                {monthEvents.length > 0 ? (
                  monthEvents.map((event, index) => (
                    <EventItem key={index}>
                      <EventInfo>
                        <EventDot />
                        <EventDate>
                          {formatDateRange(event.start, event.end)}
                        </EventDate>
                      </EventInfo>
                      <EventTitle>{event.title}</EventTitle>
                    </EventItem>
                  ))
                ) : (
                  <EmptyMessage>등록된 이벤트가 없습니다.</EmptyMessage>
                )}
              </Box>
            </TitleContentArea>
          </RightSection>
        )}
      </LayoutWrapper>
    </CalendarContainer>
  );
}

// 스타일 컴포넌트
const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1.5;
  width: 100%;
`;

const RightSection = styled.div`
  flex: 1;
  width: 100%;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 32px;
`;

const MonthDisplay = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #222;
`;

const ArrowButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const Weekdays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
  gap: 6px;
  width: 100%;
`;

const WeekdayCell = styled.div<{ $index: number }>`
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: ${({ $index }) =>
    $index === 0 ? "#F97171" : $index === 6 ? "#0A84FF" : "#4C4C4C"};
`;

const CalendarBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
`;

const WeekRow = styled.div<{ $maxRows: number }>`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  position: relative;
  min-height: ${({ $maxRows }) => 100 + ($maxRows - 1) * 24}px;
`;

const DayCell = styled.div<{ $isCurrentMonth: boolean }>`
  padding: 4px 0;
  background-color: #f9f9fb;
  border-radius: 4px;
  opacity: ${({ $isCurrentMonth }) => ($isCurrentMonth ? 1 : 0.4)};
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TodayCircle = styled.div`
  position: absolute;
  top: 5px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: #0a84ff;
  z-index: 1;
`;

const DateNumber = styled.div<{ $isToday: boolean; $isCurrentMonth: boolean }>`
  position: relative;
  z-index: 2;
  font-size: 14px;
  font-weight: ${({ $isToday }) => ($isToday ? "700" : "500")};
  line-height: 22px;
  color: ${({ $isToday }) => ($isToday ? "#fff" : "#000")};
`;

const EventBar = styled.div<{ $start: number; $end: number; $row: number }>`
  position: absolute;
  top: ${({ $row }) => 40 + $row * 24}px;
  left: ${({ $start }) =>
    `calc((100% - 24px) / 7 * ${$start} + ${$start * 4}px)`};
  width: ${({ $start, $end }) => {
    const count = $end - $start + 1;
    return `calc((100% - 24px) / 7 * ${count} + ${(count - 1) * 4}px)`;
  }};
  height: 20px;
  background-color: rgba(64, 113, 185, 1);
  color: white;
  font-size: 11px;
  padding: 0 8px;
  box-sizing: border-box;
  border-radius: 6px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 3;
`;

const EventItem = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-bottom: 1px solid #f2f2f7;
  &:last-child {
    border-bottom: none;
  }
`;

const EventInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EventDot = styled.div`
  width: 8px;
  height: 8px;
  background-color: rgba(64, 113, 185, 1);
  border-radius: 50%;
`;

const EventDate = styled.span`
  font-size: 12px;
  color: #8e8e93;
  font-weight: 500;
`;

const EventTitle = styled.strong`
  font-size: 15px;
  color: #1c1c1e;
  padding-left: 16px;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #8e8e93;
  font-size: 14px;
  margin: 20px 0;
`;
