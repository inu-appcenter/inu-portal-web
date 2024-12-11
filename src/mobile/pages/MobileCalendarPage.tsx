import styled from "styled-components";
import Calendarbar from "mobile/components/calendar/Calendar";
import BackImg from "resources/assets/mobile-common/backbtn.svg";
import { useNavigate } from "react-router-dom";
import useAppStateStore from "stores/useAppStateStore";

export default function MobileCalendarPage() {
  const navigate = useNavigate();
  const { isAppUrl } = useAppStateStore();

  return (
    <MobileWritePageWrapper>
      <BackButton onClick={() => navigate(`${isAppUrl}/home`)}>
        <img src={BackImg} alt="뒤로가기 버튼" />
        <span>Back</span>
      </BackButton>
      <Calendarbar />
    </MobileWritePageWrapper>
  );
}

const MobileWritePageWrapper = styled.div`
  width: 100%;
`;

const BackButton = styled.div`
  padding: 20px 0 0 20px;
  width: 80px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  img {
    width: 15px;
    height: 15px;
  }
`;
