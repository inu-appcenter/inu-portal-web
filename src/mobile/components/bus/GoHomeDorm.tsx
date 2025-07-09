import styled from "styled-components";
import BusStopHeader from "mobile/components/bus/BusStopHeader.tsx";
import BusStopBox from "mobile/components/bus/BusStopBox.tsx";
import { goHome_Dorm } from "mobile/components/bus/BusDummy.ts";
import useBusStopNavigate from "../../../hooks/useBusStopNavigate.ts";

export default function GoHomeDorm() {
  const mobileBusStopNavigate = useBusStopNavigate();
  return (
    <PageWrapper>
      <BusStopHeader
        stopName="인천대 송도캠퍼스 (암벽 앞)"
        stopNotice="※ 배차간격이 길어요"
        onClickStopInfo={() => mobileBusStopNavigate("go-home-dorm")}
      />
      <BusStopBox sectionName="인천대입구 1번출구 " busList={goHome_Dorm} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
`;
