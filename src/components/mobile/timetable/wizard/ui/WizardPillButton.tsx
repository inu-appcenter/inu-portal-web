import styled from "styled-components";
import Icon from "@/components/common/Icon";
import type { FontelloIconName } from "@/components/common/fontelloIcons";
import { buttonReset } from "./tokens";
import { typography } from "@/styles/typography";

interface WizardPillButtonProps {
  children: React.ReactNode;
  icon?: FontelloIconName;
  onClick: () => void;
  disabled?: boolean;
}

/** 흰 바탕 외곽선 pill 버튼 — 강의계획서 / 강의평 (Figma button_편람) */
const WizardPillButton = ({
  children,
  icon,
  onClick,
  disabled,
}: WizardPillButtonProps) => (
  <Button
    type="button"
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    {icon && <Icon name={icon} size={16} />}
    <span>{children}</span>
  </Button>
);

export default WizardPillButton;

const Button = styled.button`
  ${buttonReset}
  flex: 1 0 0;
  min-width: 0;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 999px;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
  color: var(--text-secondary);
  white-space: nowrap;
  ${typography.label2}

  &:active:not(:disabled) {
    background: var(--bg-muted);
  }

  &:disabled {
    color: var(--text-disabled);
  }
`;
