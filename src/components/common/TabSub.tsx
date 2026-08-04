import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
}

export interface TabSubProps {
  tabs: TabItem[];
  activeTabId: string;
  onChange: (id: string) => void;
  className?: string;
}

const TabContainer = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  padding: 4px;
  box-sizing: border-box;

  border-radius: 12px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-subtle, #f8f9fb);
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  //padding: 10px 0;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &:focus {
    outline: none;
  }
`;

const TabLabel = styled.span<{ $isActive: boolean }>`
  position: relative;
  z-index: 2;
  color: ${({ $isActive }) =>
    $isActive ? "var(--text-secondary)" : "var(--text-tertiary, #8b95a1)"};
  transition: color 0.2s ease-in-out;

  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
`;

const ActiveBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.04);

  border-radius: 8px;
  background: var(--bg-base, #fff);

  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);

  z-index: 1;
`;

export const TabSub: React.FC<TabSubProps> = ({
  tabs,
  activeTabId,
  onChange,
  className,
}) => {
  return (
    <TabContainer className={className}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <TabButton
            key={tab.id}
            $isActive={isActive}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            <TabLabel $isActive={isActive}>{tab.label}</TabLabel>
            {isActive && (
              <ActiveBackground
                layoutId="activeTabSubBackground"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 24,
                  mass: 0.8,
                }}
              />
            )}
          </TabButton>
        );
      })}
    </TabContainer>
  );
};

// Tab_Sub 스네이크 케이스 별칭 추가
export const Tab_Sub = TabSub;

export default TabSub;
