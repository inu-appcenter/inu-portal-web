import React from "react";
import styled from "styled-components";
import BottomSheet from "@/components/common/BottomSheet";
import Ripple from "@/components/common/Ripple";

export interface TimetableMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface TimetableMenuBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: TimetableMenuItem[];
}

const TimetableMenuBottomSheet = ({
  open,
  onOpenChange,
  items,
}: TimetableMenuBottomSheetProps) => {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} height="auto" maxHeight="80%">
      <MenuList>
        {items.map((item, idx) => (
          <MenuRow
            key={idx}
            type="button"
            onClick={() => {
              item.onClick();
              onOpenChange(false);
            }}
          >
            <Ripple />
            <IconSlot>{item.icon}</IconSlot>
            <span>{item.label}</span>
          </MenuRow>
        ))}
      </MenuList>
    </BottomSheet>
  );
};

export default TimetableMenuBottomSheet;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 4px;
`;

const MenuRow = styled.button`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 52px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: Pretendard;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary, #333d4b);
  text-align: left;
`;

const IconSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;

  & > svg {
    width: 24px;
    height: 24px;
  }
`;
