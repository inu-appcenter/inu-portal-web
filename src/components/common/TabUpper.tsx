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
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
`;

const TabTrack = styled.div`
  display: flex;
  flex: 1;
  gap: 20px;
  align-items: center;
  min-width: 0;
  overflow: clip;
  padding: 4px;
  background: var(--bg-blur, rgba(255, 255, 255, 0.6));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 999px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.08);
  position: relative;
  box-sizing: border-box;
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.2s ease-in-out;
  box-sizing: border-box;

  /* Font styling from Figma */
  font-family: "Pretendard", -apple-system, sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  color: ${({ $isActive }) =>
    $isActive ? "var(--text-primary, #333d4b)" : "var(--text-tertiary, #8b95a1)"};

  &:focus {
    outline: none;
  }
`;

const ActivePill = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 999px;
  z-index: -1;
  box-sizing: border-box;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.04);
`;

export const TabUpper: React.FC<TabUpperProps> = ({
  tabs,
  activeTabId,
  onChange,
  className,
}) => {
  return (
    <TabContainer className={className}>
      <TabTrack>
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
                <ActivePill
                  layoutId="activeTabPill"
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
      </TabTrack>
    </TabContainer>
  );
};

// Tab_Upper 스네이크 케이스 별칭 추가
export const Tab_Upper = TabUpper;

export default TabUpper;
