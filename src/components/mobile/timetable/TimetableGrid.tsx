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
  
  // Selection Mode additions
  isSelectionMode?: boolean;
  selectedSlots?: string[];
  onSelectedSlotsChange?: (slots: string[]) => void;
  showClasses?: boolean;
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

const EMPTY_PREVIEW_EVENTS: ClassItem[] = [];
const EMPTY_SELECTED_SLOTS: string[] = [];

const TimetableGrid = ({
  events,
  previewEvents = EMPTY_PREVIEW_EVENTS,
  highlightedSlot = null,
  isCompareMode = false,
  isFreeMode = false,
  onEdit,
  onDelete,
  isSelectionMode = false,
  selectedSlots = EMPTY_SELECTED_SLOTS,
  onSelectedSlotsChange,
  showClasses = true,
}: TimetableGridProps) => {
  // 바텀시트 상태 정의
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // --- 드래그/클릭 시간대 선택 로직 ---
  const isDrawingRef = React.useRef(false);
  const drawingModeRef = React.useRef<"select" | "deselect">("select");
  const selectedRef = React.useRef<string[]>(selectedSlots);
  const [localSelected, setLocalSelected] = useState<string[]>(selectedSlots);

  // 모바일 롱프레스 및 터치 스크롤 제어용 refs
  const longPressTimerRef = React.useRef<number | null>(null);
  const touchStartPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const isLongPressedRef = React.useRef<boolean>(false);
  const touchStartCellRef = React.useRef<{ day: number; hour: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const isSame =
      selectedSlots.length === selectedRef.current.length &&
      selectedSlots.every((val, index) => val === selectedRef.current[index]);

    if (!isSame) {
      selectedRef.current = selectedSlots;
      setLocalSelected(selectedSlots);
    }
  }, [selectedSlots]);

  React.useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const updateSelection = (slot: string, mode: "select" | "deselect") => {
    const current = selectedRef.current;
    const isSelected = current.includes(slot);

    let next: string[];
    if (mode === "select" && !isSelected) {
      next = [...current, slot];
    } else if (mode === "deselect" && isSelected) {
      next = current.filter((s) => s !== slot);
    } else {
      return;
    }

    selectedRef.current = next;
    setLocalSelected([...next]);
    onSelectedSlotsChange?.(next);
  };

  const handleCellTouchStart = (day: number, hour: number, e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    touchStartCellRef.current = { day, hour };
    isLongPressedRef.current = false;
    isDrawingRef.current = false;

    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressedRef.current = true;
      isDrawingRef.current = true;

      const slot = `${day}-${hour}`;
      const isSelected = selectedRef.current.includes(slot);
      const mode = isSelected ? "deselect" : "select";
      drawingModeRef.current = mode;

      updateSelection(slot, mode);

      if (navigator.vibrate) {
        navigator.vibrate(40);
      }
    }, 400); // 400ms 롱프레스 판정
  };

  React.useEffect(() => {
    if (!isSelectionMode) return;
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMoveNative = (e: TouchEvent) => {
      if (!touchStartPosRef.current) return;

      const touch = e.touches[0];
      const diffX = touch.clientX - touchStartPosRef.current.x;
      const diffY = touch.clientY - touchStartPosRef.current.y;
      const dist = Math.sqrt(diffX * diffX + diffY * diffY);

      if (isLongPressedRef.current) {
        // 롱프레스 선택 활성화 상태: 화면 스크롤 금지 및 드래그 슬롯 누적 선택
        if (e.cancelable) {
          e.preventDefault();
        }

        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!element) return;

        const dayAttr = element.getAttribute("data-day");
        const hourAttr = element.getAttribute("data-hour");

        if (dayAttr !== null && hourAttr !== null) {
          const day = parseInt(dayAttr, 10);
          const hour = parseInt(hourAttr, 10);
          updateSelection(`${day}-${hour}`, drawingModeRef.current);
        }
      } else {
        // 롱프레스 판정 전 8px 넘게 움직이면 일반 스크롤로 간주하고 타이머 취소
        if (dist > 8) {
          if (longPressTimerRef.current) {
            window.clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
        }
      }
    };

    container.addEventListener("touchmove", handleTouchMoveNative, { passive: false });
    return () => {
      container.removeEventListener("touchmove", handleTouchMoveNative);
    };
  }, [isSelectionMode]);

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!isLongPressedRef.current && touchStartPosRef.current && touchStartCellRef.current) {
      // 단순 짧은 탭(클릭): 롱프레스는 작동하지 않았고, 손가락 떼는 시점에 터치 이동이 거의 없었을 때 토글
      const touch = e.changedTouches[0];
      const diffX = touch.clientX - touchStartPosRef.current.x;
      const diffY = touch.clientY - touchStartPosRef.current.y;
      const dist = Math.sqrt(diffX * diffX + diffY * diffY);

      if (dist <= 8) {
        const { day, hour } = touchStartCellRef.current;
        const slot = `${day}-${hour}`;
        const isSelected = selectedRef.current.includes(slot);
        updateSelection(slot, isSelected ? "deselect" : "select");
      }
    }

    isDrawingRef.current = false;
    isLongPressedRef.current = false;
    touchStartPosRef.current = null;
    touchStartCellRef.current = null;
  };

  const handleMouseDown = (day: number, hour: number) => {
    const slot = `${day}-${hour}`;
    const isSelected = selectedRef.current.includes(slot);
    const mode = isSelected ? "deselect" : "select";
    isDrawingRef.current = true;
    drawingModeRef.current = mode;
    updateSelection(slot, mode);
  };

  const handleMouseEnter = (day: number, hour: number) => {
    if (!isDrawingRef.current) return;
    updateSelection(`${day}-${hour}`, drawingModeRef.current);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  React.useEffect(() => {
    if (!isSelectionMode) return;
    const handleGlobalUp = () => {
      isDrawingRef.current = false;
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };
    window.addEventListener("mouseup", handleGlobalUp);
    window.addEventListener("touchend", handleGlobalUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalUp);
      window.removeEventListener("touchend", handleGlobalUp);
    };
  }, [isSelectionMode]);

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
        id={isPreview ? "timetable-preview-block" : undefined}
        key={`${isPreview ? "prev" : "evt"}-${item.id}-${index}`}
        $bgColor={bgColor}
        $isPreview={isPreview}
        $isCompareMode={isCompareMode} // 추가
        $isFreeMode={isFreeMode} // 추가
        $isSelectionMode={isSelectionMode} // 추가
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
      <GridContainer
        ref={containerRef}
        $rowCount={rowCount}
        onTouchEnd={isSelectionMode ? handleTouchEnd : undefined}
      >
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
              {DAYS.map((_, dayIndex) => {
                const slot = `${dayIndex}-${time}`;
                const isSelected = localSelected.includes(slot);
                return (
                  <GridBackgroundCell
                    key={`bg-${time}-${dayIndex}`}
                    $isSelectionMode={isSelectionMode}
                    $isSelected={isSelected}
                    data-day={dayIndex}
                    data-hour={time}
                    onTouchStart={isSelectionMode ? (e) => handleCellTouchStart(dayIndex, time, e) : undefined}
                    onTouchEnd={isSelectionMode ? handleTouchEnd : undefined}
                    onMouseDown={isSelectionMode ? () => handleMouseDown(dayIndex, time) : undefined}
                    onMouseEnter={isSelectionMode ? () => handleMouseEnter(dayIndex, time) : undefined}
                    onMouseUp={isSelectionMode ? handleMouseUp : undefined}
                    style={{
                      gridColumn: dayIndex + 2,
                      gridRowStart: rowIndex,
                      gridRowEnd: "span 2",
                    }}
                  />
                );
              })}
            </React.Fragment>
          );
        })}

        {/* (3) 기존 수업 아이템 */}
        {showClasses && events.map((item, index) => renderEventBlock(item, index, false))}

        {/* (4) 미리보기 아이템 (오버레이) */}
        {showClasses && previewEvents.map((item, index) =>
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

const GridBackgroundCell = styled.div<{ $isSelectionMode?: boolean; $isSelected?: boolean }>`
  border-bottom: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  &:nth-child(6n) {
    border-right: none;
  }

  ${({ $isSelectionMode, $isSelected }) =>
    $isSelectionMode &&
    `
    cursor: pointer;
    background-color: ${$isSelected ? "rgba(0, 97, 255, 0.4)" : "#ffffff"};
    transition: background-color 0.1s ease;
    user-select: none;
    -webkit-user-drag: none;
  `}
`;

const ClassItemBlock = styled.div<{
  $bgColor: string;
  $isPreview?: boolean;
  $isCompareMode?: boolean; // 추가
  $isFreeMode?: boolean; // 추가
  $isSelectionMode?: boolean; // 추가
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
  pointer-events: ${({ $isPreview, $isFreeMode, $isSelectionMode }) =>
    $isPreview || $isFreeMode || $isSelectionMode
      ? "none"
      : "auto"}; /* 미리보기와 공강 모드는 클릭 통과 */
  cursor: ${({ $isPreview, $isFreeMode, $isSelectionMode }) =>
    $isPreview || $isFreeMode || $isSelectionMode ? "default" : "pointer"};

  ${({ $isPreview }) =>
    $isPreview &&
    `
    animation: previewPulse 1.5s infinite ease-in-out;
  `}
  
  user-select: none;
  -webkit-user-drag: none;

  @keyframes previewPulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }
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
