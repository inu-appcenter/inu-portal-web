import styled from "styled-components";
import { buttonReset, WIZARD_PRIMARY } from "./tokens";
import { typography } from "@/styles/typography";

interface WizardDayChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/** 조건설정 > 공강으로 비울 요일. 48px 폭 고정 pill (Figma Day_Chips 3485:15476) */
const WizardDayChip = ({
  label,
  selected,
  onClick,
  disabled,
}: WizardDayChipProps) => (
  <Chip
    type="button"
    aria-pressed={selected}
    $selected={selected}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </Chip>
);

export default WizardDayChip;

const Chip = styled.button<{ $selected: boolean }>`
  ${buttonReset}
  flex-shrink: 0;
  width: 48px;
  padding: 12px 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid
    ${({ $selected }) =>
      $selected ? WIZARD_PRIMARY : "var(--border-default, #e5e8eb)"};
  background: ${({ $selected }) =>
    $selected ? WIZARD_PRIMARY : "var(--bg-base, #ffffff)"};
  color: ${({ $selected }) =>
    $selected
      ? "var(--text-inverse, #ffffff)"
      : "var(--text-secondary, #333d4b)"};
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    transform 0.1s ease;
  ${typography.label1}

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
  }
`;
