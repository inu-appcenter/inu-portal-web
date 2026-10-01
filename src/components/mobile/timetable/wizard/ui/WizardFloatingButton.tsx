import styled from "styled-components";
import Icon from "@/components/common/Icon";
import type { FontelloIconName } from "@/components/common/fontelloIcons";
import { buttonReset } from "./tokens";
import { effects } from "@/styles/effects";

interface WizardFloatingButtonProps {
  icon: FontelloIconName;
  /** 아이콘만 있는 버튼이라 필수 */
  "aria-label": string;
  onClick: () => void;
  /** 필터가 걸려 있는 등 활성 상태 표시가 필요할 때 */
  active?: boolean;
}

/** 강의검색 하단 60px 원형 플로팅 버튼 (Figma Filter_Button / FAV, Floating_Button 효과) */
const WizardFloatingButton = ({
  icon,
  onClick,
  active,
  "aria-label": ariaLabel,
}: WizardFloatingButtonProps) => (
  <Button type="button" aria-label={ariaLabel} $active={active} onClick={onClick}>
    <Icon name={icon} size={24} />
  </Button>
);

export default WizardFloatingButton;

const Button = styled.button<{ $active?: boolean }>`
  ${buttonReset}
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid
    ${({ $active }) =>
      $active
        ? "var(--border-brand-subtle, #d3e5ff)"
        : "var(--border-default, #e5e8eb)"};
  background: ${({ $active }) =>
    $active ? "var(--bg-brand, #eff6ff)" : "var(--bg-blur, rgba(255, 255, 255, 0.6))"};
  color: ${({ $active }) =>
    $active ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #333d4b)"};
  ${effects.floatingButton}
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.94);
  }
`;
