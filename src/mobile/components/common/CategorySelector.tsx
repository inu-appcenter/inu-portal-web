import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getTipsCategories } from "apis/categories";
import dropdownIcon from "resources/assets/mobile-tips/CategorySelectDropdown-img.svg";
import { useLocation, useNavigate } from "react-router-dom";
import useAppStateStore from "stores/useAppStateStore";

export default function CategorySelector() {
  const location = useLocation();
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { isAppUrl } = useAppStateStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (location.pathname === `${isAppUrl}/write`) {
      setType("write");
    } else if (params.get("type") != type) {
      if (params.get("type") === "notice") {
        setType("notice");
      } else {
        setType("tips");
      }
    }
    if (params.get("search")) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(params.get("category") || "전체");
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (type == "tips") {
          const response = await getTipsCategories();
          setCategories(["전체", ...response.data]);
        } else if (type == "write") {
          const response = await getTipsCategories();
          setCategories(response.data);
        } else if (type === "notice") {
          setCategories(["전체", "학사", "모집", "학점교류", "교육시험"]);
        }
      } catch (error) {
        console.error("모든 카테고리 가져오기 실패", error);
      }
    };
    fetchCategories();
  }, [type]);

  const handleClickCategory = (category: string) => {
    const params = new URLSearchParams(location.search);
    params.delete("search");
    params.set("category", category);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  return (
    <CategorySelectorWrapper onClick={() => setIsOpen(!isOpen)}>
      {isOpen ? (
        <DropdownOptions>
          {categories.map((category, index) => (
            <React.Fragment key={category}>
              <DropdownOption
                onClick={() => {
                  handleClickCategory(category);
                  setIsOpen(false);
                }}
              >
                <div>{category}</div>
                {index < categories.length - 1 && <DropdownOptionLine />}
              </DropdownOption>
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
  font-size: 11px;
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
  padding-top: 15px;
  padding-bottom: 15px;

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

  max-height: 250px;
  gap: 10px;
`;

const DropdownOption = styled.div`
  width: 100%;
  text-align: center;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const DropdownOptionLine = styled.div`
  height: 1px;
  width: 80%;
  background-color: #969696;
`;
