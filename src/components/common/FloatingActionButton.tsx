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
  bottom: ${({ $bottom }) => `calc(${$bottom} + env(safe-area-inset-bottom, 0px))`};
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
  background-color: #333;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;

  &.active-touch {
    background-color: #000;
    transform: scale(0.98);
  }
`;
