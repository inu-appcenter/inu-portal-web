import { useState } from "react";
import styled from "styled-components";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export interface GpaTrendPoint {
  /** x축 라벨("23-2\n학기"). 줄바꿈으로 두 줄을 그린다. */
  name: string;
  overall: number;
  /** 전공 과목이 없는 학기는 null(선이 0으로 떨어지지 않게 건너뛴다). */
  major: number | null;
}

/**
 * 학기별 추이 그래프. 리디자인 전 학점계산기 그래프를 그대로 옮겼다.
 * 점을 누르면 그 학기의 전체·전공 평점을 말풍선으로 보여준다.
 */
export default function GpaTrendChart({ data }: { data: GpaTrendPoint[] }) {
  /** 평점을 펼쳐 볼 학기(점) 인덱스. null이면 아무 값도 안 띄운다. */
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // 학기를 지우거나 새로 넣으면 펼쳐 둔 점이 다른 학기를 가리키게 되므로 닫는다.
  const [prevLength, setPrevLength] = useState(data.length);
  if (prevLength !== data.length) {
    setPrevLength(data.length);
    setActiveIndex(null);
  }

  const togglePoint = (index: number) =>
    setActiveIndex((prev) => (prev === index ? null : index));

  return (
    <>
      <LegendRow>
        <LegendItem>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
            <line x1="0" y1="4" x2="12" y2="4" stroke="var(--border-brand)" strokeWidth="2" />
          </svg>
          <span>전체 평점</span>
        </LegendItem>
        <LegendItem>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
            <line
              x1="0"
              y1="4"
              x2="12"
              y2="4"
              stroke="var(--border-warn)"
              strokeWidth="2"
              strokeDasharray="3 2"
            />
          </svg>
          <span>전공 평점</span>
        </LegendItem>
      </LegendRow>

      {data.length < 2 ? (
        <EmptyText>다음 학기부터 성적 추이를 볼 수 있어요.</EmptyText>
      ) : (
        <ChartBody>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              // 카드 폭을 최대한 쓰도록 여백을 최소로 둔다. 위쪽만 선택 시
              // 뜨는 말풍선이 잘리지 않을 만큼 남긴다.
              margin={{ top: 12, right: 4, left: 0, bottom: 30 }}
            >
              <ReferenceLine y={4.5} stroke="var(--border-default)" strokeWidth={1} />
              <ReferenceLine y={4.0} stroke="var(--border-default)" strokeWidth={1} />
              <ReferenceLine y={3.5} stroke="var(--border-default)" strokeWidth={1} />
              <ReferenceLine y={3.0} stroke="var(--border-default)" strokeWidth={1} />
              <ReferenceLine y={2.0} stroke="var(--border-default)" strokeWidth={1} />

              <XAxis
                dataKey="name"
                tick={<AxisTick />}
                axisLine={false}
                tickLine={false}
                interval={0}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                domain={[1.2, 4.8]}
                ticks={[2.0, 3.0, 3.5, 4.0, 4.5]}
                axisLine={false}
                tickLine={false}
                width={28}
                interval={0}
                tickFormatter={(val: number) => val.toFixed(1)}
                tick={{ fill: "var(--gray-500)", fontSize: 11, fontWeight: 500 }}
              />
              <Line
                type="linear"
                dataKey="overall"
                stroke="var(--border-brand)"
                strokeWidth={2.5}
                dot={
                  <PointDot
                    activeIndex={activeIndex}
                    color="var(--border-brand)"
                    onToggle={togglePoint}
                  />
                }
                label={
                  <PointLabel
                    activeIndex={activeIndex}
                    placement="top"
                    label="전체"
                    color="var(--border-brand)"
                  />
                }
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="major"
                stroke="var(--border-warn)"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                connectNulls
                dot={
                  <PointDot
                    activeIndex={activeIndex}
                    color="var(--border-warn)"
                    onToggle={togglePoint}
                  />
                }
                label={
                  <PointLabel
                    activeIndex={activeIndex}
                    placement="bottom"
                    label="전공"
                    color="var(--border-warn)"
                  />
                }
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartBody>
      )}
    </>
  );
}

/**
 * x축 라벨. 학기 수가 많으면 라벨이 옆 라벨과 겹치므로 "23-2\n학기"처럼 두 줄로 그리고,
 * 7학기 이상이면 글자 크기를 한 단계 낮춘다.
 */
function AxisTick(props: {
  x?: number;
  y?: number;
  payload?: { value?: string };
  visibleTicksCount?: number;
}) {
  const { x, y, payload, visibleTicksCount } = props;
  if (!payload || !payload.value) return null;

  const [firstLine, secondLine] = String(payload.value).split("\n");
  const fontSize = (visibleTicksCount ?? 0) >= 7 ? 10 : 11;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={12} textAnchor="middle" fill="var(--gray-500)" fontSize={fontSize} fontWeight={500}>
        {firstLine}
      </text>
      {secondLine && (
        <text
          x={0}
          y={12 + fontSize + 3}
          textAnchor="middle"
          fill="var(--gray-500)"
          fontSize={fontSize}
          fontWeight={500}
        >
          {secondLine}
        </text>
      )}
    </g>
  );
}

/** 선택된 학기의 평점 말풍선. 선택 안 된 점에는 아무것도 안 그린다. */
function PointLabel(props: {
  x?: number;
  y?: number;
  value?: number;
  index?: number;
  activeIndex: number | null;
  /** 전체 평점은 점 위에, 전공 평점은 점 아래에 둔다(값이 붙어 있어도 안 겹치게). */
  placement: "top" | "bottom";
  label: string;
  color: string;
}) {
  const { x, y, value, index, activeIndex, placement, label, color } = props;
  if (
    activeIndex === null ||
    index !== activeIndex ||
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof value !== "number"
  ) {
    return null;
  }

  const width = 58;
  const height = 18;
  const offsetY = placement === "top" ? -height - 10 : 12;

  return (
    <g transform={`translate(${x - width / 2},${y + offsetY})`}>
      <rect width={width} height={height} rx={9} fill="var(--text-inverse)" stroke={color} strokeWidth={1} />
      <text
        x={width / 2}
        y={height / 2 + 3.5}
        textAnchor="middle"
        fill="var(--gray-800)"
        fontSize={10}
        fontWeight={700}
      >
        {`${label} ${value.toFixed(2)}`}
      </text>
    </g>
  );
}

/**
 * 그래프의 점. 선택된 학기는 크게 그리고, 손가락으로 누를 수 있도록 눈에 안 보이는
 * 넓은 히트 영역을 함께 둔다(실제 점은 반지름 4px이라 그대로는 누르기 어렵다).
 */
function PointDot(props: {
  cx?: number;
  cy?: number;
  index?: number;
  activeIndex: number | null;
  color: string;
  onToggle: (index: number) => void;
}) {
  const { cx, cy, index, activeIndex, color, onToggle } = props;
  if (typeof cx !== "number" || typeof cy !== "number" || index === undefined) {
    return null;
  }

  const isActive = index === activeIndex;

  return (
    <g style={{ cursor: "pointer" }} onClick={() => onToggle(index)}>
      <circle cx={cx} cy={cy} r={16} fill="transparent" />
      {/* 선택된 점은 흰 링을 한 겹 둘러 배경선과 구분되게 키운다. */}
      {isActive && (
        <circle cx={cx} cy={cy} r={7} fill="var(--text-inverse)" stroke={color} strokeWidth={2} />
      )}
      <circle cx={cx} cy={cy} r={isActive ? 4 : 3.5} fill={color} />
    </g>
  );
}

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  span {
    font-size: 12px;
    color: var(--text-tertiary);
  }
`;

const ChartBody = styled.div`
  display: flex;
  width: 100%;
  height: 220px;

  /*
   * recharts의 accessibilityLayer(기본 켜짐)가 차트 <svg>에 tabIndex=0을 걸어서,
   * 점을 탭하면 브라우저 기본 포커스 링이 그래프 전체를 감싼다. 키보드로 들어온
   * 포커스(:focus-visible)에서는 그대로 두고, 마우스·터치일 때만 지운다.
   */
  .recharts-surface:focus:not(:focus-visible),
  .recharts-wrapper:focus:not(:focus-visible) {
    outline: none;
  }
`;

const EmptyText = styled.div`
  text-align: center;
  font-size: 14px;
  color: var(--text-disabled);
  padding: 40px 16px;
  width: 100%;
`;
