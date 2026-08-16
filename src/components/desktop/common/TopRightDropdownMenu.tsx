import React, { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";
import { MoreVertical } from "lucide-react";
import Ripple from "@/components/common/Ripple";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";

type MenuItemType = {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
};

interface TopRightDropdownMenuProps {
  items: MenuItemType[];
  color?: string;
}

const TopRightDropdownMenu: React.FC<TopRightDropdownMenuProps> = ({
  items,
  color,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
      });
    }

    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsRendered(true);
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  useSheetBackHandler(isOpen, handleClose);

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsRendered(false);
    }
  };

  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  return (
    <Container>
      <MenuButton ref={buttonRef} onClick={handleToggle}>
        <Ripple />
        <MoreVertical size={24} color={color || "black"} />
      </MenuButton>

      {isRendered &&
        createPortal(
          <>
            <Backdrop onClick={handleClose} />
            <Dropdown
              style={{ top: `${position.top}px`, right: `${position.right}px` }}
              $isOpen={isOpen}
              onAnimationEnd={handleAnimationEnd}
            >
              {items.map((item, idx) => (
                <MenuItem
                  key={idx}
                  onClick={() => {
                    item.onClick();
                    handleClose();
                  }}
                >
                  <Ripple />
                  {item.icon && <IconWrapper>{item.icon}</IconWrapper>}
                  <span>{item.label}</span>
                </MenuItem>
              ))}
            </Dropdown>
          </>,
          document.body,
        )}
    </Container>
  );
};

export default TopRightDropdownMenu;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  background-color: transparent;
`;

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: 100%;
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  line-height: 0;
  background-color: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border-radius: 999px;
  outline: none;
`;

const unfurlAnimation = keyframes`
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const furlAnimation = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0;
  }
`;

const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  z-index: 1000;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  box-sizing: border-box;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  transform-origin: top right;
  animation: ${({ $isOpen }) => ($isOpen ? unfurlAnimation : furlAnimation)} 0.12s
    ease-in-out forwards;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;
  cursor: pointer;
  color: #333D4B;
  font-size: 15px;
  line-height: 1.4;
  padding: 10px 16px;
  word-break: keep-all;
  background: transparent;
  border: none;
  outline: none;
  position: relative;
  overflow: hidden;
  text-align: left;

  &:hover {
    font-weight: 500;
    background-color: rgba(243, 244, 247, 0.4);
  }
`;

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: #4E5968;

  & > svg {
    width: 20px;
    height: 20px;
    stroke-width: 2px;
  }
`;
