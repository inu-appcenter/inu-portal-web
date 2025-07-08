import styled from "styled-components";
import BusStopHeader from "mobile/components/bus/BusStopHeader.tsx";
import BusStopBox from "mobile/components/bus/BusStopBox.tsx";
import {
  goHome_Science_INU,
  goHome_Science_BIT,
} from "mobile/components/bus/busdummy.ts";
import BusCircleBox from "mobile/components/bus/BusCircleBox.tsx";

export default function GoHomeScience() {
  return (
    <PageWrapper>
      <BusStopHeader
        stopName="인천대 자연과학대학"
        stopNotice={`⚠️ 오후 5시~6시에는 사람이 몰려 버스가 정차하지 않을 수 있어요.
      \n공과대학 정류장을 이용하는걸 추천해요.`}
      />
      <BusStopBox
        sectionName="인천대입구 1번출구"
        busList={goHome_Science_INU}
      />
      <BusStopBox sectionName="지식정보단지역행" busList={goHome_Science_BIT} />
      <BusStopHeader
        stopName="인천대 공과대학"
        stopNotice={`※ 도착 정보가 표시되지 않을 수 있습니다.`}
      />
      <BusCircleBox label="정차 버스" busList={["셔틀", "8", "16", "41"]} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  padding: 16px;
`;
