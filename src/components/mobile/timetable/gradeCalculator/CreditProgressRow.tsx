import styled from "styled-components";
import { typography } from "@/styles/typography";
import type { CreditProgress } from "@/types/graduation";
import { ProgressFill, ProgressTrack } from "./ui";

/** Figma "요건/총 취득학점" 줄: 이름 · 남은 학점 · 취득/기준 + 진행 막대 */
export default function CreditProgressRow({ progress }: { progress: CreditProgress }) {
  const ratio = progress.required > 0 ? progress.earned / progress.required : 0;
  return (
    <CreditItem>
      <CreditTop>
        <CreditLabel>
          {progress.label}
          {progress.unverifiable && <Reference> (참고)</Reference>}
        </CreditLabel>
        <CreditValue>
          <CreditCaption $satisfied={progress.satisfied}>
            {progress.satisfied ? "충족" : `${progress.remaining}학점 남음`}
          </CreditCaption>
          <strong>
            {progress.earned} / {progress.required}
          </strong>
        </CreditValue>
      </CreditTop>
      <ProgressTrack>
        <ProgressFill $ratio={ratio} $done={progress.satisfied} />
      </ProgressTrack>
    </CreditItem>
  );
}

const CreditItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const CreditTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  white-space: nowrap;
`;

const CreditLabel = styled.span`
  ${typography.label2}
  color: var(--text-secondary);
`;

const Reference = styled.span`
  color: var(--text-tertiary);
`;

const CreditValue = styled.span`
  display: flex;
  align-items: baseline;
  gap: 6px;

  strong {
    ${typography.title4}
    color: var(--text-primary);
  }
`;

const CreditCaption = styled.span<{ $satisfied: boolean }>`
  ${typography.caption1}
  color: ${({ $satisfied }) =>
    $satisfied ? "var(--text-success)" : "var(--text-tertiary)"};
`;
