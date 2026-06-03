import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import TimetableGrid, {
  ClassItem,
} from "@/components/mobile/timetable/TimetableGrid";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import ComingSoonModal from "@/components/mobile/common/ComingSoonModal";
import LinkCardButton from "@/components/mobile/common/LinkCardButton";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { Pencil } from "lucide-react";

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
  const gradeCalculatorRef = useRef<HTMLDivElement>(null);

  const headerRight = useMemo(
    () => (
      <HeaderRightArea>
        <IconButton onClick={() => navigate(ROUTES.TIMETABLE.EDIT)}>
          <Pencil size={22} color="#1C1C1E" />
        </IconButton>
      </HeaderRightArea>
    ),
    [navigate],
  );

  useHeader({
    title: "시간표",
    showAlarm: true,
    hasback: false,
    rightArea: headerRight,
  });

  const handleGradeCalculatorClick = () => {
    gradeCalculatorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

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

      <ButtonGroup>
        <ButtonRow>
          <LinkCardButton
            label="친구"
            onClick={() => navigate(ROUTES.TIMETABLE.COMPARE_SELECT)}
          />
          <LinkCardButton
            label="학점 계산기"
            onClick={handleGradeCalculatorClick}
          />
        </ButtonRow>
        <LinkCardButton
          label="모의 수강 신청(수강 신청 시뮬레이터)"
          onClick={() =>
            window.open("https://inu-sugang-simulator.pages.dev", "_blank")
          }
        />
      </ButtonGroup>
    </MobileTimeTablePageWrapper>
  );
};

export default MobileTimeTablePage;

const MobileTimeTablePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  //gap: 24px;
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: var(--header-height, 56px) ${MOBILE_PAGE_GUTTER}
    calc(var(--nav-height, 100px) + 40px);

  @media ${DESKTOP_MEDIA} {
    padding: var(--header-height, 56px) 0 40px;
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
