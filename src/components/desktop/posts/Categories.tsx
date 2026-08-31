import { getTipsCategories } from "@/apis/categories";
import CategoryIcon from "@/resources/assets/icons/category/CategoryIcon";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

interface Category {
  name: string;
}

export default function Categories() {
  const location = useLocation();
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [colleges, setColleges] = useState<Category[]>([]);
  const [isCollegesOpened, setIsCollegesOpened] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("type") != type) {
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
  }, [location.search]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (type == "tips") {
          const response = await getTipsCategories();
          const allCategories = ["전체", ...response.data];
          const tmpCategories: Category[] = [];
          const tmpCollages: Category[] = [];

          allCategories.forEach((cat) => {
            const category = { name: cat };

            if (cat.endsWith("대학") || cat.endsWith("학부")) {
              tmpCollages.push(category);
            } else {
              tmpCategories.push(category);
            }
          });

          setCategories(tmpCategories);
          setColleges(tmpCollages);
        } else if (type == "notice") {
          setCategories(
            ["전체", "학사", "모집", "학점교류", "교육시험"].map((cat) => ({
              name: cat,
            })),
          );
        }
      } catch (error) {
        console.error("모든 카테고리 가져오기 실패", error);
      }
    };

    fetchCategories();
  }, [type]);

  const handleClickCategory = (category: string) => {
    const params = new URLSearchParams(location.search);
    params.delete("id");
    params.delete("search");
    params.set("category", category);
    params.delete("page");
    navigate(`/posts?${params.toString()}`);
  };

  return (
    <CategoriesWrapper>
      {categories.map((category, index) => (
        <CategoryItem
          className={selectedCategory === category.name ? "selected" : ""}
          key={index}
          onClick={() => handleClickCategory(category.name)}
        >
          <StyledCategoryIcon
            name={category.name}
            active={selectedCategory === category.name}
            $selected={selectedCategory === category.name}
          />
          {category.name}
        </CategoryItem>
      ))}
      {type === "tips" && (
        <>
          <Line />
          <CollegeTitle onClick={() => setIsCollegesOpened(!isCollegesOpened)}>
            단과대 ▼
          </CollegeTitle>
        </>
      )}
      {isCollegesOpened && (
        <Colleges>
          {colleges.map((category, index) => (
            <CollegeItem
              className={selectedCategory === category.name ? "selected" : ""}
              key={index}
              onClick={() => handleClickCategory(category.name)}
            >
              {category.name}
            </CollegeItem>
          ))}
        </Colleges>
      )}
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

// CategoryIcon은 currentColor를 상속하므로, 선택 상태에 따른 아이콘 색은
// 여기(호출부)에서 결정한다. 기존 시각 결과(비선택 #888888 / 선택 #ffffff)를 그대로 유지한다.
const StyledCategoryIcon = styled(CategoryIcon)<{ $selected: boolean }>`
  color: ${({ $selected }) => ($selected ? "#ffffff" : "#888888")};
  flex-shrink: 0;
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

const Line = styled.div`
  height: 1px;
  background-color: #888888;
`;

const CollegeTitle = styled.button`
  height: 60px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 500;
  color: #656565;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border: none;
`;

const Colleges = styled.div`
  background-color: #eff5fe;
  border-radius: 12px;
`;

const CollegeItem = styled.button`
  width: 100%;
  padding-left: 48px;
  height: 56px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #656565;
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;

  &:hover {
    text-shadow: 2px 2px 5px rgba(111, 132, 226, 0.5); /* 그림자 추가 */
  }

  &.selected {
    background: linear-gradient(90deg, #6f84e2 0%, #7babe5 100%);
    font-weight: 700;
    color: #ffffff;
  }
`;
