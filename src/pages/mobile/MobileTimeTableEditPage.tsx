import { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import TimetableGrid from "@/components/mobile/timetable/TimetableGrid";
import MobileCourseSearchSheet, {
  CourseResult,
  COURSE_SEARCH_SNAP_POINTS,
} from "@/components/mobile/timetable/MobileCourseSearchSheet";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useCourses } from "@/hooks/useCourses";
import { Course } from "@/types/courses";
import {
  useCreateTimeTableCourseItem,
  useDeleteTimeTableItem,
  useTimeTableDetail,
} from "@/hooks/useTimeTables";
import { formatHoursToTime } from "@/utils/timetable";
import type { CustomScheduleEditState } from "@/pages/mobile/timetable/MobileCourseAddPage";

// 서버 강의 데이터에는 아직 room/day/startTime/endTime/professor 등 시간표 배치 정보가 없어
// 검색 시트가 요구하는 CourseResult 형태로 임시 매핑한다.
const mapCourseToCourseResult = (course: Course): CourseResult => ({
  id: course.id,
  name: course.title,
  professor: "-",
  timeStr: "-",
  room: "-",
  grade: parseInt(course.targetGradeName, 10) || 0,
  isMajor: course.completionDivisionName.includes("전공"),
  credits: parseInt(course.credit, 10) || 0,
  courseId: String(course.id),
  remarks: course.content,
  enrolledCount: 0,
  schedules: [],
});
import { useTimetableStore } from "@/stores/useTimetableStore";

// --- SVG Icons from Figma ---
const IconsAddPlus = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(3, 3)">
      <path
        d="M1 9H9M9 9H17M9 9V17M9 9V1"
        stroke="#1C1C1E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

const IconsMagicWand = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(1.5, 1.5)">
      <path
        d="M13 3V1M13 15V13M6 8H8M18 8H20M15.8 10.8L17 12M15.8 5.2L17 4M1 20L9 12M12 9L13 8M10.2 5.2L9 4"
        stroke="#1C1C1E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

const IconsLock = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(3, 2)">
      <rect
        x="1"
        y="7"
        width="16"
        height="12"
        rx="4"
        stroke="#1C1C1E"
        strokeWidth="2"
      />
      <path
        d="M9 14L9 12"
        stroke="#1C1C1E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 7V5C13 2.79086 11.2091 1 9 1C6.79086 1 5 2.79086 5 5L5 7"
        stroke="#1C1C1E"
        strokeWidth="2"
      />
    </g>
  </svg>
);

// --- Styled Components for Header Right Area ---
const HeaderRightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 4px;
`;


const MobileTimeTableEditPage = () => {
  const navigate = useNavigate();

  // 서버 강의 목록 조회 (react query) + zustand 상태 동기화
  const { courses } = useCourses();
  const searchResults = useMemo(
    () => courses.map(mapCourseToCourseResult),
    [courses],
  );

  const headerRight = useMemo(
    () => (
      <HeaderRightArea>
        <IconButton onClick={() => navigate(ROUTES.TIMETABLE.ADD)}>
          <IconsAddPlus />
        </IconButton>
        <IconButton onClick={() => alert("시간표 마법사 클릭")}>
          <IconsMagicWand />
        </IconButton>
        <IconButton onClick={() => navigate(ROUTES.TIMETABLE.VISIBILITY)}>
          <IconsLock />
        </IconButton>
      </HeaderRightArea>
    ),
    [navigate],
  );

  useHeader({
    title: "시간표 편집",
    showAlarm: false,
    hasback: true,
    rightArea: headerRight,
    rightAreaNotCircle: true,
  });

  // 상태 및 스토어 관리
  const { timetables, activeTimetableId } = useTimetableStore();
  const activeTimetable = useMemo(() => {
    return timetables.find((t) => t.id === activeTimetableId) || null;
  }, [timetables, activeTimetableId]);
  const timetable = activeTimetable?.events || [];

  // 상세 조회로 서버 요소를 스토어에 동기화 (뮤테이션 성공 시 invalidate로 재조회됨)
  useTimeTableDetail(activeTimetableId);

  const createCourseItemMutation = useCreateTimeTableCourseItem();
  const deleteItemMutation = useDeleteTimeTableItem();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [snap, setSnap] = useState<string | number | null>(
    COURSE_SEARCH_SNAP_POINTS[1],
  );
  const [isSheetOpen, setIsSheetOpen] = useState(true);

  const handleAddCourse = (newCourse: CourseResult) => {
    if (activeTimetableId === null) {
      alert("활성화된 시간표가 없습니다.");
      return;
    }
    if (createCourseItemMutation.isPending) return;

    createCourseItemMutation.mutate(
      {
        timeTableId: activeTimetableId,
        body: { courseOfferingId: newCourse.id },
      },
      {
        onError: (error: any) => {
          alert(error.response?.data?.msg || "강의 추가에 실패했습니다.");
        },
      },
    );
  };

  useEffect(() => {
    if (typeof snap !== "number" || !COURSE_SEARCH_SNAP_POINTS.includes(snap)) {
      setSnap(COURSE_SEARCH_SNAP_POINTS[1]);
    }
  }, [snap]);

  // 프리뷰 연산
  const previewSchedules = useMemo(
    () => searchResults.find((c) => c.id === expandedId)?.schedules || [],
    [searchResults, expandedId],
  );

  // 선택된 강의(미리보기)가 바텀시트에 의해 가려지는 경우 스크롤 처리
  useEffect(() => {
    if (expandedId === null) return;

    const timer = setTimeout(() => {
      const element = document.getElementById("timetable-preview-block");
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const headerHeight = 130; // 헤더 영역 높이 추정치
      const bottomSheetHeight =
        typeof snap === "number"
          ? snap * viewportHeight
          : COURSE_SEARCH_SNAP_POINTS[1] * viewportHeight;
      const visibleAreaHeight =
        viewportHeight - headerHeight - bottomSheetHeight;

      const elementTop = rect.top + window.scrollY;
      const elementHeight = rect.height;

      const elementBottomInViewport = rect.bottom;
      const elementTopInViewport = rect.top;
      const bottomSheetTopInViewport = viewportHeight - bottomSheetHeight;

      const isCoveredByBottomSheet =
        elementBottomInViewport > bottomSheetTopInViewport;
      const isCoveredByHeader = elementTopInViewport < headerHeight;

      if (isCoveredByBottomSheet || isCoveredByHeader) {
        let targetScrollY = window.scrollY;

        if (elementHeight <= visibleAreaHeight) {
          // 화면에 충분히 노출 가능한 높이인 경우 중앙 정렬
          targetScrollY =
            elementTop +
            elementHeight / 2 -
            (headerHeight + visibleAreaHeight / 2);
        } else {
          // 너무 길어 안 들어가는 경우 위쪽 기준 정렬 (여백 16px)
          targetScrollY = elementTop - headerHeight - 16;
        }

        const maxScrollY =
          document.documentElement.scrollHeight - window.innerHeight;
        targetScrollY = Math.max(0, Math.min(targetScrollY, maxScrollY));

        window.scrollTo({ top: targetScrollY, behavior: "smooth" });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [expandedId, snap]);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // 커스텀 일정 수정 (과목 직접 추가 페이지를 수정 모드로 재사용)
  const handleEdit = (id: number) => {
    const target = timetable.find((item) => item.id === id);
    if (!target?.isCustom || target.customScheduleId === undefined) return;

    const editItem: CustomScheduleEditState = {
      customScheduleId: target.customScheduleId,
      title: target.name,
      memo: target.memo ?? "",
      // 같은 커스텀 일정의 모든 시간대를 함께 넘겨야 수정 시 누락되지 않음
      meetings: timetable
        .filter((item) => item.customScheduleId === target.customScheduleId)
        .map((item) => ({
          day: item.day,
          startTime: formatHoursToTime(item.startTime),
          endTime: formatHoursToTime(item.endTime),
          location: item.room,
        })),
    };
    navigate(ROUTES.TIMETABLE.ADD, { state: { editItem } });
  };

  const handleDelete = (id: number) => {
    if (activeTimetableId === null || deleteItemMutation.isPending) return;
    const target = timetable.find((item) => item.id === id);
    if (target?.itemId === undefined) return;

    deleteItemMutation.mutate(
      { timeTableId: activeTimetableId, timeTableItemId: target.itemId },
      {
        onError: (error: any) => {
          alert(
            error.response?.data?.msg || "시간표 요소 삭제에 실패했습니다.",
          );
        },
      },
    );
  };

  const snapHeightValue = typeof snap === "number" ? snap : 0.6;

  return (
    <PageWrapper $snapHeight={snapHeightValue} $isSheetOpen={isSheetOpen}>
      <TimetableGrid
        events={timetable}
        previewEvents={previewSchedules}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <SemesterInfoLine>
        <Semester>2026년 1학기</Semester>
        <ScoreArea>
          <div className="type1">
            <span>전공 9</span>
            <span>교양 9</span>
          </div>
          <div className="type2">총 18학점</div>
        </ScoreArea>
      </SemesterInfoLine>

      {/* 바텀시트 */}
      <MobileCourseSearchSheet
        courses={searchResults}
        expandedId={expandedId}
        onToggleExpand={toggleExpand}
        snap={snap}
        onSnapChange={setSnap}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onAddCourse={handleAddCourse}
      />
    </PageWrapper>
  );
};

export default MobileTimeTableEditPage;

const PageWrapper = styled.div<{ $snapHeight: number; $isSheetOpen: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 0 ${MOBILE_PAGE_GUTTER}
    ${({ $snapHeight, $isSheetOpen }) =>
      $isSheetOpen ? `calc(${$snapHeight * 100}dvh + 24px)` : "40px"};
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    padding: 0 0
      ${({ $snapHeight, $isSheetOpen }) =>
        $isSheetOpen ? `calc(${$snapHeight * 100}dvh + 24px)` : "40px"};
  }
`;

const SemesterInfoLine = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 8px;
  width: 100%;
  box-sizing: border-box;
`;

const Semester = styled.div`
  color: var(--text-secondary);

  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
`;

const ScoreArea = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  gap: 12px;

  .type1 {
    color: #6b7280;

    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  .type2 {
    color: var(--text-secondary);

    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
  }
`;
