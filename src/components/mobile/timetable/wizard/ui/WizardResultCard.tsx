import styled from "styled-components";
import WizardTag, { type WizardTagTone } from "./WizardTag";
import { WIZARD_PRIMARY } from "./tokens";
import { typography } from "@/styles/typography";

export interface WizardResultTag {
  label: string;
  tone: Exclude<WizardTagTone, "brand">;
}

interface WizardResultCardProps {
  /** "마법사 A" */
  name: string;
  recommended?: boolean;
  totalCredits: number;
  courseCount: number;
  courseNames: string[];
  tags?: WizardResultTag[];
  onClick?: () => void;
  /** 선택 상태(비교·저장 흐름에서 쓸 여지). 시안의 Card_Result/False = 미선택 */
  selected?: boolean;
}

/** 추천결과 카드 (Figma Card_Result/False 3506:15820) */
const WizardResultCard = ({
  name,
  recommended,
  totalCredits,
  courseCount,
  courseNames,
  tags,
  onClick,
  selected = false,
}: WizardResultCardProps) => (
  <Card
    as={onClick ? "button" : "div"}
    type={onClick ? "button" : undefined}
    onClick={onClick}
    $selected={selected}
  >
    <Header>
      <NameGroup>
        <Name>{name}</Name>
        {recommended && <WizardTag tone="brand">추천</WizardTag>}
      </NameGroup>
      <Summary>
        {totalCredits}학점 · {courseCount}과목
      </Summary>
    </Header>
    <Body>
      <Courses>{courseNames.join(" · ")}</Courses>
      {tags && tags.length > 0 && (
        <Tags>
          {tags.map((tag) => (
            <WizardTag key={tag.label} tone={tag.tone}>
              {tag.label}
            </WizardTag>
          ))}
        </Tags>
      )}
    </Body>
  </Card>
);

export default WizardResultCard;

const Card = styled.div<{ $selected: boolean }>`
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-radius: 20px;
  border: 1px solid
    ${({ $selected }) =>
      $selected ? WIZARD_PRIMARY : "var(--border-default, #e5e8eb)"};
  background: var(--bg-base, #ffffff);
  font: inherit;
  text-align: left;
  overflow: hidden;
  cursor: ${({ as }) => (as === "button" ? "pointer" : "default")};
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s ease;

  &:active {
    transform: ${({ as }) => (as === "button" ? "scale(0.99)" : "none")};
  }

  &:focus-visible {
    outline: 2px solid ${WIZARD_PRIMARY};
    outline-offset: 2px;
  }
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const NameGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const Name = styled.span`
  color: var(--text-secondary, #333d4b);
  white-space: nowrap;
  ${typography.heading2}
`;

const Summary = styled.span`
  flex-shrink: 0;
  color: var(--text-tertiary, #8b95a1);
  white-space: nowrap;
  ${typography.label2}
`;

const Body = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Courses = styled.p`
  margin: 0;
  color: var(--text-secondary, #333d4b);
  /* 시안처럼 과목명 중간에서도 줄을 바꾼다(keep-all이면 줄 끝이 크게 비어 보인다) */
  overflow-wrap: anywhere;
  ${typography.body2}
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;
