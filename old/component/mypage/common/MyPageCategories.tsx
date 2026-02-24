import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MyPageCategory } from "old/resource/string/mypage";
import MypageLogout from "./logout";
import styled from "styled-components";

interface Category {
  name: string;
  iconWhite: string;
  iconGray: string;
  hasError?: boolean;
}

interface MyPageCategoriesProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function MyPageCategories({
  selectedCategory,
  setSelectedCategory,
}: MyPageCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    const cats = MyPageCategory.map((cat: string) => ({
      name: cat,
      iconWhite: `/categoryIcons/${cat}_white.svg`,
      iconGray: `/categoryIcons/${cat}_gray.svg`,
    }));
    setCategories(cats);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageError = (index: number) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat, idx) =>
        idx === index ? { ...cat, hasError: true } : cat,
      ),
    );
  };

  const handleClickCategory = (category: string) => {
    setSelectedCategory(category);
    navigate(`/mypage`);
  };

  return (
    <Categories>
      {categories.map((category, index) => (
        <CategoryItem
          key={index}
          className={selectedCategory === category.name ? "selected" : ""}
          onClick={() => handleClickCategory(category.name)}
        >
          {category.hasError ? (
            <div style={{ width: "25px", height: "25px" }} />
          ) : (
            <img
              src={
                selectedCategory === category.name
                  ? category.iconWhite
                  : category.iconGray
              }
              alt={category.name}
              onError={() => handleImageError(index)}
            />
          )}
          {category.name}
        </CategoryItem>
      ))}
      <MypageLogout />
    </Categories>
  );
}

// Styled Components
const Categories = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
    align-items: center;
    gap: 0px;
    width: 80%;
  }
`;

const CategoryItem = styled.div`
  width: 143px;
  padding-left: 50px;
  height: 60px;
  border-radius: 10px;
  cursor: url("/pointers/cursor-pointer.svg"), pointer;
  font-size: 17px;
  font-weight: 500;
  color: #656565;
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    width: 100%;
    height: 40px;
  }

  &.selected {
    background: linear-gradient(90deg, #6f84e2 0%, #7babe5 100%);
    font-weight: 700;
    color: #ffffff;
    width: auto;
  }
`;
