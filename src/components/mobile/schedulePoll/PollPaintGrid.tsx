import { useEffect, useRef, type PointerEvent } from "react";
import styled from "styled-components";
import { typography } from "@/styles/typography";
import {
  SLOT_MINUTES,
  cellIndex,
  type PollGridShape,
  type PollOverlayItem,
} from "@/utils/schedulePoll";
import PollGridFrame, { POLL_ROW_HEIGHT, PollGridCell } from "./PollGrid";

interface PollPaintGridProps {
  shape: PollGridShape;
  /** 칠한 칸 = 되는 시간. 빈 칸은 안 되는 시간이다(FR-032: 데이터는 가능 칸 집합 하나) */
  painted: boolean[];
  /** 칠한 칸 위에 반투명하게 겹쳐 보여 줄 대표 시간표 수업. 터치는 통과한다 */
  overlayItems: PollOverlayItem[];
  onPaintedChange: (next: boolean[]) => void;
  disabled?: boolean;
}

interface Cell {
  column: number;
  row: number;
}

interface Gesture {
  pointerId: number;
  start: Cell;
  startX: number;
  startY: number;
  /** 드래그 시작 전 상태. 드래그 중에는 여기서 사각형만 덮어써 다시 그린다 */
  base: boolean[];
  /** 빈 칸에서 시작하면 칠하고, 칠한 칸에서 시작하면 지운다(FR-031) */
  value: boolean;
  dragging: boolean;
  isTouch: boolean;
  timer: number | null;
}

/** 터치에서 이 시간만큼 누르고 있으면 칠하기 드래그로 본다. 그 전에 움직이면 스크롤이다 */
const LONG_PRESS_MS = 220;
const SCROLL_SLOP_PX = 8;

/**
 * 내 일정 입력 그리드 (Figma C. 내 일정 입력).
 *
 * 가로·세로 스크롤과 칠하기 드래그가 충돌하지 않도록 터치는 '꾹 누른 뒤 끌기'로 칠한다.
 * 짧게 누르면 한 칸을 토글하고, 바로 움직이면 평소처럼 스크롤된다.
 * 수업은 모드 없이 회색 반투명으로만 보여 준다. 손대지 않으면 빈 칸이라 '안 돼요'고,
 * 휴강처럼 되는 경우엔 그대로 칠하면 된다.
 * 마우스는 누른 채 끌면 바로 칠한다.
 */
const PollPaintGrid = ({
  shape,
  painted,
  overlayItems,
  onPaintedChange,
  disabled,
}: PollPaintGridProps) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture | null>(null);

  // 길게 눌러 칠하는 동안에는 페이지가 스크롤되지 않게 막는다.
  // React의 touchmove는 passive라 preventDefault가 먹지 않아 직접 건다.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const handleTouchMove = (event: TouchEvent) => {
      if (gestureRef.current?.dragging) event.preventDefault();
    };
    body.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => body.removeEventListener("touchmove", handleTouchMove);
  }, []);

  useEffect(
    () => () => {
      const timer = gestureRef.current?.timer;
      if (timer != null) window.clearTimeout(timer);
    },
    [],
  );

  const locate = (clientX: number, clientY: number): Cell | null => {
    const body = bodyRef.current;
    if (!body || shape.columns.length === 0 || shape.rowCount === 0) return null;
    const rect = body.getBoundingClientRect();
    const clamp = (value: number, max: number) =>
      Math.min(Math.max(value, 0), max);
    return {
      column: clamp(
        Math.floor(((clientX - rect.left) / rect.width) * shape.columns.length),
        shape.columns.length - 1,
      ),
      row: clamp(
        Math.floor((clientY - rect.top) / POLL_ROW_HEIGHT),
        shape.rowCount - 1,
      ),
    };
  };

  const paintRect = (gesture: Gesture, to: Cell) => {
    const next = [...gesture.base];
    const [columnFrom, columnTo] = [
      Math.min(gesture.start.column, to.column),
      Math.max(gesture.start.column, to.column),
    ];
    const [rowFrom, rowTo] = [
      Math.min(gesture.start.row, to.row),
      Math.max(gesture.start.row, to.row),
    ];
    for (let column = columnFrom; column <= columnTo; column += 1) {
      for (let row = rowFrom; row <= rowTo; row += 1) {
        next[cellIndex(shape, column, row)] = gesture.value;
      }
    }
    onPaintedChange(next);
  };

  const endGesture = () => {
    const gesture = gestureRef.current;
    if (gesture?.timer != null) window.clearTimeout(gesture.timer);
    gestureRef.current = null;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || gestureRef.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const start = locate(event.clientX, event.clientY);
    if (!start) return;

    const isTouch = event.pointerType !== "mouse";
    const gesture: Gesture = {
      pointerId: event.pointerId,
      start,
      startX: event.clientX,
      startY: event.clientY,
      base: painted,
      value: !painted[cellIndex(shape, start.column, start.row)],
      dragging: false,
      isTouch,
      timer: null,
    };
    gestureRef.current = gesture;

    if (isTouch) {
      gesture.timer = window.setTimeout(() => {
        gesture.timer = null;
        if (gestureRef.current !== gesture) return;
        gesture.dragging = true;
        navigator.vibrate?.(10);
        paintRect(gesture, gesture.start);
      }, LONG_PRESS_MS);
    } else {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const cell = locate(event.clientX, event.clientY);
    if (!cell) return;

    if (!gesture.dragging) {
      if (gesture.isTouch) {
        // 길게 누르기 전에 움직였으면 스크롤 의도다. 칠하지 않고 손을 뗀다.
        const moved = Math.hypot(
          event.clientX - gesture.startX,
          event.clientY - gesture.startY,
        );
        if (moved > SCROLL_SLOP_PX) endGesture();
        return;
      }
      if (cell.column === gesture.start.column && cell.row === gesture.start.row) {
        return;
      }
      gesture.dragging = true;
    }
    paintRect(gesture, cell);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    endGesture();
    if (gesture.dragging) return;

    // 짧게 누름: 한 칸을 토글한다.
    const index = cellIndex(shape, gesture.start.column, gesture.start.row);
    const next = [...gesture.base];
    next[index] = gesture.value;
    onPaintedChange(next);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    endGesture();
    // 브라우저가 제스처를 가져갔으면(스크롤 등) 칠하던 내용을 되돌린다.
    if (gesture.dragging) onPaintedChange(gesture.base);
  };

  return (
    <PollGridFrame
      ref={bodyRef}
      shape={shape}
      bodyProps={{
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerCancel,
        onContextMenu: (event) => event.preventDefault(),
        style: {
          cursor: disabled ? "default" : "pointer",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
        },
      }}
      renderColumn={(column) => (
        <>
          {Array.from({ length: shape.rowCount }, (_unused, row) => {
            const index = cellIndex(shape, column, row);
            const minutes = shape.rangeStartMin + (row + 1) * SLOT_MINUTES;
            return (
              <Cell
                key={row}
                $hourEnd={minutes % 60 === 0 || row === shape.rowCount - 1}
                $painted={painted[index]}
              />
            );
          })}
          {overlayItems.flatMap((item) =>
            item.blocks
              .filter((block) => block.column === column)
              .map((block) => (
                <OverlayBlock
                  key={`${item.id}-${block.rowStart}`}
                  style={{
                    top: block.rowStart * POLL_ROW_HEIGHT,
                    height: (block.rowEnd - block.rowStart) * POLL_ROW_HEIGHT,
                  }}
                >
                  <span>{item.title}</span>
                </OverlayBlock>
              )),
          )}
        </>
      )}
    />
  );
};

export default PollPaintGrid;

// 시안 C: 칠한 칸 = blue/300. 수업 = bg/disabled 50% 반투명(poll/class-overlay 토큰 대기).
const Cell = styled(PollGridCell)<{ $painted: boolean }>`
  background: ${({ $painted }) => ($painted ? "var(--blue-300)" : "var(--bg-base)")};
`;

const OverlayBlock = styled.div`
  position: absolute;
  left: 1px;
  right: 2px;
  box-sizing: border-box;
  padding: 3px 4px;
  overflow: hidden;
  /* 터치는 통과해 칠하기·지우기와 꼬이지 않는다 */
  pointer-events: none;
  border-radius: 4px;
  color: var(--text-secondary);

  /* 배경만 반투명하게 깔아 칠한 파랑이 비쳐 보이고 강의명은 그대로 남는다 */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--bg-disabled);
    opacity: 0.5;
  }

  span {
    position: relative;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
    ${typography.caption1}
    font-size: 10px;
    line-height: 1.3;
  }
`;
