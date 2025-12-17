import styled from "styled-components";
import BusStopHeader from "@/components/mobile/bus/BusStopHeader.tsx";
import SectionLabel from "@/components/mobile/bus/SectionLabel.tsx";
import BusCircleBox from "@/components/mobile/bus/BusCircleBox.tsx";

import { useLocation } from "react-router-dom";
import { BusStopDummy } from "@/components/mobile/bus/data/BusStopDummy";
import BusStopMap from "@/components/mobile/bus/BusStopMap.tsx";
import MobileHeader from "../../../containers/mobile/common/MobileHeader.tsx";
import { useHeader } from "@/context/HeaderContext";

export default function MobileBusStopPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const stopId = searchParams.get("id");

  const stop = BusStopDummy.find((s) => s.id === stopId);

  // 헤더 설정 주입
  useHeader({
    title: "정류장 정보",
  });

  if (stop)
    return (
      <MobileBusStopPageWrapper>
        <MobileHeader />
        <BusStopHeader
          stopName={stop.stopName}
          stopNotice={stop.stopNotice ?? ""}
          showInfoIcon={false}
          sectionLabel={stop.sectionLabel}
        />

        <StopMapSection>
          <SectionLabel text="정류장 위치" />
          <BusStopMap lat={stop.lat} lng={stop.lng} />
        </StopMapSection>

        <BusCircleBox label="정차 버스" busList={stop.busList} />
      </MobileBusStopPageWrapper>
    );
}

const MobileBusStopPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 16px;
  width: 100%;
  box-sizing: border-box;
`;

const StopMapSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
