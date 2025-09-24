import styled from "styled-components";
import Calendarbar from "mobile/components/calendar/Calendar";
import MobileHeader from "../containers/common/MobileHeader.tsx";
import { useEffect } from "react";
import { postApiLogs } from "../../apis/members.ts";

export default function MobileCalendarPage() {
  useEffect(() => {
    const logApi = async () => {
      console.log("학사일정 로그");
      await postApiLogs("/api/calendar");
    };
    logApi();
  }, []);
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
