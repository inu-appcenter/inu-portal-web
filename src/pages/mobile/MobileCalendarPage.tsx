import styled from "styled-components";
import Calendar from "@/components/mobile/calendar/Calendar";
import MobileHeader from "../../containers/mobile/common/MobileHeader.tsx";
import { useHeader } from "@/context/HeaderContext";

export default function MobileCalendarPage() {
  // 헤더 설정 주입
  useHeader({
    title: "학사일정",
  });
  return (
    <>
      <MobileHeader />
      <MobileCalendarPageWrapper>
        <Calendar />
      </MobileCalendarPageWrapper>
    </>
  );
}

const MobileCalendarPageWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 0 16px;
  padding-bottom: 100px;

  box-sizing: border-box;
`;
