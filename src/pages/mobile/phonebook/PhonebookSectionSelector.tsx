import styled from "styled-components";

import { SOFT_CARD_SHADOW } from "@/styles/shadows";

export type PhonebookSectionKey = "people" | "office";

interface SectionItem {
  key: PhonebookSectionKey;
  label: string;
  count: number;
}

interface PhonebookSectionSelectorProps {
  selectedSection: PhonebookSectionKey;
  sections: SectionItem[];
  onSelect: (section: PhonebookSectionKey) => void;
}

const PhonebookSectionSelector = ({
  selectedSection,
  sections,
  onSelect,
}: PhonebookSectionSelectorProps) => {
  return (
    <SectionSelector>
      {sections.map((section) => (
        <SectionButton
          key={section.key}
          $selected={selectedSection === section.key}
          onClick={() => onSelect(section.key)}
          type="button"
        >
          <span>{section.label}</span>
          <strong>{section.count}</strong>
        </SectionButton>
      ))}
    </SectionSelector>
  );
};

export default PhonebookSectionSelector;

const SectionSelector = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 2px 0;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const SectionButton = styled.button<{ $selected: boolean }>`
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  border-radius: 999px;
  padding: 9px 14px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: ${SOFT_CARD_SHADOW};
  background-color: ${({ $selected }) => ($selected ? "#5e92f0" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#f4f4f4" : "#666666")};

  strong {
    font-size: 13px;
    font-weight: 800;
    opacity: 0.9;
  }
`;
