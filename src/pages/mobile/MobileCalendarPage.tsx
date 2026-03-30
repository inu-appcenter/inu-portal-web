import styled from "styled-components";
import Calendar from "@/components/mobile/calendar/Calendar";
import { useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";

export default function MobileCalendarPage() {
  // 헤더 설정 주입
  useHeader({
    title: "학사일정",
  });
  return (
    <MobileCalendarPageWrapper>
      <Calendar />
    </MobileCalendarPageWrapper>
  );
}

const MobileCalendarPageWrapper = styled.div`
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 0 ${MOBILE_PAGE_GUTTER};
  padding-bottom: 100px;

  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    min-height: calc(100vh - 220px);
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
    padding-top: clamp(32px, 5vh, 64px);
    padding-bottom: clamp(72px, 10vh, 120px);
  }
`;
