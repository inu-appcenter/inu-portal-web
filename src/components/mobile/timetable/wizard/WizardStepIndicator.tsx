import styled from "styled-components";

interface WizardStepIndicatorProps {
  step: 1 | 2 | 3;
}

const TOTAL_STEPS = 3;

const WizardStepIndicator = ({ step }: WizardStepIndicatorProps) => (
  <IndicatorRow>
    {Array.from({ length: TOTAL_STEPS }, (_, i) => (
      <Bar key={i} $active={i < step} />
    ))}
  </IndicatorRow>
);

export default WizardStepIndicator;

const IndicatorRow = styled.div`
  display: flex;
  gap: 6px;
  padding: 0 20px 12px;
  flex-shrink: 0;
`;

const Bar = styled.div<{ $active: boolean }>`
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: ${({ $active }) =>
    $active ? "var(--interactive-primary, #3b82f6)" : "var(--border-default, #e5e8eb)"};
`;
