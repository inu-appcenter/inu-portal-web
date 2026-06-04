import React, { useMemo, useState } from "react";
import styled from "styled-components";
import ClassDetailBottomSheet from "./ClassDetailBottomSheet";

// --- 타입 정의 ---
export interface ClassItem {
  id: number;
  name: string;
  room: string;
  day: number; // 0:월 ~ 4:금
  startTime: number; // 9 ~ 21
  endTime: number;
  // 미리보기 구분용
  isPreview?: boolean;
  professor?: string; //교수명
  memo?: string; //메모
  color?: string; // 개별 배경 색상
  ownerName?: string; // 추가: 소유자 이름 (시간표 구분용)
}

interface TimetableGridProps {
  events: ClassItem[];
  // 추가: 미리보기용 이벤트 배열
  previewEvents?: ClassItem[];
  highlightedSlot?: {
    day: number;
    startTime: number;
    endTime: number;
  } | null;
  isCompareMode?: boolean; // 추가
  isFreeMode?: boolean; // 추가
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

// --- 상수 데이터 ---
const DAYS = ["월", "화", "수", "목", "금"];
const START_HOUR = 9;
const DEFAULT_MAX_HOUR = 18;

// 팔레트
const COLORS = [
  "var(--color-chips-red)",
  "var(--color-chips-orange)",
  "var(--color-chips-yellow)",
  "var(--color-chips-teal)",
  "var(--color-chips-skyblue)",
  "var(--color-chips-lilac)",
  "var(--color-chips-violet)",
  "var(--color-chips-purple)",
  "var(--color-chips-pink)",
  "var(--color-chips-gray)",
];

const TimetableGrid = ({
  events,
  previewEvents = [],
  highlightedSlot = null,
  isCompareMode = false,
  isFreeMode = false,
  onEdit,
  onDelete,
}: TimetableGridProps) => {
  // 바텀시트 상태 정의
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

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

  const rowCount = (timeSlots.length - 1) * 2;

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
    const rowStart = Math.round((item.startTime - START_HOUR) * 2) + 2;
    const rowEnd = Math.round((item.endTime - START_HOUR) * 2) + 2;
    // 개별 색상이 지정되어 있으면 우선 사용, 아니면 미리보기면 고정색, 기본은 맵핑된 색
    const bgColor = item.color
      ? item.color
      : isPreview
        ? "rgba(0, 123, 255, 0.5)" // 반투명 파란색
        : colorMap.get(item.name) || "#FFFFFF";

    const handleClassClick = () => {
      if (isPreview || isFreeMode) return;
      setSelectedClass(item);
      setIsBottomSheetOpen(true);
    };

    return (
      <ClassItemBlock
        key={`${isPreview ? "prev" : "evt"}-${item.id}-${index}`}
        $bgColor={bgColor}
        $isPreview={isPreview}
        $isCompareMode={isCompareMode} // 추가
        $isFreeMode={isFreeMode} // 추가
        onClick={handleClassClick}
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
    <>
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
          const rowIndex = timeIndex * 2 + 2;
          return (
            <React.Fragment key={`row-${time}`}>
              <TimeCell
                style={{
                  gridColumn: 1,
                  gridRowStart: rowIndex,
                  gridRowEnd: "span 2",
                }}
              >
                <span>{time}</span>
              </TimeCell>
              {DAYS.map((_, dayIndex) => (
                <GridBackgroundCell
                  key={`bg-${time}-${dayIndex}`}
                  style={{
                    gridColumn: dayIndex + 2,
                    gridRowStart: rowIndex,
                    gridRowEnd: "span 2",
                  }}
                />
              ))}
            </React.Fragment>
          );
        })}

        {/* (3) 기존 수업 아이템 */}
        {events.map((item, index) => renderEventBlock(item, index, false))}

        {/* (4) 미리보기 아이템 (오버레이) */}
        {previewEvents.map((item, index) =>
          renderEventBlock(item, index, true),
        )}

        {highlightedSlot && (
          <HighlightedBlock
            id="timetable-highlighted-block"
            style={{
              gridColumnStart: highlightedSlot.day + 2,
              gridColumnEnd: "span 1",
              gridRowStart:
                Math.round((highlightedSlot.startTime - START_HOUR) * 2) + 2,
              gridRowEnd:
                Math.round((highlightedSlot.endTime - START_HOUR) * 2) + 2,
            }}
          />
        )}
      </GridContainer>

      <ClassDetailBottomSheet
        open={isBottomSheetOpen}
        onOpenChange={setIsBottomSheetOpen}
        selectedClass={selectedClass}
        allEvents={events}
        colorMap={colorMap}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
};

export default TimetableGrid;

// --- 스타일 컴포넌트 ---
const GridContainer = styled.div<{ $rowCount: number }>`
  display: grid;
  grid-template-columns: 24px repeat(5, minmax(0, 1fr));
  grid-template-rows: 24px repeat(${({ $rowCount }) => $rowCount}, 25px);
  border: 1px solid var(--border-strong);
  border-radius: 16px;
  background-color: var(--bg-base);
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
  border-bottom: 1px solid #eee;
  border-right: 1px solid #f0f0f0;
  background-color: var(--bg-base)
  &:last-child {
    border-right: none;
  }

  color: var(--text-tertiary, #8B95A1);
  text-align: center;
  
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

const TimeCell = styled(CellBase)`
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 4px;

  border-right: 1px solid #eee;
  border-bottom: 1px solid #f0f0f0;
  background-color: var(--bg-base);

  color: var(--text-tertiary, #8b95a1);

  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
`;

const GridBackgroundCell = styled.div`
  border-bottom: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  &:nth-child(6n) {
    border-right: none;
  }
`;

const ClassItemBlock = styled.div<{
  $bgColor: string;
  $isPreview?: boolean;
  $isCompareMode?: boolean; // 추가
  $isFreeMode?: boolean; // 추가
}>`
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
  pointer-events: ${({ $isPreview, $isFreeMode }) =>
    $isPreview || $isFreeMode
      ? "none"
      : "auto"}; /* 미리보기와 공강 모드는 클릭 통과 */
  cursor: ${({ $isPreview, $isFreeMode }) =>
    $isPreview || $isFreeMode ? "default" : "pointer"};
`;

const ItemContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ClassName = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 14px;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
`;

const ClassRoom = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: 100%;
  white-space: nowrap;
`;

const HighlightedBlock = styled.div`
  background: var(
    --timeTable-color-available-time-selected,
    rgba(59, 130, 246, 0.5)
  );
  border: 1px solid var(--border-brand, #0061ff);
  margin: 1px;
  border-radius: 4px;
  z-index: 50;
  animation: pulse 1.5s infinite ease-in-out;
  pointer-events: none;

  @keyframes pulse {
    0% {
      opacity: 0.6;
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
    }
    100% {
      opacity: 0.6;
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }
`;
