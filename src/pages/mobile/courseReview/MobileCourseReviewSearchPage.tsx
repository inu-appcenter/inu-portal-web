import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { SlidersHorizontal, ChevronDown, Check, Search } from "lucide-react";
import { useNavigate, useSearchParams, useNavigationType } from "react-router-dom";
import { createPortal } from "react-dom";
import { useHeader } from "@/context/HeaderContext";
import TabUpper from "@/components/common/TabUpper";
import { ROUTES } from "@/constants/routes";
import { useCourses } from "@/hooks/useCourses";
import { useCourseOfferings } from "@/hooks/useCourseOfferings";
import { useSemesters } from "@/hooks/useSemesters";
import { useEffectiveCourseFilters } from "@/stores/useCourseFilterStore";
import { countActiveFilters } from "@/components/mobile/timetable/filter/courseFilterModel";
import { mapFilterToOfferingFilters, mapCourseOfferingToCourseResult } from "@/utils/courseSearchResult";
import CourseResultList from "@/components/mobile/timetable/CourseResultList";
import type { CourseResult } from "@/components/mobile/timetable/CourseResultList";
import { formatSemester, pickCurrentSemester } from "@/utils/semester";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { SAFE_AREA } from "@/styles/safeArea";
import EmptyState from "@/components/common/EmptyState";
import Skeleton from "@/components/common/Skeleton";
import BottomSheet from "@/components/common/BottomSheet";
import FloatingSearchBar, { FloatingSearchBarRef } from "@/components/mobile/common/FloatingSearchBar";
import MyEnrolledCoursesSection from "@/components/mobile/courseReview/MyEnrolledCoursesSection";
import RecentReviewsFeedSection from "@/components/mobile/courseReview/RecentReviewsFeedSection";
import useUserStore from "@/stores/useUserStore";
import type { Term } from "@/types/timetables";

const TAB_STORAGE_KEY = "COURSE_REVIEWS_ACTIVE_TAB";
const SCROLL_STORAGE_KEY = "COURSE_REVIEWS_SCROLL_Y";
const EXPANDED_STORAGE_KEY = "COURSE_REVIEWS_EXPANDED_ID";

export default function MobileCourseReviewSearchPage() {
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const isBackNavigation = navigationType === "POP";
  const [searchParams, setSearchParams] = useSearchParams();
  const searchBarRef = useRef<FloatingSearchBarRef>(null);

  // 외부에서 새로 진입(PUSH/REPLACE)한 경우 이전 세션 스토리지 상태를 깨끗이 초기화
  useEffect(() => {
    if (!isBackNavigation) {
      try {
        sessionStorage.removeItem(TAB_STORAGE_KEY);
        sessionStorage.removeItem(SCROLL_STORAGE_KEY);
        sessionStorage.removeItem(EXPANDED_STORAGE_KEY);
      } catch {
        // ignore
      }
      window.scrollTo(0, 0);
    }
  }, [isBackNavigation]);

  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인 후 이용할 수 있어요.");
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // 상단 탭: 둘러보기(기본) vs 전체 강의 (POP 뒤로가기 시에만 세션 스토리지 복원)
  const [activeTab, setActiveTabState] = useState<string>(() => {
    const fromUrl = searchParams.get("tab");
    if (fromUrl === "all" || fromUrl === "discovery") return fromUrl;
    if (isBackNavigation) {
      const fromSession = sessionStorage.getItem(TAB_STORAGE_KEY);
      if (fromSession === "all" || fromSession === "discovery") return fromSession;
    }
    return "discovery";
  });

  const setActiveTab = useCallback(
    (newTab: string) => {
      setActiveTabState(newTab);
      sessionStorage.setItem(TAB_STORAGE_KEY, newTab);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newTab === "discovery") {
            next.delete("tab");
          } else {
            next.set("tab", newTab);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const keyword = searchParams.get("courseQuery") || "";

  useEffect(() => {
    if (keyword.trim()) {
      setActiveTab("all");
    }
  }, [keyword, setActiveTab]);

  const tabs = useMemo(
    () => [
      { id: "discovery", label: "둘러보기" },
      { id: "all", label: "전체 강의" },
    ],
    [],
  );

  // 학기 목록 및 선택
  const { semesters } = useSemesters();
  const defaultSemester = useMemo(() => pickCurrentSemester(semesters), [semesters]);

  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(() => defaultSemester?.id ?? null);
  const [isSemesterSheetOpen, setIsSemesterSheetOpen] = useState(false);

  useEffect(() => {
    if (defaultSemester && selectedSemesterId === null) {
      setSelectedSemesterId(defaultSemester.id);
    }
  }, [defaultSemester, selectedSemesterId]);

  const currentSelectedSemester = useMemo(() => {
    return semesters.find((s) => s.id === selectedSemesterId) ?? defaultSemester;
  }, [semesters, selectedSemesterId, defaultSemester]);

  const currentYear = currentSelectedSemester?.year ?? 2026;
  const currentTerm = (currentSelectedSemester?.term ?? "1") as Term;
  const currentSemesterLabel = currentSelectedSemester
    ? formatSemester(currentSelectedSemester.year, currentSelectedSemester.term)
    : "학기 선택";

  // 헤더 설정: 상단 헤더에 학기 선택 드롭다운 배치
  const headerTitle = useMemo(() => (
    <HeaderSemesterButton type="button" onClick={() => setIsSemesterSheetOpen(true)}>
      <span>{currentSemesterLabel}</span>
      <ChevronDown size={18} color="var(--text-primary)" />
    </HeaderSemesterButton>
  ), [currentSemesterLabel]);

  useHeader({
    title: headerTitle,
    showAlarm: false,
    hasback: true,
  });

  // 검색바 활성 상태
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  // 필터 스토어 연동 (시간표 편집과 100% 동일)
  const effectiveFilter = useEffectiveCourseFilters();
  const activeFilterCount = useMemo(() => countActiveFilters(effectiveFilter), [effectiveFilter]);
  const offeringFilters = useMemo(
    () => mapFilterToOfferingFilters(effectiveFilter),
    [effectiveFilter]
  );

  // 개설 강좌 데이터 조회 (선택된 학기 기준)
  const {
    courseOfferings,
    isLoading: isOfferingsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useCourseOfferings(currentYear, currentTerm, offeringFilters, {
    enabled: isLoggedIn,
  });

  // 교과목 마스터 데이터
  const { courses: allCourses, isLoading: isCoursesLoading } = useCourses(
    undefined,
    { enabled: isLoggedIn },
  );

  // 검색 결과 변환 및 클라이언트 필터링
  const searchResults: CourseResult[] = useMemo(() => {
    const courseMap = new Map<number, (typeof allCourses)[0]>();
    allCourses.forEach((c) => {
      courseMap.set(c.id, c);
    });

    return courseOfferings.map((offering) =>
      mapCourseOfferingToCourseResult(
        offering,
        offering.courseId ? courseMap.get(offering.courseId) : undefined
      )
    );
  }, [courseOfferings, allCourses]);

  const filteredResults: CourseResult[] = useMemo(() => {
    let list: CourseResult[] = [...searchResults];
    if (keyword.trim()) {
      const lower = keyword.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          (c.professor && c.professor.toLowerCase().includes(lower)) ||
          (c.courseId && c.courseId.toLowerCase().includes(lower))
      );
    }
    return list;
  }, [searchResults, keyword]);

  // 아코디언 펼침 상태 (POP 뒤로가기 시에만 세션 스토리지 복원)
  const [expandedId, setExpandedId] = useState<number | null>(() => {
    if (!isBackNavigation) return null;
    const saved = sessionStorage.getItem(EXPANDED_STORAGE_KEY);
    return saved ? Number(saved) : null;
  });

  const handleToggleExpand = useCallback((id: number) => {
    setExpandedId((prev) => {
      const next = prev === id ? null : id;
      if (next !== null) {
        sessionStorage.setItem(EXPANDED_STORAGE_KEY, String(next));
      } else {
        sessionStorage.removeItem(EXPANDED_STORAGE_KEY);
      }
      return next;
    });
  }, []);

  const isLoading = isOfferingsLoading || isCoursesLoading;

  // 스크롤 위치 저장 (스크롤 시 세션 스토리지 기록)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        sessionStorage.setItem(SCROLL_STORAGE_KEY, String(window.scrollY));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 상세/계획서 페이지에서 뒤로가기(POP)로 복귀했을 때만 스크롤 복원
  const isRestoredRef = useRef(false);
  useEffect(() => {
    if (!isBackNavigation) return;
    if (isLoading || isRestoredRef.current) return;

    const savedY = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    if (!savedY) return;

    const top = Number(savedY);
    if (!isNaN(top) && top > 0) {
      isRestoredRef.current = true;
      const timer = setTimeout(() => {
        window.scrollTo({ top, behavior: "instant" });
      }, 70);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isBackNavigation, activeTab]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <PageWrapper $isAllTab={activeTab === "all"}>
      {/* 상단 탭 (둘러보기 vs 전체 강의) */}
      <TabWrapper>
        <TabUpper
          tabs={tabs}
          activeTabId={activeTab}
          onChange={setActiveTab}
        />
      </TabWrapper>

      {activeTab === "discovery" ? (
        <DiscoveryContent>
          {/* 1. 검색 유도 바 (터치 시 전체 강의 탭 전환 및 검색 활성화) */}
          <MiniSearchTrigger
            type="button"
            onClick={() => {
              setActiveTab("all");
              setTimeout(() => searchBarRef.current?.focus(), 50);
            }}
          >
            <Search size={18} color="var(--text-caption, #8b95a1)" />
            <MiniSearchPlaceholder>어떤 강의의 후기가 궁금한가요?</MiniSearchPlaceholder>
          </MiniSearchTrigger>

          {/* 2. 내 수강 강의 섹션 */}
          <MyEnrolledCoursesSection
            currentYear={currentYear}
            currentTerm={currentTerm}
          />

          {/* 3. 최근 등록된 강의평 피드 */}
          <RecentReviewsFeedSection />
        </DiscoveryContent>
      ) : (
        /* 전체 강좌 목록 영역 */
        <ListContainer>
          {isLoading ? (
            <SkeletonWrapper>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} height="88px" variant="card" />
              ))}
            </SkeletonWrapper>
          ) : filteredResults.length > 0 ? (
            <CourseResultList
              courses={filteredResults}
              expandedId={expandedId}
              onToggleExpand={handleToggleExpand}
              hasNextPage={hasNextPage}
              fetchNextPage={fetchNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          ) : (
            <EmptyStateWrapper>
              <EmptyState>
                <EmptyTextGroup>
                  <strong>{keyword ? "검색 결과가 없어요" : "조건에 맞는 강의가 없어요"}</strong>
                  <span>
                    {keyword
                      ? "검색어를 확인하거나 필터 조건을 변경해 보세요."
                      : "하단 필터에서 다른 학과나 이수구분을 선택해 보세요."}
                  </span>
                </EmptyTextGroup>
              </EmptyState>
            </EmptyStateWrapper>
          )}
        </ListContainer>
      )}

      {/* 전체 강의 탭에서만 활성화되는 하단 플로팅 검색바 & 필터 버튼 */}
      {activeTab === "all" &&
        createPortal(
          <FloatingActionsContainer>
            <FilterButton
              $isHidden={isSearchActive}
              $isZeroCount={activeFilterCount === 0}
              onClick={() => navigate(ROUTES.TIMETABLE.FILTER)}
            >
              <SlidersHorizontal size={20} />
              {activeFilterCount > 0 && <span>필터 {activeFilterCount}</span>}
            </FilterButton>

            <FloatingSearchBar
              ref={searchBarRef}
              placeholder="교과목명, 교수명 검색"
              onSearch={(query) => console.log("강의평 검색 실행:", query)}
              onActiveChange={setIsSearchActive}
              searchParamKey="courseQuery"
            />
          </FloatingActionsContainer>,
          document.body,
        )}

      {/* 학기 선택 바텀시트 */}
      <BottomSheet
        open={isSemesterSheetOpen}
        onOpenChange={setIsSemesterSheetOpen}
        handle="compact"
      >
        <SemesterSheetWrapper>
          <SemesterSheetTitle>학기 선택</SemesterSheetTitle>
          <SemesterList>
            {semesters.map((s) => {
              const isSelected = s.id === currentSelectedSemester?.id;
              return (
                <SemesterItem
                  key={s.id}
                  $isSelected={isSelected}
                  onClick={() => {
                    setSelectedSemesterId(s.id);
                    setIsSemesterSheetOpen(false);
                  }}
                >
                  <span>{formatSemester(s.year, s.term)}</span>
                  {isSelected && <Check size={18} color="var(--interactive-primary, #3182f6)" />}
                </SemesterItem>
              );
            })}
          </SemesterList>
        </SemesterSheetWrapper>
      </BottomSheet>
    </PageWrapper>
  );
}

const PageWrapper = styled.div<{ $isAllTab: boolean }>`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: 0 20px
    ${({ $isAllTab }) => ($isAllTab ? `calc(90px + ${SAFE_AREA.BOTTOM})` : `calc(40px + ${SAFE_AREA.BOTTOM})`)};
  gap: 16px;

  @media ${DESKTOP_MEDIA} {
    padding: 0 0
      ${({ $isAllTab }) => ($isAllTab ? `calc(90px + ${SAFE_AREA.BOTTOM})` : `calc(40px + ${SAFE_AREA.BOTTOM})`)};
  }
`;

const TabWrapper = styled.div`
  margin: 0 -20px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-divider, #f2f4f6);
`;

const DiscoveryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const MiniSearchTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-surface, #ffffff);
  cursor: pointer;
  box-sizing: border-box;
  text-align: left;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:active {
    background: var(--bg-base, #f9fafb);
    border-color: var(--border-strong, #b0b8c1);
  }
`;

const MiniSearchPlaceholder = styled.span`
  font-size: 14px;
  color: var(--text-caption, #8b95a1);
`;

const HeaderSemesterButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  pointer-events: auto;

  &:active {
    opacity: 0.8;
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
`;

const EmptyStateWrapper = styled.div`
  padding: 60px 0;
`;

const EmptyTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;

  strong {
    color: var(--text-primary);
    font-size: 15px;
  }

  span {
    color: var(--text-secondary);
    font-size: 13px;
  }
`;

const FloatingActionsContainer = styled.div`
  position: fixed;
  bottom: calc(24px + ${SAFE_AREA.BOTTOM});
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: calc(768px - 40px);
  z-index: 10005;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  box-sizing: border-box;
`;

const FilterButton = styled.button<{
  $isHidden: boolean;
  $isZeroCount?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 48px;
  border-radius: 999px;
  cursor: pointer;
  pointer-events: auto;
  box-sizing: border-box;
  white-space: nowrap;

  border: ${({ $isZeroCount }) =>
    $isZeroCount
      ? "1px solid var(--border-default)"
      : "1px solid var(--border-brand)"};
  background: ${({ $isZeroCount }) =>
    $isZeroCount
      ? "rgba(255, 255, 255, 0.85)"
      : "var(--interactive-primary)"};
  box-shadow: ${({ $isZeroCount }) =>
    $isZeroCount
      ? "var(--elevation-1-shadow)"
      : "0 4px 12px rgba(59, 130, 246, 0.3)"};
  backdrop-filter: blur(8px);

  color: ${({ $isZeroCount }) =>
    $isZeroCount
      ? "var(--text-secondary)"
      : "var(--text-inverse)"};
  font-size: 14px;
  font-weight: 600;

  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  ${({ $isHidden }) =>
    $isHidden
      ? `
    width: 0;
    min-width: 0;
    padding: 0;
    margin-right: 0px;
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8);
    border: 0px solid transparent; 
  `
      : `
    width: auto;
    padding: 12px 16px;
    margin-right: 12px;
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  `}

  &:active {
    transform: scale(0.96);
  }
`;

const SemesterSheetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 4px 16px;
  gap: 12px;
`;

const SemesterSheetTitle = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  padding: 0 8px;
`;

const SemesterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SemesterItem = styled.button<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 12px;
  border-radius: 12px;
  border: none;
  background: ${({ $isSelected }) =>
    $isSelected ? "var(--bg-brand, #e8f3ff)" : "transparent"};
  color: ${({ $isSelected }) =>
    $isSelected ? "var(--interactive-primary, #3182f6)" : "var(--text-primary)"};
  font-size: 15px;
  font-weight: ${({ $isSelected }) => ($isSelected ? "700" : "500")};
  cursor: pointer;
  text-align: left;

  &:active {
    background: var(--bg-subtle, #f2f4f6);
  }
`;
