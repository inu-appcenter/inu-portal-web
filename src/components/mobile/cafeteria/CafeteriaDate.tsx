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
        return "#efc1c1";
      }

      if ($isActive && $tone === "saturday") {
        return "#c3d2fb";
      }

      if ($isActive) {
        return "#91aee4";
      }

      return "#e3e8f1";
    }};
  background:
    ${({ $tone, $isActive }) => {
      if ($isActive && $tone === "sunday") {
        return "#fff6f6";
      }

      if ($isActive && $tone === "saturday") {
        return "#f5f8ff";
      }

      if ($isActive) {
        return "#eff4ff";
      }

      return "#fbfcfe";
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
          return "#e05656";
        }

        if ($isActive && $tone === "saturday") {
          return "#4d77e8";
        }

        if ($isActive) {
          return "#5f78a7";
        }

        if ($tone === "sunday") {
          return "#e05656";
        }

        if ($tone === "saturday") {
          return "#4d77e8";
        }

        return "#6a7485";
      }};
  }

  .date-number {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.15;
    color:
      ${({ $tone, $isActive }) => {
        if ($isActive && $tone === "sunday") {
          return "#cc4747";
        }

        if ($isActive && $tone === "saturday") {
          return "#3d67d7";
        }

        if ($isActive) {
          return "#2f5fb8";
        }

        if ($tone === "sunday") {
          return "#d64b4b";
        }

        if ($tone === "saturday") {
          return "#3f6fe4";
        }

        return "#273142";
      }};
  }

  &:hover {
    border-color:
      ${({ $tone, $isActive }) => {
        if ($isActive && $tone === "sunday") {
          return "#e7b2b2";
        }

        if ($isActive && $tone === "saturday") {
          return "#b8cbfb";
        }

        if ($isActive) {
          return "#85a5df";
        }

        return "#ccd6e5";
      }};
    background:
      ${({ $tone, $isActive }) => {
        if ($isActive && $tone === "sunday") {
          return "#fff2f2";
        }

        if ($isActive && $tone === "saturday") {
          return "#eef4ff";
        }

        if ($isActive) {
          return "#e8f0ff";
        }

        return "#ffffff";
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
