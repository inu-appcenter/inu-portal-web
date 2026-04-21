import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { SOFT_CHIP_SHADOW } from "@/styles/shadows";

interface CategoryOption {
  label: string;
  value?: string;
}

interface CategorySelectorNewProps {
  categories: Array<string | CategoryOption>;
  selectedCategory?: string;
  queryParam?: string;
  paramsToReset?: string[];
}

export default function CategorySelectorNew({
  categories,
  selectedCategory,
  queryParam = "category",
  paramsToReset = ["search"],
}: CategorySelectorNewProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);

  const normalizedCategories = useMemo(
    () =>
      categories.map((category) =>
        typeof category === "string"
          ? { label: category, value: category }
          : { label: category.label, value: category.value ?? category.label },
      ),
    [categories],
  );

  useLayoutEffect(() => {
    const element = scrollAreaRef.current;
    if (!element) return;

    const updateOverflow = () => {
      const { scrollWidth, clientWidth } = element;
      const isOverflowing = scrollWidth > clientWidth + 1;
      setHasHorizontalOverflow(isOverflowing);
    };

    const handle = requestAnimationFrame(updateOverflow);

    const observer = new ResizeObserver(() => {
      updateOverflow();
    });

    observer.observe(element);
    window.addEventListener("resize", updateOverflow);

    return () => {
      cancelAnimationFrame(handle);
      observer.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [normalizedCategories]);

  const handleClickCategory = (category: string) => {
    const params = new URLSearchParams(location.search);
    paramsToReset.forEach((paramKey) => params.delete(paramKey));
    params.set(queryParam, category);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  return (
    <CategorySelectorWrapper>
      <CategoryScrollArea
        ref={scrollAreaRef}
        $hasHorizontalOverflow={hasHorizontalOverflow}
      >
        {normalizedCategories.map((category, index) => (
          <FillItem
            key={index}
            $selected={selectedCategory === category.value}
            onClick={() => handleClickCategory(category.value)}
          >
            <div>{category.label}</div>
          </FillItem>
        ))}
      </CategoryScrollArea>
    </CategorySelectorWrapper>
  );
}

const CategorySelectorWrapper = styled.div`
  width: 100%;
  overflow: hidden;
`;

const CategoryScrollArea = styled.div<{ $hasHorizontalOverflow: boolean }>`
  display: flex;
  flex-direction: row;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;

  overflow-x: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow ? "auto" : "hidden"};

  /* 스크롤 시에만 우측 여백 확보 */
  padding: 4px 0;
  padding-right: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow ? "24px" : "0px"};

  mask-image: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow
      ? `linear-gradient(to right, #000 85%, transparent 100%)`
      : "none"};
  -webkit-mask-image: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow
      ? `linear-gradient(to right, #000 85%, transparent 100%)`
      : "none"};

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FillItem = styled.div<{ $selected: boolean }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: fit-content;
  border-radius: 100px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  background: ${({ $selected }) => ($selected ? "#5E92F0" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#F4F4F4" : "#666")};
  box-shadow: ${SOFT_CHIP_SHADOW};
  cursor: pointer;
  white-space: nowrap;
`;
