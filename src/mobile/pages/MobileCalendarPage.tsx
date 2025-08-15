import styled from "styled-components";
import Calendarbar from "mobile/components/calendar/Calendar";

export default function MobileCalendarPage() {
  return (
    <MobileCalendarPageWrapper>
      {/*<Title title={"학사일정"} onback={() => mobileNavigate("/home")} />*/}
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
  box-sizing: border-box;
`;
