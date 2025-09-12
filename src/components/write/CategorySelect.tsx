import { getTipsCategories } from "apis/categories";
import { useEffect, useState } from "react";
import styled from "styled-components";
import dropdown from "resources/assets/write/dropdown.svg";

interface CategorySelectProps {
  category: string;
  setCategory: (value: string) => void;
}

export default function CategorySelect({
  category,
  setCategory,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getTipsCategories();
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
    <CategorySelectWrapper>
      {isOpen ? (
        <Dropdown>
          {categories.map((category) => (
            <DropdownOption
              key={category}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </DropdownOption>
          ))}
        </Dropdown>
      ) : (
        <Selected
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <span>{category || "카테고리 선택"}</span>
          <img src={dropdown} alt="" />
        </Selected>
      )}
    </CategorySelectWrapper>
  );
}

const CategorySelectWrapper = styled.div`
  width: 240px;
  height: 60px;
  border: none;
`;

const Selected = styled.button`
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-radius: 40px;
  border: none;
  background: linear-gradient(
    180deg,
    #ffffff -21.86%,
    #d5e4f7 100%,
    #aac9ee 100%
  );
  span {
    font-size: 16px;
  }
  img {
    width: 14px;
  }
`;

const Dropdown = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  background: linear-gradient(
    180deg,
    #ffffff -21.86%,
    #d5e4f7 100%,
    #aac9ee 100%
  );
  border-radius: 20px;
  max-height: 500px;
  overflow-y: scroll;
`;

const DropdownOption = styled.button`
  border: none;
  background: transparent;
  width: 80%;
  padding: 20px 0;

  font-size: 16px;
  font-weight: 500;
  color: #656565;

  &:hover {
    text-shadow: 2px 2px 5px rgba(111, 132, 226, 0.5); /* 그림자 추가 */
  }

  border-top: 1px solid #969696;
  &:first-of-type {
    border-top: none;
  }
`;
