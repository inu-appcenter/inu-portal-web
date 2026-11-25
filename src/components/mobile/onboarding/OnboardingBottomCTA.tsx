import styled, { css } from "styled-components";
import { typography } from "@/styles/typography";
import { SAFE_AREA } from "@/styles/safeArea";

interface CTAButton {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface OnboardingBottomCTAProps {
  primary: CTAButton;
  /** 왼쪽 보조 버튼 (Figma Bottom_CTA State=Double) */
  secondary?: CTAButton;
  /** 버튼 위 한 줄. onCaptionClick이 있으면 링크처럼 누를 수 있다 */
  caption?: string;
  onCaptionClick?: () => void;
  /** page: 화면 아래 고정, inline: 흐름 안 (시트 등) */
  placement?: "page" | "inline";
}

/** 온보딩 하단 버튼 (Figma Bottom_CTA 1839:5947 + Button Size=L). */
export default function OnboardingBottomCTA({
  primary,
  secondary,
  caption,
  onCaptionClick,
  placement = "page",
}: OnboardingBottomCTAProps) {
  const body = (
    <Container $placement={placement}>
      {caption &&
        (onCaptionClick ? (
          <CaptionLink type="button" onClick={onCaptionClick}>
            {caption}
          </CaptionLink>
        ) : (
          <Caption>{caption}</Caption>
        ))}
      <Buttons>
        {secondary && (
          <Button
            type="button"
            $variant="outline"
            onClick={secondary.onClick}
            disabled={secondary.disabled}
          >
            {secondary.label}
          </Button>
        )}
        <Button
          type="button"
          $variant="primary"
          onClick={primary.onClick}
          disabled={primary.disabled}
        >
          {primary.label}
        </Button>
      </Buttons>
    </Container>
  );

  if (placement === "inline") return body;

  return (
    <>
      <Spacer aria-hidden $withCaption={Boolean(caption)} />
      <Fixed>{body}</Fixed>
    </>
  );
}

const Spacer = styled.div<{ $withCaption: boolean }>`
  flex-shrink: 0;
  height: calc(${({ $withCaption }) => ($withCaption ? 101 : 72)}px + ${SAFE_AREA.BOTTOM});
`;

const Fixed = styled.div`
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 100;
  width: 100%;
  max-width: 440px;
  transform: translateX(-50%);
  padding-bottom: ${SAFE_AREA.BOTTOM};
  background: var(--bg-base);
  box-sizing: border-box;
`;

const Container = styled.div<{ $placement: "page" | "inline" }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  padding: ${({ $placement }) => ($placement === "page" ? "8px 16px" : "8px 0")};
`;

const captionText = css`
  ${typography.label3}
  color: var(--text-tertiary);
  text-align: center;
`;

const Caption = styled.p`
  margin: 0;
  ${captionText}
`;

const CaptionLink = styled.button`
  ${captionText}
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
`;

const Buttons = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const Button = styled.button<{ $variant: "primary" | "outline" }>`
  flex: 1 0 0;
  min-width: 0;
  height: 48px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  white-space: nowrap;
  cursor: pointer;
  ${typography.title3}
  transition:
    background-color 0.15s ease,
    transform 0.1s ease;
  -webkit-tap-highlight-color: transparent;

  ${({ $variant }) =>
    $variant === "primary"
      ? css`
          border: 1px solid transparent;
          background: var(--interactive-primary);
          color: var(--text-on-brand);

          &:hover:not(:disabled) {
            background: var(--interactive-primary-hover);
          }
          &:active:not(:disabled) {
            background: var(--interactive-primary-pressed);
          }
          &:disabled {
            background: var(--interactive-primary-disabled);
            border-color: var(--border-default);
            color: var(--text-disabled);
            cursor: not-allowed;
          }
        `
      : css`
          border: 1px solid var(--border-default);
          background: var(--bg-base);
          color: var(--text-primary);

          &:active:not(:disabled) {
            background: var(--bg-subtle);
          }
          &:disabled {
            color: var(--text-disabled);
            cursor: not-allowed;
          }
        `}

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;
