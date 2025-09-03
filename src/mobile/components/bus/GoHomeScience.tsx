import styled from "styled-components";
import BusStopHeader from "mobile/components/bus/BusStopHeader.tsx";
import BusStopBox from "mobile/components/bus/BusStopBox.tsx";
import {
  goHome_Nature_BIT,
  goHome_Nature_INU,
} from "mobile/components/bus/BusDummy.ts";
import BusCircleBox from "mobile/components/bus/BusCircleBox.tsx";
import useBusStopNavigate from "../../../hooks/useBusStopNavigate.ts";

export default function GoHomeScience() {
  const mobileBusStopNavigate = useBusStopNavigate();
  return (
    <PageWrapper>
      <BusStopHeader
        stopName="인천대 자연과학대학"
        stopNotice={`※ 오후 4~6시에는 사람이 몰려 버스가 정차하지 않을 수 있어요.\n    공과대학 정류장을 이용하는걸 추천해요.`}
        onClickStopInfo={() => mobileBusStopNavigate("go-home-science")}
      />
      <BusStopBox
        sectionName="인입 1번 출구행"
        busList={goHome_Nature_INU}
        bstopId={"164000378"}
      />
      <BusStopBox
        sectionName="지식정보단지역행"
        busList={goHome_Nature_BIT}
        bstopId={"164000378"}
      />
      <BusStopHeader
        stopName="인천대 공과대학"
        stopNotice={`※ 이 곳은 출발지라 도착 정보가 표시되지 않습니다.\n    자연대 정류장을 참고해주세요.`}
        onClickStopInfo={() => mobileBusStopNavigate("go-home-engineering")}
      />
      <BusCircleBox label="정차 버스" busList={["셔틀", "8", "6-1", "6"]} />
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
