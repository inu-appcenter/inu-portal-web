import type { ReactNode } from "react";
import styled, { css } from "styled-components";
import { buttonReset } from "@/components/mobile/timetable/wizard/ui/tokens";
import { typography } from "@/styles/typography";
import { effects } from "@/styles/effects";
import { SAFE_AREA } from "@/styles/safeArea";

// 시간 맞추기 화면들이 함께 쓰는 틀 (Figma INTIP / 짭투밋 5970:19857).

export const PollPage = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--header-height));
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-subtle);
`;

export const PollBody = styled.div<{ $gap?: number }>`
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 16 }) => $gap}px;
`;

export const PollCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  border-radius: 16px;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
`;

/** 필드 묶음 제목 (heading/3) */
export const PollFieldLabel = styled.span`
  padding: 0 4px;
  color: var(--text-primary);
  ${typography.heading3}
  line-height: 1.6;
`;

export const PollFieldHint = styled.span`
  padding: 0 4px;
  color: var(--text-tertiary);
  ${typography.caption1}
`;

/** 인원·상태 배지. brand: 강조(전원 가능 등), neutral: 일반, warn: 이전 결과 등 */
export const PollBadge = styled.span<{ $tone?: "brand" | "neutral" | "warn" }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 4px 9px;
  border-radius: 999px;
  white-space: nowrap;
  ${typography.caption1}
  ${({ $tone = "neutral" }) =>
    $tone === "brand"
      ? css`
          background: var(--bg-brand);
          color: var(--text-brand);
        `
      : $tone === "warn"
        ? css`
            background: var(--bg-warn);
            color: var(--text-warn);
          `
        : css`
            background: var(--bg-muted);
            color: var(--text-secondary);
          `}
`;

const buttonBase = css`
  ${buttonReset}
  height: 48px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    transform 0.1s ease;
  ${typography.title3}

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

export const PollPrimaryButton = styled.button`
  ${buttonBase}
  flex: 1 0 0;
  min-width: 0;
  background: var(--interactive-primary);
  color: var(--text-inverse);
  ${effects.elevation1}

  &:active:not(:disabled) {
    background: var(--interactive-primary-pressed);
  }

  &:disabled {
    background: var(--interactive-primary-disabled);
    color: var(--text-disabled);
    box-shadow: none;
  }
`;

export const PollSecondaryButton = styled.button`
  ${buttonBase}
  flex-shrink: 0;
  border: 1px solid var(--border-default);
  background: var(--bg-subtle);
  color: var(--text-secondary);

  &:disabled {
    color: var(--text-disabled);
  }
`;

interface PollBottomBarProps {
  children: ReactNode;
  /** 버튼 위에 얹는 한 줄 안내 */
  caption?: ReactNode;
}

/** 화면 하단 고정 버튼 영역 (Figma Bottom_CTA + Bottom_Gradient + BottomScrollSpacer). */
export const PollBottomBar = ({ children, caption }: PollBottomBarProps) => (
  <>
    <BottomSpacer aria-hidden $withCaption={Boolean(caption)} />
    <FixedBar>
      {caption && <BarCaption>{caption}</BarCaption>}
      <BarButtons>{children}</BarButtons>
    </FixedBar>
  </>
);

const BottomSpacer = styled.div<{ $withCaption: boolean }>`
  flex-shrink: 0;
  height: calc(
    ${({ $withCaption }) => ($withCaption ? 124 : 96)}px +
      ${SAFE_AREA.BOTTOM}
  );
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
  padding: 12px 16px calc(16px + ${SAFE_AREA.BOTTOM});
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

const BarCaption = styled.p`
  margin: 0;
  color: var(--text-tertiary);
  text-align: center;
  ${typography.caption1}
`;

const BarButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

interface PollNoticeProps {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

/** 로딩·오류·입장 불가처럼 화면 전체를 대신하는 안내. */
export const PollNotice = ({ title, description, children }: PollNoticeProps) => (
  <NoticeWrapper>
    <NoticeTitle>{title}</NoticeTitle>
    {description && <NoticeDescription>{description}</NoticeDescription>}
    {children && <NoticeActions>{children}</NoticeActions>}
  </NoticeWrapper>
);

const NoticeWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 80px 24px;
  text-align: center;
`;

const NoticeTitle = styled.h2`
  margin: 0;
  color: var(--text-primary);
  ${typography.title2}
`;

const NoticeDescription = styled.p`
  margin: 0;
  color: var(--text-tertiary);
  white-space: pre-line;
  ${typography.body2}
`;

const NoticeActions = styled.div`
  width: 100%;
  max-width: 320px;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
