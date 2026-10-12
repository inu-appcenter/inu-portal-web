import React from "react";
import styled from "styled-components";
import { Switch as HeadlessSwitch } from "@headlessui/react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const SwitchContainer = styled(HeadlessSwitch)<{ checked: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 24px;
  width: 44px;
  border-radius: var(--radius-full);
  border: none;
  transition: background-color 0.2s ease-in-out;
  background-color: ${({ checked }) =>
    checked ? "var(--interactive-primary)" : "var(--gray-400)"};
`;

const SwitchHandle = styled.span<{ checked: boolean }>`
  position: relative;
  height: 16px;
  width: 16px;
  border-radius: var(--radius-full);
  background-color: var(--bg-base);
  transform: ${({ checked }) =>
    checked ? "translateX(24px)" : "translateX(4px)"};
  transition: transform 0.2s ease-in-out;
`;

const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange }) => {
  return (
    <SwitchContainer checked={checked} onChange={onCheckedChange}>
      <SwitchHandle checked={checked} />
    </SwitchContainer>
  );
};

export default Switch;
