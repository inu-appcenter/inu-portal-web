import styled from "styled-components";
import { buttonReset, typo, WIZARD_PRIMARY } from "./tokens";

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
  border: 1px dashed ${WIZARD_PRIMARY};
  background: var(--bg-base, #ffffff);
  color: var(--text-brand, #0061ff);
  ${typo.heading2}

  &:active:not(:disabled) {
    background: var(--bg-brand, #eff6ff);
  }

  &:disabled {
    border-color: var(--border-default, #e5e8eb);
    color: var(--text-disabled, #b0b8c1);
  }
`;
