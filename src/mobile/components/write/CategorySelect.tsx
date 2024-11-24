import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getCategories } from "apis/categories";
import dropdownIcon from "resources/assets/mobile-tips/CategorySelectDropdown-img.svg";

interface CategorySelectProps {
  category: string;
  setCategory: (value: string) => void;
}

export default function CategorySelector({
  category,
  setCategory,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("모든 카테고리 가져오기 실패", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category: string) => {
    setCategory(category);
    setIsOpen(false);
  };

  return (
    <CategorySelectorWrapper>
      {isOpen ? (
        <DropdownOptions>
          {categories.map((category, index) => (
            <React.Fragment key={category}>
              <DropdownOption
                onClick={() => {
                  handleCategoryClick(category);
                  setIsOpen(false);
                }}
              >
                <div>{category}</div>
              </DropdownOption>
              {index < categories.length - 1 && <DropdownOptionLine />}
            </React.Fragment>
          ))}
        </DropdownOptions>
      ) : (
        <Dropdown
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <div>{category || "카테고리 선택"}</div>
          <DropdownImg src={dropdownIcon} alt="" />
        </Dropdown>
      )}
    </CategorySelectorWrapper>
  );
}

const CategorySelectorWrapper = styled.div`
  font-size: 8px;
  font-weight: 300;
  width: 112px;
  height: 32px;
  position: relative;
`;

const Dropdown = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 32px;
  border-radius: 100px;
  background: linear-gradient(
    180deg,
    #ffffff -21.86%,
    #d5e4f7 100%,
    #aac9ee 100%
  );
`;

const DropdownImg = styled.img`
  width: 4px;
  height: 8px;
`;

const DropdownOptions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0 12px 0;

  position: absolute;
  top: 0; /* Dropdown과 같은 위치로 설정 */
  left: 0;
  right: 0;
  border-radius: 16px;
  background: linear-gradient(
    180deg,
    #ffffff -21.86%,
    #d5e4f7 100%,
    #aac9ee 100%
  );
  z-index: 10;
  overflow-y: scroll;
`;

const DropdownOption = styled.div`
  width: 100%;
  text-align: center;
`;

const DropdownOptionLine = styled.div`
  height: 1px;
  width: 80%;
  background-color: #969696;
`;