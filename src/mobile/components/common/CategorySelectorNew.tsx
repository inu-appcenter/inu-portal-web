import { useEffect, useState } from "react";
import styled from "styled-components";
import { getCategories } from "apis/categories";
import { useLocation, useNavigate } from "react-router-dom";
import useAppStateStore from "stores/useAppStateStore";

export default function CategorySelectorNew() {
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
    } else if (location.pathname === `${isAppUrl}/home/notice`) {
      setType("notice");
    } else if (location.pathname === `${isAppUrl}/home/tips`) {
      setType("tips");
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
          const response = await getCategories();
          setCategories(["전체", ...response.data]);
        } else if (type == "write") {
          const response = await getCategories();
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
      {categories.map((category, index) => (
        <FillItem
          key={index}
          $selected={selectedCategory === category}
          onClick={() => {
            handleClickCategory(category);
            setIsOpen(false);
          }}
        >
          <div>{category}</div>
        </FillItem>
      ))}
    </CategorySelectorWrapper>
  );
}

const CategorySelectorWrapper = styled.div`
  width: 100%;
  height: fit-content;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap; /* ✅ 줄바꿈 허용 */
  gap: 6px;
`;

const FillItem = styled.div<{ $selected: boolean }>`
  min-width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  height: fit-content;
  border-radius: 100px;
  padding: 8px 14px;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 500;

  background: ${({ $selected }) =>
    $selected
      ? "linear-gradient(180deg, #ffffff -21.86%, #d5e4f7 100%, #aac9ee 100%)"
      : "#e0e0e0"}; /* ✅ 선택되지 않은 건 회색 */
  color: ${({ $selected }) => ($selected ? "#000" : "#666")};
  cursor: pointer;
`;
