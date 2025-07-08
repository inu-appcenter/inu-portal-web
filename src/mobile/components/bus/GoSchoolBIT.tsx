import styled from "styled-components";
import BusStopHeader from "mobile/components/bus/BusStopHeader.tsx";
import BusStopBox from "mobile/components/bus/BusStopBox.tsx";
import { goSchool_BITExit3 } from "mobile/components/bus/busdummy.ts";

export default function GoSchoolBIT() {
  return (
    <PageWrapper>
      <BusStopHeader
        stopName="지식정보단지역"
        stopNotice="※ 엘리베이터로 이동하면 더 쉽게 찾을 수 있어요 !"
      />
      <BusStopBox sectionName="3번출구" busList={goSchool_BITExit3} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  padding: 16px;
`;
