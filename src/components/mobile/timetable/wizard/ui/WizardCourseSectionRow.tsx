import styled from "styled-components";
import { typo } from "./tokens";

export interface WizardCourseSectionDetail {
  label: string;
  value: string;
}

interface WizardCourseSectionRowProps {
  professor: string | null;
  /** 학수번호(분반 포함) */
  subjectNumber: string;
  /** "수 09:30~10:15, 목 10:30~11:45" 형태로 이미 포맷된 문자열 */
  timeStr: string;
  room?: string | null;
  /** 담은 인원. null/undefined면 표시하지 않는다 */
  savedCount?: number | null;
  /** 오른쪽 아래 액션 — 보통 WizardFavButton */
  action?: React.ReactNode;
  /** 행 클릭(상세 열기·펼치기). 생략하면 클릭 불가 */
  onClick?: () => void;
  /** 펼친 상태: 연회색 배경 + 상세·액션 버튼 노출 (Figma 강의검색 첫 분반) */
  expanded?: boolean;
  /** 펼쳤을 때 보이는 "비고 : …", "강의개요 : …" 줄 */
  details?: WizardCourseSectionDetail[];
  /** 펼쳤을 때 맨 아래 버튼 줄 — 보통 WizardPillButton 두 개 */
  expandedActions?: React.ReactNode;
}

/**
 * 강의 카드 안의 분반 한 줄 (Figma CourseSectionRow).
 * 오른쪽 열(담은 인원·버튼)은 정보 열과 같은 높이를 채우고 위/아래로 붙는다.
 * FAV 버튼이 안에 들어가므로 행 자체는 button이 아닌 role="button"으로 둔다.
 */
const WizardCourseSectionRow = ({
  professor,
  subjectNumber,
  timeStr,
  room,
  savedCount,
  action,
  onClick,
  expanded = false,
  details,
  expandedActions,
}: WizardCourseSectionRowProps) => {
  const clickable = Boolean(onClick);
  const hasRight = savedCount != null || Boolean(action);

  return (
    <Row
      $expanded={expanded}
      $clickable={clickable}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-expanded={clickable && details ? expanded : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick || e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CourseInfo>
        <Info>
          <ProfessorInfo>
            <ProfName>{professor || "교수 미정"}</ProfName>
            <SubjectNumber>{subjectNumber}</SubjectNumber>
          </ProfessorInfo>
          <SubText>{timeStr}</SubText>
          {room && <SubText>{room}</SubText>}
        </Info>
        {hasRight && (
          <Right>
            {savedCount != null && <SubText as="span">{savedCount}명 담음</SubText>}
            {action}
          </Right>
        )}
      </CourseInfo>

      {expanded && (details?.length || expandedActions) && (
        <Accordion>
          {details?.map((detail) => (
            <SubText key={detail.label}>
              {detail.label} : {detail.value}
            </SubText>
          ))}
          {expandedActions && <ActionRow>{expandedActions}</ActionRow>}
        </Accordion>
      )}
    </Row>
  );
};

export default WizardCourseSectionRow;

const Row = styled.div<{ $expanded: boolean; $clickable: boolean }>`
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: ${({ $expanded }) =>
    $expanded ? "var(--bg-subtle, #f8f9fb)" : "transparent"};
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  -webkit-tap-highlight-color: transparent;

  &:focus-visible {
    outline: 2px solid var(--interactive-brand, #0061ff);
    outline-offset: -2px;
  }
`;

const CourseInfo = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Info = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  word-break: break-word;
`;

const ProfessorInfo = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: var(--text-secondary, #333d4b);
  white-space: nowrap;
`;

const ProfName = styled.span`
  ${typo.heading3}
`;

const SubjectNumber = styled.span`
  ${typo.caption1}
`;

const SubText = styled.p`
  margin: 0;
  color: var(--text-tertiary, #8b95a1);
  ${typo.caption1}
`;

const Right = styled.div`
  align-self: stretch;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  white-space: nowrap;
`;

const Accordion = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  word-break: break-word;
`;

const ActionRow = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
  /* 강의개요와 버튼 사이는 시안에서 gap 4 + 버튼 자체 여백으로 벌어진다 */
  margin-top: 4px;
`;
