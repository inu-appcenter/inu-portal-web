import styled from "styled-components";
import BusStopHeader from "@/components/mobile/bus/BusStopHeader.tsx";
import SectionLabel from "@/components/mobile/bus/SectionLabel.tsx";
import BusCircleBox from "@/components/mobile/bus/BusCircleBox.tsx";

import { useLocation } from "react-router-dom";
import { BusStopDummy } from "@/components/mobile/bus/data/BusStopDummy";
import BusStopMap from "@/components/mobile/bus/BusStopMap.tsx";
import { useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";

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

        {stop.stopInfoSections?.length ? (
          stop.stopInfoSections.map((section) => (
            <BusCircleBox
              key={`${stop.id}-${section.label}`}
              label={section.label}
              busList={section.busList}
            />
          ))
        ) : (
          <BusCircleBox label="정차 버스" busList={stop.busList} />
        )}
      </MobileBusStopPageWrapper>
    );
}

const MobileBusStopPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 ${MOBILE_PAGE_GUTTER};
  width: 100%;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    padding: 0;
  }
`;

const StopMapSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
