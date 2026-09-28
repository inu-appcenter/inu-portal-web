import styled, { css } from "styled-components";
import { typo, WIZARD_SUCCESS } from "./tokens";

export type WizardTagTone = "brand" | "success" | "warn" | "error";

interface WizardTagProps {
  children: React.ReactNode;
  tone?: WizardTagTone;
  /** sm: 강의 카드 메타(py 2px) / md: 결과 카드 태그(py 4px) */
  size?: "sm" | "md";
  className?: string;
}

/**
 * 읽기 전용 pill 태그. Figma의 `button` 인스턴스(추천·전공핵심·조건 충족 등)이지만
 * 눌리는 동작이 없어서 span으로 그린다.
 */
const WizardTag = ({
  children,
  tone = "brand",
  size = "md",
  className,
}: WizardTagProps) => (
  <Tag $tone={tone} $size={size} className={className}>
    {children}
  </Tag>
);

export default WizardTag;

const TONE_STYLES: Record<WizardTagTone, ReturnType<typeof css>> = {
  brand: css`
    background: var(--bg-brand, #eff6ff);
    border-color: var(--border-brand-subtle, #d3e5ff);
    color: var(--text-brand, #0061ff);
  `,
  success: css`
    background: ${WIZARD_SUCCESS.bg};
    border-color: ${WIZARD_SUCCESS.border};
    color: ${WIZARD_SUCCESS.text};
  `,
  warn: css`
    background: var(--bg-warn, #fffaeb);
    /* 시안이 테두리에 bg/warn-subtle을 쓴다(border 토큰 아님) */
    border-color: var(--border-warn-subtle, #fef3c7);
    color: var(--text-warn, #b58000);
  `,
  error: css`
    background: var(--bg-error, #fff0f0);
    border-color: var(--border-error-subtle, #ffd8d8);
    color: var(--text-error, #ef4444);
  `,
};

const Tag = styled.span<{ $tone: WizardTagTone; $size: "sm" | "md" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: ${({ $size }) => ($size === "sm" ? "2px 8px" : "4px 8px")};
  border: 1px solid transparent;
  border-radius: 999px;
  white-space: nowrap;
  ${typo.label3}
  ${({ $tone }) => TONE_STYLES[$tone]}
`;
