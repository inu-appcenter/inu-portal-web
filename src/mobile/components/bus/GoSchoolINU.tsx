import styled from "styled-components";
import BusStopHeader from "mobile/components/bus/BusStopHeader.tsx";
import BusStopBox from "mobile/components/bus/BusStopBox.tsx";
import {
  goSchool_INUExit1,
  goSchool_INUExit2,
} from "mobile/components/bus/busdummy.ts";
//import { mobileNavigate } from "hooks/useMobileNavigate";

export default function GoSchoolINU() {
  return (
    <PageWrapper>
      <BusStopHeader
        stopName="인천대입구역"
        stopNotice="※버스 노선을 꼭 확인하고 탑승해주세요 !"
        showInfoIcon={false}
      />
      <BusStopBox
        sectionName="2번출구"
        busList={goSchool_INUExit2}
        showInfoIcon={true}
      />
      <BusStopBox
        sectionName="1번출구"
        busList={goSchool_INUExit1}
        showInfoIcon={true}
      />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  padding: 16px;
`;
