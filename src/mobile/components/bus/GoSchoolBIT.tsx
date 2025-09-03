import styled from "styled-components";
import BusStopHeader from "mobile/components/bus/BusStopHeader.tsx";
import BusStopBox from "mobile/components/bus/BusStopBox.tsx";
import { goSchool_BIT3 } from "mobile/components/bus/BusDummy.ts";
import useBusStopNavigate from "../../../hooks/useBusStopNavigate.ts";

export default function GoSchoolBIT() {
  const mobileBusStopNavigate = useBusStopNavigate();
  return (
    <PageWrapper>
      <BusStopHeader
        stopName="지식정보단지역"
        stopNotice="※ 공대, 정보대 학생들이 이용하기 좋아요! "
        onClickStopInfo={() => mobileBusStopNavigate("go-school-BIT3")}
      />
      <BusStopBox
        sectionName="3번 출구"
        busList={goSchool_BIT3}
        bstopId={"164000403"}
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
