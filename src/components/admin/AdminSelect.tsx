import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import styled from "styled-components";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
  description?: string;
}

interface AdminSelectProps {
  label?: string;
  options: Option[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
}

const AdminSelect: React.FC<AdminSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "선택해주세요",
}) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Container>
      {label && <Label>{label}</Label>}
      <Listbox value={value} onChange={onChange}>
        <ListWrapper>
          <ListboxButton>
            <SelectedText>
              {selectedOption ? selectedOption.label : placeholder}
            </SelectedText>
            <IconWrapper>
              <ChevronDown size={18} />
            </IconWrapper>
          </ListboxButton>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <OptionsList>
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  as={Fragment}
                >
                  {({ active, selected }) => (
                    <OptionItem $active={active}>
                      <OptionContent>
                        <LabelGroup>
                          <OptionLabel $selected={selected}>
                            {option.label}
                          </OptionLabel>
                          {option.description && (
                            <OptionDesc>
                              {option.description}
                            </OptionDesc>
                          )}
                        </LabelGroup>
                        {selected && (
                          <CheckIconWrapper>
                            <Check size={16} />
                          </CheckIconWrapper>
                        )}
                      </OptionContent>
                    </OptionItem>
                  )}
                </Listbox.Option>
              ))}
            </OptionsList>
          </Transition>
        </ListWrapper>
      </Listbox>
    </Container>
  );
};

export default AdminSelect;

const Container = styled.div`
  width: 100%;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
`;

const ListWrapper = styled.div`
  position: relative;
  margin-top: 4px;
`;

const ListboxButton = styled(Listbox.Button)`
  position: relative;
  width: 100%;
  cursor: pointer;
  border-radius: 12px;
  background-color: #ffffff;
  padding: 12px 40px 12px 16px;
  text-align: left;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }
`;

const SelectedText = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 500;
`;

const IconWrapper = styled.span`
  pointer-events: none;
  position: absolute;
  inset-y: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding-right: 12px;
  color: #94a3b8;
  height: 100%;
`;

const OptionsList = styled(Listbox.Options)`
  position: absolute;
  z-index: 1000;
  margin-top: 8px;
  max-height: 240px;
  width: 100%;
  overflow: auto;
  border-radius: 14px;
  background-color: #ffffff;
  padding: 4px;
  font-size: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;

  &:focus {
    outline: none;
  }
`;

const OptionItem = styled.div<{ $active: boolean }>`
  position: relative;
  cursor: pointer;
  user-select: none;
  padding: 10px 12px;
  border-radius: 10px;
  background-color: ${({ $active }) => ($active ? "#f0fdfa" : "transparent")};
  transition: background-color 0.2s;
`;

const OptionContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LabelGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const OptionLabel = styled.span<{ $selected: boolean }>`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${({ $selected }) => ($selected ? "700" : "500")};
  color: ${({ $selected }) => ($selected ? "#0d9488" : "#1e293b")};
  font-size: 0.95rem;
`;

const OptionDesc = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
`;

const CheckIconWrapper = styled.span`
  display: flex;
  align-items: center;
  color: #0d9488;
  margin-left: 12px;
`;
