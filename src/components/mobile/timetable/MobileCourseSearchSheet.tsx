import styled from "styled-components";
import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal } from "lucide-react";
import BottomSheet from "@/components/common/BottomSheet";
import FloatingSearchBar, {
  FloatingSearchBarRef,
} from "@/components/mobile/common/FloatingSearchBar";

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
export const COURSE_SEARCH_SNAP_POINTS = [0.6, 0.95];

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
  const [activeFilterCount] = useState<number>(3);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const searchBarRef = useRef<FloatingSearchBarRef>(null);

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
      typeof snap === "number" ? snap : COURSE_SEARCH_SNAP_POINTS[0];
    const currentIndex = COURSE_SEARCH_SNAP_POINTS.findIndex(
      (point) => point === currentSnap,
    );
    return currentIndex === -1 ? 0 : currentIndex;
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
        dismissible={
          snap === COURSE_SEARCH_SNAP_POINTS[0] ||
          snap === null ||
          snap === undefined
        }
        snapPoints={COURSE_SEARCH_SNAP_POINTS}
        activeSnapPoint={open ? snap : null}
        setActiveSnapPoint={onSnapChange}
        disablePreventScroll={true}
        snapToSequentialPoint={true}
        showCloseButton={true}
      >
        <SheetContentWrapper
          $snapHeight={
            typeof snap === "number" ? snap : COURSE_SEARCH_SNAP_POINTS[0]
          }
        >
          <ScrollableBody
            $snapHeight={
              typeof snap === "number" ? snap : COURSE_SEARCH_SNAP_POINTS[0]
            }
            data-vaul-no-drag=""
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onScroll={handleScroll}
          >
            <CourseList>
              {courses.map((course) => {
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
                          {course.enrolledCount}명 담음
                        </EnrolledBadge>
                        <StyledArrowIcon $isExpanded={isExpanded} />
                      </RightInfo>
                    </InfoRow>

                    <ProfName>{course.professor}</ProfName>
                    <DetailText>
                      {course.timeStr} {course.room}
                      <br />
                      {`${course.grade}학년 ${course.isMajor ? "전공심화" : "교양"} ${course.credits}학점 ${course.courseId}`}
                    </DetailText>

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
                            시간표에 추가
                          </PrimaryActionButton>
                          <SecondaryActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("강의평 보기 클릭됨");
                            }}
                          >
                            강의평 보기
                          </SecondaryActionButton>
                          <SecondaryActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("강의계획서 클릭됨");
                            }}
                          >
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
              onClick={() => console.log("필터 버튼 클릭됨")}
            >
              <SlidersHorizontal size={20} />
              <span>필터 {activeFilterCount}</span>
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

const FilterButton = styled.button<{ $isHidden: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 52px;
  border-radius: 999px;
  border: 1px solid var(--border-brand, #0061ff);
  background: var(--interactive-primary, #3b82f6);

  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

  color: var(--text-inverse, #fff);
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;

  ${(props) =>
    props.$isHidden
      ? `
    width: 0px;
    padding: 0;
    margin-right: 0px;
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8);
  `
      : `
    width: 115px;
    padding: 0 20px;
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
  padding: 16px 0;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  color: var(--text-brand, #0061ff);

  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  margin: 0;
`;

const ProfName = styled.span`
  color: var(--text-secondary, #333d4b);

  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
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
  border: 1px solid var(--bg-brand, #d3e5ff);
  background: var(--bg-brand-subtle, #eff6ff);
  color: var(--text-brand, #0061ff);

  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

const StyledArrowIcon = styled(MdKeyboardArrowDown)<{ $isExpanded: boolean }>`
  font-size: 24px;
  color: var(--text-secondary);
  transition: transform 0.3s;
  transform: ${({ $isExpanded }) =>
    $isExpanded ? "rotate(180deg)" : "rotate(0deg)"};
`;

const DetailText = styled.div`
  color: var(--text-tertiary, #8b95a1);

  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

const ExpandedArea = styled.div`
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;

  font-size: 14px;
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
