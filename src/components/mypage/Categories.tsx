import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

interface Category {
  name: string;
  iconWhite: string;
  iconGray: string;
  hasError?: boolean;
}

const allCategories = [
  "스크랩",
  "내 활동",
  "개인정보 수정",
  // "회원 탈퇴"
];

export default function Categories() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const categories: Category[] = allCategories.map((cat) => ({
    name: cat,
    iconWhite: `/categoryIcons/${cat}_white.svg`,
    iconGray: `/categoryIcons/${cat}_gray.svg`,
  }));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedCategory(params.get("category") || "스크랩");
  }, [location.search]);

  const handleClickCategory = (category: string) => {
    const params = new URLSearchParams(location.search);
    params.set("category", category);
    params.delete("page");
    navigate(`/mypage?${params.toString()}`);
  };

  return (
    <CategoriesWrapper>
      {categories.map((category, index) => (
        <CategoryItem
          className={selectedCategory === category.name ? "selected" : ""}
          key={index}
          onClick={() => handleClickCategory(category.name)}
        >
          {category.hasError ? (
            <div style={{ width: "25px", height: "25px" }}></div>
          ) : (
            <img
              src={
                selectedCategory === category.name
                  ? category.iconWhite
                  : category.iconGray
              }
              alt={category.name}
            />
          )}
          {category.name}
        </CategoryItem>
      ))}
    </CategoriesWrapper>
  );
}

const CategoriesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 220px;
  margin: 60px 16px 0 16px;
`;

const CategoryItem = styled.button`
  background-color: white;
  border: none;
  padding-left: 48px;
  height: 60px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 500;
  color: #656565;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    text-shadow: 2px 2px 5px rgba(111, 132, 226, 0.5); /* 그림자 추가 */
  }

  &.selected {
    background: linear-gradient(90deg, #6f84e2 0%, #7babe5 100%);
    font-weight: 700;
    color: #ffffff;
  }
`;
