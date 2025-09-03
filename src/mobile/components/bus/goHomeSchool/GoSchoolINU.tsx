import styled from "styled-components";
import BusStopHeader from "mobile/components/bus/BusStopHeader.tsx";
import BusStopBox from "mobile/components/bus/BusStopBox.tsx";
import {
  goSchool_INU1,
  goSchool_INU2,
} from "mobile/components/bus/data/BusDummy.ts";
import useBusStopNavigate from "../../../../hooks/useBusStopNavigate.ts";

export default function GoSchoolINU() {
  const mobileBusStopNavigate = useBusStopNavigate();
  return (
    <PageWrapper>
      <BusStopHeader
        stopName="인천대입구역"
        stopNotice="※버스 노선을 꼭 확인하고 탑승해주세요!"
        showInfoIcon={false}
      />
      <BusStopBox
        sectionName="2번 출구"
        busList={goSchool_INU2}
        bstopId={"164000395"}
        showInfoIcon
        onClickInfo={() => mobileBusStopNavigate("go-school-INU2")}
      />
      <BusStopBox
        sectionName="1번 출구"
        busList={goSchool_INU1}
        bstopId={"164000396"}
        showInfoIcon
        onClickInfo={() => mobileBusStopNavigate("go-school-INU1")}
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
