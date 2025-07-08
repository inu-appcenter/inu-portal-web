import styled from "styled-components";
import BusStopHeader from "mobile/components/bus/BusStopHeader.tsx";
import BusStopBox from "mobile/components/bus/BusStopBox.tsx";
import { goHome_Dorm } from "mobile/components/bus/busdummy.ts";

export default function GoHomeDorm() {
  return (
    <PageWrapper>
      <BusStopHeader
        stopName="인천대 송도캠퍼스 (암벽 앞)"
        stopNotice="※ 배차간격이 길어요"
      />
      <BusStopBox sectionName="인천대입구 1번출구 " busList={goHome_Dorm} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  padding: 16px;
`;
