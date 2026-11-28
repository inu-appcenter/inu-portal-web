import styled from "styled-components";
import Icon from "@/components/common/Icon";

interface OnboardingFunnelHeaderProps {
  /** 현재 단계(1부터). 이 단계까지 채운다 */
  step: number;
  total: number;
  onBack?: () => void;
}

/**
 * 온보딩 퍼널 상단 (Figma Onboarding/Funnel_Progress 6269:18543).
 * 뒤로가기 + 진행 바. 시안은 5칸 고정이지만, 실제로는 사용자가 거치는 단계 수만큼 칸을 나눈다.
 */
export default function OnboardingFunnelHeader({
  step,
  total,
  onBack,
}: OnboardingFunnelHeaderProps) {
  return (
    <Wrapper>
      <BackButton
        type="button"
        onClick={onBack}
        aria-label="이전 단계로"
        $hidden={!onBack}
        disabled={!onBack}
      >
        <Icon name="chevron-left" size={24} />
      </BackButton>
      <Progress
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-label={`${total}단계 중 ${step}단계`}
      >
        {Array.from({ length: total }, (_, i) => (
          <Bar key={i} $active={i < step} />
        ))}
      </Progress>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 0 24px 12px;
  background: var(--bg-base);
  flex-shrink: 0;
`;

const BackButton = styled.button<{ $hidden: boolean }>`
  width: 40px;
  height: 40px;
  margin-left: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  background: none;
  color: var(--text-primary);
  cursor: pointer;
  visibility: ${({ $hidden }) => ($hidden ? "hidden" : "visible")};
  -webkit-tap-highlight-color: transparent;
`;

const Progress = styled.div`
  display: flex;
  gap: 6px;
  width: 100%;
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
