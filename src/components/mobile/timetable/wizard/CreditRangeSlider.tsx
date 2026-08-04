import React, { useCallback, useRef } from "react";
import styled from "styled-components";

interface CreditRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChange: (next: { min: number; max: number }) => void;
}

// 목표 학점 듀얼 핸들 레인지 슬라이더. 기존 코드베이스에 슬라이더 라이브러리가 없어
// TimetableGrid의 포인터 드래그 패턴을 참고해 새로 작성했다.
const CreditRangeSlider = ({
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChange,
}: CreditRangeSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingHandleRef = useRef<"min" | "max" | null>(null);

  const clampToStep = useCallback(
    (raw: number) => {
      const stepped = Math.round((raw - min) / step) * step + min;
      return Math.min(max, Math.max(min, stepped));
    },
    [min, max, step],
  );

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const raw = min + ratio * (max - min);
      return clampToStep(raw);
    },
    [min, max, clampToStep],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const handle = draggingHandleRef.current;
      if (!handle) return;
      const next = valueFromClientX(e.clientX);
      if (handle === "min") {
        onChange({ min: Math.min(next, valueMax - step), max: valueMax });
      } else {
        onChange({ min: valueMin, max: Math.max(next, valueMin + step) });
      }
    },
    [valueFromClientX, onChange, valueMin, valueMax, step],
  );

  const stopDragging = useCallback(() => {
    draggingHandleRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDragging);
  }, [handlePointerMove]);

  const startDragging = (handle: "min" | "max") => (e: React.PointerEvent) => {
    e.preventDefault();
    draggingHandleRef.current = handle;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (e.target !== trackRef.current) return;
    const next = valueFromClientX(e.clientX);
    // 클릭한 지점에 더 가까운 핸들을 이동
    const distToMin = Math.abs(next - valueMin);
    const distToMax = Math.abs(next - valueMax);
    if (distToMin <= distToMax) {
      onChange({ min: Math.min(next, valueMax - step), max: valueMax });
    } else {
      onChange({ min: valueMin, max: Math.max(next, valueMin + step) });
    }
  };

  const minPercent = ((valueMin - min) / (max - min)) * 100;
  const maxPercent = ((valueMax - min) / (max - min)) * 100;

  return (
    <SliderWrapper>
      <Track ref={trackRef} onClick={handleTrackClick}>
        <TrackActive
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <Handle
          role="slider"
          aria-label="최소 학점"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={valueMin}
          style={{ left: `${minPercent}%` }}
          onPointerDown={startDragging("min")}
        />
        <Handle
          role="slider"
          aria-label="최대 학점"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={valueMax}
          style={{ left: `${maxPercent}%` }}
          onPointerDown={startDragging("max")}
        />
      </Track>
      <ScaleRow>
        <span>{min}학점</span>
        <span>{max}학점</span>
      </ScaleRow>
    </SliderWrapper>
  );
};

export default CreditRangeSlider;

const SliderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 12px 0 0;
  box-sizing: border-box;
`;

const Track = styled.div`
  position: relative;
  width: 100%;
  height: 24px;
  cursor: pointer;
  touch-action: none;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 6px;
    transform: translateY(-50%);
    border-radius: 999px;
    background: var(--border-default, #e5e8eb);
  }
`;

const TrackActive = styled.div`
  position: absolute;
  top: 50%;
  height: 6px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: var(--interactive-primary, #3b82f6);
`;

const Handle = styled.div`
  position: absolute;
  top: 50%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--bg-base, #ffffff);
  border: 2px solid var(--interactive-primary, #3b82f6);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  cursor: grab;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
`;

const ScaleRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  color: var(--text-tertiary, #8b95a1);
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
`;
