import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { getTipsCategories } from "@/apis/categories";
import Icon from "@/components/common/Icon";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getTipsCategories();
        setCategories(response.data);
        if (!category && response.data.length > 0) {
          setCategory(response.data[0]);
        }
      } catch (error) {
        console.error("카테고리 가져오기 실패", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (cat: string) => {
    setCategory(cat);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <CategorySelectorWrapper ref={dropdownRef}>
      <DropdownButton onClick={() => setIsOpen(!isOpen)} type="button">
        <span>{category || "카테고리"}</span>
        <Icon name="chevron-down" size={18} color="#333D4B" />
      </DropdownButton>

      {isOpen && (
        <DropdownMenu>
          {categories.map((cat) => (
            <DropdownItem
              key={cat}
              $selected={cat === category}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </CategorySelectorWrapper>
  );
}

const CategorySelectorWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #333d4b);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background-color 0.15s ease-in-out;

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #ffffff;
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 130px;
  overflow: hidden;
  padding: 6px 0;
`;

const DropdownItem = styled.div<{ $selected: boolean }>`
  padding: 10px 16px;
  font-size: 14px;
  font-weight: ${(props) => (props.$selected ? "600" : "400")};
  color: ${(props) =>
    props.$selected ? "var(--text-brand, #0061ff)" : "#333d4b"};
  background-color: ${(props) => (props.$selected ? "#f0f6ff" : "transparent")};
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease-in-out;

  &:active {
    background-color: #f8f9fb;
  }
`;
