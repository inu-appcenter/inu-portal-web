import styled from "styled-components";
import { buttonReset } from "./tokens";
import { typography } from "@/styles/typography";
import { effects } from "@/styles/effects";

interface WizardBottomCTAProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  /**
   * page: 화면 하단 고정 바. 뒤로 본문이 비쳐 보이지 않게 Bottom_Gradient를 깔고,
   *       좌우 여백을 본문(16px)과 맞춘다.
   * sheet: 공용 BottomSheet 안. 시트가 이미 좌우 20px·아래 안전영역을 두므로 4px만 더해
   *        시안의 24px에 맞춘다.
   * inline: 흐름 안에 그대로 둔다(미리보기·테스트용).
   */
  placement?: "page" | "sheet" | "inline";
  type?: "button" | "submit";
}

/**
 * 하단 주 버튼 (Figma Bottom_CTA + Bottom_Gradient).
 *
 * 시안의 CTA 컨테이너는 좌우 24px인데 본문 카드는 16px이라, 한 화면에 두면 버튼만
 * 안쪽으로 들어가 보인다(리뷰 피드백). 화면 하단 버튼은 본문 가장자리와 맞춰 16px을 쓴다.
 */
const WizardBottomCTA = ({
  children,
  onClick,
  disabled,
  loading,
  placement = "page",
  type = "button",
}: WizardBottomCTAProps) => {
  const button = (
    <Button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={onClick}
    >
      {loading ? <Spinner aria-hidden /> : children}
    </Button>
  );

  if (placement === "page") {
    return (
      <>
        {/* 고정 바에 가려지는 만큼 본문 끝에 여백을 둔다 (Figma BottomScrollSpacer) */}
        <ScrollSpacer aria-hidden />
        <FixedBar>{button}</FixedBar>
      </>
    );
  }

  return <Container $placement={placement}>{button}</Container>;
};

export default WizardBottomCTA;

const ScrollSpacer = styled.div`
  flex-shrink: 0;
  height: calc(96px + env(safe-area-inset-bottom, 0px));
`;

const FixedBar = styled.div`
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 100;
  width: 100%;
  max-width: 768px;
  transform: translateX(-50%);
  box-sizing: border-box;
  /* 그라데이션이 버튼 위로 번지는 높이만큼 위 여백을 둔다 (Figma Bottom_Gradient 120px) */
  padding: 48px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(
    to bottom,
    rgba(248, 249, 251, 0) 16%,
    var(--bg-subtle) 50%
  );
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

const Container = styled.div<{ $placement: "sheet" | "inline" }>`
  width: 100%;
  box-sizing: border-box;
  padding: ${({ $placement }) =>
    $placement === "sheet" ? "8px 4px" : "8px 16px"};
`;

const Button = styled.button`
  ${buttonReset}
  width: 100%;
  height: 48px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--interactive-primary);
  color: var(--text-inverse);
  white-space: nowrap;
  ${effects.elevation1}
  transition:
    background-color 0.15s ease,
    transform 0.1s ease;
  ${typography.title3}

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    background: var(--interactive-primary-disabled);
    color: var(--text-disabled);
    box-shadow: none;
  }

  &[aria-busy="true"] {
    background: var(--interactive-primary);
  }
`;

const Spinner = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: var(--bg-base);
  animation: wizard-cta-spin 0.8s linear infinite;

  @keyframes wizard-cta-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
