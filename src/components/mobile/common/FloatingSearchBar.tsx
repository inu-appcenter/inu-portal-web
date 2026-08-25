import { useState, useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import styled from "styled-components";
import { Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { resetScrollToTop } from "@/utils/scroll";

export interface FloatingSearchBarRef {
  blur: () => void;
  focus: () => void;
  clear: () => void;
}

interface FloatingSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onActiveChange?: (isActive: boolean) => void;
  searchParamKey?: string;
  /** 접혀있을 때(비활성 상태) FAB 지름(px). 다른 FAB과 크기를 맞출 때 사용. 기본 48px. */
  size?: number;
}

const SEARCH_HISTORY_STATE_KEY = "__intipFloatingSearchBarOpen";

const FloatingSearchBar = forwardRef<
  FloatingSearchBarRef,
  FloatingSearchBarProps
>(({ placeholder = "검색어를 입력하세요", onSearch, onActiveChange, searchParamKey, size = 48 }, ref) => {
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [searchParams, setSearchParams] = useSearchParams();

  const isSearchActiveRef = useRef(false);
  const hasSearchHistoryEntryRef = useRef(false);
  const isSyncingSearchHistoryRef = useRef(false);

  const handleActiveChange = (active: boolean) => {
    setIsSearchActive(active);
    if (onActiveChange) {
      onActiveChange(active);
    }
  };

  useEffect(() => {
    if (searchParamKey) {
      const paramVal = searchParams.get(searchParamKey) || "";
      if (paramVal !== searchQuery) {
        setSearchQuery(paramVal);
        if (paramVal) {
          handleActiveChange(true);
          if (onSearch) {
            onSearch(paramVal);
          }
        }
      }
    }
  }, [searchParams, searchParamKey]);

  useEffect(() => {
    isSearchActiveRef.current = isSearchActive;
  }, [isSearchActive]);

  useEffect(() => {
    const handlePopState = () => {
      if (isSyncingSearchHistoryRef.current) {
        isSyncingSearchHistoryRef.current = false;
        hasSearchHistoryEntryRef.current = false;
        return;
      }

      if (!isSearchActiveRef.current) return;

      // 우리가 쌓은 엔트리가 아직 스택에 남아 있다면 이 popstate 는 우리 것이
      // 아니다. 같은 문서 안에서 히스토리를 쓰는 주체가 여럿이라(시트·드롭다운
      // 오버레이의 useSheetBackHandler/useHistoryBackedOverlay, 네이티브 셸의
      // 딥링크 합성 popstate, 뒤로가기 위임의 webViewGoBack) 남의 back() 이
      // 만든 pop 까지 받아 검색바가 제멋대로 접히곤 했다. 착지한 엔트리에
      // 우리 플래그가 그대로 있으면 무시한다.
      if (window.history.state?.[SEARCH_HISTORY_STATE_KEY]) return;

      hasSearchHistoryEntryRef.current = false;
      inputRef.current?.blur();
      handleActiveChange(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (isSearchActive) {
      if (!hasSearchHistoryEntryRef.current) {
        window.history.pushState(
          {
            ...(window.history.state ?? {}),
            [SEARCH_HISTORY_STATE_KEY]: true,
          },
          "",
        );
        hasSearchHistoryEntryRef.current = true;
      }
      return;
    }

    if (
      hasSearchHistoryEntryRef.current &&
      window.history.state?.[SEARCH_HISTORY_STATE_KEY]
    ) {
      isSyncingSearchHistoryRef.current = true;
      window.history.back();
    }
  }, [isSearchActive]);

  // 검색어가 비어있는 상태에서 다른 영역을 만지면(탭/드래그) 검색바 닫기.
  //
  // 드래그 신호로 scroll 이 아니라 touchmove 를 쓴다. 네이티브 웹뷰에서는 인풋에
  // 포커스가 가면 소프트 키보드가 올라오며 뷰포트가 줄고(안드로이드는 셸이 웹뷰를
  // 키보드 높이만큼 줄이고, iOS 는 WKWebView 가 스크롤뷰에 인셋을 넣고 포커스된
  // 요소를 보이게 스크롤한다) 그게 window 의 scroll 로 나타난다. 사용자가 스크롤한
  // 적이 없는데 여기서 닫혀서, 포커스가 가자마자 키보드가 닫히고 검색바가 접혔다
  // (브라우저는 포커스만으로 뷰포트가 변하지 않아 재현되지 않는다). 손가락 드래그는
  // 그런 오인이 없다.
  useEffect(() => {
    if (!isSearchActive) return;

    const handleOutsideInteraction = (e: Event) => {
      // 검색바 자신을 만지는 건 "바깥 상호작용"이 아니다.
      if ((e.target as HTMLElement)?.closest?.(".floating-search-bar-wrapper")) {
        return;
      }

      if (!searchQuery.trim()) {
        inputRef.current?.blur();
        handleActiveChange(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideInteraction, {
      passive: true,
    });
    document.addEventListener("touchmove", handleOutsideInteraction, {
      passive: true,
    });

    return () => {
      document.removeEventListener("pointerdown", handleOutsideInteraction);
      document.removeEventListener("touchmove", handleOutsideInteraction);
    };
  }, [isSearchActive, searchQuery]);

  const handleClear = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSearchQuery("");
    if (searchParamKey) {
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.delete(searchParamKey);
      setSearchParams(nextParams, { replace: true });
    }
    if (onSearch) {
      onSearch("");
    }
    inputRef.current?.focus();
  };

  useImperativeHandle(ref, () => ({
    blur: () => {
      inputRef.current?.blur();
      if (!searchQuery.trim()) {
        handleActiveChange(false);
      }
    },
    focus: () => {
      handleActiveChange(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
    clear: () => {
      handleClear();
    },
  }));

  const executeSearch = (query: string) => {
    resetScrollToTop();
    if (onSearch) {
      onSearch(query);
    }
    if (searchParamKey) {
      const nextParams = new URLSearchParams(window.location.search);
      if (query.trim()) {
        nextParams.set(searchParamKey, query);
      } else {
        nextParams.delete(searchParamKey);
      }
      setSearchParams(nextParams, { replace: true });
    }
    inputRef.current?.blur();
  };

  return (
    <SearchBarWrapper
      className="floating-search-bar-wrapper"
      $isActive={isSearchActive}
      $size={size}
    >
      <SearchInput
        ref={inputRef}
        $isActive={isSearchActive}
        $hasValue={searchQuery.length > 0}
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            executeSearch(searchQuery);
          }
        }}
      />
      {isSearchActive && searchQuery.length > 0 && (
        <ClearButton
          type="button"
          onClick={handleClear}
          aria-label="검색어 지우기"
        >
          <X size={14} strokeWidth={2.5} />
        </ClearButton>
      )}
      <SearchButtonCircle
        $isActive={isSearchActive}
        $size={size}
        onClick={(e) => {
          e.stopPropagation();
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
        <Search size={20} />
      </SearchButtonCircle>
    </SearchBarWrapper>
  );
});

FloatingSearchBar.displayName = "FloatingSearchBar";

export default FloatingSearchBar;

// --- 스타일 정의 ---

const SearchBarWrapper = styled.div<{ $isActive: boolean; $size: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${(props) => props.$size}px;
  border-radius: 999px;
  transition:
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    flex 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.3s ease,
    box-shadow 0.3s ease;
  will-change: width, flex;
  pointer-events: auto;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;

  border: 1px solid var(--border-default, #E5E8EB);
  background: ${(props) => (props.$isActive ? "#ffffff" : "rgba(255, 255, 255, 0.50)")};
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
  backdrop-filter: ${(props) => (props.$isActive ? "none" : "blur(8px)")};

  width: ${(props) => (props.$isActive ? "100%" : `${props.$size}px`)};
  flex: ${(props) => (props.$isActive ? "1" : `0 0 ${props.$size}px`)};
`;

const SearchInput = styled.input<{ $isActive: boolean; $hasValue: boolean }>`
  width: 100%;
  height: 100%;
  outline: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #333d4b);
  box-sizing: border-box;

  opacity: ${(props) => (props.$isActive ? 1 : 0)};
  padding-left: ${(props) => (props.$isActive ? "16px" : "0px")};
  padding-right: ${(props) =>
    props.$isActive ? (props.$hasValue ? "76px" : "46px") : "0px"};
  pointer-events: ${(props) => (props.$isActive ? "auto" : "none")};

  border-radius: 999px;
  border: 1px solid var(--border-strong, #d1d6db);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);

  transition: 
    opacity 0.25s ease,
    padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, padding;

  &::placeholder {
    color: var(--text-tertiary, #8b95a1);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  top: 50%;
  right: 46px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--bg-neutral, #e5e8eb);
  color: var(--text-tertiary, #8b95a1);
  border: none;
  cursor: pointer;
  outline: none;
  z-index: 3;
  padding: 0;
  transition: all 0.2s ease;

  &:hover {
    background: var(--border-strong, #d1d6db);
    color: var(--text-secondary, #4e5968);
  }

  &:active {
    transform: translateY(-50%) scale(0.9);
  }
`;

const SearchButtonCircle = styled.button<{ $isActive: boolean; $size: number }>`
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
    width: ${props.$size - 8}px;
    height: ${props.$size - 8}px;
    background: var(--interactive-primary, #3b82f6);
    color: #ffffff;
    border: 1px solid var(--border-brand, #0061FF);
  `
      : `
    top: 0px;
    right: 0px;
    width: ${props.$size - 2}px;
    height: ${props.$size - 2}px;
    background: transparent;
    color: var(--text-secondary, #333d4b);
  `}

  &:active {
    transform: scale(0.95);
  }
`;
