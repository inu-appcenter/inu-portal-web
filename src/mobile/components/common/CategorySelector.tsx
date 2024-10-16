import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getCategories } from "../../../utils/API/Categories";
import dropdownIcon from "../../../resource/assets/CategorySelectDropdown-img.svg";

interface CategorySelectorProps {
  write?: boolean;
  value: string;
  onChange: (value: string) => void;
  docType: string;
}

export default function CategorySelector({
  write,
  value,
  onChange,
  docType,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (docType === "NOTICE") {
          setCategories(["전체", "학사", "모집", "학점교류", "교육시험"]);
        } else {
          const response = await getCategories();
          if (response.status === 200) {
            if (write) {
              setCategories(response.body.data);
            } else {
              setCategories(["전체"].concat(response.body.data));
            }
          } else {
            alert(`${response.status} 모든 카테고리 가져오기 실패`);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();
  }, [docType]);

  return (
    <CategorySelectorWrapper onClick={() => setIsOpen(!isOpen)}>
      {isOpen ? (
        <DropdownOptions>
          {categories.map((category, index) => (
            <React.Fragment key={category}>
              <DropdownOption
                onClick={() => {
                  onChange(category);
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
        <Dropdown>
          <div>{value || "카테고리 선택"}</div>
          <DropdownImg src={dropdownIcon} alt="dropdownIcon" />
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
