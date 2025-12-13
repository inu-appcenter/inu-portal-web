import styled from "styled-components";
import BusStopHeader from "@/components/mobile/bus/BusStopHeader.tsx";
import BusStopBox from "@/components/mobile/bus/BusStopBox.tsx";
import {
  goHome_MainIn,
  goHome_MainOut,
} from "@/components/mobile/bus/data/BusDummy.ts";
import useBusStopNavigate from "../../../../hooks/useBusStopNavigate.ts";

export default function GoHomeMain() {
  const mobileBusStopNavigate = useBusStopNavigate();
  return (
    <PageWrapper>
      <BusStopHeader
        stopName="인천대 정문 (길 건너)"
        stopNotice="※ 오후 4~6시에는 사람이 몰려 버스가 정차하지 않을 수 있어요."
        onClickStopInfo={() => mobileBusStopNavigate("go-home-main-out")}
      />
      <BusStopBox
        sectionName="인입 1번 출구행"
        busList={goHome_MainOut}
        bstopId={"164000385"}
      />
      <BusStopHeader
        stopName="인천대 정문"
        onClickStopInfo={() => mobileBusStopNavigate("go-home-main-in")}
      />
      <BusStopBox
        sectionName="인입 1번 출구행"
        busList={goHome_MainIn}
        bstopId={"164000386"}
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
