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
}

interface TimetableGridProps {
  events: ClassItem[];
}

// --- 상수 데이터 ---
const DAYS = ["월", "화", "수", "목", "금"];
const START_HOUR = 9;
const DEFAULT_MAX_HOUR = 18; // 기본적으로 보여줄 최대 시간

// 팔레트 (10종)
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

const TimetableGrid = ({ events }: TimetableGridProps) => {
  // 1. 동적 시간 범위 계산
  const timeSlots = useMemo(() => {
    // 이벤트 중 가장 늦게 끝나는 시간 찾기 (없으면 0)
    const maxEventTime = Math.max(0, ...events.map((e) => e.endTime));

    // 기본 18시와 비교하여 더 큰 값을 최종 종료 시간으로 결정
    const endHour = Math.max(DEFAULT_MAX_HOUR, maxEventTime);

    // 시작시간(9)부터 종료시간(endHour)까지 배열 생성
    const slots = [];
    for (let i = START_HOUR; i <= endHour; i++) {
      slots.push(i);
    }
    return slots;
  }, [events]);

  // 그리드에 표시될 실제 행 개수 (마지막 시간 숫자는 표시용이므로 -1)
  const rowCount = timeSlots.length - 1;

  // 2. 색상 매핑 (이전과 동일)
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    const uniqueSubjects = Array.from(new Set(events.map((e) => e.name)));
    uniqueSubjects.forEach((subject, index) => {
      map.set(subject, COLORS[index % COLORS.length]);
    });
    return map;
  }, [events]);

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

      {/* (2) 시간표 바디 (동적 시간 범위 렌더링) */}
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
                style={{
                  gridColumn: dayIndex + 2,
                  gridRow: rowIndex,
                }}
              />
            ))}
          </React.Fragment>
        );
      })}

      {/* (3) 수업 아이템 */}
      {events.map((item, index) => {
        const colStart = item.day + 2;
        const rowStart = item.startTime - START_HOUR + 2;
        const rowEnd = item.endTime - START_HOUR + 2;

        return (
          <ClassItemBlock
            key={`${item.id}-${index}`}
            $bgColor={colorMap.get(item.name) || "#FFFFFF"}
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
      })}
    </GridContainer>
  );
};

export default TimetableGrid;

// --- 스타일 컴포넌트 ---

const GridContainer = styled.div<{ $rowCount: number }>`
  display: grid;
  grid-template-columns: 30px repeat(5, minmax(0, 1fr));

  /* 핵심: 동적으로 계산된 행 개수만큼 높이 반복 */
  grid-template-rows: 30px repeat(${({ $rowCount }) => $rowCount}, 50px);

  border: 1px solid #eee;
  border-radius: 20px;
  background-color: white;
  overflow: hidden;
  position: relative;

  /* 부드러운 높이 변화 애니메이션 (선택사항) */
  transition: all 0.3s ease-in-out;
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

const ClassItemBlock = styled.div<{ $bgColor: string }>`
  background-color: ${({ $bgColor }) => $bgColor};
  margin: 1px;
  border-radius: 4px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  //justify-content: center;
  //align-items: center;
  //text-align: start;
  z-index: 10;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const ItemContent = styled.div`
  width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  //align-items: center;
  //justify-content: center;
`;

const ClassName = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
  margin-bottom: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
`;

const ClassRoom = styled.span`
  font-size: 10px;
  color: #666;
  white-space: nowrap;
`;
