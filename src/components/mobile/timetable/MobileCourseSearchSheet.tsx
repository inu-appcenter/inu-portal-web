import styled from "styled-components";
import { Drawer } from "vaul";
import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import Badge from "@/components/common/Badge";
import { MdKeyboardArrowDown } from "react-icons/md";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { useState, useRef, useEffect } from "react";
import Chip from "@/components/common/Chip";

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
    "#2학점",
    "#3학년",
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
    <Drawer.Root
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
      <Drawer.Portal>
        <StyledContent>
          <SheetInner>
            <DragHeader>
              <HandleBar />
            </DragHeader>
            <ContentAreaBottomSheet>
              <FilterContainer ref={filterRef}>
                <CategorySelectorNew categories={categoryList} />
                <Chip title={"필터"} />
              </FilterContainer>
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
                        $isExpanded={isExpanded}
                      >
                        {/* 기본 정보 */}
                        <InfoRow>
                          <MainInfo>
                            <CourseName>{course.name}</CourseName>
                            <ProfName>{course.professor}</ProfName>
                          </MainInfo>
                          <RightInfo>
                            <Badge
                              text={`${course.enrolledCount}명 담음`}
                            ></Badge>
                            <StyledArrowIcon $isExpanded={isExpanded} />
                          </RightInfo>
                        </InfoRow>

                        {/* 상세 스펙 */}
                        <DetailString>
                          {`${course.timeStr} ${course.room}`} <br />
                          {`${course.grade}학년 ${course.isMajor ? "전공심화" : "교양"} ${course.credits}학점 ${course.courseId}`}
                        </DetailString>

                        {/* 확장 영역 */}
                        {isExpanded && (
                          <ExpandedArea>
                            {course.remarks && (
                              <RemarkText>비고 : {course.remarks}</RemarkText>
                            )}
                            <ButtonRow>
                              <Chip title={"시간표에 추가"} />
                              <Chip title={"강의평 보기 🔗"} />
                            </ButtonRow>
                          </ExpandedArea>
                        )}
                      </CourseItem>
                    );
                  })}
                </CourseList>
              </ScrollableBody>
            </ContentAreaBottomSheet>
          </SheetInner>
        </StyledContent>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default MobileCourseSearchSheet;

// --- 스타일 ---

const StyledContent = styled(Drawer.Content)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  outline: none;

  height: 100%;
  max-height: 96%;
  display: flex;
  flex-direction: column;

  max-width: 768px;
  margin: 0 auto;
  pointer-events: none;
`;

const SheetInner = styled.div`
  background: var(--bg-base, #ffffff);
  width: 100%;
  height: 100%;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border-top: 1px solid var(--border-default, #e5e8eb);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));

  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  pointer-events: auto;
  touch-action: none;
`;

const DragHeader = styled.div`
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  touch-action: none;
`;

const HandleBar = styled.div`
  width: 36px;
  height: 5px;
  border-radius: 999px;
  background: var(--border-default, #e5e8eb);
`;

const ContentAreaBottomSheet = styled.div`
  padding: 8px 20px 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  align-items: center;
  background-color: white;
  padding-bottom: 12px;
  touch-action: pan-x;

  &::-webkit-scrollbar {
    display: none;
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

  /* 스크롤 영역의 높이를 snap 높이에 따라 동적으로 묶어줌 */
  max-height: ${({ $snapHeight }) =>
    typeof $snapHeight === "number"
      ? `calc(${$snapHeight * 100}dvh - 120px)`
      : "none"};

  /* 스크롤바 숨김 */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const CourseList = styled.div`
  padding: 0 0 24px 0;
`;

const CourseItem = styled.div<{ $isExpanded: boolean }>`
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: ${({ $isExpanded }) => ($isExpanded ? "#F8F9FA" : "white")};
  margin: 0 -20px;
  padding-left: 20px;
  padding-right: 20px;
  transition: background-color 0.2s;
  cursor: pointer;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const MainInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CourseName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #2d68ff;
`;

const ProfName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #333;
`;

const RightInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledArrowIcon = styled(MdKeyboardArrowDown)<{ $isExpanded: boolean }>`
  font-size: 24px;
  color: #aaa;
  transition: transform 0.3s;
  transform: ${({ $isExpanded }) =>
    $isExpanded ? "rotate(180deg)" : "rotate(0deg)"};
`;

const DetailString = styled.div`
  font-size: 12px;
  color: #888;
  line-height: 1.4;
`;

const ExpandedArea = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeIn 0.3s ease-in-out;

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
  font-size: 11px;
  color: #ff4b4b;
  font-weight: 500;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;
