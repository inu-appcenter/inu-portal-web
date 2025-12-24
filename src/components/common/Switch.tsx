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
  border-radius: 9999px;
  border: none;
  transition: background-color 0.2s ease-in-out;
  background-color: ${({ checked }) => (checked ? "#0A84FF" : "#A2A1A5")};
`;

const SwitchHandle = styled.span<{ checked: boolean }>`
  position: relative;
  height: 16px;
  width: 16px;
  border-radius: 9999px;
  background-color: white;
  transform: ${({ checked }) =>
    checked ? "translateX(20px)" : "translateX(4px)"};
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
