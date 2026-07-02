import { useState, useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import styled from "styled-components";
import { Search } from "lucide-react";

export interface FloatingSearchBarRef {
  blur: () => void;
  focus: () => void;
  clear: () => void;
}

interface FloatingSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onActiveChange?: (isActive: boolean) => void;
}

const FloatingSearchBar = forwardRef<
  FloatingSearchBarRef,
  FloatingSearchBarProps
>(({ placeholder = "검색어를 입력하세요", onSearch, onActiveChange }, ref) => {
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleActiveChange = (active: boolean) => {
    setIsSearchActive(active);
    if (onActiveChange) {
      onActiveChange(active);
    }
  };

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    blur: () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      inputRef.current?.blur();
      handleActiveChange(false);
    },
    focus: () => {
      handleActiveChange(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
    clear: () => {
      setSearchQuery("");
    },
  }));

  const executeSearch = (query: string) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    if (onSearch) {
      onSearch(query);
    }
    inputRef.current?.blur();
    handleActiveChange(false);
  };

  return (
    <SearchBarWrapper $isActive={isSearchActive}>
      <SearchInput
        ref={inputRef}
        $isActive={isSearchActive}
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onBlur={() => {
          // 인풋 외부 클릭 시 검색창이 축소되도록 하되, 돋보기 버튼 클릭 시의 onClick 이벤트를 먼저 실행할 수 있게 약간의 딜레이를 줌
          blurTimeoutRef.current = setTimeout(() => {
            handleActiveChange(false);
          }, 150);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            executeSearch(searchQuery);
          }
        }}
      />
      <SearchButtonCircle
        $isActive={isSearchActive}
        onClick={(e) => {
          e.stopPropagation();
          if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
          }
          if (!isSearchActive) {
            handleActiveChange(true);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          } else {
            executeSearch(searchQuery);
          }
        }}
      >
        <Search size={24} />
      </SearchButtonCircle>
    </SearchBarWrapper>
  );
});

FloatingSearchBar.displayName = "FloatingSearchBar";

export default FloatingSearchBar;

// --- 스타일 정의 ---

const SearchBarWrapper = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  border-radius: 999px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;

  border: 1px solid var(--border-default, #E5E8EB);
  background: ${(props) => (props.$isActive ? "#ffffff" : "rgba(255, 255, 255, 0.50)")};
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
  backdrop-filter: ${(props) => (props.$isActive ? "none" : "blur(8px)")};

  width: ${(props) => (props.$isActive ? "100%" : "56px")};
  flex: ${(props) => (props.$isActive ? "1" : "0 0 56px")};
`;

const SearchInput = styled.input<{ $isActive: boolean }>`
  width: 100%;
  height: 100%;
  outline: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary, #333d4b);
  box-sizing: border-box;

  opacity: ${(props) => (props.$isActive ? 1 : 0)};
  padding-left: ${(props) => (props.$isActive ? "20px" : "0px")};
  padding-right: ${(props) => (props.$isActive ? "56px" : "0px")};
  pointer-events: ${(props) => (props.$isActive ? "auto" : "none")};

  border-radius: 999px;
  border: 1px solid var(--border-strong, #d1d6db);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);

  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &::placeholder {
    color: var(--text-tertiary, #8b95a1);
  }
`;

const SearchButtonCircle = styled.button<{ $isActive: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-subtle, #f8f9fb);
  cursor: pointer;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  flex-shrink: 0;
  z-index: 2;

  /* Position & Size based on active state */
  ${(props) =>
    props.$isActive
      ? `
    top: 3px;
    right: 3px;
    width: 48px;
    height: 48px;
    background: var(--interactive-primary, #3b82f6);
    color: #ffffff;
    border: 1px solid var(--border-brand, #0061FF);
  `
      : `
    top: 0px;
    right: 0px;
    width: 54px;
    height: 54px;
    background: transparent;
    color: var(--text-secondary, #333d4b);
  `}

  &:active {
    transform: scale(0.95);
  }
`;
