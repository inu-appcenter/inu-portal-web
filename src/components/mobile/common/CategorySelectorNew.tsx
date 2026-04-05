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
      // 패딩이나 마진 영향을 제외한 순수 가시 너비와 전체 너비 비교
      const isOverflowing = element.scrollWidth > element.offsetWidth;
      setHasHorizontalOverflow(isOverflowing);
    };

    updateOverflow();

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(element);
    // 윈도우 리사이즈도 감지하여 정확도 향상
    window.addEventListener("resize", updateOverflow);

    return () => {
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
  max-width: 100%;
  overflow: hidden;
`;

const CategoryScrollArea = styled.div<{ $hasHorizontalOverflow: boolean }>`
  display: flex;
  flex-direction: row;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;

  /* 스크롤 발생 여부에 따른 가변 레이아웃 */
  overflow-x: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow ? "auto" : "visible"};

  /* 오버플로우가 없을 때는 패딩과 마진을 0으로 초기화하여 우측 여백 제거 */
  padding: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow ? "4px 24px 4px 2px" : "4px 0"};
  margin-right: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow ? "-24px" : "0"};

  /* 마스크 효과도 스크롤 시에만 적용 */
  mask-image: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow
      ? `linear-gradient(to right, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 0) 100%)`
      : "none"};
  -webkit-mask-image: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow
      ? `linear-gradient(to right, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 0) 100%)`
      : "none"};

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FillItem = styled.div<{ $selected: boolean }>`
  flex-shrink: 0; /* 아이템이 눌리지 않도록 설정 */
  display: flex;
  align-items: center;
  justify-content: center;
  height: fit-content;
  border-radius: 100px;
  padding: 8px 14px;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 500;
  background: ${({ $selected }) => ($selected ? "#5E92F0" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#F4F4F4" : "#666")};
  box-shadow: ${SOFT_CHIP_SHADOW};
  cursor: pointer;
  white-space: nowrap; /* 글자 줄바꿈 방지 */
`;
