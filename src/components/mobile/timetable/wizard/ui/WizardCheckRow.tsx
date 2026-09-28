import styled, { css } from "styled-components";
import WizardCheckbox from "./WizardCheckbox";
import { buttonReset } from "./tokens";
import { typography } from "@/styles/typography";

interface WizardCheckRowProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /**
   * compact: "모두 저장" 줄 — 32px 박스 영역, label/2
   * list: 미리보기 목록 줄 — 박스 주변 16px, heading/2
   */
  variant?: "compact" | "list";
  disabled?: boolean;
}

/** 저장 시트의 체크 행 (Figma Row + SelectionControl). 행 전체가 체크박스다 */
const WizardCheckRow = ({
  label,
  checked,
  onCheckedChange,
  variant = "list",
  disabled,
}: WizardCheckRowProps) => (
  <Row
    type="button"
    role="checkbox"
    aria-checked={checked}
    disabled={disabled}
    $variant={variant}
    onClick={() => onCheckedChange(!checked)}
  >
    <BoxArea $variant={variant}>
      <WizardCheckbox checked={checked} />
    </BoxArea>
    <Label $variant={variant}>{label}</Label>
  </Row>
);

export default WizardCheckRow;

const Row = styled.button<{ $variant: "compact" | "list" }>`
  ${buttonReset}
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${({ $variant }) => ($variant === "compact" ? "8px" : "0")};
  text-align: left;

  &:disabled {
    opacity: 0.4;
  }
`;

const BoxArea = styled.span<{ $variant: "compact" | "list" }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ $variant }) =>
    $variant === "compact"
      ? css`
          width: 32px;
          height: 32px;
        `
      : css`
          padding: 16px;
        `}
`;

const Label = styled.span<{ $variant: "compact" | "list" }>`
  color: var(--text-secondary, #333d4b);
  white-space: nowrap;
  ${({ $variant }) => ($variant === "compact" ? typography.label2 : typography.heading2)}
`;
