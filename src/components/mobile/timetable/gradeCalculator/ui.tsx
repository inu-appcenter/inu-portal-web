import styled, { css } from "styled-components";
import { typography } from "@/styles/typography";

// 학점계산기 리디자인(Figma 02-07 "리디자인") 화면에서 같이 쓰는 조각들.
// Figma 컴포넌트 Badge·Chip·Button(M)·Progress Bar를 이 화면에 필요한 만큼만 옮겼다.

/** 흰 카드(라운드 20, 패딩 20). 화면 배경은 --bg-subtle이다. */
export const SectionCard = styled.section<{ $gap?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 16 }) => `${$gap}px`};
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
  border-radius: 20px;
  background: var(--bg-base);
`;

export const CardTitle = styled.h3`
  ${typography.title3}
  margin: 0;
  color: var(--text-primary);
`;

export const Divider = styled.hr`
  width: 100%;
  height: 1px;
  margin: 0;
  border: none;
  background: var(--border-default);
`;

export type BadgeTone = "brand" | "neutral" | "warn" | "danger" | "success";

const BADGE_TONES: Record<BadgeTone, ReturnType<typeof css>> = {
  brand: css`
    background: var(--bg-brand);
    color: var(--text-brand);
  `,
  neutral: css`
    background: var(--bg-muted);
    color: var(--text-secondary);
  `,
  warn: css`
    background: var(--bg-warn);
    color: var(--text-warn);
  `,
  danger: css`
    background: var(--bg-error);
    color: var(--text-error);
  `,
  // Figma Badge 설명: success는 시맨틱 토큰이 없어 green/50·green/700 원시값을 쓴다.
  success: css`
    background: var(--green-50);
    color: var(--green-700);
  `,
};

/** Figma Badge Size S(caption/1). 누를 수 없는 상태 라벨. */
export const Badge = styled.span<{ $tone?: BadgeTone }>`
  ${typography.caption1}
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  ${({ $tone = "neutral" }) => BADGE_TONES[$tone]}
`;

/** Figma Chip Size M, Color primary. 학기 선택에 쓴다. */
export const SelectChip = styled.button<{ $selected: boolean }>`
  ${typography.label2}
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: 40px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  border: 1px solid
    ${({ $selected }) =>
      $selected ? "var(--border-brand)" : "var(--border-default)"};
  background: ${({ $selected }) =>
    $selected ? "var(--interactive-primary)" : "var(--bg-base)"};
  color: ${({ $selected }) =>
    $selected ? "var(--text-on-brand)" : "var(--text-secondary)"};
  white-space: nowrap;
  cursor: pointer;

  /* Figma Chip 설명: 터치 영역은 세로 44px 이상 */
  &::before {
    content: "";
    position: absolute;
    inset: -2px 0;
  }
`;

type ActionButtonTone = "muted" | "outline";

/** Figma Button Size M(44, label/2). muted = bg/muted 채움, outline = 흰 배경 + 테두리. */
export const ActionButton = styled.button<{ $tone?: ActionButtonTone }>`
  ${typography.label2}
  display: inline-flex;
  flex: 1 0 0;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-width: 0;
  height: 44px;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  ${({ $tone = "muted" }) =>
    $tone === "muted"
      ? css`
          border: none;
          background: var(--bg-muted);
        `
      : css`
          border: 1px solid var(--border-default);
          background: var(--bg-base);
        `}

  &:active:not(:disabled) {
    box-shadow: inset 0 0 0 999px rgba(0, 0, 0, 0.08);
  }

  &:disabled {
    background: var(--bg-disabled);
    color: var(--text-disabled);
    cursor: default;
  }
`;

/** 카드 안 접기/펼치기 줄. 전체가 눌리는 버튼이다. */
export const FoldTrigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 4px 0;
  border: none;
  background: none;
  color: var(--text-tertiary);
  text-align: left;
  cursor: pointer;
`;

export const ProgressTrack = styled.div`
  position: relative;
  width: 100%;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--bg-muted);
`;

export const ProgressFill = styled.div<{ $ratio: number; $done?: boolean }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: ${({ $ratio }) => `${Math.max(0, Math.min(1, $ratio)) * 100}%`};
  border-radius: var(--radius-full);
  background: ${({ $done }) =>
    $done ? "var(--border-success)" : "var(--interactive-primary)"};
  transition: width 0.3s ease;
`;

/** 목표 평점 위치 표시(검정 세로 막대). */
export const ProgressMarker = styled.div<{ $ratio: number }>`
  position: absolute;
  top: 50%;
  left: ${({ $ratio }) => `${Math.max(0, Math.min(1, $ratio)) * 100}%`};
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: var(--text-primary);
  transform: translate(-50%, -50%);
`;
