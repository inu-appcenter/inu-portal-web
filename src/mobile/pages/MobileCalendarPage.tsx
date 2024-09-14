import styled from "styled-components";
import Calendarbar from "../components/calendar/Calendar";
import BackImg from "../../resource/assets/backbtn.svg";
import { useNavigate } from "react-router-dom";

export default function MobileCalendarPage() {
  const navigate = useNavigate();

  return (
    <MobileWritePageWrapper>
      <BackButton onClick={() => navigate("/m/home")}>
        <img src={BackImg} alt="뒤로가기 버튼" />
        <span>Back</span>
      </BackButton>
      <Calendarbar />
    </MobileWritePageWrapper>
  );
}

const MobileWritePageWrapper = styled.div`
  width: 100%;
  height: calc(100svh - 72px - 72px);
  overflow-y: scroll;
`;

const BackButton = styled.div`
  padding: 20px 0 0 20px;
  width: 80px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  img {
    width: 15px;
    height: 15px;
  }
`;
