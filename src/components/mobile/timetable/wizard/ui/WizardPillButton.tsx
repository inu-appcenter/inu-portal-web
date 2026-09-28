import styled from "styled-components";
import Icon from "@/components/common/Icon";
import type { FontelloIconName } from "@/components/common/fontelloIcons";
import { buttonReset, typo } from "./tokens";

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
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  color: var(--text-secondary, #333d4b);
  white-space: nowrap;
  ${typo.label2}

  &:active:not(:disabled) {
    background: var(--bg-muted, #f1f3f5);
  }

  &:disabled {
    color: var(--text-disabled, #b0b8c1);
  }
`;
