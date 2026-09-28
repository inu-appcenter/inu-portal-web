import styled from "styled-components";
import { typo } from "./tokens";

interface WizardSectionLabelProps {
  children: React.ReactNode;
  /** 제목 뒤 파란 `*` */
  required?: boolean;
  /** 오른쪽 끝 값 (예: 목표 학점 "18학점") */
  trailing?: React.ReactNode;
  as?: "h2" | "h3" | "div";
}

/** 섹션 제목 (Figma SecLabel / Label) — title/2 */
const WizardSectionLabel = ({
  children,
  required,
  trailing,
  as = "h2",
}: WizardSectionLabelProps) => (
  <Row>
    <Title as={as}>
      {children}
      {required && <Required aria-label="필수">*</Required>}
    </Title>
    {trailing !== undefined && <Trailing>{trailing}</Trailing>}
  </Row>
);

export default WizardSectionLabel;

const Row = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Title = styled.h2`
  margin: 0;
  display: flex;
  gap: 4px;
  color: var(--text-secondary, #333d4b);
  white-space: nowrap;
  ${typo.title2}
`;

const Required = styled.span`
  color: var(--text-brand, #0061ff);
`;

const Trailing = styled.span`
  color: var(--text-brand, #0061ff);
  white-space: nowrap;
  ${typo.label1}
`;
