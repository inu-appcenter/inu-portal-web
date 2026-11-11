import { useState, useMemo, useEffect, useCallback } from "react";
import styled from "styled-components";
import { SlidersHorizontal, Search, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import { useCourses } from "@/hooks/useCourses";
import { useCourseOfferings } from "@/hooks/useCourseOfferings";
import { useSemesters } from "@/hooks/useSemesters";
import { useEffectiveCourseFilters } from "@/stores/useCourseFilterStore";
import { countActiveFilters } from "@/components/mobile/timetable/filter/courseFilterModel";
import { mapFilterToOfferingFilters, mapCourseOfferingToCourseResult } from "@/utils/courseSearchResult";
import CourseResultList from "@/components/mobile/timetable/CourseResultList";
import type { CourseResult } from "@/components/mobile/timetable/CourseResultList";
import { pickCurrentSemester } from "@/utils/semester";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import EmptyState from "@/components/common/EmptyState";
import Skeleton from "@/components/common/Skeleton";
import type { Term } from "@/types/timetables";

export default function MobileCourseReviewSearchPage() {
  const navigate = useNavigate();
  const { semesters } = useSemesters();

  // 현재 학기 기준 설정
  const currentSemester = useMemo(() => pickCurrentSemester(semesters), [semesters]);
  const currentYear = currentSemester?.year ?? 2026;
  const currentTerm = (currentSemester?.term ?? "1") as Term;

  // 헤더 설정
  useHeader({
    title: "강의평 둘러보기",
    showAlarm: false,
    hasback: true,
  });

  // 검색어 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 필터 스토어 연동 (시간표 편집과 100% 동일한 필터 공유)
  const effectiveFilter = useEffectiveCourseFilters();
  const activeFilterCount = useMemo(() => countActiveFilters(effectiveFilter), [effectiveFilter]);

  const offeringFilters = useMemo(
    () => mapFilterToOfferingFilters(effectiveFilter),
    [effectiveFilter]
  );

  // 개설 강좌 데이터 조회 (현재 학기 기준)
  const {
    courseOfferings,
    isLoading: isOfferingsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useCourseOfferings(currentYear, currentTerm, offeringFilters);

  // 교과목 마스터 데이터
  const { courses: allCourses, isLoading: isCoursesLoading } = useCourses();

  // 검색 결과 변환 및 클라이언트 필터링
  const rawResults: CourseResult[] = useMemo(() => {
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
    if (!debouncedQuery) return rawResults;
    const lower = debouncedQuery.toLowerCase();
    return rawResults.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        (c.professor && c.professor.toLowerCase().includes(lower)) ||
        (c.courseId && c.courseId.toLowerCase().includes(lower))
    );
  }, [rawResults, debouncedQuery]);

  // 아코디언 펼침 상태
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const handleToggleExpand = useCallback((id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const isLoading = isOfferingsLoading || isCoursesLoading;

  return (
    <PageWrapper>
      {/* 상단 검색바 & 필터 버튼 영역 */}
      <SearchHeaderSection>
        <SearchBarWrapper>
          <SearchIconWrapper>
            <Search size={18} color="var(--text-caption, #8b95a1)" />
          </SearchIconWrapper>
          <SearchInput
            type="text"
            placeholder="과목명, 교수명으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBarWrapper>
        <FilterButton
          type="button"
          $hasFilter={activeFilterCount > 0}
          onClick={() => navigate(ROUTES.TIMETABLE.FILTER)}
        >
          <SlidersHorizontal size={18} />
          {activeFilterCount > 0 && <FilterCountBadge>{activeFilterCount}</FilterCountBadge>}
        </FilterButton>
      </SearchHeaderSection>

      {/* 안내 배너 */}
      <GuideNoticeBanner>
        <Star size={15} color="var(--interactive-primary, #3182f6)" fill="var(--interactive-primary, #3182f6)" />
        <GuideText>
          강의를 선택하면 후기 목록을 확인하고 직접 수강평을 남길 수 있어요.
        </GuideText>
      </GuideNoticeBanner>

      {/* 강좌 목록 영역 */}
      <ListContainer>
        {isLoading ? (
          <SkeletonWrapper>
            {[...Array(5)].map((_, i) => (
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
                <strong>{debouncedQuery ? "검색 결과가 없어요" : "조건에 맞는 강의가 없어요"}</strong>
                <span>
                  {debouncedQuery
                    ? "검색어를 확인하거나 필터 조건을 변경해 보세요."
                    : "우측 상단 필터에서 다른 학과나 이수구분을 선택해 보세요."}
                </span>
              </EmptyTextGroup>
            </EmptyState>
          </EmptyStateWrapper>
        )}
      </ListContainer>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: 0 ${MOBILE_PAGE_GUTTER} calc(var(--nav-height, 100px) + 20px);
  gap: 12px;

  @media ${DESKTOP_MEDIA} {
    padding: 0 0 calc(var(--nav-height, 100px) + 40px);
  }
`;

const SearchHeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding-top: 4px;
`;

const SearchBarWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  padding: 0 12px;
  height: 44px;
  box-sizing: border-box;
  gap: 8px;

  &:focus-within {
    border-color: var(--interactive-primary, #3182f6);
  }
`;

const SearchIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;

  &::placeholder {
    color: var(--text-caption, #8b95a1);
  }
`;

const FilterButton = styled.button<{ $hasFilter: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${({ $hasFilter }) =>
    $hasFilter ? "var(--bg-brand, #e8f3ff)" : "var(--bg-surface, #ffffff)"};
  border: 1px solid
    ${({ $hasFilter }) =>
      $hasFilter ? "var(--interactive-primary, #3182f6)" : "var(--border-default, #e5e8eb)"};
  color: ${({ $hasFilter }) =>
    $hasFilter ? "var(--interactive-primary, #3182f6)" : "var(--text-secondary)"};
  cursor: pointer;
  flex-shrink: 0;

  &:active {
    transform: scale(0.96);
  }
`;

const FilterCountBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--interactive-primary, #3182f6);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 10px;
  padding: 1px 5px;
  line-height: 1.2;
`;

const GuideNoticeBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  padding: 10px 14px;
  box-sizing: border-box;
`;

const GuideText = styled.span`
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.4;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EmptyStateWrapper = styled.div`
  padding: 40px 0;
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
