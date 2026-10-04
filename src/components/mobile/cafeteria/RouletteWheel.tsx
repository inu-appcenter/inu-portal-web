import {
  useState,
  useRef,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styled from "styled-components";

export interface RouletteWheelHandle {
  spin: () => void;
}

interface RouletteWheelProps {
  items: string[];
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: string) => void;
}

const WHEEL_COLORS = [
  "#3B82F6", // 블루
  "#F97316", // 오렌지
  "#10B981", // 에메랄드 그린
  "#EC4899", // 핑크
  "#8B5CF6", // 바이올렛
  "#F59E0B", // 앰버
  "#06B6D4", // 시안
  "#6366F1", // 인디고
];

const formatWheelText = (name: string): string[] => {
  if (name.includes("\n")) {
    const parts = name.split("\n");
    // 코너명(2번째 줄)의 부채꼴 공간 확보: [1코너(백반)] -> 1코너 백반 또는 1코너로 간결화
    const cornerPart = parts[1]
      .replace(/[\[\]]/g, "")
      .replace(/\([^)]*\)/g, "")
      .trim() || parts[1];
    return [parts[0], cornerPart];
  }

  if (name.includes("(")) {
    const parts = name.replace(")", "").split("(");
    if (parts.length === 2) {
      return [parts[0], parts[1]];
    }
  }

  if (name.includes(" ")) {
    return name.split(" ");
  }

  if (name.endsWith("식당") && name.length >= 5) {
    return [name.slice(0, -2), name.slice(-2)];
  }

  if (name.length >= 6) {
    const mid = Math.ceil(name.length / 2);
    return [name.slice(0, mid), name.slice(mid)];
  }

  return [name];
};

const WHEEL_SIZE = 210;

const RouletteWheel = forwardRef<RouletteWheelHandle, RouletteWheelProps>(
  (
    {
      items,
      isSpinning,
      onSpinStart,
      onSpinEnd,
    },
    ref,
  ) => {
    const [rotation, setRotation] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    const numItems = items.length;
    const sliceAngle = 360 / (numItems || 1);

    // 부채꼴 SVG 패스 생성
    const slices = useMemo(() => {
      const center = WHEEL_SIZE / 2;
      const radius = center - 4;

      if (numItems === 0) {
        return [];
      }

      // 단일 항목인 경우: SVG 호(arc)의 시작점과 끝점이 같으면 퇴화되어 사라지므로 원(circle)으로 명시적 생성
      if (numItems === 1) {
        const color = WHEEL_COLORS[0];
        const lines = formatWheelText(items[0]);
        return [
          {
            isFullCircle: true,
            pathData: "",
            item: items[0],
            lines,
            color,
            textX: center,
            textY: center - radius * 0.45,
            midAngle: 0,
          },
        ];
      }

      return items.map((item, index) => {
        const startAngle = index * sliceAngle;
        const endAngle = (index + 1) * sliceAngle;

        const startRad = ((startAngle - 90) * Math.PI) / 180;
        const endRad = ((endAngle - 90) * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

        const midAngle = startAngle + sliceAngle / 2;
        const midRad = ((midAngle - 90) * Math.PI) / 180;
        // 텍스트를 원 가장 바깥쪽(0.81)으로 배치하여 부채꼴의 최대 가로 공간 확보
        const textRadius = radius * 0.81;
        const textX = center + textRadius * Math.cos(midRad);
        const textY = center + textRadius * Math.sin(midRad);

        const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
        const lines = formatWheelText(item);

        return {
          isFullCircle: false,
          pathData,
          item,
          lines,
          color,
          textX,
          textY,
          midAngle,
        };
      });
    }, [items, sliceAngle, numItems]);

    const handleSpin = () => {
      if (isSpinning || items.length < 2) return;

      onSpinStart();

      const targetIndex = Math.floor(Math.random() * items.length);
      const targetItem = items[targetIndex];

      const targetMidAngle = targetIndex * sliceAngle + sliceAngle / 2;
      const extraRounds = 5 + Math.floor(Math.random() * 2);
      const baseOffset = 360 * extraRounds;

      const targetRemainder = (360 - (targetMidAngle % 360)) % 360;
      const currentRemainder = rotation % 360;
      let delta = targetRemainder - currentRemainder;
      if (delta <= 0) delta += 360;

      const nextRotation = rotation + baseOffset + delta;
      setRotation(nextRotation);

      timerRef.current = setTimeout(() => {
        onSpinEnd(targetItem);
      }, 3500);
    };

    useImperativeHandle(ref, () => ({
      spin: handleSpin,
    }));

    return (
      <Container>
        <WheelArea>
          {/* 상단 인디케이터 포인터 핀 */}
          <PointerWrapper>
            <PointerTriangle />
          </PointerWrapper>

          {/* 회전 시 외부 박스 팽창으로 인한 스크롤 방지 래퍼 */}
          <CircleClipWrapper>
            <StyledSvg
              viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
              $rotation={rotation}
              $isSpinning={isSpinning}
            >
              {numItems === 0 && (
                <circle
                  cx={WHEEL_SIZE / 2}
                  cy={WHEEL_SIZE / 2}
                  r={WHEEL_SIZE / 2 - 4}
                  fill="#f1f5f9"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}
              {slices.map((slice, idx) => (
                <g key={idx}>
                  {slice.isFullCircle ? (
                    <circle
                      cx={WHEEL_SIZE / 2}
                      cy={WHEEL_SIZE / 2}
                      r={WHEEL_SIZE / 2 - 4}
                      fill={slice.color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  ) : (
                    <path
                      d={slice.pathData}
                      fill={slice.color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  )}
                  <ItemText
                    x={slice.textX}
                    y={slice.textY}
                    transform={
                      slice.isFullCircle
                        ? undefined
                        : `rotate(${slice.midAngle}, ${slice.textX}, ${slice.textY})`
                    }
                    $isMultiLine={slice.lines.length > 1}
                    $itemCount={items.length}
                  >
                    {slice.lines.length === 1 ? (
                      <tspan x={slice.textX} dy="0.32em">
                        {slice.lines[0]}
                      </tspan>
                    ) : (
                      <>
                        <tspan x={slice.textX} dy="-0.48em">
                          {slice.lines[0]}
                        </tspan>
                        <tspan x={slice.textX} dy="1.15em">
                          {slice.lines[1]}
                        </tspan>
                      </>
                    )}
                  </ItemText>
                </g>
              ))}
              {/* 중앙 허브 원 */}
              <circle
                cx={WHEEL_SIZE / 2}
                cy={WHEEL_SIZE / 2}
                r="14"
                fill="#ffffff"
                filter="drop-shadow(0 1px 3px rgba(0,0,0,0.15))"
              />
              <circle
                cx={WHEEL_SIZE / 2}
                cy={WHEEL_SIZE / 2}
                r="7"
                fill="var(--branding-brand-blue, #0061ff)"
              />
            </StyledSvg>
          </CircleClipWrapper>
        </WheelArea>

        {items.length < 2 && (
          <WarningText>최소 2개 이상의 식당을 선택해주세요.</WarningText>
        )}
      </Container>
    );
  },
);

RouletteWheel.displayName = "RouletteWheel";

export default RouletteWheel;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 4px;
  overflow: hidden;
`;

const WheelArea = styled.div`
  position: relative;
  width: ${WHEEL_SIZE}px;
  height: ${WHEEL_SIZE}px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: 2px 0;
`;

const PointerWrapper = styled.div`
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
`;

const PointerTriangle = styled.div`
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-top: 18px solid #ef4444;
  border-radius: 3px;
`;

const CircleClipWrapper = styled.div`
  width: ${WHEEL_SIZE}px;
  height: ${WHEEL_SIZE}px;
  border-radius: 50%;
  overflow: hidden;
  contain: paint;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledSvg = styled.svg<{ $rotation: number; $isSpinning: boolean }>`
  width: 100%;
  height: 100%;
  transform: rotate(${({ $rotation }) => $rotation}deg);
  transition: ${({ $isSpinning }) =>
    $isSpinning
      ? "transform 3.5s cubic-bezier(0.12, 0.8, 0.15, 1)"
      : "none"};
  will-change: transform;
`;

const ItemText = styled.text<{ $isMultiLine?: boolean; $itemCount: number }>`
  fill: #ffffff;
  font-size: ${({ $itemCount, $isMultiLine }) =>
    $itemCount >= 9
      ? $isMultiLine
        ? "8.5px"
        : "9.5px"
      : $isMultiLine
      ? "9.5px"
      : "11px"};
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: central;
  letter-spacing: -0.2px;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.65);
`;

const WarningText = styled.span`
  font-size: 11px;
  color: var(--text-error, #ef4444);
  font-weight: 500;
`;
