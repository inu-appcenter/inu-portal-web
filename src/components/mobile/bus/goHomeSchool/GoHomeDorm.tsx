import styled from "styled-components";
import BusStopHeader from "@/components/mobile/bus/BusStopHeader.tsx";
import BusStopBox from "@/components/mobile/bus/BusStopBox.tsx";
import {
  goHome_Dorm1,
  goHome_Dorm2,
} from "@/components/mobile/bus/data/BusDummy.ts";
import useBusStopNavigate from "../../../../hooks/useBusStopNavigate.ts";

export default function GoHomeDorm() {
  const mobileBusStopNavigate = useBusStopNavigate();
  return (
    <PageWrapper>
      <BusStopHeader
        stopName="인천대 송도캠퍼스"
        stopNotice="※ 버스가 오지 않을 땐 공과대학 정류장을 이용해보세요!"
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
