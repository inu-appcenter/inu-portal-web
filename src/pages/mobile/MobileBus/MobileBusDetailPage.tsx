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
import { useHeader } from "@/context/HeaderContext";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";

export default function MobileBusDetailPage() {
  const [searchParams] = useSearchParams();
  const id = Number(searchParams.get("id"));
  const bstopId = searchParams.get("bstopId") || "";

  const mobileBusStopNavigate = useBusStopNavigate();

  // 헤더 설정 주입
  useHeader({
    title: "버스 정보",
  });

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
  padding: 0 16px;
  box-sizing: border-box;
`;
