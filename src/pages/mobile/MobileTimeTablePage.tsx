import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import GradeCalculatorWidget from "@/components/mobile/timetable/GradeCalculatorWidget";
import TimetableGrid, {
  ClassItem,
} from "@/components/mobile/timetable/TimetableGrid";

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
  useHeader({
    title: undefined,
    showAlarm: true,
    hasback: false,
  });

  return (
    <MobileTimeTablePageWrapper>
      <TitleContentArea title={"2025년 2학기"}>
        <TimetableGrid events={MOCK_TIMETABLE} />
      </TitleContentArea>

      <TitleContentArea title={"학점 계산기"}>
        <GradeCalculatorWidget />
      </TitleContentArea>
    </MobileTimeTablePageWrapper>
  );
};

export default MobileTimeTablePage;

const MobileTimeTablePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px 40px 16px;
`;
