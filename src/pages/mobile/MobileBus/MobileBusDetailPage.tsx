import { useSearchParams } from "react-router-dom";
import BusStopHeader from "@/components/mobile/bus/BusStopHeader.tsx";
import BusRouteMap from "@/components/mobile/bus/BusRouteMap.tsx";
import styled from "styled-components";
import BusRouteBar from "@/components/mobile/bus/BusRouteBar.tsx";
import SectionLabel from "@/components/mobile/bus/SectionLabel.tsx";
import {
  goHome_Dorm1,
  goHome_Dorm2,
  goHome_MainIn,
  goHome_MainOut,
  goHome_Nature_BIT,
  goHome_Nature_INU,
  goSchool_BIT3,
  goSchool_INU1,
  goSchool_INU2,
} from "@/components/mobile/bus/data/BusDummy";
import useBusStopNavigate from "../../../hooks/useBusStopNavigate.ts";
import MobileHeader from "../../../containers/mobile/common/MobileHeader.tsx";

export default function MobileBusDetailPage() {
  const [searchParams] = useSearchParams();
  const id = Number(searchParams.get("id"));
  const bstopId = searchParams.get("bstopId") || "";

  const mobileBusStopNavigate = useBusStopNavigate();

  const allBus = [
    ...goSchool_INU1,
    ...goSchool_INU2,
    ...goSchool_BIT3,
    ...goHome_Dorm1,
    ...goHome_Dorm2,
    ...goHome_MainIn,
    ...goHome_MainOut,
    ...goHome_Nature_BIT,
    ...goHome_Nature_INU,
  ];

  const bus = allBus.find((b) => b.id === id);
  if (!bus) {
    return null;
  }

  return (
    <MobileBusDetailPageWrapper>
      <MobileHeader title={"버스 정보"} />
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
      <BusRouteBar bus={bus} bstopId={bstopId} />
      <SectionLabel text={"노선 지도"} />
      {bus?.path && <BusRouteMap path={bus.path} stopMarker={bus.stopMarker} />}
    </MobileBusDetailPageWrapper>
  );
}

const MobileBusDetailPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 0 16px;
  padding-top: 56px;
  margin-bottom: 20px;
  box-sizing: border-box;
  width: 100%;
`;
