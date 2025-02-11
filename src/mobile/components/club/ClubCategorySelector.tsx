import React, { useEffect, useState } from "react";
import styled from "styled-components";
import dropdownIcon from "resources/assets/mobile-tips/CategorySelectDropdown-img.svg";
import { useLocation, useNavigate } from "react-router-dom";

export default function ClubCategorySelector() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isOpen, setIsOpen] = useState(false);

  const clubCategories = [
    "전체",
    "교양학술",
    "문화",
    "봉사",
    "종교",
    "체육",
    "취미·전시",
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedCategory(params.get("category") || "전체");
  }, [location.search]);

  const handleClickCategory = (category: string) => {
    const params = new URLSearchParams(location.search);
    params.delete("search");
    params.set("category", category);
    navigate(`${location.pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <CategorySelectorWrapper onClick={() => setIsOpen(!isOpen)}>
      {isOpen ? (
        <DropdownOptions>
          {clubCategories.map((category, index) => (
            <React.Fragment key={category}>
              <DropdownOption onClick={() => handleClickCategory(category)}>
                <div>{category}</div>
              </DropdownOption>
              {index < clubCategories.length - 1 && <DropdownOptionLine />}
            </React.Fragment>
          ))}
        </DropdownOptions>
      ) : (
        <Dropdown>
          <div>{selectedCategory || "카테고리 선택"}</div>
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
  padding: 4px 0;
  position: absolute;
  top: 0;
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
  padding: 8px 0;
  text-align: center;
`;

const DropdownOptionLine = styled.div`
  height: 1px;
  width: 80%;
  background-color: #969696;
`;
