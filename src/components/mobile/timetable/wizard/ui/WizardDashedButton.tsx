import styled from "styled-components";
import { buttonReset } from "./tokens";
import { typography } from "@/styles/typography";

interface WizardDashedButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

/** 점선 추가 버튼 — "+ 강의 담기" (Figma Btn_AddCourse 3853:13208) */
const WizardDashedButton = ({
  children,
  onClick,
  disabled,
}: WizardDashedButtonProps) => (
  <Button type="button" onClick={onClick} disabled={disabled}>
    {children}
  </Button>
);

export default WizardDashedButton;

const Button = styled.button`
  ${buttonReset}
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  border: 1px dashed var(--border-brand);
  background: var(--bg-base);
  color: var(--text-brand);
  ${typography.heading2}

  &:active:not(:disabled) {
    background: var(--bg-brand);
  }

  &:disabled {
    border-color: var(--border-default);
    color: var(--text-disabled);
  }
`;
