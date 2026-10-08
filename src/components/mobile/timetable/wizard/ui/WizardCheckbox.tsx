import styled from "styled-components";
import Icon from "@/components/common/Icon";

interface WizardCheckboxProps {
  checked: boolean;
  className?: string;
}

/**
 * 24px 체크박스 모양 (Figma SelectionControl / Checkbox).
 * 모양만 그린다 — 클릭·role은 행(label/button)이 맡는다. 행 전체가 눌리는 시안이라
 * 박스만 따로 조작 대상이 되면 터치 영역이 작아진다.
 */
const WizardCheckbox = ({ checked, className }: WizardCheckboxProps) => (
  <Box $checked={checked} className={className} aria-hidden>
    {checked && <Icon name="check" size={24} />}
  </Box>
);

export default WizardCheckbox;

const Box = styled.span<{ $checked: boolean }>`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--text-inverse);
  background: ${({ $checked }) =>
    $checked ? "var(--interactive-primary)" : "var(--bg-subtle)"};
  border: ${({ $checked }) =>
    $checked ? "none" : "1px solid var(--border-strong)"};
`;
