import styled from "styled-components";
import BusStopHeader from "@/components/mobile/bus/BusStopHeader";
import BusStopBox from "@/components/mobile/bus/BusStopBox";
import { useDynamicBusRoutes } from "@/hooks/useDynamicBusRoutes";
import useBusStopNavigate from "@/hooks/useBusStopNavigate";
import Skeleton from "@/components/common/Skeleton";

interface DynamicLegacyBusTabContentProps {
  type: string;
  tabName: string;
}

export default function DynamicLegacyBusTabContent({
  type,
  tabName,
}: DynamicLegacyBusTabContentProps) {
  const mobileBusStopNavigate = useBusStopNavigate();
  const { tabs, stops, isLoading } = useDynamicBusRoutes(type);

  if (isLoading) {
    return (
      <PageWrapper>
        <Skeleton width="100%" height={80} />
        <Skeleton width="100%" height={160} />
      </PageWrapper>
    );
  }

  const currentTab = tabs.find((t) => t.label === tabName) ?? tabs[0];
  if (!currentTab) {
    return (
      <PageWrapper>
        <EmptyBox>등록된 버스 노선 정보가 없습니다.</EmptyBox>
      </PageWrapper>
    );
  }

  const tabStops = stops.filter((s) => currentTab.stopIds.includes(s.id));

  if (tabStops.length === 0) {
    return (
      <PageWrapper>
        <EmptyBox>등록된 정류소 정보가 없습니다.</EmptyBox>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {tabStops.map((stop) => (
        <StopGroup key={stop.id}>
          <BusStopHeader
            stopName={stop.stopName}
            stopNotice={stop.stopNotice}
            showInfoIcon={true}
            onClickStopInfo={() => mobileBusStopNavigate(stop.id)}
          />
          {stop.busSections.map((sec) => (
            <BusStopBox
              key={sec.id}
              sectionName={sec.label || stop.stopName}
              busList={sec.buses}
              bstopId={stop.bstopId || ""}
              showInfoIcon={true}
              onClickInfo={() => mobileBusStopNavigate(stop.id)}
            />
          ))}
        </StopGroup>
      ))}
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

const StopGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const EmptyBox = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #8c8c8c;
  font-size: 14px;
`;
