import React, { useMemo, useState } from "react";
import styled from "styled-components";
import ClassDetailBottomSheet from "./ClassDetailBottomSheet";
import { TimetableTheme } from "@/stores/useTimetableStore";
import { THEME_PALETTES } from "./TimetableThemeBottomSheet";

// --- 타입 정의 ---
export interface ClassItem {
  id: number;
  // 서버 시간표 요소 id (삭제 API용). id는 meeting 단위, itemId는 요소 단위
  itemId?: number;
  // 개설강의 id (강의 수강 추가 여부 판단용)
  courseOfferingId?: number;
  // 커스텀 일정 수정 API용 id (id는 meeting 단위라 요소 식별에 쓸 수 없음)
  customScheduleId?: number;
  name: string;
  room: string;
  day: number; // 0:월 ~ 6:일 (기본은 월~금만 표시, 토/일 데이터가 있으면 그리드가 자동 확장됨)
  startTime: number; // 9 ~ 21
  endTime: number;
  credits?: number;
  // 미리보기 구분용
  isPreview?: boolean;
  professor?: string; //교수명
  memo?: string; //메모
  color?: string; // 개별 배경 색상
  ownerName?: string; // 추가: 소유자 이름 (시간표 구분용)
  // 친구 소유 항목 여부. true면 조회 전용(메모 등 본인만 봐야 하는 정보는 노출/편집 금지)
  isFriendOwned?: boolean;
  grade?: string;
  courseType?: string;
  evaluation?: string;
  courseId?: string;
  numericCourseId?: number;
  ssupTypeName?: string;
  ssupTypeCode?: string;
  isCustom?: boolean;
  isUntimed?: boolean;
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
  theme?: TimetableTheme;
  // 최소로 보여줄 요일 컬럼 수(월요일부터). 이벤트/선택 슬롯에 토·일 데이터가 있으면
  // 이 값과 무관하게 자동으로 늘어난다. 기본은 월~금(5) — 대부분의 개설강의가 평일이라
  // 굳이 항상 7컬럼을 보여주면 컬럼 폭만 좁아진다. 주말 슬롯을 미리 선택하게 하고
  // 싶은 화면(제외조건 등)은 7로 지정한다.
  minDayCount?: number;
}

// --- 상수 데이터 ---
const ALL_DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const START_HOUR = 9;
const DEFAULT_MAX_HOUR = 18;
const MIN_DAY_COUNT = 5;
const MAX_DAY_COUNT = 7;

const EMPTY_PREVIEW_EVENTS: ClassItem[] = [];
const EMPTY_SELECTED_SLOTS: string[] = [];

export const formatRoom = (room: string) => {
  const match = room.match(/^제(.+?)호관\s+.*?-([^\s]+)/);
  return match ? `${match[1]}-${match[2]}` : room;
};

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
  theme,
  minDayCount = MIN_DAY_COUNT,
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
    isDrawingRef.current = true;

    const slot = `${day}-${hour}`;
    const isSelected = selectedRef.current.includes(slot);
    const mode = isSelected ? "deselect" : "select";
    drawingModeRef.current = mode;

    updateSelection(slot, mode);

    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  React.useEffect(() => {
    if (!isSelectionMode) return;
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMoveNative = (e: TouchEvent) => {
      if (!isDrawingRef.current) return;

      const touch = e.touches[0];
      if (e.cancelable) {
        e.preventDefault();
      }

      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!element) return;

      const dayAttr = element.getAttribute("data-day");
      const hourAttr = element.getAttribute("data-hour");

      if (dayAttr !== null && hourAttr !== null) {
        const day = parseInt(dayAttr, 10);
        const hour = parseFloat(hourAttr);
        updateSelection(`${day}-${hour}`, drawingModeRef.current);
      }
    };

    container.addEventListener("touchmove", handleTouchMoveNative, { passive: false });
    return () => {
      container.removeEventListener("touchmove", handleTouchMoveNative);
    };
  }, [isSelectionMode]);

  const handleTouchEnd = () => {
    isDrawingRef.current = false;
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

  const timedEvents = useMemo(
    () => events.filter((event) => !event.isUntimed),
    [events],
  );
  const untimedEvents = useMemo(
    () => events.filter((event) => event.isUntimed),
    [events],
  );
  const timedPreviewEvents = useMemo(
    () => previewEvents.filter((event) => !event.isUntimed),
    [previewEvents],
  );

  // 0. 동적 요일 범위 계산 (이벤트/선택 슬롯에 토·일 데이터가 있으면 자동으로 확장)
  const DAYS = useMemo(() => {
    const slotDays = selectedSlots.map((slot) => parseInt(slot.split("-")[0], 10));
    const eventDays = [...timedEvents, ...timedPreviewEvents].map((e) => e.day);
    const maxDay = Math.max(minDayCount - 1, 0, ...eventDays, ...slotDays);
    const dayCount = Math.min(MAX_DAY_COUNT, maxDay + 1);
    return ALL_DAY_LABELS.slice(0, dayCount);
  }, [timedEvents, timedPreviewEvents, selectedSlots, minDayCount]);

  // 1. 동적 시간 범위 계산 (기존 이벤트 + 미리보기 이벤트 포함)
  const timeSlots = useMemo(() => {
    const allEvents = [...timedEvents, ...timedPreviewEvents];
    const maxEventTime = Math.max(0, ...allEvents.map((e) => e.endTime));
    const endHour = Math.max(DEFAULT_MAX_HOUR, maxEventTime);

    const slots = [];
    for (let i = START_HOUR; i <= endHour; i++) {
      slots.push(i);
    }
    return slots;
  }, [timedEvents, timedPreviewEvents]);

  const rowCount = (timeSlots.length - 1) * 2;

  // 2. 색상 매핑
  const themeColors = useMemo(() => {
    if (!theme || !theme.colorTheme) return THEME_PALETTES.default;
    return THEME_PALETTES[theme.colorTheme] || THEME_PALETTES.default;
  }, [theme]);

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    const uniqueSubjects = Array.from(new Set(events.map((e) => e.name)));
    uniqueSubjects.forEach((subject, index) => {
      map.set(subject, themeColors[index % themeColors.length]);
    });
    return map;
  }, [events, themeColors]);

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
          <ClassName $fontSize={theme?.fontSize}>{item.name}</ClassName>
          {(theme?.showRoom ?? true) && item.room && (
            <ClassRoom $fontSize={theme?.fontSize}>{formatRoom(item.room)}</ClassRoom>
          )}
          {theme?.showProfessor && item.professor && (
            <ClassProfessor $fontSize={theme?.fontSize}>{item.professor}</ClassProfessor>
          )}
        </ItemContent>
      </ClassItemBlock>
    );
  };

  const handleUntimedClick = (item: ClassItem) => {
    if (isFreeMode || isSelectionMode) return;
    setSelectedClass(item);
    setIsBottomSheetOpen(true);
  };

  return (
    <>
      <GridContainer
        ref={containerRef}
        $rowCount={rowCount}
        $dayCount={DAYS.length}
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
              {/* First 30 minutes */}
              {DAYS.map((_, dayIndex) => {
                const timeVal = time;
                const slot = `${dayIndex}-${timeVal}`;
                const isSelected = localSelected.includes(slot);
                return (
                  <GridBackgroundCell
                    key={`bg-${timeVal}-${dayIndex}`}
                    $isSelectionMode={isSelectionMode}
                    $isSelected={isSelected}
                    $isLastDay={dayIndex === DAYS.length - 1}
                    data-day={dayIndex}
                    data-hour={timeVal}
                    onTouchStart={isSelectionMode ? (e) => handleCellTouchStart(dayIndex, timeVal, e) : undefined}
                    onTouchEnd={isSelectionMode ? handleTouchEnd : undefined}
                    onMouseDown={isSelectionMode ? () => handleMouseDown(dayIndex, timeVal) : undefined}
                    onMouseEnter={isSelectionMode ? () => handleMouseEnter(dayIndex, timeVal) : undefined}
                    onMouseUp={isSelectionMode ? handleMouseUp : undefined}
                    style={{
                      gridColumn: dayIndex + 2,
                      gridRowStart: rowIndex,
                      gridRowEnd: "span 1",
                    }}
                  />
                );
              })}
              {/* Second 30 minutes */}
              {DAYS.map((_, dayIndex) => {
                const timeVal = time + 0.5;
                const slot = `${dayIndex}-${timeVal}`;
                const isSelected = localSelected.includes(slot);
                return (
                  <GridBackgroundCell
                    key={`bg-${timeVal}-${dayIndex}`}
                    $isSelectionMode={isSelectionMode}
                    $isSelected={isSelected}
                    $isLastDay={dayIndex === DAYS.length - 1}
                    data-day={dayIndex}
                    data-hour={timeVal}
                    onTouchStart={isSelectionMode ? (e) => handleCellTouchStart(dayIndex, timeVal, e) : undefined}
                    onTouchEnd={isSelectionMode ? handleTouchEnd : undefined}
                    onMouseDown={isSelectionMode ? () => handleMouseDown(dayIndex, timeVal) : undefined}
                    onMouseEnter={isSelectionMode ? () => handleMouseEnter(dayIndex, timeVal) : undefined}
                    onMouseUp={isSelectionMode ? handleMouseUp : undefined}
                    style={{
                      gridColumn: dayIndex + 2,
                      gridRowStart: rowIndex + 1,
                      gridRowEnd: "span 1",
                    }}
                  />
                );
              })}
            </React.Fragment>
          );
        })}

        {/* (3) 기존 수업 아이템 */}
        {showClasses && timedEvents.map((item, index) => renderEventBlock(item, index, false))}

        {/* (4) 미리보기 아이템 (오버레이) */}
        {showClasses && timedPreviewEvents.map((item, index) =>
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

        {showClasses && untimedEvents.length > 0 && (
          <UntimedCourseList>
            {untimedEvents.map((item) => (
              <UntimedCourseItem
                key={`untimed-${item.id}`}
                type="button"
                onClick={() => handleUntimedClick(item)}
                disabled={isFreeMode || isSelectionMode}
              >
                <UntimedCourseName>{item.name}</UntimedCourseName>
              </UntimedCourseItem>
            ))}
          </UntimedCourseList>
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
const GridContainer = styled.div<{ $rowCount: number; $dayCount: number }>`
  display: grid;
  grid-template-columns: 24px repeat(${({ $dayCount }) => $dayCount}, minmax(0, 1fr));
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

const GridBackgroundCell = styled.div<{ $isSelectionMode?: boolean; $isSelected?: boolean; $isLastDay?: boolean }>`
  border-bottom: 1px solid #f0f0f0;
  border-right: ${({ $isLastDay }) => $isLastDay ? "none" : "1px solid #f0f0f0"};

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

const ClassName = styled.span<{ $fontSize?: "small" | "medium" | "large" }>`
  color: var(--text-secondary, #333d4b);
  font-size: ${({ $fontSize }) => 
    $fontSize === "small" ? "10px" : $fontSize === "large" ? "14px" : "12px"};
  font-style: normal;
  font-weight: 700;
  line-height: ${({ $fontSize }) => 
    $fontSize === "small" ? "12px" : $fontSize === "large" ? "16px" : "14px"};
  margin-bottom: ${({ $fontSize }) => ($fontSize === "small" ? "4px" : "8px")};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
`;

const ClassRoom = styled.span<{ $fontSize?: "small" | "medium" | "large" }>`
  color: var(--text-secondary, #333d4b);
  font-size: ${({ $fontSize }) => 
    $fontSize === "small" ? "9px" : $fontSize === "large" ? "11px" : "10px"};
  font-style: normal;
  font-weight: 500;
  line-height: 100%;
  white-space: nowrap;
`;

const ClassProfessor = styled.span<{ $fontSize?: "small" | "medium" | "large" }>`
  color: var(--text-tertiary, #8b95a1);
  font-size: ${({ $fontSize }) => 
    $fontSize === "small" ? "9px" : $fontSize === "large" ? "11px" : "10px"};
  font-style: normal;
  font-weight: 500;
  line-height: 100%;
  white-space: nowrap;
  margin-top: 4px;
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

const UntimedCourseList = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
  border-top: 1px solid var(--border-default, #e5e8eb);
`;

const UntimedCourseItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 8px 16px;
  border: 0;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:last-child {
    border-bottom: 0;
  }

  &:disabled {
    cursor: default;
  }
`;

const UntimedCourseName = styled.span`
  color: var(--text-tertiary, #6b7280);
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
