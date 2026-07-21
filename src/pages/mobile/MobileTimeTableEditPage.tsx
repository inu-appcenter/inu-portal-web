import { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import TimetableGrid, {
  ClassItem,
} from "@/components/mobile/timetable/TimetableGrid";
import MobileCourseSearchSheet, {
  CourseResult,
  COURSE_SEARCH_SNAP_POINTS,
} from "@/components/mobile/timetable/MobileCourseSearchSheet";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useCourses } from "@/hooks/useCourses";
import { Course } from "@/types/courses";

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
import Modal from "@/components/common/Modal";
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

const SEARCH_RESULTS: CourseResult[] = [
  {
    id: 101,
    name: "웹프로그래밍",
    professor: "박기석",
    timeStr: "화 8 9 (17:00~18:45)",
    room: "07-304",
    grade: 3,
    isMajor: true,
    credits: 2,
    courseId: "0008868001",
    remarks: "상대평가 / 노트북 지참 필수",
    enrolledCount: 72,
    schedules: [
      {
        id: 101,
        name: "웹프로그래밍",
        room: "07-304",
        day: 1,
        startTime: 17,
        endTime: 19,
      },
    ],
  },
  {
    id: 102,
    name: "운영체제",
    professor: "문주팍",
    timeStr: "화 8 9 (17:00~18:45)",
    room: "07-304",
    grade: 3,
    isMajor: true,
    credits: 1,
    courseId: "0008868001",
    enrolledCount: 151,
    schedules: [
      {
        id: 102,
        name: "운영체제",
        room: "07-304",
        day: 1,
        startTime: 17,
        endTime: 19,
      },
    ],
  },
  {
    id: 103,
    name: "창의적사고와문제해결",
    professor: "김창의",
    timeStr: "목 5 6 (13:00~15:00)",
    room: "05-202",
    grade: 1,
    isMajor: false,
    credits: 2,
    courseId: "0001234001",
    remarks: "팀프로젝트 있음",
    enrolledCount: 45,
    schedules: [
      {
        id: 103,
        name: "창의적사고와문제해결",
        room: "05-202",
        day: 3,
        startTime: 13,
        endTime: 15,
      },
    ],
  },
];

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
  const { timetables, activeTimetableId, updateTimetableEvents } =
    useTimetableStore();
  const activeTimetable = useMemo(() => {
    return timetables.find((t) => t.id === activeTimetableId) || null;
  }, [timetables, activeTimetableId]);
  const timetable = activeTimetable?.events || [];

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [snap, setSnap] = useState<string | number | null>(
    COURSE_SEARCH_SNAP_POINTS[1],
  );
  const [isSheetOpen, setIsSheetOpen] = useState(true);

  // 모달 및 과목 교체 상태 관리
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [overlappingCourse, setOverlappingCourse] = useState<ClassItem | null>(
    null,
  );
  const [pendingCourse, setPendingCourse] = useState<CourseResult | null>(null);

  const handleAddCourse = (newCourse: CourseResult) => {
    const isOverlapping = (a: ClassItem, b: ClassItem) => {
      if (a.day !== b.day) return false;
      return a.startTime < b.endTime && b.startTime < a.endTime;
    };

    const enrichedSchedules = newCourse.schedules.map((schedule) => ({
      ...schedule,
      professor: newCourse.professor,
      credits: newCourse.credits,
      grade: String(newCourse.grade),
      courseType: newCourse.isMajor ? "전공심화" : "교양",
      evaluation: newCourse.remarks?.includes("상대평가") ? "상대평가" : "절대평가",
      courseId: newCourse.courseId,
    }));

    let conflictItem: ClassItem | null = null;
    for (const newSlot of enrichedSchedules) {
      for (const existingSlot of timetable) {
        if (isOverlapping(newSlot, existingSlot)) {
          conflictItem = existingSlot;
          break;
        }
      }
      if (conflictItem) break;
    }

    if (conflictItem) {
      setOverlappingCourse(conflictItem);
      setPendingCourse({ ...newCourse, schedules: enrichedSchedules });
      setIsConflictModalOpen(true);
    } else {
      if (activeTimetableId !== null) {
        updateTimetableEvents(activeTimetableId, [
          ...timetable,
          ...enrichedSchedules,
        ]);
      }
    }
  };

  const handleReplaceCourse = () => {
    if (!overlappingCourse || !pendingCourse || activeTimetableId === null)
      return;
    updateTimetableEvents(activeTimetableId, [
      ...timetable.filter((item) => item.id !== overlappingCourse.id),
      ...pendingCourse.schedules,
    ]);
    setIsConflictModalOpen(false);
    setOverlappingCourse(null);
    setPendingCourse(null);
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

  const handleEdit = (id: number) => {
    alert(`과목 수정 창을 엽니다. (ID: ${id})`);
  };

  const handleDelete = (id: number) => {
    if (activeTimetableId !== null) {
      updateTimetableEvents(
        activeTimetableId,
        timetable.filter((item) => item.id !== id),
      );
    }
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

      {/* 시간표 충돌 모달 */}
      <Modal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        title="시간이 겹쳐요"
        description={`${overlappingCourse?.name}와(과) 시간이 겹쳐요.\n이 과목으로 교체하시겠어요?`}
        primaryButton={{
          text: "교체하기",
          onClick: handleReplaceCourse,
        }}
        secondaryButton={{
          text: "취소",
          onClick: () => setIsConflictModalOpen(false),
        }}
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
