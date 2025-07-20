import styled from "styled-components";
import BusStopHeader from "mobile/components/bus/BusStopHeader.tsx";
import BusStopBox from "mobile/components/bus/BusStopBox.tsx";
import {
  goHome_MainOut,
  goHome_MainIn,
} from "mobile/components/bus/BusDummy.ts";
import useBusStopNavigate from "../../../hooks/useBusStopNavigate.ts";

export default function GoHomeMain() {
  const mobileBusStopNavigate = useBusStopNavigate();
  return (
    <PageWrapper>
      <BusStopHeader
        stopName="인천대 정문 (길 건너서)"
        stopNotice="⚠️ 오후 4시~6시에는 사람이 몰려 버스가 정차하지 않을 수 있어요."
        onClickStopInfo={() => mobileBusStopNavigate("go-home-main-out")}
      />
      <BusStopBox
        sectionName="인천대입구 1번출구"
        busList={goHome_MainOut}
        bstopId={"164000385"}
      />
      <BusStopHeader
        stopName="인천대 정문"
        stopNotice="※ 정류장 위치를 꼭 확인하세요! "
        onClickStopInfo={() => mobileBusStopNavigate("go-home-main-in")}
      />
      <BusStopBox
        sectionName="인천대입구 1번출구"
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
  padding: 0 16px;
  box-sizing: border-box;
`;
