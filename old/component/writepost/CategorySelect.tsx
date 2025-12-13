import { useState, useEffect } from "react";
import { getCategories } from "old/utils/API/Categories";
import dropdownImg from "../../resource/assets/CategorySelectDropdown-img.svg";
import styled from "styled-components";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CategorySelect({
  value,
  onChange,
}: CategorySelectProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategories();
        setOptions(categories.body.data);
      } catch (error) {
        console.error("카테고리를 불러오는 중 에러가 발생했습니다:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <DropdownContainer isOpen={isOpen}>
      <DropdownSelected onClick={handleDropdownToggle}>
        <DropdownText>{value || "카테고리 선택"}</DropdownText>
        <DropdownImage src={dropdownImg} alt="dropdown" />
      </DropdownSelected>
      {isOpen && (
        <DropdownOptions>
          {options.map((option) => (
            <DropdownOption
              key={option}
              onClick={() => handleOptionClick(option)}
            >
              <DropdownOptionLine />
              <DropdownOptionText>{option}</DropdownOptionText>
            </DropdownOption>
          ))}
        </DropdownOptions>
      )}
    </DropdownContainer>
  );
}

// Styled Components
const DropdownContainer = styled.div<{ isOpen: boolean }>`
  width: 176px;
  padding: ${({ isOpen }) => (isOpen ? "10px 10px 20px 10px" : "10px")};
  border-radius: ${({ isOpen }) => (isOpen ? "40px" : "100px")};
  background: linear-gradient(
    180deg,
    #ffffff -21.86%,
    #d5e4f7 100%,
    #aac9ee 100%
  );
  height: ${({ isOpen }) => (isOpen ? "auto" : "40px")};
`;

const DropdownSelected = styled.div`
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;
`;

const DropdownImage = styled.img`
  width: 13px;
  height: 7px;
`;

const DropdownText = styled.div`
  font-size: 15px;
  font-weight: 400;
  text-align: left;
  color: #000000;
  line-height: 20px;
`;

const DropdownOptions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
`;

const DropdownOption = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
  width: 100%;
  cursor: pointer;
`;

const DropdownOptionLine = styled.div`
  height: 1px;
  width: 80%;
  background-color: #969696;
`;

const DropdownOptionText = styled.div`
  font-size: 17px;
  font-weight: 500;
  text-align: center;
  color: #656565;
`;
