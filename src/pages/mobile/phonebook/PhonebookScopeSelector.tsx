import styled from "styled-components";
import { Building2, Users } from "lucide-react";

import { PhonebookScope } from "@/pages/mobile/phonebook/phonebookConfig";
import { SOFT_CARD_SHADOW } from "@/styles/shadows";

interface PhonebookScopeSelectorProps {
  scope: PhonebookScope;
  onChange: (scope: PhonebookScope) => void;
}

const PhonebookScopeSelector = ({
  scope,
  onChange,
}: PhonebookScopeSelectorProps) => {
  return (
    <ScopeSelector>
      <ScopeButton
        $selected={scope === "people"}
        onClick={() => onChange("people")}
        type="button"
      >
        <Users size={15} />
        교직원·교수
      </ScopeButton>
      <ScopeButton
        $selected={scope === "office"}
        onClick={() => onChange("office")}
        type="button"
      >
        <Building2 size={15} />
        학과사무실
      </ScopeButton>
    </ScopeSelector>
  );
};

export default PhonebookScopeSelector;

const ScopeSelector = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 2px 0;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ScopeButton = styled.button<{ $selected: boolean }>`
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  border-radius: 999px;
  padding: 9px 14px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: ${SOFT_CARD_SHADOW};
  background-color: ${({ $selected }) => ($selected ? "#5e92f0" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#f4f4f4" : "#666666")};
`;
