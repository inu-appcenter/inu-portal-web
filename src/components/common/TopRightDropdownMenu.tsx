import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
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
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Container ref={menuRef}>
      <MenuButton onClick={() => setOpen((prev) => !prev)}>
        <MoreVertical size={24} color={color || "black"} />
      </MenuButton>

      {open && (
        <Dropdown>
          {items.map((item, idx) => (
            <MenuItem
              key={idx}
              onClick={() => {
                item.onClick();
                setOpen(false); // 메뉴 닫기
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Dropdown>
      )}
    </Container>
  );
};

export default TopRightDropdownMenu;

const Container = styled.div`
  position: relative;
  width: fit-content;
  height: fit-content;
`;

const MenuButton = styled.button`
  background-color: transparent;
  border-color: transparent;
  cursor: pointer;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 36px; /* 메뉴 버튼 아래로 */
  right: 0;
  z-index: 1000;

  background-color: white;
  border-radius: 16px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  //padding-right: 32px;
  box-sizing: border-box;
  min-width: 160px;

  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: start;
`;

const MenuItem = styled.button`
  all: unset;
  display: block;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  color: black;
  font-size: 14px;
  padding: 4px 0;
  word-break: keep-all;

  &:hover {
    font-weight: 500;
  }
`;
