import styled from "styled-components";

interface WizardStepIndicatorProps {
  /** 현재 단계(1부터). 이 단계까지 채운다 */
  step: number;
  /** 전체 단계 수. 새 시안은 강의선택 → 조건설정 2단계 */
  total?: number;
}

const DEFAULT_TOTAL_STEPS = 3;

// Figma Step_Indicator (3485:14030): 높이 16, 좌우 24, 막대 사이 8, 막대 h4 r2
const WizardStepIndicator = ({
  step,
  total = DEFAULT_TOTAL_STEPS,
}: WizardStepIndicatorProps) => (
  <IndicatorRow
    role="progressbar"
    aria-valuemin={1}
    aria-valuemax={total}
    aria-valuenow={step}
    aria-label={`${total}단계 중 ${step}단계`}
  >
    {Array.from({ length: total }, (_, i) => (
      <Bar key={i} $active={i < step} />
    ))}
  </IndicatorRow>
);

export default WizardStepIndicator;

const IndicatorRow = styled.div`
  height: 16px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const Bar = styled.div<{ $active: boolean }>`
  flex: 1 0 0;
  min-width: 0;
  height: 4px;
  border-radius: 2px;
  background: ${({ $active }) =>
    $active ? "var(--interactive-primary)" : "var(--border-default)"};
  transition: background-color 0.2s ease;
`;
