import styled from "styled-components";
import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import { MdKeyboardArrowDown } from "react-icons/md";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import BottomSheet from "@/components/common/BottomSheet";

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
  const [categoryList] = useState<string[]>([
    "#컴퓨터공학부",
    "# 2학점",
    "# 3학년",
  ]);

  const filterRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const touchGestureRef = useRef({
    startY: 0,
    lastY: 0,
    startX: 0,
    lastX: 0,
    startAtTop: false,
    startAtBottom: false,
    isEdgeSwipe: false,
  });

  const handleTouchStart = (event: TouchEvent) => {
    const listElement = event.currentTarget as HTMLDivElement;
    if (!listElement) return;
    const touch = event.touches[0];
    const touchY = touch?.clientY ?? 0;
    const touchX = touch?.clientX ?? 0;
    const maxScrollTop = Math.max(
      listElement.scrollHeight - listElement.clientHeight,
      0,
    );

    touchGestureRef.current = {
      startY: touchY,
      lastY: touchY,
      startX: touchX,
      lastX: touchX,
      startAtTop: listElement.scrollTop <= 1,
      startAtBottom: listElement.scrollTop >= maxScrollTop - 1,
      isEdgeSwipe: false,
    };
  };

  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    const touchY = touch?.clientY ?? touchGestureRef.current.lastY;
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

  const handleFilterTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    const touchY = touch?.clientY ?? 0;
    const touchX = touch?.clientX ?? 0;

    touchGestureRef.current = {
      startY: touchY,
      lastY: touchY,
      startX: touchX,
      lastX: touchX,
      startAtTop: true,
      startAtBottom: false,
      isEdgeSwipe: false,
    };
  };

  const handleFilterTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    const touchY = touch?.clientY ?? touchGestureRef.current.lastY;
    const touchX = touch?.clientX ?? touchGestureRef.current.lastX;

    const deltaY = touchY - touchGestureRef.current.startY;
    const deltaX = touchX - touchGestureRef.current.startX;

    touchGestureRef.current.lastY = touchY;
    touchGestureRef.current.lastX = touchX;

    const isVertical = Math.abs(deltaY) > Math.abs(deltaX);

    if (isVertical && Math.abs(deltaY) > 2) {
      if (event.cancelable) {
        event.preventDefault();
      }
      touchGestureRef.current.isEdgeSwipe = true;
    } else {
      touchGestureRef.current.isEdgeSwipe = false;
    }
  };

  useEffect(() => {
    const filterElement = filterRef.current;
    const bodyElement = bodyRef.current;

    if (filterElement) {
      filterElement.addEventListener("touchstart", handleFilterTouchStart, {
        passive: true,
      });
      filterElement.addEventListener("touchmove", handleFilterTouchMove, {
        passive: false,
      });
    }

    if (bodyElement) {
      bodyElement.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      bodyElement.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
    }

    return () => {
      if (filterElement) {
        filterElement.removeEventListener("touchstart", handleFilterTouchStart);
        filterElement.removeEventListener("touchmove", handleFilterTouchMove);
      }
      if (bodyElement) {
        bodyElement.removeEventListener("touchstart", handleTouchStart);
        bodyElement.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [open, snap]);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      modal={false}
      dismissible={snap === 0.45 || snap === null || snap === undefined}
      snapPoints={[0.45, 0.95]}
      activeSnapPoint={open ? snap : null}
      setActiveSnapPoint={onSnapChange}
      disablePreventScroll={true}
      snapToSequentialPoint={true}
    >
      <FilterRow ref={filterRef}>
        <SearchCircleButton
          onClick={() => console.log("검색 버튼 클릭됨")}
        >
          <Search size={20} />
        </SearchCircleButton>
        <CategoryWrapper>
          <CategorySelectorNew categories={categoryList} />
        </CategoryWrapper>
        <FilterCircleButton
          onClick={() => console.log("필터 버튼 클릭됨")}
        >
          <SlidersHorizontal size={20} />
        </FilterCircleButton>
      </FilterRow>
      <ScrollableBody
        ref={bodyRef}
        $snapHeight={typeof snap === "number" ? snap : 0.45}
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
                <TimeRoomText>
                  {course.timeStr} {course.room}
                </TimeRoomText>

                {/* 확장 영역 */}
                {isExpanded && (
                  <ExpandedArea>
                    <DetailText>
                      {`${course.grade}학년 ${course.isMajor ? "전공심화" : "교양"} ${course.credits}학점 ${course.courseId}`}
                    </DetailText>
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
    </BottomSheet>
  );
};

export default MobileCourseSearchSheet;

// --- 스타일 ---

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding-bottom: 16px;
  background-color: var(--bg-base, #ffffff);
  z-index: 10;
  flex-shrink: 0;
`;

const CategoryWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const SearchCircleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-default, #e5e8eb);
  background-color: var(--bg-base, #ffffff);
  color: var(--interactive-primary, #0061FF);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease-in-out;

  &:active {
    transform: scale(0.92);
  }
`;

const FilterCircleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: var(--interactive-primary, #0061FF);
  color: #ffffff;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease-in-out;

  &:active {
    transform: scale(0.92);
  }
`;

const ScrollableBody = styled.div<{ $snapHeight?: number }>`
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

  max-height: ${({ $snapHeight }) =>
    typeof $snapHeight === "number"
      ? `calc(${$snapHeight * 100}dvh - 120px)`
      : "none"};

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const CourseList = styled.div`
  padding: 0 0 24px 0;
`;

const CourseItem = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  display: flex;
  flex-direction: column;
  gap: 6px;
  background-color: #ffffff;
  transition: background-color 0.2s;
  cursor: pointer;
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
  font-size: 16px;
  font-weight: 700;
  color: var(--interactive-primary, #0061FF);
  margin: 0;
`;

const ProfName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, #333d4b);
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
  padding: 4px 10px;
  border-radius: 999px;
  background-color: rgba(0, 97, 255, 0.08);
  color: var(--interactive-primary, #0061FF);
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
`;

const StyledArrowIcon = styled(MdKeyboardArrowDown)<{ $isExpanded: boolean }>`
  font-size: 24px;
  color: var(--text-tertiary, #8b95a1);
  transition: transform 0.3s;
  transform: ${({ $isExpanded }) =>
    $isExpanded ? "rotate(180deg)" : "rotate(0deg)"};
`;

const TimeRoomText = styled.div`
  font-size: 13px;
  color: var(--text-tertiary, #8b95a1);
  line-height: 18px;
`;

const DetailText = styled.div`
  font-size: 13px;
  color: var(--text-tertiary, #8b95a1);
  line-height: 18px;
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
  font-size: 13px;
  color: var(--text-tertiary, #8b95a1);
  line-height: 18px;
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
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;

  &:active {
    transform: scale(0.96);
  }
`;

const PrimaryActionButton = styled(ActionButton)`
  background-color: var(--interactive-primary, #0061FF);
  color: #ffffff;
`;

const SecondaryActionButton = styled(ActionButton)`
  background-color: #ffffff;
  border: 1px solid var(--border-default, #e5e8eb);
  color: var(--text-secondary, #333d4b);
`;
