import styled from "styled-components";
import { MenuItemType, useHeader } from "@/context/HeaderContext";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import GradeCalculatorWidget from "@/components/mobile/timetable/GradeCalculatorWidget";
import TimetableGrid, {
  ClassItem,
} from "@/components/mobile/timetable/TimetableGrid";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import ComingSoonModal from "@/components/mobile/common/ComingSoonModal";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";

// 목업 데이터
const MOCK_TIMETABLE: ClassItem[] = [
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
  {
    id: 3,
    name: "컴퓨터네트워크",
    room: "201호",
    day: 1,
    startTime: 10,
    endTime: 12,
  },
  {
    id: 1,
    name: "데이터구조",
    room: "302호",
    day: 2,
    startTime: 9,
    endTime: 11,
  },
  {
    id: 4,
    name: "데이터베이스",
    room: "105호",
    day: 2,
    startTime: 14,
    endTime: 16,
  },
  {
    id: 2,
    name: "운영체제",
    room: "404호",
    day: 3,
    startTime: 13,
    endTime: 15,
  },
  {
    id: 5,
    name: "인공지능",
    room: "501호",
    day: 4,
    startTime: 15,
    endTime: 18,
  },
];

const MobileTimeTablePage = () => {
  const navigate = useNavigate();
  const [isModalOpen] = useState(false);

  const menuItems = useMemo<MenuItemType[]>(
    () => [
      {
        label: "시간표 편집",
        onClick: () => navigate(ROUTES.TIMETABLE.EDIT),
      },
    ],
    [navigate], // navigate 함수 의존성 추가
  );

  useHeader({
    title: "시간표",
    showAlarm: true,
    hasback: false,
    menuItems,
  });

  return (
    <MobileTimeTablePageWrapper>
      <ComingSoonModal
        isOpen={isModalOpen}
        onClose={() => navigate(ROUTES.HOME, { replace: true })}
      />
      <TimetableGrid events={MOCK_TIMETABLE} />
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

      <TitleContentArea
        title={"학점 계산기"}
        style={{ marginTop: "36px" }}
        onClick={() => {}}
      >
        <GradeCalculatorWidget />
      </TitleContentArea>
    </MobileTimeTablePageWrapper>
  );
};

export default MobileTimeTablePage;

const MobileTimeTablePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  //gap: 24px;
  padding: 0 ${MOBILE_PAGE_GUTTER} 40px;

  @media ${DESKTOP_MEDIA} {
    padding: 0 0 40px;
  }
`;

const SemesterInfoLine = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 8px;
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
