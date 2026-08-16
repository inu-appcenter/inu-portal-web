import styled from "styled-components";
import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type { ReactNode, RefObject, UIEventHandler } from "react";
import { createPortal } from "react-dom";
import { Sheet, SheetRef } from "react-modal-sheet";
import { useTransform } from "motion/react";
import {
  SlidersHorizontal,
  Plus,
  MessagesSquare,
  FileText,
  Check,
  SearchX,
} from "lucide-react";
import FloatingSearchBar, {
  FloatingSearchBarRef,
} from "@/components/mobile/common/FloatingSearchBar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { mixpanelTrack } from "@/utils/mixpanel";
import { useEffectiveCourseFilters } from "@/stores/useCourseFilterStore";
import {
  countActiveFilters,
  getOnlineTypeLabel,
  getEnrollmentLabel,
} from "@/components/mobile/timetable/filter/courseFilterModel";
import { mapFilterToOfferingFilters } from "@/utils/courseSearchResult";
import Skeleton from "@/components/common/Skeleton";

export interface CourseResult {
  id: number;
  name: string;
  professor: string;
  timeStr: string;
  room: string;
  grade: number;
  isMajor: boolean;
  credits: number;
  courseId: string;
  remarks?: string;
  // 서버 수강인원/정원 데이터가 아직 동기화되지 않아 null일 수 있음 - null이면 배지 자체를 숨김
  enrolledCount: number | null;
  capacity: number | null;
  savedCount?: number | null;
  schedules: ClassItem[];
  deptName?: string;
  collegeName?: string;
  isuName?: string;
  isuFldName?: string;
  hyName?: string;
  ssupTypeName?: string;
  ssupTypeCode?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const COURSE_SEARCH_SNAP_POINTS = [0.18, 0.45, 0.9];
const SHEET_SNAP_POINTS = [0, 0.2, 0.5, 1];
const SYLLABUS_UNAVAILABLE_MESSAGE =
  "현 시점에는 제공되지 않아요. 원동력을 위해 학우 여러분의 많은 관심과 성원을 부탁드립니다!";
const LECTURE_REVIEW_NOTICE_KEY = "lectureReviewEverytimeNoticeShown";
const LECTURE_REVIEW_NOTICE_MESSAGE =
  "현 시점에는 에브리타임 강의평 페이지로 이동해요. 다음학기부터 강의평 서비스가 제공될 예정이에요.";

interface CourseSheetScrollableContentProps {
  children: ReactNode;
  onScrollCapture: UIEventHandler<HTMLDivElement>;
  isAnimating: boolean;
  scrollRef: (node: HTMLDivElement | null) => void;
}

const CourseSheetScrollableContent = ({
  children,
  onScrollCapture,
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
      onScrollCapture={onScrollCapture}
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

  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchNextPageRef = useRef(fetchNextPage);
  fetchNextPageRef.current = fetchNextPage;

  const hasNextPageRef = useRef(hasNextPage);
  hasNextPageRef.current = hasNextPage;

  const isFetchingRef = useRef(false);
  isFetchingRef.current = Boolean(isLoading || isFetchingNextPage);

  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry?.isIntersecting &&
          hasNextPageRef.current &&
          !isFetchingRef.current &&
          fetchNextPageRef.current
        ) {
          isFetchingRef.current = true;
          fetchNextPageRef.current();
        }
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(node);
  }, []);

  const handleScroll: UIEventHandler<HTMLDivElement> = () => {
    searchBarRef.current?.blur();
  };

  const openLectureReview = (professor: string) => {
    const professorName = professor?.trim() || "";
    if (!professorName) {
      alert("교수명 정보가 없어 강의평을 바로 찾을 수 없어요.");
      return;
    }

    if (!localStorage.getItem(LECTURE_REVIEW_NOTICE_KEY)) {
      alert(LECTURE_REVIEW_NOTICE_MESSAGE);
      localStorage.setItem(LECTURE_REVIEW_NOTICE_KEY, "true");
    }

    const url = `https://everytime.kr/lecture/search?keyword=${encodeURIComponent(professorName)}&condition=professor`;
    window.open(url, "_blank", "noopener,noreferrer");
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
            onScrollCapture={handleScroll}
            isAnimating={isAnimating}
            scrollRef={attachScroller}
          >
            <SheetContentWrapper>
              <CourseList>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonCard key={`course-skeleton-${index}`}>
                      <div className="skeleton-row-top">
                        <Skeleton width="45%" height="20px" />
                        <Skeleton
                          width="70px"
                          height="20px"
                          style={{ borderRadius: "999px" }}
                        />
                      </div>
                      <div className="skeleton-row-mid">
                        <Skeleton width="50px" height="16px" />
                        <Skeleton width="40px" height="16px" />
                        <Skeleton width="50px" height="16px" />
                      </div>
                      <div className="skeleton-row-bottom">
                        <Skeleton width="30%" height="14px" />
                        <Skeleton width="50%" height="14px" />
                      </div>
                    </SkeletonCard>
                  ))
                ) : filteredCourses.length === 0 ? (
                  <EmptyContainer>
                    <SearchIconBox>
                      <SearchX size={32} color="var(--gray-400, #b0b8c1)" />
                    </SearchIconBox>
                    <EmptyTitle>조회된 강의가 없습니다</EmptyTitle>
                    <EmptyDescription>
                      검색어나 필터 조건을 변경해 보세요
                    </EmptyDescription>
                  </EmptyContainer>
                ) : (
                  filteredCourses.map((course) => {
                  const isExpanded = expandedId === course.id;
                  const isAdded = Boolean(
                    (addedCourseOfferingIds && addedCourseOfferingIds.has(course.id)) ||
                    (course.courseId && addedCourseIds && addedCourseIds.has(course.courseId)),
                  );
                  const onlineTypeLabel = getOnlineTypeLabel(
                    course.ssupTypeName,
                    course.ssupTypeCode,
                  );
                  const enrollmentLabel = getEnrollmentLabel(
                    course.enrolledCount,
                    course.capacity,
                  );

                  return (
                    <CourseItem
                      key={course.id}
                      data-course-id={course.id}
                      onClick={() => onToggleExpand(course.id)}
                    >
                      {/* 기본 정보 */}
                      <InfoRow>
                        <MainInfo>
                          <CourseName>{course.name}</CourseName>
                        </MainInfo>
                        <RightInfo>
                          {course.savedCount != null && (
                            <SavedBadge>
                              {course.savedCount}명 담음
                            </SavedBadge>
                          )}
                          {enrollmentLabel && (
                            <EnrolledBadge>{enrollmentLabel}</EnrolledBadge>
                          )}
                        </RightInfo>
                      </InfoRow>

                      <CourseAttributes>
                        <AttributeItem $primary>
                          {course.professor}
                        </AttributeItem>
                        <AttributeItem>{course.credits}학점</AttributeItem>
                        <AttributeItem>상대평가</AttributeItem>
                      </CourseAttributes>

                      <CourseAdditionalInfo>
                        <InfoLine>
                          <span>
                          {course.grade > 0 ? `${course.grade}학년` : "전학년"}
                        </span>
                          {/* 서버 이수구분(전공기초/전공핵심/전공심화/기초교양/핵심교양/
                              심화교양/교직/일반선택/군사학)을 그대로 보여준다. 전공/교양
                              두 갈래로 뭉개면 전공핵심·전공기초가 "전공심화"로, 교직·
                              일반선택이 "교양"으로 잘못 표시된다. */}
                          <span>{course.isuName || "-"}</span>
                          {onlineTypeLabel && <span>{onlineTypeLabel}</span>}
                          <span>{course.courseId}</span>
                        </InfoLine>
                        <div>{course.timeStr}</div>
                        <div>{course.room}</div>
                      </CourseAdditionalInfo>

                      {/* 확장 영역 */}
                      {isExpanded && (
                        <ExpandedArea>
                          {course.remarks && (
                            <RemarkText>비고 : {course.remarks}</RemarkText>
                          )}
                          <ButtonRow>
                            <PrimaryActionButton
                              disabled={isAdded}
                              $isAdded={isAdded}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isAdded && onAddCourse) {
                                  onAddCourse(course);
                                }
                              }}
                            >
                              {isAdded ? <Check size={20} /> : <Plus size={20} />}
                              {isAdded ? "추가됨" : "시간표에 추가"}
                            </PrimaryActionButton>
                            <SecondaryActionButton
                              onClick={(e) => {
                                e.stopPropagation();
                                openLectureReview(course.professor);
                              }}
                            >
                              <MessagesSquare size={20} />
                              강의평
                            </SecondaryActionButton>
                            <SecondaryActionButton
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(SYLLABUS_UNAVAILABLE_MESSAGE);
                              }}
                            >
                              <FileText size={20} />
                              강의계획서
                            </SecondaryActionButton>
                          </ButtonRow>
                        </ExpandedArea>
                      )}
                    </CourseItem>
                  );
                }))}
                {isFetchingNextPage && (
                  <SkeletonCard key="next-page-skeleton">
                    <div className="skeleton-row-top">
                      <Skeleton width="45%" height="20px" />
                      <Skeleton
                        width="70px"
                        height="20px"
                        style={{ borderRadius: "999px" }}
                      />
                    </div>
                    <div className="skeleton-row-mid">
                      <Skeleton width="50px" height="16px" />
                      <Skeleton width="40px" height="16px" />
                      <Skeleton width="50px" height="16px" />
                    </div>
                  </SkeletonCard>
                )}
                {hasNextPage && (
                  <div
                    ref={loadMoreRef}
                    style={{ height: "20px", width: "100%" }}
                  />
                )}
              </CourseList>
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

const CourseList = styled.div`
  padding: 0;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
`;

const SearchIconBox = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--bg-muted, #f1f3f5);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const EmptyTitle = styled.h3`
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary, #333d4b);
  margin: 0 0 6px 0;
`;

const EmptyDescription = styled.p`
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--text-tertiary, #8b95a1);
  margin: 0;
`;

const SkeletonCard = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  display: flex;
  flex-direction: column;
  gap: 8px;

  .skeleton-row-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .skeleton-row-mid {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .skeleton-row-bottom {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

const CourseItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  display: flex;
  flex-direction: column;
  //gap: 8px;
  background-color: #ffffff;
  transition: background-color 0.2s;
  //cursor: pointer;

  /* The sheet's per-frame drag-driven scrollPaddingBottom (see
     CourseSheetScrollableContent) forces a layout recalculation on every
     animation tick, and with an unvirtualized course list that cost scales
     with row count — the main source of Android-only jank here (WKWebView
     doesn't show the same behavior). content-visibility skips layout/paint
     for rows currently off-screen entirely, instead of just scoping
     invalidation (plain contain doesn't stop the browser from still doing
     the work for every row). "auto <length>" remembers each row's real
     rendered height after it's first been on-screen, so the placeholder only
     matters before that — safe here since the sheet's snap points are
     viewport-ratio based (COURSE_SEARCH_SNAP_POINTS), not derived from this
     list's scrollHeight. */
  content-visibility: auto;
  contain-intrinsic-size: auto 140px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MainInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const CourseName = styled.h3`
  color: var(--text-secondary, #333d4b);

  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  margin: 0;
`;

const RightInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EnrolledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  background: var(--bg-brand-subtle, #eff6ff);
  color: var(--text-brand, #0061ff);

  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

const SavedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  background: var(--bg-brand, #eff6ff);
  color: var(--text-brand, #0061ff);

  font-family: Pretendard, sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

const CourseAttributes = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
`;

const AttributeItem = styled.span<{ $primary?: boolean }>`
  color: ${({ $primary }) =>
    $primary
      ? "var(--text-secondary, #333d4b)"
      : "var(--text-tertiary, #8b95a1)"};
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
`;

const CourseAdditionalInfo = styled.div`
  display: flex;
  flex-direction: column;
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;

  margin-top: 4px;
`;

const InfoLine = styled.div`
  display: flex;
  gap: 12px;
`;

const ExpandedArea = styled.div`
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const RemarkText = styled.div`
  color: var(--text-tertiary, #8b95a1);

  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;

  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;

  &:active {
    transform: scale(0.96);
  }
`;

const PrimaryActionButton = styled(ActionButton)<{ $isAdded?: boolean }>`
  border-radius: 999px;
  background: ${({ $isAdded }) =>
    $isAdded
      ? "var(--bg-subtle-dark, #e5e8eb)"
      : "var(--interactive-primary, #3b82f6)"};

  color: ${({ $isAdded }) =>
    $isAdded ? "var(--text-tertiary, #8b95a1)" : "#fff"};

  ${({ $isAdded }) =>
    $isAdded &&
    `
    background-color: var(--bg-neutral-subtle, #f2f4f6) !important;
    color: var(--text-tertiary, #8b95a1) !important;
    border: 1px solid var(--border-default, #e5e8eb);
    cursor: not-allowed;
    opacity: 0.8;
  `}
`;

const SecondaryActionButton = styled(ActionButton)`
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-subtle, #f8f9fb);

  color: var(--text-primary, #333d4b);
`;
