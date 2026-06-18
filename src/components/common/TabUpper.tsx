import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
}

export interface TabUpperProps {
  tabs: TabItem[];
  activeTabId: string;
  onChange: (id: string) => void;
  className?: string;
}

const TabContainer = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  pointer-events: auto;
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  color: ${({ $isActive }) =>
    $isActive ? "var(--text-secondary)" : "var(--text-tertiary)"};
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.2s ease-in-out;

  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;

  &:focus {
    outline: none;
  }
`;

const ActiveUnderline = styled(motion.div)`
  position: absolute;
  bottom: -1px; /* 컨테이너 보더 위에 겹치도록 설정 */
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--text-secondary);
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);

  z-index: 1;
`;

export const TabUpper: React.FC<TabUpperProps> = ({
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
            {tab.label}
            {isActive && (
              <ActiveUnderline
                layoutId="activeTabUnderline"
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

// Tab_Upper 스네이크 케이스 별칭 추가
export const Tab_Upper = TabUpper;

export default TabUpper;
