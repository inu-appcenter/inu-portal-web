import styled from "styled-components";
import BusStopHeader from "mobile/components/bus/BusStopHeader.tsx";
import BusStopBox from "mobile/components/bus/BusStopBox.tsx";
import {
  goHome_Dorm1,
  goHome_Dorm2,
} from "mobile/components/bus/data/BusDummy.ts";
import useBusStopNavigate from "../../../../hooks/useBusStopNavigate.ts";

export default function GoHomeDorm() {
  const mobileBusStopNavigate = useBusStopNavigate();
  return (
    <PageWrapper>
      <BusStopHeader
        stopName="인천대 송도캠퍼스"
        stopNotice="※ 암벽 앞, 기숙사 근처에 위치해 있어요."
        onClickStopInfo={() => mobileBusStopNavigate("go-home-dorm")}
      />
      <BusStopBox
        sectionName="인입 1번 출구행 "
        busList={goHome_Dorm1}
        bstopId={"164000751"}
      />
      <BusStopBox
        sectionName="인입 2번 출구행 "
        busList={goHome_Dorm2}
        bstopId={"164000751"}
      />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
`;
