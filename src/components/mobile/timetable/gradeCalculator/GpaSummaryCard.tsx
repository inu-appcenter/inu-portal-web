import styled from "styled-components";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import Icon from "@/components/common/Icon";
import SlidingNumber from "@/components/common/SlidingNumber";
import { typography } from "@/styles/typography";
import { MAX_GPA } from "@/utils/graduationRequirements";
import {
  ActionButton,
  Divider,
  FoldTrigger,
  ProgressFill,
  ProgressMarker,
  ProgressTrack,
  SectionCard,
} from "./ui";

export interface GpaTrendPoint {
  /** x축 라벨("24-2") */
  name: string;
  overall: number;
  major: number | null;
}

interface GpaSummaryCardProps {
  overallGpa: number;
  majorGpa: number;
  acquiredCredits: number;
  targetCredits: number;
  targetGpa: number | null;
  /** 목표 평점에 닿으려면 남은 학점에서 받아야 하는 평균. 계산할 수 없으면 null. */
  requiredAverageGpa: number | null;
  remainingCredits: number;
  trend: GpaTrendPoint[];
  /** "24-2 평점이 가장 낮아요 · F 1과목(통계학입문)" 같은 한 줄 요약. 없으면 null. */
  trendCaption: string | null;
  expanded: boolean;
  onToggle: () => void;
  onEditTargetGpa: () => void;
  onEditTargetCredits: () => void;
}

/**
 * Figma "리디자인 / 메인 · 기본(접힘)"(7885:32518)·"메인 · 펼침"(7885:32673)의 요약 카드.
 * 접힘: 전체 평점 + 전공·취득 / 펼침: 목표 평점 진행도 + 학기별 추이 그래프.
 */
export default function GpaSummaryCard({
  overallGpa,
  majorGpa,
  acquiredCredits,
  targetCredits,
  targetGpa,
  requiredAverageGpa,
  remainingCredits,
  trend,
  trendCaption,
  expanded,
  onToggle,
  onEditTargetGpa,
  onEditTargetCredits,
}: GpaSummaryCardProps) {
  const targetLabel =
    targetGpa === null
      ? "목표 평점 미설정"
      : `목표 평점 ${targetGpa.toFixed(2)}`;

  const notice = (() => {
    if (targetGpa === null) {
      return {
        tone: "info" as const,
        text: "목표 평점을 정하면 남은 학점에서 받아야 할 평점을 알려드려요.",
      };
    }
    if (requiredAverageGpa === null) {
      return {
        tone: "info" as const,
        text: "남은 학점이 없어 목표 평점을 계산할 수 없어요.",
      };
    }
    if (requiredAverageGpa > MAX_GPA) {
      return {
        tone: "warn" as const,
        text: `남은 ${remainingCredits}학점을 모두 A+ 받아도 ${targetGpa.toFixed(2)}에 닿기 어려워요`,
      };
    }
    if (requiredAverageGpa <= 0) {
      return {
        tone: "info" as const,
        text: "지금 평점으로 이미 목표를 넘었어요.",
      };
    }
    return {
      tone: "info" as const,
      text: `남은 ${remainingCredits}학점에서 평균 ${requiredAverageGpa.toFixed(2)} 이상 받으면 목표에 닿아요`,
    };
  })();

  return (
    <SectionCard>
      <Metrics>
        <MainMetric>
          <MetricLabel>전체 평점</MetricLabel>
          <MainValueRow>
            <MainValue>
              <SlidingNumber value={overallGpa.toFixed(2)} />
            </MainValue>
            <MaxText>/ 4.5</MaxText>
          </MainValueRow>
        </MainMetric>
        <SubMetrics>
          <SubMetric>
            <SubLabel>전공</SubLabel>
            <SubValue>{majorGpa.toFixed(2)}</SubValue>
          </SubMetric>
          <SubMetric>
            <SubLabel>취득</SubLabel>
            <ValueGroup>
              <SubValue>{acquiredCredits}</SubValue>
              <SubLabel>/{targetCredits}학점</SubLabel>
            </ValueGroup>
          </SubMetric>
        </SubMetrics>
      </Metrics>

      <Divider />

      <FoldTrigger type="button" onClick={onToggle} aria-expanded={expanded}>
        <TriggerText>
          <strong>{targetLabel}</strong>
          {!expanded && <span>· 학기별 추이</span>}
        </TriggerText>
        <Icon name={expanded ? "chevron-up" : "chevron-down"} size={20} />
      </FoldTrigger>

      {expanded && (
        <>
          <TargetSection>
            <ProgressTrack>
              <ProgressFill $ratio={overallGpa / MAX_GPA} />
              {targetGpa !== null && (
                <ProgressMarker $ratio={targetGpa / MAX_GPA} />
              )}
            </ProgressTrack>
            <ScaleLabels>
              <span>현재 {overallGpa.toFixed(2)}</span>
              {targetGpa !== null && <span>목표 {targetGpa.toFixed(2)}</span>}
            </ScaleLabels>
            <Notice $tone={notice.tone}>
              {notice.tone === "warn" && (
                <Icon
                  name="triangle-warning"
                  size={16}
                  className="notice-icon"
                />
              )}
              <span>{notice.text}</span>
            </Notice>
            <ButtonRow>
              <ActionButton type="button" onClick={onEditTargetGpa}>
                {targetGpa === null ? "목표 평점 설정" : "목표 평점 수정"}
              </ActionButton>
              <ActionButton type="button" onClick={onEditTargetCredits}>
                졸업 학점 수정
              </ActionButton>
            </ButtonRow>
          </TargetSection>

          <Divider />

          <TrendTitle>학기별 추이</TrendTitle>
          {trend.length < 2 ? (
            <EmptyTrend>다음 학기부터 성적 추이를 볼 수 있어요.</EmptyTrend>
          ) : (
            <>
              <ChartBox>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trend}
                    margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      horizontal
                      vertical={false}
                      stroke="var(--border-default)"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      padding={{ left: 8, right: 8 }}
                      tick={<TrendXTick lastIndex={trend.length - 1} />}
                    />
                    <YAxis
                      domain={[1.5, MAX_GPA]}
                      ticks={[2.5, 3.5, 4.5]}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                      tickFormatter={(v: number) => v.toFixed(1)}
                      tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
                    />
                    {targetGpa !== null && (
                      <ReferenceLine
                        y={targetGpa}
                        stroke="var(--border-warn)"
                        strokeDasharray="4 4"
                        label={{
                          value: "목표",
                          position: "insideTopLeft",
                          fill: "var(--text-warn)",
                          fontSize: 12,
                        }}
                      />
                    )}
                    <Line
                      type="linear"
                      dataKey="major"
                      stroke="var(--text-tertiary)"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                      connectNulls
                      isAnimationActive={false}
                    />
                    <Line
                      type="linear"
                      dataKey="overall"
                      stroke="var(--interactive-primary)"
                      strokeWidth={2}
                      dot={{
                        r: 3.5,
                        fill: "var(--bg-base)",
                        stroke: "var(--interactive-primary)",
                        strokeWidth: 2,
                      }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartBox>
              <Legend>
                <LegendItem>
                  <LegendSwatch $color="var(--interactive-primary)" />
                  전체 평점
                </LegendItem>
                <LegendItem>
                  <LegendSwatch $color="var(--text-tertiary)" />
                  전공 평점
                </LegendItem>
              </Legend>
              {trendCaption && <TrendCaption>{trendCaption}</TrendCaption>}
            </>
          )}
        </>
      )}
    </SectionCard>
  );
}

/** x축 라벨. 마지막(최근) 학기만 진하게 표시한다. */
function TrendXTick(props: {
  x?: number;
  y?: number;
  index?: number;
  payload?: { value: string };
  lastIndex: number;
}) {
  const { x = 0, y = 0, index = 0, payload, lastIndex } = props;
  const isLast = index === lastIndex;
  return (
    <text
      x={x}
      y={y + 12}
      textAnchor="middle"
      fontSize={12}
      fill={isLast ? "var(--text-primary)" : "var(--text-tertiary)"}
    >
      {payload?.value}
    </text>
  );
}

const Metrics = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

const MainMetric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MetricLabel = styled.span`
  ${typography.label2}
  color: var(--text-secondary);
`;

const MainValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

const MainValue = styled.span`
  font-size: 40px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -1.2px;
  color: var(--text-primary);
`;

const MaxText = styled.span`
  ${typography.caption1}
  color: var(--text-tertiary);
`;

const SubMetrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 6px;
`;

const SubMetric = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const ValueGroup = styled.span`
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
`;

const SubLabel = styled.span`
  ${typography.caption1}
  color: var(--text-tertiary);
`;

const SubValue = styled.span`
  ${typography.title4}
  color: var(--text-primary);
`;

const TriggerText = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  strong {
    ${typography.title4}
    color: var(--text-primary);
  }

  span {
    ${typography.label2}
    color: var(--text-secondary);
  }
`;

const TargetSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ScaleLabels = styled.div`
  ${typography.caption1}
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
`;

const Notice = styled.div<{ $tone: "warn" | "info" }>`
  ${typography.caption1}
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  background: ${({ $tone }) =>
    $tone === "warn" ? "var(--bg-warn-subtle)" : "var(--bg-subtle)"};
  color: ${({ $tone }) =>
    $tone === "warn" ? "var(--text-warn)" : "var(--text-secondary)"};

  .notice-icon {
    flex-shrink: 0;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const TrendTitle = styled.p`
  ${typography.title4}
  margin: 0;
  color: var(--text-primary);
`;

const EmptyTrend = styled.p`
  ${typography.caption1}
  margin: 0;
  color: var(--text-tertiary);
`;

const ChartBox = styled.div`
  width: 100%;
  height: 140px;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LegendItem = styled.span`
  ${typography.caption1}
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
`;

const LegendSwatch = styled.span<{ $color: string }>`
  width: 10px;
  height: 3px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
`;

const TrendCaption = styled.p`
  ${typography.caption1}
  margin: 0;
  color: var(--text-secondary);
`;
