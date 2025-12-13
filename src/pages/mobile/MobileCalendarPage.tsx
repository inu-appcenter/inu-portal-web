import styled from "styled-components";
import Calendarbar from "@/components/mobile/calendar/Calendar";
import MobileHeader from "../../containers/mobile/common/MobileHeader.tsx";

export default function MobileCalendarPage() {
  return (
    <MobileCalendarPageWrapper>
      {/*<Title title={"학사일정"} onback={() => mobileNavigate("/home")} />*/}
      <MobileHeader title={"학사일정"} />
      <Calendarbar />
    </MobileCalendarPageWrapper>
  );
}

const MobileCalendarPageWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 30px 16px;
  padding-top: 72px;

  box-sizing: border-box;
`;
