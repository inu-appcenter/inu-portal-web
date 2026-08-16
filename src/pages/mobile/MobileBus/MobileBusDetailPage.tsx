import { useLocation, useSearchParams } from "react-router-dom";
import BusStopHeader from "@/components/mobile/bus/BusStopHeader.tsx";
import BusRouteMap from "@/components/mobile/bus/BusRouteMap.tsx";
import styled from "styled-components";
import BusRouteBar from "@/components/mobile/bus/BusRouteBar.tsx";
import SectionLabel from "@/components/mobile/bus/SectionLabel.tsx";
import { useDynamicBusRoutes } from "@/hooks/useDynamicBusRoutes";
import useBusStopNavigate from "../../../hooks/useBusStopNavigate.ts";
import { useHeader } from "@/context/HeaderContext";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import type { BusData } from "@/types/bus";
import { useEffect } from "react";
import { mixpanelTrack } from "@/utils/mixpanel";

interface BusDetailLocationState {
  bus?: BusData;
}

export default function MobileBusDetailPage() {
  // 헤더 설정 주입
  useHeader({
    title: "버스 정보",
  });

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const id = Number(searchParams.get("id"));
  const bstopId = searchParams.get("bstopId") || "";

  const mobileBusStopNavigate = useBusStopNavigate();

  const { stops: schoolStops } = useDynamicBusRoutes("go-school");
  const { stops: homeStops } = useDynamicBusRoutes("go-home");

  const allBuses = [...schoolStops, ...homeStops].flatMap((s) => s.buses);


  const navigationBus =
    (location.state as BusDetailLocationState | null)?.bus ?? null;
  const bus =
    navigationBus?.id === id ? navigationBus : allBuses.find((b) => b.id === id);


  useEffect(() => {
    if (bus) {
      mixpanelTrack.busChecked(bus.sectionLabel ?? "", bus.number);
    }
  }, [bus]);

  if (!bus) {
    return null;
  }

  return (
    <MobileBusDetailPageWrapper>
      <MediumPaddingWrapper>
        <BusStopHeader
          stopName={`${bus.number} 번`}
          sectionLabel={bus.sectionLabel}
          onClickStopInfo={() => {
            if (bus?.stopId) {
              mobileBusStopNavigate(bus?.stopId);
            }
          }}
          stopNotice={bus.busNotice}
        />
      </MediumPaddingWrapper>
      <MediumPaddingWrapper>
        <BusRouteBar bus={bus} bstopId={bstopId} />
      </MediumPaddingWrapper>
      <MediumPaddingWrapper>
        <TitleContentArea title={<SectionLabel text={"노선 지도"} />}>
          {bus?.path && (
            <BusRouteMap path={bus.path} stopMarker={bus.stopMarker} />
          )}
        </TitleContentArea>
      </MediumPaddingWrapper>
    </MobileBusDetailPageWrapper>
  );
}

const MobileBusDetailPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  width: 100%;
`;

const MediumPaddingWrapper = styled.div`
  padding: 0 ${MOBILE_PAGE_GUTTER};
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    padding: 0;
  }
`;
