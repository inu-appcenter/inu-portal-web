import styled from "styled-components";
import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import { useState, useRef, useEffect, useMemo } from "react";
import type { ReactNode, UIEventHandler } from "react";
import { createPortal } from "react-dom";
import { Sheet } from "react-modal-sheet";
import { useTransform } from "motion/react";
import {
  SlidersHorizontal,
  Plus,
  MessagesSquare,
  FileText,
  Check,
} from "lucide-react";
import FloatingSearchBar, {
  FloatingSearchBarRef,
} from "@/components/mobile/common/FloatingSearchBar";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import {
  FilterState,
  DEFAULT_FILTERS,
} from "@/pages/mobile/timetable/MobileCourseFilterPage";
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
  schedules: ClassItem[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const COURSE_SEARCH_SNAP_POINTS = [0.18, 0.45, 0.9];
const SHEET_SNAP_POINTS = [0, 0.2, 0.5, 1];

interface CourseSheetScrollableContentProps {
  children: ReactNode;
  onScrollCapture: UIEventHandler<HTMLDivElement>;
  isAnimating: boolean;
}

const CourseSheetScrollableContent = ({
  children,
  onScrollCapture,
  isAnimating,
}: CourseSheetScrollableContentProps) => {
  const { y } = Sheet.useContext();
  const scrollPaddingBottom = useTransform(y, (currentY) => currentY + 124);

  return (
    <CourseSheetContent
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
  onAddCourse?: (course: CourseResult) => void;
  // 전공/영역 필터 등 서버 조회가 필요한 필터는 상위에서 querystring으로 다시 조회해야 하므로 변경을 알림
  onFiltersChange?: (filters: FilterState) => void;
  addedCourseOfferingIds?: Set<number>;
  addedCourseIds?: Set<string>;
  isLoading?: boolean;
}

const MobileCourseSearchSheet = ({
  courses,
  expandedId,
  onToggleExpand,
  snap,
  onSnapChange,
  open,
  onOpenChange,
  onAddCourse,
  onFiltersChange,
  addedCourseOfferingIds,
  addedCourseIds,
  isLoading = false,
}: MobileCourseSearchSheetProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  const [activeFilters, setActiveFiltersState] =
    useState<FilterState>(DEFAULT_FILTERS);

  const setActiveFilters = (filters: FilterState) => {
    setActiveFiltersState(filters);
    onFiltersChange?.(filters);
  };

  // listen to returned filters from filter page (LocalStorage & window focus & storage & visibilitychange & location fallback)
  useEffect(() => {
    const restoreFilters = () => {
      const savedFilters = localStorage.getItem("applied_filters");
      if (savedFilters) {
        try {
          const parsed = JSON.parse(savedFilters);
          setActiveFilters(parsed);
        } catch (e) {
          console.error("필터 복원 오류:", e);
        }
        localStorage.removeItem("applied_filters");
        return true;
      }
      return false;
    };

    // 1. 컴포넌트 마운트 시도 또는 location 변경 시 확인
    const restored = restoreFilters();

    // location.state 폴백 (앱이 아닌 일반 브라우저 환경에서 데이터가 올 때를 대비)
    if (!restored && location.state && (location.state as any).filters) {
      setActiveFilters((location.state as any).filters);
    }

    // 2. 멀티 웹뷰 덮인 화면이 닫히며 복귀할 때를 위한 이벤트 리스너 등록
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        restoreFilters();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "applied_filters" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setActiveFilters(parsed);
          localStorage.removeItem("applied_filters");
        } catch (err) {
          console.error("필터 복원 오류:", err);
        }
      }
    };

    window.addEventListener("focus", restoreFilters);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("focus", restoreFilters);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [location.state, location.key]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeFilters.major) count++;
    if (activeFilters.sort !== "기본순") count++;
    if (activeFilters.time !== "전체 시간") count++;
    count += activeFilters.grades.length;
    count += activeFilters.types.length;
    count += activeFilters.credits.length;
    return count;
  }, [activeFilters]);

  const filteredCourses = useMemo(() => {
    let list: CourseResult[] = [...courses];

    // 1~4. 전공/영역·학년·이수구분·학점 필터는 상위(MobileTimeTableEditPage)에서
    // onFiltersChange로 전달받아 querystring으로 서버에 재조회하므로 여기서는 거르지 않는다
    // (inu-appcenter/inu-portal-server#297 - 서버가 지원하기 전까지는 필터링되지 않음).

    // 5. 정렬 필터
    if (activeFilters.sort === "별점높은순") {
      const ratings: Record<string, number> = {
        웹프로그래밍: 4.8,
        운영체제: 4.5,
        창의적사고와문제해결: 4.2,
      };
      list.sort((a, b) => (ratings[b.name] || 0) - (ratings[a.name] || 0));
    } else if (activeFilters.sort === "담은인원많은순") {
      list.sort((a, b) => (b.enrolledCount ?? 0) - (a.enrolledCount ?? 0));
    }

    return list;
  }, [courses, activeFilters]);

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

  const handleScroll = () => {
    searchBarRef.current?.blur();
  };

  const openLectureReview = (professor: string) => {
    const professorName = professor?.trim() || "";
    if (!professorName) {
      alert("교수명 정보가 없어 강의평을 바로 찾을 수 없어요.");
      return;
    }

    const url = `https://everytime.kr/lecture/search?keyword=${encodeURIComponent(professorName)}&condition=professor`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const activeSnap =
    typeof snap === "number" && COURSE_SEARCH_SNAP_POINTS.includes(snap)
      ? snap
      : COURSE_SEARCH_SNAP_POINTS[1];
  const initialSnap = COURSE_SEARCH_SNAP_POINTS.indexOf(activeSnap) + 1;

  return (
    <>
      <CourseSheet
        isOpen={open}
        onClose={() => onOpenChange(false)}
        snapPoints={SHEET_SNAP_POINTS}
        initialSnap={initialSnap}
        disableDismiss
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
                ) : (
                  filteredCourses.map((course) => {
                  const isExpanded = expandedId === course.id;
                  const isAdded = Boolean(
                    (addedCourseOfferingIds && addedCourseOfferingIds.has(course.id)) ||
                    (course.courseId && addedCourseIds && addedCourseIds.has(course.courseId)),
                  );

                  return (
                    <CourseItem
                      key={course.id}
                      onClick={() => onToggleExpand(course.id)}
                    >
                      {/* 기본 정보 */}
                      <InfoRow>
                        <MainInfo>
                          <CourseName>{course.name}</CourseName>
                        </MainInfo>
                        <RightInfo>
                          {course.enrolledCount != null &&
                            course.capacity != null && (
                              <EnrolledBadge>
                                {course.enrolledCount}명 / {course.capacity}명
                              </EnrolledBadge>
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
                          <span>{course.isMajor ? "전공심화" : "교양"}</span>
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
                                navigate(ROUTES.TIMETABLE.SYLLABUS, {
                                  state: {
                                    courseName: course.name,
                                    professor: course.professor,
                                  },
                                });
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
              </CourseList>
            </SheetContentWrapper>
          </CourseSheetScrollableContent>
        </CourseSheetContainer>
      </CourseSheet>

      {open &&
        createPortal(
          <FloatingActionsContainer>
            <FilterButton
              $isHidden={isSearchActive}
              $isZeroCount={activeFilterCount === 0}
              onClick={() =>
                navigate(ROUTES.TIMETABLE.FILTER, {
                  state: { filters: activeFilters },
                })
              }
            >
              <SlidersHorizontal size={24} />
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
  gap: 8px;
  height: 56px;
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
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;

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
    max-width: 56px;
    padding: 16px;
    margin-right: 16px;
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  `
        : `
    max-width: 240px; 
    padding: 16px 20px;
    margin-right: 16px;
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
