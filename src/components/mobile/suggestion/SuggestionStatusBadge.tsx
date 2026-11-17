import styled, { css } from "styled-components";
import { typography } from "@/styles/typography";
import {
  SUGGESTION_STATUS_LABEL,
  type SuggestionStatus,
} from "@/types/suggestions";

// 반영 예정·보류는 Figma에 색이 없어 기존 시맨틱 토큰으로 구분한다.
const TONES: Record<SuggestionStatus, ReturnType<typeof css>> = {
  RECEIVED: css`
    background: var(--bg-muted);
    color: var(--text-secondary);
  `,
  IN_REVIEW: css`
    background: var(--bg-warn);
    color: var(--text-warn);
  `,
  PLANNED: css`
    background: var(--bg-base);
    border-color: var(--border-brand-subtle);
    color: var(--text-brand);
  `,
  COMPLETED: css`
    background: var(--bg-brand);
    color: var(--text-brand);
  `,
  ON_HOLD: css`
    background: var(--bg-error);
    color: var(--text-error);
  `,
};

export default function SuggestionStatusBadge({
  status,
}: {
  status: SuggestionStatus;
}) {
  return (
    <Badge $status={status}>{SUGGESTION_STATUS_LABEL[status] ?? status}</Badge>
  );
}

const Badge = styled.span<{ $status: SuggestionStatus }>`
  ${typography.label3}
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  height: 24px;
  padding: 0 8px;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: 6px;
  white-space: nowrap;
  ${({ $status }) => TONES[$status]}
`;
