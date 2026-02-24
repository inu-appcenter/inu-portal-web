import React, { useMemo } from "react";
import styled from "styled-components";

// --- 타입 정의 ---
export interface ClassItem {
  id: number;
  name: string;
  room: string;
  day: number; // 0:월 ~ 4:금
  startTime: number; // 9 ~ 21
  endTime: number;
  // 미리보기 구분을 위한 선택적 속성
  isPreview?: boolean;
}

interface TimetableGridProps {
  events: ClassItem[];
  // 추가: 미리보기용 이벤트 배열
  previewEvents?: ClassItem[];
}

// --- 상수 데이터 ---
const DAYS = ["월", "화", "수", "목", "금"];
const START_HOUR = 9;
const DEFAULT_MAX_HOUR = 18;

// 팔레트
const COLORS = [
  "#FFD1DC",
  "#FFE4B5",
  "#D4F0F0",
  "#E6E6FA",
  "#F0E68C",
  "#E0FFFF",
  "#FFDEAD",
  "#F5F5DC",
  "#E3F2FD",
  "#F3E5F5",
];

const TimetableGrid = ({ events, previewEvents = [] }: TimetableGridProps) => {
  // 1. 동적 시간 범위 계산 (기존 이벤트 + 미리보기 이벤트 포함)
  const timeSlots = useMemo(() => {
    const allEvents = [...events, ...previewEvents];
    const maxEventTime = Math.max(0, ...allEvents.map((e) => e.endTime));
    const endHour = Math.max(DEFAULT_MAX_HOUR, maxEventTime);

    const slots = [];
    for (let i = START_HOUR; i <= endHour; i++) {
      slots.push(i);
    }
    return slots;
  }, [events, previewEvents]);

  const rowCount = timeSlots.length - 1;

  // 2. 색상 매핑
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    const uniqueSubjects = Array.from(new Set(events.map((e) => e.name)));
    uniqueSubjects.forEach((subject, index) => {
      map.set(subject, COLORS[index % COLORS.length]);
    });
    return map;
  }, [events]);

  // 렌더링 헬퍼 함수
  const renderEventBlock = (
    item: ClassItem,
    index: number,
    isPreview: boolean,
  ) => {
    const colStart = item.day + 2;
    const rowStart = item.startTime - START_HOUR + 2;
    const rowEnd = item.endTime - START_HOUR + 2;
    // 미리보기면 고정색, 아니면 맵핑된 색
    const bgColor = isPreview
      ? "rgba(0, 123, 255, 0.5)" // 반투명 파란색
      : colorMap.get(item.name) || "#FFFFFF";

    return (
      <ClassItemBlock
        key={`${isPreview ? "prev" : "evt"}-${item.id}-${index}`}
        $bgColor={bgColor}
        $isPreview={isPreview}
        style={{
          gridColumnStart: colStart,
          gridColumnEnd: "span 1",
          gridRowStart: rowStart,
          gridRowEnd: rowEnd,
        }}
      >
        <ItemContent>
          <ClassName>{item.name}</ClassName>
          <ClassRoom>{item.room}</ClassRoom>
        </ItemContent>
      </ClassItemBlock>
    );
  };

  return (
    <GridContainer $rowCount={rowCount}>
      {/* (1) 요일 헤더 */}
      <HeaderCell style={{ gridColumn: 1, gridRow: 1 }} />
      {DAYS.map((day, index) => (
        <HeaderCell
          key={`header-${day}`}
          style={{ gridColumn: index + 2, gridRow: 1 }}
        >
          {day}
        </HeaderCell>
      ))}

      {/* (2) 시간표 바디 */}
      {timeSlots.slice(0, -1).map((time, timeIndex) => {
        const rowIndex = timeIndex + 2;
        return (
          <React.Fragment key={`row-${time}`}>
            <TimeCell style={{ gridColumn: 1, gridRow: rowIndex }}>
              <span>{time}</span>
            </TimeCell>
            {DAYS.map((_, dayIndex) => (
              <GridBackgroundCell
                key={`bg-${time}-${dayIndex}`}
                style={{ gridColumn: dayIndex + 2, gridRow: rowIndex }}
              />
            ))}
          </React.Fragment>
        );
      })}

      {/* (3) 기존 수업 아이템 */}
      {events.map((item, index) => renderEventBlock(item, index, false))}

      {/* (4) 미리보기 아이템 (오버레이) */}
      {previewEvents.map((item, index) => renderEventBlock(item, index, true))}
    </GridContainer>
  );
};

export default TimetableGrid;

// --- 스타일 컴포넌트 ---
const GridContainer = styled.div<{ $rowCount: number }>`
  display: grid;
  grid-template-columns: 30px repeat(5, minmax(0, 1fr));
  grid-template-rows: 30px repeat(${({ $rowCount }) => $rowCount}, 50px);
  border: 1px solid #eee;
  border-radius: 20px;
  background-color: white;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease-in-out;

  width: 100%;
`;

const CellBase = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`;

const HeaderCell = styled(CellBase)`
  font-size: 12px;
  font-weight: 600;
  color: #555;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #f0f0f0;
  &:last-child {
    border-right: none;
  }
`;

const TimeCell = styled(CellBase)`
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 4px;
  font-size: 10px;
  color: #888;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #f0f0f0;
  background-color: white;
`;

const GridBackgroundCell = styled.div`
  border-bottom: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  &:nth-child(6n) {
    border-right: none;
  }
`;

const ClassItemBlock = styled.div<{ $bgColor: string; $isPreview?: boolean }>`
  background-color: ${({ $bgColor }) => $bgColor};
  margin: 1px;
  border-radius: 4px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  z-index: ${({ $isPreview }) =>
    $isPreview ? 20 : 10}; /* 미리보기가 더 위로 */
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  pointer-events: ${({ $isPreview }) =>
    $isPreview ? "none" : "auto"}; /* 미리보기는 클릭 통과 */
`;

const ItemContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ClassName = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ClassRoom = styled.span`
  font-size: 10px;
  color: #666;
  white-space: nowrap;
`;
