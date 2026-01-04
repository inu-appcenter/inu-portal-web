import { useState, useMemo } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import TimetableGrid, {
  ClassItem,
} from "@/components/mobile/timetable/TimetableGrid";
import MobileCourseSearchSheet, {
  CourseResult,
} from "@/components/mobile/timetable/MobileCourseSearchSheet";

// --- 목업 데이터 ---
const MY_TIMETABLE: ClassItem[] = [
  {
    id: 1,
    name: "데이터구조",
    room: "302호",
    day: 0,
    startTime: 9,
    endTime: 11,
  },
  {
    id: 2,
    name: "운영체제",
    room: "404호",
    day: 0,
    startTime: 13,
    endTime: 15,
  },
];

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
  useHeader({
    title: "시간표 편집",
    showAlarm: false,
    hasback: true,
  });

  // 상태 관리
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 프리뷰 연산
  const previewSchedules = useMemo(
    () => SEARCH_RESULTS.find((c) => c.id === expandedId)?.schedules || [],
    [expandedId],
  );

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <PageWrapper>
      <TitleContentArea title={"2025년 2학기"}>
        {/* 시간표 그리드 */}
        <TimetableGrid events={MY_TIMETABLE} previewEvents={previewSchedules} />
      </TitleContentArea>

      {/* 바텀시트 */}
      <MobileCourseSearchSheet
        courses={SEARCH_RESULTS}
        expandedId={expandedId}
        onToggleExpand={toggleExpand}
      />
    </PageWrapper>
  );
};

export default MobileTimeTableEditPage;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px 400px 16px;
  box-sizing: border-box;
`;
