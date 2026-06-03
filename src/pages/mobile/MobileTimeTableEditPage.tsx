import { useState, useMemo } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import TimetableGrid, {
  ClassItem,
} from "@/components/mobile/timetable/TimetableGrid";
import MobileCourseSearchSheet, {
  CourseResult,
} from "@/components/mobile/timetable/MobileCourseSearchSheet";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import LinkCardButton from "@/components/mobile/common/LinkCardButton";

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
  const [snap, setSnap] = useState<string | number | null>(0.45);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // 프리뷰 연산
  const previewSchedules = useMemo(
    () => SEARCH_RESULTS.find((c) => c.id === expandedId)?.schedules || [],
    [expandedId],
  );

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const snapHeightValue = typeof snap === "number" ? snap : 0.45;

  return (
    <PageWrapper $snapHeight={snapHeightValue} $isSheetOpen={isSheetOpen}>
      <TimetableGrid events={MY_TIMETABLE} previewEvents={previewSchedules} />
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
        courses={SEARCH_RESULTS}
        expandedId={expandedId}
        onToggleExpand={toggleExpand}
        snap={snap}
        onSnapChange={setSnap}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />

      {/* 하단 버튼 그룹 */}
      <ButtonGroup>
        <ButtonRow>
          <LinkCardButton
            label="직접 추가"
            onClick={() => alert("직접 추가 클릭")}
          />
          <LinkCardButton
            label="목록에서 추가"
            onClick={() => setIsSheetOpen(true)}
          />
        </ButtonRow>

        <LinkCardButton
          label="시간표 마법사"
          onClick={() => alert("시간표 마법사 클릭")}
        />
      </ButtonGroup>
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

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 36px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  width: 100%;
`;
