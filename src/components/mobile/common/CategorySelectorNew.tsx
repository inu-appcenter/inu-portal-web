import { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

interface CategorySelectorNewProps {
  categories: string[];
  selectedCategory?: string;
}

export default function CategorySelectorNew({
  categories,
  selectedCategory,
}: CategorySelectorNewProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);

  useLayoutEffect(() => {
    const element = scrollAreaRef.current;
    if (!element) {
      setHasHorizontalOverflow(false);
      return;
    }

    const updateOverflow = () => {
      const nextHasOverflow = element.scrollWidth > element.clientWidth + 1;
      setHasHorizontalOverflow((prev) =>
        prev === nextHasOverflow ? prev : nextHasOverflow,
      );
    };

    updateOverflow();
    const frameId = window.requestAnimationFrame(updateOverflow);
    window.addEventListener("resize", updateOverflow);

    if (typeof ResizeObserver === "undefined") {
      return () => {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener("resize", updateOverflow);
      };
    }

    const observer = new ResizeObserver(() => {
      updateOverflow();
    });
    observer.observe(element);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateOverflow);
      observer.disconnect();
    };
  }, [categories, selectedCategory]);

  const handleClickCategory = (category: string) => {
    const params = new URLSearchParams(location.search);
    params.delete("search");
    params.set("category", category);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  return (
    <CategorySelectorWrapper>
      <CategoryScrollArea
        ref={scrollAreaRef}
        $hasHorizontalOverflow={hasHorizontalOverflow}
      >
        {categories.map((category, index) => (
          <FillItem
            key={index}
            $selected={selectedCategory === category}
            onClick={() => handleClickCategory(category)}
          >
            <div>{category}</div>
          </FillItem>
        ))}
      </CategoryScrollArea>

      {/*<GradientRight />*/}
    </CategorySelectorWrapper>
  );
}

const CategorySelectorWrapper = styled.div`
  //position: relative;
  width: fit-content;
  max-width: 100%;
  height: fit-content;
`;

const CategoryScrollArea = styled.div<{ $hasHorizontalOverflow: boolean }>`
  display: flex;
  width: max-content;
  max-width: 100%;
  flex-direction: row;
  gap: 6px;
  overflow-x: auto;
  padding: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow ? "4px 20px 4px 0" : "4px 0"};
  box-sizing: border-box;

  /* Keep the right fade only while horizontal scroll is actually possible. */
  mask-image: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow
      ? `linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 90%,
    rgba(0, 0, 0, 0) 100%
  )`
      : "none"};
  -webkit-mask-image: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow
      ? `linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 90%,
    rgba(0, 0, 0, 0) 100%
  )`
      : "none"};

  &::-webkit-scrollbar {
    display: none;
  }
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

  background: ${({ $selected }) => ($selected ? "#5E92F0" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#F4F4F4" : "#666")};
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;
