import styled from "styled-components";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
  subWeeks,
  subMonths,
} from "date-fns";
import { Fragment, useEffect, useState } from "react";
import { getMyDeptSchedules, getSchedules } from "@/apis/schedules";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import {
  ScheduleEvent,
  ScheduleType,
  toScheduleEvent,
} from "@/types/schedules";
import EventItem from "@/components/mobile/calendar/EventItem";
import ScheduleModal from "@/components/mobile/calendar/ScheduleModal";
import Divider from "@/components/common/Divider";

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
  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(baseDate);
  const [monthEvents, setMonthEvents] = useState<ScheduleEvent[]>([]);
  const [weeks, setWeeks] = useState<Date[][]>([]);
  const [eventsByWeek, setEventsByWeek] = useState<
    {
      weekIndex: number;
      start: number;
      end: number;
      title: string;
      row: number;
      type: ScheduleType;
    }[]
  >([]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const selectedDateEvents = monthEvents.filter((event) => {
    if (!selectedDate) return false;
    const start = parseISO(String(event.start));
    const end = parseISO(String(event.end));
    // 선택한 날짜가 시작일과 종료일 사이에 있는지 확인
    return (
      (isAfter(selectedDate, addDays(start, -1)) ||
        isSameDay(selectedDate, start)) &&
      (isBefore(selectedDate, addDays(end, 1)) || isSameDay(selectedDate, end))
    );
  });

  const selectedMonthStr = format(currentDate, "yyyy-MM");

  // 주차 및 날짜 계산
  useEffect(() => {
    const weeksArr: Date[][] = [];

    if (mode === "weekly") {
      const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const prevWeekStart = subWeeks(currentWeekStart, 1);
      const nextWeekStart = addWeeks(currentWeekStart, 1);

      [prevWeekStart, currentWeekStart, nextWeekStart].forEach((start) => {
        const week = Array.from({ length: 7 }, (_, i) => addDays(start, i));
        weeksArr.push(week);
      });
    } else {
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

      // 학교 및 학과 일정 동시 호출
      const [resSchool, resDept] = await Promise.all([
        getSchedules(year, month),
        getMyDeptSchedules(year, month),
      ]);

      // 타입 부여 및 데이터 통합
      const schoolEvents = resSchool.data.map((schedule) =>
        toScheduleEvent(schedule, "school"),
      );
      const deptEvents = resDept.data.map((schedule) =>
        toScheduleEvent(schedule, "dept"),
      );
      const combinedEvents = [...schoolEvents, ...deptEvents];

      setMonthEvents(combinedEvents);

      const parsedEvents: typeof eventsByWeek = [];

      weeks.forEach((week, weekIndex) => {
        const weekStart = week[0];
        const weekEnd = week[6];

        const eventsInWeek = combinedEvents
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
                type: event.type,
              };
            }
            return null;
          })
          .filter(Boolean) as {
          start: number;
          end: number;
          title: string;
          type: ScheduleType;
        }[];

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

  const goToNext = () => setCurrentDate((prev) => addMonths(prev, 1));
  const goToPrev = () => setCurrentDate((prev) => subMonths(prev, 1));

  return (
    <CalendarContainer>
      <LayoutWrapper>
        <LeftSection>
          <ScheduleModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            selectedDate={selectedDate}
            events={selectedDateEvents}
          />

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
                      const isActive =
                        mode === "weekly"
                          ? true
                          : date.getMonth() === currentDate.getMonth();
                      return (
                        <DayCell
                          key={idx}
                          $isCurrentMonth={isActive}
                          onClick={() => handleDayClick(date)} // 날짜 클릭 시 모달 열기
                          style={{ cursor: "pointer" }}
                        >
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
                          $type={event.type}
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
                  monthEvents.map((event, idx) => (
                    <Fragment key={event.id}>
                      <EventItem {...event} />
                      {idx < monthEvents.length - 1 && <Divider />}
                    </Fragment>
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

  @media (min-width: 1024px) {
    max-width: 1280px;
  }
`;

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 32px;
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

  @media (min-width: 1024px) {
    > div {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: flex-start;
      gap: 16px;
    }

    > div > :first-child {
      min-height: 32px;
      display: flex;
      align-items: center;
    }
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 32px;
  min-height: 32px;
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
  min-height: ${({ $maxRows }) => 80 + ($maxRows - 1) * 24}px;
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

const DateNumber = styled.div<{
  $isToday: boolean;
  $isCurrentMonth: boolean;
}>`
  position: relative;
  z-index: 2;
  font-size: 14px;
  font-weight: ${({ $isToday }) => ($isToday ? "700" : "500")};
  line-height: 22px;
  color: ${({ $isToday }) => ($isToday ? "#fff" : "#000")};
`;

const EventBar = styled.div<{
  $start: number;
  $end: number;
  $row: number;
  $type: ScheduleType;
}>`
  position: absolute;
  top: ${({ $row }) => 28 + $row * 24}px;
  left: ${({ $start }) =>
    `calc((100% - 24px) / 7 * ${$start} + ${$start * 4}px)`};
  width: ${({ $start, $end }) => {
    const count = $end - $start + 1;
    return `calc((100% - 24px) / 7 * ${count} + ${(count - 1) * 4}px)`;
  }};
  height: 20px;
  /* 타입에 따른 배경색 조건부 렌더링 */
  background-color: ${({ $type }) =>
    $type === "dept" ? "#9AE1D9" : "#A4B6E6"};
  color: black;
  font-size: 11px;
  font-weight: 400;
  padding: 0 8px;
  box-sizing: border-box;
  border-radius: 6px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 3;
  pointer-events: none; //클릭 통과
  line-height: normal;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #8e8e93;
  font-size: 14px;
  margin: 20px 0;
`;
