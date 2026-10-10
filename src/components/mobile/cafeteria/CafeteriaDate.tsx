import styled from "styled-components";

import { DESKTOP_MEDIA } from "@/styles/responsive";

interface WeekDatesProps {
  dayName: string;
  date: string;
}

interface CafeteriaDateProps {
  nowday: number;
  setNowDay: (nowday: number) => void;
  weekDates: WeekDatesProps[];
}

type DayTone = "weekday" | "saturday" | "sunday";

const getDayTone = (dayName: string): DayTone => {
  if (dayName === "일") {
    return "sunday";
  }

  if (dayName === "토") {
    return "saturday";
  }

  return "weekday";
};

export default function CafeteriaDate({
  nowday,
  setNowDay,
  weekDates,
}: CafeteriaDateProps) {
  const activeDay = nowday === 0 ? 7 : nowday;

  return (
    <DateListContainer>
      {weekDates.map((weekDate, index) => {
        const tone = getDayTone(weekDate.dayName);
        const isActive = index + 1 === activeDay;

        return (
          <DateButton
            key={index}
            type="button"
            $tone={tone}
            $isActive={isActive}
            onClick={() => setNowDay(index + 1)}
            aria-pressed={isActive}
          >
            <span className="day-name">{weekDate.dayName}</span>
            <span className="date-number">{weekDate.date}</span>
          </DateButton>
        );
      })}
    </DateListContainer>
  );
}

const DateListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  width: 100%;
  gap: 6px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, 580px);
    margin: 0;
    justify-self: start;
    gap: 8px;
  }
`;

const DateButton = styled.button<{ $tone: DayTone; $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 100%;
  min-height: 54px;
  padding: 7px 4px;
  border-radius: 11px;
  border: 1px solid
    ${({ $tone, $isActive }) => {
      if ($isActive && $tone === "sunday") {
        return "rgb(239, 193, 193)";
      }

      if ($isActive && $tone === "saturday") {
        return "var(--blue-200)";
      }

      if ($isActive) {
        return "var(--interactive-focus)";
      }

      return "var(--border-subtle)";
    }};
  background:
    ${({ $tone, $isActive }) => {
      if ($isActive && $tone === "sunday") {
        return "rgb(255, 246, 246)";
      }

      if ($isActive && $tone === "saturday") {
        return "var(--bg-subtle)";
      }

      if ($isActive) {
        return "var(--bg-brand)";
      }

      return "var(--bg-base)";
    }};
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease;

  .day-name {
    font-size: 10px;
    font-weight: 700;
    line-height: 1.1;
    color:
      ${({ $tone, $isActive }) => {
        if ($isActive && $tone === "sunday") {
          return "var(--text-error)";
        }

        if ($isActive && $tone === "saturday") {
          return "var(--interactive-primary)";
        }

        if ($isActive) {
          return "var(--gray-600)";
        }

        if ($tone === "sunday") {
          return "var(--text-error)";
        }

        if ($tone === "saturday") {
          return "var(--interactive-primary)";
        }

        return "var(--text-tertiary)";
      }};
  }

  .date-number {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.15;
    color:
      ${({ $tone, $isActive }) => {
        if ($isActive && $tone === "sunday") {
          return "var(--text-error)";
        }

        if ($isActive && $tone === "saturday") {
          return "var(--interactive-primary-press)";
        }

        if ($isActive) {
          return "var(--interactive-primary-press)";
        }

        if ($tone === "sunday") {
          return "var(--text-error)";
        }

        if ($tone === "saturday") {
          return "var(--interactive-primary)";
        }

        return "var(--text-primary)";
      }};
  }

  &:hover {
    border-color:
      ${({ $tone, $isActive }) => {
        if ($isActive && $tone === "sunday") {
          return "rgb(231, 178, 178)";
        }

        if ($isActive && $tone === "saturday") {
          return "var(--blue-200)";
        }

        if ($isActive) {
          return "var(--interactive-focus)";
        }

        return "var(--border-default)";
      }};
    background:
      ${({ $tone, $isActive }) => {
        if ($isActive && $tone === "sunday") {
          return "rgb(255, 242, 242)";
        }

        if ($isActive && $tone === "saturday") {
          return "var(--bg-brand)";
        }

        if ($isActive) {
          return "var(--bg-brand)";
        }

        return "var(--bg-base)";
      }};
  }

  @media ${DESKTOP_MEDIA} {
    min-height: 58px;
    padding: 8px 5px;
    border-radius: 12px;

    .day-name {
      font-size: 11px;
    }

    .date-number {
      font-size: 16px;
    }
  }
`;
