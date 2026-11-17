import { useState } from "react";
import styled, { css } from "styled-components";
import { buttonReset } from "@/components/mobile/timetable/wizard/ui/tokens";
import { typography } from "@/styles/typography";
import type { PollDay } from "@/types/schedulePolls";
import { POLL_DAYS, parseDateKey, toDateKey } from "@/utils/schedulePoll";

// 달력은 일요일부터 그린다(Figma B v4 단계 2 Calendar).
const HEADER_DAYS: PollDay[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const HEADER_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const dayOf = (date: Date): PollDay => POLL_DAYS[(date.getDay() + 6) % 7];

interface PollCalendarProps {
  today: string;
  startDate: string;
  endDate: string;
  /** 기간 안에서 만날 요일. 빠진 요일은 흐리게 그린다 */
  days: PollDay[];
  /** 기간 안에서 하나씩 뺀 날짜. 빠진 요일처럼 흐리게 그린다 */
  excludedDates: string[];
  maxDays: number;
  onRangeChange: (start: string, end: string) => void;
  onToggleDay: (day: PollDay) => void;
  /** 기간을 다 고른 뒤 기간 안 날짜를 누르면 그 날짜를 빼거나 다시 넣는다 */
  onToggleDate: (key: string) => void;
}

/**
 * 기간 + 요일 고르기 달력 (Figma B. 조건 설정 v4 - 단계 2/4).
 * 날짜를 두 번 눌러 기간을 정하고, 요일 머리를 눌러 그 요일을 빼거나 넣는다.
 * 기간을 다 고른 뒤 기간 안 날짜를 누르면 그 날짜 하나만 빼거나 넣고, 기간 밖을 누르면 새로 고른다.
 */
const PollCalendar = ({
  today,
  startDate,
  endDate,
  days,
  excludedDates,
  maxDays,
  onRangeChange,
  onToggleDay,
  onToggleDate,
}: PollCalendarProps) => {
  const [month, setMonth] = useState(() => {
    const base = parseDateKey(startDate || today);
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const todayMonth = parseDateKey(today);
  const canGoPrev =
    month.getFullYear() * 12 + month.getMonth() >
    todayMonth.getFullYear() * 12 + todayMonth.getMonth();

  const firstWeekday = month.getDay();
  const lastDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from(
      { length: lastDate },
      (_unused, index) => new Date(month.getFullYear(), month.getMonth(), index + 1),
    ),
  ];
  const weeks: (Date | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  const maxEnd = startDate
    ? toDateKey(
        new Date(
          parseDateKey(startDate).getFullYear(),
          parseDateKey(startDate).getMonth(),
          parseDateKey(startDate).getDate() + maxDays - 1,
        ),
      )
    : null;

  const handleDateClick = (key: string) => {
    if (startDate && endDate && key >= startDate && key <= endDate) {
      onToggleDate(key);
      return;
    }
    // 시작만 골라 둔 상태에서 범위 안 날짜를 누르면 끝으로, 아니면 새로 시작한다.
    if (startDate && !endDate && key >= startDate && maxEnd && key <= maxEnd) {
      onRangeChange(startDate, key);
      return;
    }
    onRangeChange(key, "");
  };

  return (
    <Card>
      <MonthRow>
        <MonthTitle>
          {month.getFullYear()}년 {month.getMonth() + 1}월
        </MonthTitle>
        <MonthNav>
          <NavButton
            type="button"
            aria-label="이전 달"
            disabled={!canGoPrev}
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
          >
            ‹
          </NavButton>
          <NavButton
            type="button"
            aria-label="다음 달"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
          >
            ›
          </NavButton>
        </MonthNav>
      </MonthRow>

      <Grid role="grid">
        {HEADER_DAYS.map((day, index) => (
          <WeekdayButton
            key={day}
            type="button"
            aria-pressed={days.includes(day)}
            aria-label={`${HEADER_LABELS[index]}요일 ${days.includes(day) ? "빼기" : "넣기"}`}
            $off={!days.includes(day)}
            onClick={() => onToggleDay(day)}
          >
            {HEADER_LABELS[index]}
          </WeekdayButton>
        ))}

        {weeks.map((week, weekIndex) =>
          Array.from({ length: 7 }, (_unused, column) => {
            const date = week[column];
            if (!date) return <span key={`${weekIndex}-${column}`} />;
            const key = toDateKey(date);
            const isPast = key < today;
            const inRange =
              !!startDate && key >= startDate && key <= (endDate || startDate);
            const dayOff =
              !days.includes(dayOf(date)) || excludedDates.includes(key);
            const selected = inRange && !dayOff;
            const outOfReach =
              !!startDate && !endDate && !!maxEnd && key > maxEnd;
            return (
              <DateCell key={key} $band={inRange} $bandStart={key === startDate} $bandEnd={key === (endDate || startDate)}>
                <DateButton
                  type="button"
                  disabled={isPast}
                  aria-pressed={selected}
                  aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일`}
                  $selected={selected}
                  $muted={isPast || (inRange && dayOff) || outOfReach}
                  onClick={() => handleDateClick(key)}
                >
                  {date.getDate()}
                </DateButton>
              </DateCell>
            );
          }),
        )}
      </Grid>
    </Card>
  );
};

export default PollCalendar;

interface WeekdayRowProps {
  days: PollDay[];
  onToggleDay: (day: PollDay) => void;
}

/** 매주 반복일 때 달력 대신 보여 주는 요일 7개 (Figma Weekday_Row). */
export const PollWeekdayRow = ({ days, onToggleDay }: WeekdayRowProps) => (
  <WeekdayCard>
    {HEADER_DAYS.map((day, index) => (
      <DateButton
        key={day}
        type="button"
        aria-pressed={days.includes(day)}
        $selected={days.includes(day)}
        $muted={!days.includes(day)}
        onClick={() => onToggleDay(day)}
      >
        {HEADER_LABELS[index]}
      </DateButton>
    ))}
  </WeekdayCard>
);

const Card = styled.div`
  padding: 16px 12px 12px;
  border-radius: 16px;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const WeekdayCard = styled(Card)`
  flex-direction: row;
  justify-content: space-between;
  padding: 12px 16px;
`;

const MonthRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
`;

const MonthTitle = styled.span`
  color: var(--text-primary);
  ${typography.title3}
`;

const MonthNav = styled.div`
  display: flex;
  gap: 8px;
`;

const NavButton = styled.button`
  ${buttonReset}
  width: 28px;
  height: 28px;
  color: var(--text-primary);
  font-size: 24px;
  line-height: 1;

  &:disabled {
    color: var(--text-disabled);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 4px;
`;

const WeekdayButton = styled.button<{ $off: boolean }>`
  ${buttonReset}
  height: 28px;
  color: ${({ $off }) => ($off ? "var(--text-disabled)" : "var(--text-secondary)")};
  ${typography.caption1}
`;

const DateCell = styled.div<{ $band: boolean; $bandStart: boolean; $bandEnd: boolean }>`
  display: flex;
  justify-content: center;
  ${({ $band, $bandStart, $bandEnd }) =>
    $band &&
    css`
      background: var(--bg-brand);
      border-top-left-radius: ${$bandStart ? "20px" : 0};
      border-bottom-left-radius: ${$bandStart ? "20px" : 0};
      border-top-right-radius: ${$bandEnd ? "20px" : 0};
      border-bottom-right-radius: ${$bandEnd ? "20px" : 0};
    `}
`;

const DateButton = styled.button<{
  $selected: boolean;
  $muted: boolean;
}>`
  ${buttonReset}
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: ${({ $muted }) => ($muted ? "var(--text-disabled)" : "var(--text-primary)")};
  ${typography.body2}

  ${({ $selected }) =>
    $selected &&
    css`
      background: var(--interactive-primary);
      color: var(--text-inverse);
      ${typography.label2}
    `}
`;
