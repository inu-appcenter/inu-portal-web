import React, { useState } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";
import { MoreVertical } from "lucide-react";

type MenuItemType = {
  label: string;
  onClick: () => void;
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

  const handleToggle = () => {
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

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsRendered(false);
    }
  };

  return (
    <Container>
      <MenuButton onClick={handleToggle}>
        <MoreVertical size={24} color={color || "black"} />
      </MenuButton>

      {isRendered && (
        <>
          {createPortal(
            <Backdrop onClick={handleClose} />,
            document.body
          )}
          <Dropdown $isOpen={isOpen} onAnimationEnd={handleAnimationEnd}>
            {items.map((item, idx) => (
              <MenuItem
                key={idx}
                onClick={() => {
                  item.onClick();
                  handleClose(); // 메뉴 닫기
                }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Dropdown>
        </>
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
  pointer-events: auto;
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
`;

// 2. 애니메이션 정의
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
  top: 36px; /* 메뉴 버튼 아래로 */
  right: 0;
  z-index: 1000;

  background-color: white;
  border-radius: 16px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  box-sizing: border-box;
  min-width: 160px;

  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;

  /* 3. 애니메이션 속성 추가 */
  transform-origin: top right; /* 애니메이션 기준점을 우측 상단으로 설정 */
  animation: ${({ $isOpen }) => ($isOpen ? unfurlAnimation : furlAnimation)} 0.12s ease-in-out forwards; /* 애니메이션 적용 */
`;

const MenuItem = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 24px;
  box-sizing: border-box;
  cursor: pointer;
  color: black;
  font-size: 14px;
  line-height: 1.4;
  padding: 4px 0;
  word-break: keep-all;

  &:hover {
    font-weight: 500;
  }
`;
