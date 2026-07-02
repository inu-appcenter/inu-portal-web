import styled from "styled-components";
import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  SlidersHorizontal,
  Plus,
  MessagesSquare,
  FileText,
} from "lucide-react";
import BottomSheet from "@/components/common/BottomSheet";
import FloatingSearchBar, {
  FloatingSearchBarRef,
} from "@/components/mobile/common/FloatingSearchBar";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import {
  FilterState,
  DEFAULT_FILTERS,
} from "@/pages/mobile/timetable/MobileCourseFilterPage";

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
  enrolledCount: number;
  schedules: ClassItem[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const COURSE_SEARCH_SNAP_POINTS = [0.18, 0.6, 0.95];

interface MobileCourseSearchSheetProps {
  courses: CourseResult[];
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
  snap: string | number | null;
  onSnapChange: (snap: string | number | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileCourseSearchSheet = ({
  courses,
  expandedId,
  onToggleExpand,
  snap,
  onSnapChange,
  open,
  onOpenChange,
}: MobileCourseSearchSheetProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeFilters, setActiveFilters] =
    useState<FilterState>(DEFAULT_FILTERS);

  // listen to returned filters from filter page
  useEffect(() => {
    if (location.state && (location.state as any).filters) {
      setActiveFilters((location.state as any).filters);
    }
  }, [location.state]);

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

    // 1. 전공/영역 필터 (학과 분류 시뮬레이션)
    if (activeFilters.major) {
      list = list.filter((course) => {
        if (activeFilters.major === "컴퓨터공학부") {
          return course.name === "웹프로그래밍" || course.name === "운영체제";
        }
        if (activeFilters.major?.includes("교양")) {
          return course.name === "창의적사고와문제해결";
        }
        return true;
      });
    }

    // 2. 학년 필터
    if (activeFilters.grades.length > 0) {
      list = list.filter((course) =>
        activeFilters.grades.includes(course.grade),
      );
    }

    // 3. 이수구분 필터
    if (activeFilters.types.length > 0) {
      list = list.filter((course) => {
        const courseType = course.isMajor ? "전공" : "교양";
        return activeFilters.types.includes(courseType);
      });
    }

    // 4. 학점 필터
    if (activeFilters.credits.length > 0) {
      list = list.filter((course) => {
        if (activeFilters.credits.includes(4)) {
          return (
            course.credits >= 4 ||
            activeFilters.credits.includes(course.credits)
          );
        }
        return activeFilters.credits.includes(course.credits);
      });
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
      list.sort((a, b) => b.enrolledCount - a.enrolledCount);
    }

    return list;
  }, [courses, activeFilters]);

  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const searchBarRef = useRef<FloatingSearchBarRef>(null);

  // 스마트폰 뷰포트에서 키보드가 닫혔을 때 바텀시트가 아래로 처져서 빼꼼히 남는 현상 방지
  useEffect(() => {
    if (!isSearchActive) {
      const timer = setTimeout(() => {
        // 키보드가 완전히 내려간 뷰포트 크기를 기준으로 Vaul이 바텀시트 위치를 재계산하도록 강제 트리거
        window.dispatchEvent(new Event("resize"));
        // iOS Safari 등 모바일 기기의 스크롤 밀림 복원 트릭
        window.scrollTo(0, window.scrollY);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSearchActive]);

  const handleScroll = () => {
    searchBarRef.current?.blur();
  };

  const touchGestureRef = useRef({
    startY: 0,
    lastY: 0,
    startAtTop: false,
    startAtBottom: false,
    isEdgeSwipe: false,
  });

  const getSnapIndex = () => {
    const currentSnap =
      typeof snap === "number" ? snap : COURSE_SEARCH_SNAP_POINTS[1];
    const currentIndex = COURSE_SEARCH_SNAP_POINTS.findIndex(
      (point) => point === currentSnap,
    );
    return currentIndex === -1 ? 1 : currentIndex;
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const listElement = event.currentTarget;
    const touchY = event.touches[0]?.clientY ?? 0;
    const maxScrollTop = Math.max(
      listElement.scrollHeight - listElement.clientHeight,
      0,
    );

    touchGestureRef.current = {
      startY: touchY,
      lastY: touchY,
      startAtTop: listElement.scrollTop <= 1,
      startAtBottom: listElement.scrollTop >= maxScrollTop - 1,
      isEdgeSwipe: false,
    };
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touchY = event.touches[0]?.clientY ?? touchGestureRef.current.lastY;
    const deltaY = touchY - touchGestureRef.current.startY;

    touchGestureRef.current.lastY = touchY;

    const isDraggingDown = deltaY > 0;
    const canResizeDrawer =
      (isDraggingDown && touchGestureRef.current.startAtTop) ||
      (!isDraggingDown && touchGestureRef.current.startAtBottom);

    if (!canResizeDrawer || deltaY === 0) {
      touchGestureRef.current.isEdgeSwipe = false;
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }
    touchGestureRef.current.isEdgeSwipe = true;
  };

  const handleTouchEnd = () => {
    const { isEdgeSwipe, startY, lastY } = touchGestureRef.current;

    if (!isEdgeSwipe) {
      return;
    }

    const deltaY = lastY - startY;

    if (Math.abs(deltaY) < 48) {
      return;
    }

    const currentIndex = getSnapIndex();
    const nextIndex =
      deltaY < 0
        ? Math.min(currentIndex + 1, COURSE_SEARCH_SNAP_POINTS.length - 1)
        : Math.max(currentIndex - 1, 0);

    if (nextIndex !== currentIndex && onSnapChange) {
      onSnapChange(COURSE_SEARCH_SNAP_POINTS[nextIndex]);
    }
  };

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        modal={false}
        dismissible={false}
        snapPoints={COURSE_SEARCH_SNAP_POINTS}
        activeSnapPoint={open ? snap : null}
        setActiveSnapPoint={onSnapChange}
        disablePreventScroll={true}
        snapToSequentialPoint={true}
        showCloseButton={false}
      >
        <SheetContentWrapper
          $snapHeight={
            typeof snap === "number" ? snap : COURSE_SEARCH_SNAP_POINTS[1]
          }
        >
          <ScrollableBody
            $snapHeight={
              typeof snap === "number" ? snap : COURSE_SEARCH_SNAP_POINTS[1]
            }
            data-vaul-no-drag=""
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onScroll={handleScroll}
          >
            <CourseList>
              {filteredCourses.map((course) => {
                const isExpanded = expandedId === course.id;

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
                        <EnrolledBadge>
                          {course.enrolledCount}명 / n명
                        </EnrolledBadge>
                      </RightInfo>
                    </InfoRow>

                    <CourseAttributes>
                      <AttributeItem $primary>{course.professor}</AttributeItem>
                      <AttributeItem>{course.credits}학점</AttributeItem>
                      <AttributeItem>상대평가</AttributeItem>
                    </CourseAttributes>

                    <CourseAdditionalInfo>
                      <InfoLine>
                        <span>{course.grade}학년</span>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("시간표에 추가 클릭됨");
                            }}
                          >
                            <Plus size={20} />
                            시간표에 추가
                          </PrimaryActionButton>
                          <SecondaryActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("강의평 보기 클릭됨");
                            }}
                          >
                            <MessagesSquare size={20} />
                            강의평
                          </SecondaryActionButton>
                          <SecondaryActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("강의계획서 클릭됨");
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
              })}
            </CourseList>
          </ScrollableBody>
        </SheetContentWrapper>
      </BottomSheet>

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
            />
          </FloatingActionsContainer>,
          document.body,
        )}
    </>
  );
};

export default MobileCourseSearchSheet;

// --- 스타일 ---

const SheetContentWrapper = styled.div<{ $snapHeight?: number }>`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;

  height: ${({ $snapHeight }) =>
    typeof $snapHeight === "number"
      ? `calc(${$snapHeight * 100}dvh - 52px - env(safe-area-inset-bottom, 0px))`
      : "auto"};
  max-height: ${({ $snapHeight }) =>
    typeof $snapHeight === "number"
      ? `calc(${$snapHeight * 100}dvh - 52px - env(safe-area-inset-bottom, 0px))`
      : "none"};

  transition:
    height 0.35s cubic-bezier(0.32, 0.94, 0.6, 1),
    max-height 0.35s cubic-bezier(0.32, 0.94, 0.6, 1);
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

  /* 수치 변화 추적 */
  transition:
    max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${(props) =>
    props.$isHidden
      ? `
    width: 0px;
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
    width: 56px;
    padding: 16px;
    margin-right: 16px;
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  `
        : `
    width: auto;
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

const ScrollableBody = styled.div<{
  $snapHeight?: number;
}>`
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding-bottom: 24px;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const CourseList = styled.div`
  padding: 0 0 100px 0;
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

const PrimaryActionButton = styled(ActionButton)`
  border-radius: 999px;
  background: var(--interactive-primary, #3b82f6);

  color: #fff;
`;

const SecondaryActionButton = styled(ActionButton)`
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-subtle, #f8f9fb);

  color: var(--text-primary, #333d4b);
`;
