import { useSearchParams } from "react-router-dom";
import BusStopHeader from "../../components/bus/BusStopHeader.tsx";
import RouteImg from "../../components/bus/RouteImg.tsx";
import styled from "styled-components";
import BusRouteBar from "../../components/bus/BusRouteBar.tsx";
import {
  goSchool_INUExit2,
  goSchool_INUExit1,
  goSchool_BITExit3,
  goHome_Dorm,
  goHome_MainIn,
  goHome_MainOut,
  goHome_Nature_BIT,
  goHome_Nature_INU,
} from "../../components/bus/BusDummy.ts";
import useBusStopNavigate from "../../../hooks/useBusStopNavigate.ts";

export default function MobileBusDetailPage() {
  const [searchParams] = useSearchParams();
  const id = Number(searchParams.get("id"));
  const bstopId = searchParams.get("bstopId") || "";

  const mobileBusStopNavigate = useBusStopNavigate();

  const allBus = [
    ...goSchool_INUExit1,
    ...goSchool_INUExit2,
    ...goSchool_BITExit3,
    ...goHome_Dorm,
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
      <BusStopHeader
        stopName={`${bus.number}번`}
        sectionLabel={bus.sectionLabel}
        onClickStopInfo={() => mobileBusStopNavigate(bus?.stopId)}
      />
      <BusRouteBar bus={bus} bstopId={bstopId} />
      {bus.routeImg && <RouteImg routeImg={bus.routeImg} />}
    </MobileBusDetailPageWrapper>
  );
}

const MobileBusDetailPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 16px;
`;
