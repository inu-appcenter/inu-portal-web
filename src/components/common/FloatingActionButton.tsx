import styled from "styled-components";
import { ReactNode } from "react";
import Ripple from "./Ripple";

interface FloatingActionButtonProps {
  text: string;
  onClick: () => void;
  icon?: ReactNode;
  bottom?: string;
}

const FloatingActionButton = ({
  text,
  onClick,
  icon,
  bottom = "40px",
}: FloatingActionButtonProps) => {
  return (
    <FixedButtonWrapper $bottom={bottom}>
      <Button onClick={onClick}>
        <Ripple color="rgba(255, 255, 255, 0.35)" />
        {icon}
        {text}
      </Button>
    </FixedButtonWrapper>
  );
};

export default FloatingActionButton;

const FixedButtonWrapper = styled.div<{ $bottom: string }>`
  position: fixed;
  bottom: ${({ $bottom }) =>
    `calc(${$bottom} + env(safe-area-inset-bottom, 0px))`};
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;
`;

const Button = styled.button`
  pointer-events: auto;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: var(--bg-blur, rgba(255, 255, 255, 0.6));
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 999px;
  padding: 8px 12px;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    transform 0.15s ease,
    background-color 0.15s ease;

  &.active-touch {
    background-color: rgba(255, 255, 255, 0.85);
    transform: scale(0.96);
  }
`;
