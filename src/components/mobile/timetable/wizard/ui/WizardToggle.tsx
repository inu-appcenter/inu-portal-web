import styled from "styled-components";
import { buttonReset } from "./tokens";

interface WizardToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** 옆에 보이는 라벨이 없을 때만 넘긴다. 행 전체가 라벨이면 aria-labelledby를 쓴다 */
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * 48×30 스위치 (Figma Toggle). 공용 Switch(44×24, #0A84FF)와 치수·색이 달라 따로 둔다.
 * 노브 22px, 가장자리 4px, 그림자 0 1 3 rgba(0,0,0,.12)는 시안 SVG 값.
 */
const WizardToggle = ({
  checked,
  onCheckedChange,
  disabled,
  ...aria
}: WizardToggleProps) => (
  <Track
    type="button"
    role="switch"
    aria-checked={checked}
    $checked={checked}
    disabled={disabled}
    onClick={() => onCheckedChange(!checked)}
    {...aria}
  >
    <Knob $checked={checked} />
  </Track>
);

export default WizardToggle;

const Track = styled.button<{ $checked: boolean }>`
  ${buttonReset}
  position: relative;
  flex-shrink: 0;
  width: 48px;
  height: 30px;
  border-radius: 15px;
  background: ${({ $checked }) =>
    $checked ? "var(--interactive-primary)" : "var(--border-default)"};
  transition: background-color 0.2s ease;

  &:disabled {
    opacity: 0.4;
  }
`;

const Knob = styled.span<{ $checked: boolean }>`
  position: absolute;
  top: 4px;
  left: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--bg-base);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transform: translateX(${({ $checked }) => ($checked ? "18px" : "0")});
  transition: transform 0.2s ease;
`;
