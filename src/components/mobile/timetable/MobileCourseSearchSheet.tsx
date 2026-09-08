import styled from "styled-components";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import { Sheet, SheetRef } from "react-modal-sheet";
import { useTransform } from "motion/react";
import { SlidersHorizontal } from "lucide-react";
import FloatingSearchBar, {
  FloatingSearchBarRef,
} from "@/components/mobile/common/FloatingSearchBar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { mixpanelTrack } from "@/utils/mixpanel";
import { useEffectiveCourseFilters } from "@/stores/useCourseFilterStore";
import { countActiveFilters } from "@/components/mobile/timetable/filter/courseFilterModel";
import { mapFilterToOfferingFilters } from "@/utils/courseSearchResult";
import CourseResultList from "@/components/mobile/timetable/CourseResultList";
import type { CourseResult } from "@/components/mobile/timetable/CourseResultList";

export type { CourseResult };

// eslint-disable-next-line react-refresh/only-export-components
export const COURSE_SEARCH_SNAP_POINTS = [0.18, 0.45, 0.9];
const SHEET_SNAP_POINTS = [0, 0.2, 0.5, 1];

interface CourseSheetScrollableContentProps {
  children: ReactNode;
  isAnimating: boolean;
  scrollRef: (node: HTMLDivElement | null) => void;
}

const CourseSheetScrollableContent = ({
  children,
  isAnimating,
  scrollRef,
}: CourseSheetScrollableContentProps) => {
  const { y } = Sheet.useContext();
  const scrollPaddingBottom = useTransform(y, (currentY) => currentY + 124);

  return (
    <CourseSheetContent
      // react-modal-sheet의 타입 선언은 scrollRef를 RefObject로만 허용하지만,
      // 내부 mergeRefs는 함수형 콜백 ref도 그대로 호출해 준다 (dist/index.js 참고).
      scrollRef={scrollRef as unknown as RefObject<HTMLDivElement | null>}
      scrollStyle={{ paddingBottom: scrollPaddingBottom }}
      disableDrag={({ scrollPosition }) =>
        scrollPosition !== undefined && scrollPosition !== "top"
      }
      disableScroll={({ currentSnap }) =>
        isAnimating || currentSnap === 1
      }
    >
      {children}
    </CourseSheetContent>
  );
};

interface MobileCourseSearchSheetProps {
  courses: CourseResult[];
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
  snap: string | number | null;
  onSnapChange: (snap: string | number | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // 시간표 편집 화면은 강의 추가 도중 실수로 닫히지 않도록 스와이프/배경탭 dismiss를
  // 막아야 하고(기본값), 마법사의 위시리스트 검색은 반대로 자유롭게 닫을 수 있어야 한다.
  dismissible?: boolean;
  onAddCourse?: (course: CourseResult) => void;
  addedCourseOfferingIds?: Set<number>;
  addedCourseIds?: Set<string>;
  isLoading?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

const MobileCourseSearchSheet = ({
  courses,
  expandedId,
  onToggleExpand,
  snap,
  onSnapChange,
  open,
  onOpenChange,
  dismissible = false,
  onAddCourse,
  addedCourseOfferingIds,
  addedCourseIds,
  isLoading = false,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: MobileCourseSearchSheetProps) => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  // 확정 필터는 useCourseFilterStore가 소유한다. 필터 화면이 별도 웹뷰로 뜨는
  // 멀티 웹뷰 환경에서도 broadcastSync가 값을 실어오므로, 이 시트는 읽기만 한다.
  // 부모(편집 화면)가 서버 조회에 쓰는 것과 반드시 같은 파생을 써야 한다 —
  // 아래 filteredCourses가 같은 필터로 2차 로컬 필터링을 하기 때문이다.
  const activeFilters = useEffectiveCourseFilters();

  const sheetRef = useRef<SheetRef | null>(null);

  const activeSnap =
    typeof snap === "number" && COURSE_SEARCH_SNAP_POINTS.includes(snap)
      ? snap
      : COURSE_SEARCH_SNAP_POINTS[1];
  const initialSnap = COURSE_SEARCH_SNAP_POINTS.indexOf(activeSnap) + 1;

  const initialSnapRef = useRef(initialSnap);
  useEffect(() => {
    initialSnapRef.current = initialSnap;
  }, [initialSnap]);

  // 필터 화면에서 돌아왔을 때 시트가 바닥으로 내려가 있지 않도록 지정된 snap으로 되돌린다.
  // (예전에는 localStorage 복원 로직이 이 일을 겸했다.)
  const isFirstFilterRender = useRef(true);
  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    if (!open) onOpenChange(true);
    const timer = setTimeout(() => {
      sheetRef.current?.snapTo(initialSnapRef.current);
    }, 50);
    return () => clearTimeout(timer);
    // 확정 필터가 바뀐 순간에만 반응한다(open/onOpenChange 변화에는 반응하지 않는다).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]);

  const activeFilterCount = useMemo(
    () => countActiveFilters(activeFilters),
    [activeFilters],
  );

  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("courseQuery");

  const filteredCourses = useMemo(() => {
    let list: CourseResult[] = [...courses];

    // 키워드 검색(courseQuery)이 작동 중이 아닌 경우에만 2차 유연 필터링 적용 (검색어 결과는 API 응답 그대로 렌더링)
    if (!keyword) {
      const offeringFilters = mapFilterToOfferingFilters(activeFilters);

      const targetDept = offeringFilters.deptName;
      if (targetDept) {
        list = list.filter(
          (c) =>
            !c.deptName ||
            c.deptName === targetDept ||
            c.deptName.includes(targetDept) ||
            targetDept.includes(c.deptName) ||
            Boolean(offeringFilters.ssupTypeNames?.length),
        );
      }

      const targetCollege = offeringFilters.collegeName;
      if (targetCollege) {
        list = list.filter(
          (c) =>
            !c.collegeName ||
            c.collegeName === targetCollege ||
            c.collegeName.includes(targetCollege) ||
            targetCollege.includes(c.collegeName) ||
            Boolean(offeringFilters.ssupTypeNames?.length),
        );
      }

      if (offeringFilters.hyNames?.length) {
        list = list.filter(
          (c) =>
            !c.hyName ||
            offeringFilters.hyNames?.some((h) =>
              (c.hyName ?? String(c.grade))?.startsWith(h),
            ),
        );
      }
      if (offeringFilters.isuNames?.length) {
        list = list.filter(
          (c) =>
            !c.isuName ||
            offeringFilters.isuNames?.some((isu) => c.isuName?.includes(isu)),
        );
      }
      if (offeringFilters.isuFldNames?.length) {
        list = list.filter(
          (c) =>
            !c.isuFldName ||
            offeringFilters.isuFldNames?.includes(c.isuFldName),
        );
      }
      if (offeringFilters.ssupTypeNames?.length) {
        list = list.filter((c) => {
          if (!c.ssupTypeName && !c.ssupTypeCode) return true;
          return offeringFilters.ssupTypeNames?.some((st) => {
            const code = c.ssupTypeCode;
            const name = c.ssupTypeName;
            return (
              code === st ||
              name === st ||
              (code && code.toLowerCase() === st.toLowerCase()) ||
              (name && name.toLowerCase() === st.toLowerCase())
            );
          });
        });
      }
      if (offeringFilters.credits?.length) {
        list = list.filter((c) => offeringFilters.credits?.includes(c.credits));
      }
    }

    // 5. 정렬 필터
    if (activeFilters.sort === "별점높은순") {
      const ratings: Record<string, number> = {
        웹프로그래밍: 4.8,
        운영체제: 4.5,
        창의적사고와문제해결: 4.2,
      };
      list.sort((a, b) => (ratings[b.name] || 0) - (ratings[a.name] || 0));
    } else if (activeFilters.sort === "담은인원많은순") {
      list.sort((a, b) => (b.savedCount ?? 0) - (a.savedCount ?? 0));
    }

    return list;
  }, [courses, activeFilters, keyword]);

  // 바텀시트를 닫으면 react-modal-sheet가 스크롤 컨테이너 DOM을 통째로 언마운트하므로,
  // 재오픈 시 맨 위로 스크롤이 튀지 않도록 마지막으로 보고 있던 강의(id)와 그 화면상 위치를
  // 기억해 뒀다가 스크롤 컨테이너가 다시 마운트될 때 동일한 위치로 복원한다.
  const scrollerElRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<{ id: number; offset: number } | null>(null);
  const restoreAttemptsRef = useRef(0);
  const pendingRestoreRef = useRef(false);
  const scrollCleanupRef = useRef<(() => void) | null>(null);

  const captureScrollAnchor = useCallback((scroller: HTMLDivElement) => {
    const scrollerTop = scroller.getBoundingClientRect().top;
    const items = scroller.querySelectorAll<HTMLElement>("[data-course-id]");
    for (const item of items) {
      const rect = item.getBoundingClientRect();
      if (rect.bottom > scrollerTop) {
        const id = Number(item.dataset.courseId);
        if (Number.isFinite(id)) {
          scrollAnchorRef.current = { id, offset: rect.top - scrollerTop };
        }
        return;
      }
    }
  }, []);

  // 기억해 둔 강의를 화면에서 찾아 그 위치로 스크롤을 복원한다.
  // 아직 로드되지 않은 뒷 페이지에 있을 수 있으므로, 다음 페이지를 더 불러오며 재시도하되
  // 필터 변경 등으로 영영 찾을 수 없는 경우를 대비해 재시도 횟수에 상한을 둔다.
  const restoreScrollAnchor = useCallback(
    (scroller: HTMLDivElement) => {
      const anchor = scrollAnchorRef.current;
      if (!anchor) return;

      const target = scroller.querySelector<HTMLElement>(
        `[data-course-id="${anchor.id}"]`,
      );

      if (target) {
        const scrollerTop = scroller.getBoundingClientRect().top;
        const targetTop = target.getBoundingClientRect().top;
        scroller.scrollTop += targetTop - scrollerTop - anchor.offset;
        pendingRestoreRef.current = false;
        return;
      }

      if (
        hasNextPage &&
        fetchNextPage &&
        !isFetchingNextPage &&
        restoreAttemptsRef.current < 30
      ) {
        pendingRestoreRef.current = true;
        restoreAttemptsRef.current += 1;
        fetchNextPage();
      } else {
        pendingRestoreRef.current = false;
      }
    },
    [hasNextPage, fetchNextPage, isFetchingNextPage],
  );

  // 스크롤 컨테이너가 새로 마운트될 때(바텀시트 재오픈 시) 위치를 복원하고,
  // 스크롤할 때마다 현재 보고 있는 강의를 기준점으로 갱신한다.
  const attachScroller = useCallback(
    (node: HTMLDivElement | null) => {
      scrollCleanupRef.current?.();
      scrollCleanupRef.current = null;
      scrollerElRef.current = node;
      if (!node) return;

      restoreAttemptsRef.current = 0;
      restoreScrollAnchor(node);

      let rafId: number | null = null;
      const handleScroll = () => {
        if (rafId != null) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          captureScrollAnchor(node);
        });
      };

      node.addEventListener("scroll", handleScroll, { passive: true });
      scrollCleanupRef.current = () => {
        node.removeEventListener("scroll", handleScroll);
        if (rafId != null) cancelAnimationFrame(rafId);
      };
    },
    [restoreScrollAnchor, captureScrollAnchor],
  );

  // 페이지네이션으로 새 강의가 로드되거나 로딩이 끝나면, 이전에 찾지 못했던 기준 강의를 재탐색한다.
  useEffect(() => {
    if (!pendingRestoreRef.current) return;
    const scroller = scrollerElRef.current;
    if (!scroller) return;
    restoreScrollAnchor(scroller);
  }, [filteredCourses, isFetchingNextPage, restoreScrollAnchor]);

  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const searchBarRef = useRef<FloatingSearchBarRef>(null);

  // 키보드가 닫힌 뒤 변경된 모바일 뷰포트를 기준으로 높이를 다시 계산합니다.
  useEffect(() => {
    if (!isSearchActive) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
        window.scrollTo(0, window.scrollY);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSearchActive]);

  // 목록을 손가락으로 끌면 키보드를 내린다. scroll 이 아니라 touchmove 를 보는
  // 이유: 웹뷰에서 인풋에 포커스가 가면 소프트 키보드가 올라오며 뷰포트가 줄고
  // (안드로이드는 셸이 웹뷰를 키보드 높이만큼 줄이고, iOS 는 WKWebView 가
  // 스크롤뷰에 인셋을 넣는다) 그 레이아웃 변화가 목록의 scroll 이벤트로 나타난다.
  // 사용자가 스크롤한 적이 없는데 blur() 가 불려 포커스가 잡히자마자 키보드가
  // 닫히고 검색바까지 접혔다. 손가락 드래그는 그런 오인이 없다.
  const dismissKeyboardOnDrag = () => {
    searchBarRef.current?.blur();
  };

  return (
    <>
      <CourseSheet
        ref={sheetRef}
        isOpen={open}
        onClose={() => onOpenChange(false)}
        snapPoints={SHEET_SNAP_POINTS}
        initialSnap={initialSnap}
        disableDismiss={!dismissible}
        disableScrollLocking
        onSnap={(snapIndex) => {
          const nextSnap = COURSE_SEARCH_SNAP_POINTS[snapIndex - 1];
          if (nextSnap !== undefined) onSnapChange(nextSnap);
        }}
      >
        <CourseSheetContainer
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          <CourseSheetHeader />
          <CourseSheetScrollableContent
            isAnimating={isAnimating}
            scrollRef={attachScroller}
          >
            <SheetContentWrapper onTouchMove={dismissKeyboardOnDrag}>
              <CourseResultList
                courses={filteredCourses}
                expandedId={expandedId}
                onToggleExpand={onToggleExpand}
                onAddCourse={onAddCourse}
                addedCourseOfferingIds={addedCourseOfferingIds}
                addedCourseIds={addedCourseIds}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            </SheetContentWrapper>
          </CourseSheetScrollableContent>
        </CourseSheetContainer>
        {/* <Sheet.Backdrop onTap={() => onOpenChange(false)} /> */}
      </CourseSheet>

      {open &&
        createPortal(
          <FloatingActionsContainer>
            <FilterButton
              $isHidden={isSearchActive}
              $isZeroCount={activeFilterCount === 0}
              onClick={() => {
                mixpanelTrack.timetableCourseSearchAction("필터 열기", {
                  result_count: filteredCourses.length,
                });
                // state는 넘기지 않는다. 멀티 웹뷰에서는 이 이동이 네이티브
                // 웹뷰 push(appBridge.navigateTo)로 위임되고 브릿지 payload는
                // { path, url }뿐이라 state가 사라진다. 필터 화면은 양쪽 환경 모두
                // useCourseFilterStore에서 현재 필터를 읽는다.
                navigate(ROUTES.TIMETABLE.FILTER);
              }}
            >
              <SlidersHorizontal size={20} />
              {activeFilterCount > 0 && <span>필터 {activeFilterCount}</span>}
            </FilterButton>

            <FloatingSearchBar
              ref={searchBarRef}
              placeholder="교과목명, 교수명 검색"
              onSearch={(query) => console.log("검색 실행:", query)}
              onActiveChange={setIsSearchActive}
              searchParamKey="courseQuery"
            />
          </FloatingActionsContainer>,
          document.body,
        )}
    </>
  );
};

export default MobileCourseSearchSheet;

// --- 스타일 ---

const CourseSheet = styled(Sheet)`
  z-index: 10000;
`;

const CourseSheetContainer = styled(Sheet.Container)`
  left: 0;
  right: 0;
  width: min(100%, 768px);
  height: 90dvh !important;
  max-height: 90dvh !important;
  margin: 0 auto;
  overflow: hidden;
  border-top: 1px solid var(--border-default, #e5e8eb);
  border-top-left-radius: 32px !important;
  border-top-right-radius: 32px !important;
  border-bottom-right-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  background: var(--bg-base, #ffffff);
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.25) !important;
`;

const CourseSheetHeader = styled(Sheet.Header)`
  flex: 0 0 20px;

  .react-modal-sheet-header {
    height: 20px !important;
    padding: 16px 0;
    box-sizing: border-box;
  }

  .react-modal-sheet-drag-indicator-container {
    width: 40px !important;
    height: 4px !important;
    border-radius: 2px !important;
    background: var(--border-default, #e5e8eb) !important;
  }

  .react-modal-sheet-drag-indicator {
    display: none !important;
  }
`;

const CourseSheetContent = styled(Sheet.Content)`
  min-height: 0;

  .react-modal-sheet-content-scroller {
    overscroll-behavior-y: none;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const SheetContentWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
`;

const FloatingActionsContainer = styled.div`
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
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
      ? "1px solid var(--border-default, #E5E8EB)"
      : "1px solid var(--border-brand, #0061ff)"};
  background: ${({ $isZeroCount }) =>
    $isZeroCount
      ? "rgba(255, 255, 255, 0.50)"
      : "var(--interactive-primary, #3b82f6)"};
  box-shadow: ${({ $isZeroCount }) =>
    $isZeroCount
      ? "0 4px 12px 0 rgba(0, 0, 0, 0.08)"
      : "0 4px 12px rgba(59, 130, 246, 0.3)"};
  backdrop-filter: ${({ $isZeroCount }) =>
    $isZeroCount ? "blur(8px)" : "none"};

  color: ${({ $isZeroCount }) =>
    $isZeroCount
      ? "var(--text-secondary, #333d4b)"
      : "var(--text-inverse, #fff)"};
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;

  width: fit-content;
  
  /* 수치 변화 추적 */
  transition:
    max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: max-width, padding, margin-right, opacity, transform;

  ${(props) =>
    props.$isHidden
      ? `
    max-width: 0px;
    padding: 0;
    margin-right: 0px;
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8);
    border: 0px solid transparent; 
  `
      : props.$isZeroCount
        ? `
    max-width: 48px;
    padding: 12px;
    margin-right: 12px;
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  `
        : `
    max-width: 200px; 
    padding: 12px 16px;
    margin-right: 12px;
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  `}

  &:active {
    transform: scale(0.95);
  }
`;

