import styled from "styled-components";
import BusStopHeader from "@/components/mobile/bus/BusStopHeader.tsx";
import SectionLabel from "@/components/mobile/bus/SectionLabel.tsx";
import BusCircleBox from "@/components/mobile/bus/BusCircleBox.tsx";
import { useLocation } from "react-router-dom";
import { useDynamicBusRoutes } from "@/hooks/useDynamicBusRoutes";
import BusStopMap from "@/components/mobile/bus/BusStopMap.tsx";
import { useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useEffect } from "react";
import { mixpanelTrack } from "@/utils/mixpanel";
import Skeleton from "@/components/common/Skeleton";

export default function MobileBusStopPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const stopId = searchParams.get("id");

  const { stops, isLoading } = useDynamicBusRoutes("go-school");
  const { stops: homeStops } = useDynamicBusRoutes("go-home");

  const allStops = [...stops, ...homeStops];
  const stop = allStops.find((s) => s.id === stopId || s.bstopId === stopId);

  // 헤더 설정 주입
  useHeader({
    title: "정류장 정보",
  });

  useEffect(() => {
    if (stop) {
      mixpanelTrack.busChecked(stop.stopName, "N/A", stop.stopName);
    }
  }, [stop]);

  if (isLoading) {
    return (
      <MobileBusStopPageWrapper>
        <Skeleton width="100%" height={80} />
        <Skeleton width="100%" height={200} />
      </MobileBusStopPageWrapper>
    );
  }

  if (!stop) {
    return (
      <MobileBusStopPageWrapper>
        <EmptyText>정류장 정보를 찾을 수 없습니다.</EmptyText>
      </MobileBusStopPageWrapper>
    );
  }

  const busNumberList = Array.from(new Set(stop.buses.map((b) => b.number)));

  return (
    <MobileBusStopPageWrapper>
      <BusStopHeader
        stopName={stop.stopName}
        stopNotice={stop.stopNotice ?? ""}
        showInfoIcon={false}
        sectionLabel={stop.stopName}
      />

      <StopMapSection>
        <SectionLabel text="정류장 위치" />
        <BusStopMap lat={stop.lat} lng={stop.lng} />
      </StopMapSection>

      <BusCircleBox label="정차 버스" busList={busNumberList} />
    </MobileBusStopPageWrapper>
  );
}

const EmptyText = styled.div`
  padding: 40px 0;
  text-align: center;
  color: #8c8c8c;
  font-size: 14px;
`;


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
