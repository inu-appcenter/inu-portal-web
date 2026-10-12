import { useId } from "react";
import styled from "styled-components";
import WizardToggle from "./WizardToggle";
import { typography } from "@/styles/typography";

interface WizardToggleRowProps {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** 카드의 마지막 행처럼 아래 구분선이 필요 없을 때 */
  hideDivider?: boolean;
}

/** 제목·설명 + 토글 한 줄 (Figma Toggle_Row 3485:15443) */
const WizardToggleRow = ({
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
  hideDivider,
}: WizardToggleRowProps) => {
  const titleId = useId();

  return (
    <Row $divider={!hideDivider}>
      <Txt>
        <Title id={titleId}>{title}</Title>
        {description && <Description>{description}</Description>}
      </Txt>
      <WizardToggle
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-labelledby={titleId}
      />
    </Row>
  );
};

export default WizardToggleRow;

const Row = styled.div<{ $divider: boolean }>`
  width: 100%;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 11px;
  border-bottom: ${({ $divider }) =>
    $divider ? "1px solid var(--border-default)" : "none"};
`;

const Txt = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  word-break: break-word;
`;

const Title = styled.span`
  color: var(--text-secondary);
  ${typography.heading2}
`;

const Description = styled.span`
  color: var(--text-tertiary);
  ${typography.caption1}
`;
