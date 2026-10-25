import styled from "styled-components";
import { BusData } from "@/types/bus.ts";
import BusCircle from "./BusCircle.tsx";
import Box from "@/components/common/Box";
import { FiChevronRight } from "react-icons/fi";
import { getArrivalStationText } from "@/components/mobile/bus/busArrivalDisplay";
import { getBusCircleTone } from "@/components/mobile/bus/busCircleTone";
import AutoMarquee from "@/components/common/AutoMarquee";
import { livePulseRing } from "@/styles/motion";

interface BusItemProps extends BusData {
  onClick?: () => void;
}

function cleanRouteStopName(name: string): string {
  if (!name) return "";
  return name
    .replace(/인천대학교/g, "")
    .replace(/^인천대(?!(?:입구|교))/g, "")
    .trim();
}

function formatRouteText(routeNotice?: string, route: string[] = []) {
  if (routeNotice) return routeNotice.replace(/->/g, "→").replace(/\.\.\./g, "…");
  const rawRoute = (route || []).filter(Boolean);
  if (rawRoute.length === 0) return "";
  const cleanedRoute = rawRoute.map(cleanRouteStopName);
  if (cleanedRoute.length <= 4) {
    return cleanedRoute.join(" → ");
  }
  const firstTwo = cleanedRoute.slice(0, 2);
  const lastTwo = cleanedRoute.slice(-2);
  return `${firstTwo.join(" → ")} → … → ${lastTwo.join(" → ")}`;
}

export default function BusItem({
  number,
  route,
  routeNotice,
  arrivalInfo,
  onClick,
}: BusItemProps) {
  const stationText = getArrivalStationText(arrivalInfo);
  const isImminent =
    arrivalInfo?.time === "곧 도착" ||
    Boolean(arrivalInfo?.time?.includes("1분")) ||
    stationText === "1정류장 전";

  return (
    <Box onClick={onClick}>
      <BusItemWrapper>
        <TopSection>
          <RouteText><AutoMarquee text={formatRouteText(routeNotice, route)} /></RouteText>
        </TopSection>
        <MainSection>
          <BusCircle number={number} tone={getBusCircleTone(number)} />
          {arrivalInfo && (
            <TimeInfo>
              <ArrivalWrapper>
                <MainTime>{isImminent && <LivePulseDot />}{arrivalInfo.time}</MainTime>
                {(arrivalInfo.status || stationText) && (
                  <LabelWrapper>
                    <StatusInfo>
                      {stationText === "시간표 기반" ||
                      stationText === "통계 추정" ||
                      stationText === "과거 기록 기반" ? (
                        <span style={{ color: "var(--interactive-primary)", fontWeight: 600 }}>
                          ⏱️ 이전 기록 기반
                        </span>
                      ) : (
                        <>
                          {stationText}{" "}
                          {arrivalInfo.isLastBus ? (
                            <LastBus>🚨막차</LastBus>
                          ) : (
                            <StatusText $status={arrivalInfo.status}>
                              {arrivalInfo.status}
                            </StatusText>
                          )}
                        </>
                      )}
                    </StatusInfo>
                  </LabelWrapper>
                )}
              </ArrivalWrapper>
            </TimeInfo>
          )}
          <FiChevronRight strokeWidth={3} />
        </MainSection>
      </BusItemWrapper>
    </Box>
  );
}

const BusItemWrapper = styled.div`
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
`;

const TopSection = styled.div``;

const RouteText = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-brand);
`;

const MainSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const TimeInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ArrivalWrapper = styled.div`
  display: flex;
  align-items: center;
  //justify-content: center;
  gap: 12px;
  padding-left: 32px;
`;

const LivePulseDot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background-color: var(--red-500);
  margin-right: 6px;
  vertical-align: middle;
  animation: ${livePulseRing} 1.8s cubic-bezier(0.24, 0, 0.38, 1) infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const MainTime = styled.div`
  font-weight: 500;
  font-size: 15px;
`;

const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1px;
`;

const StatusInfo = styled.span`
  border-radius: 2px;
  border: 0.5px solid var(--border-strong);
  padding: 2px;
  font-size: 12px;
  color: var(--gray-600);
  font-weight: 400;
  word-break: keep-all;
`;

// 상태별 텍스트 색상 정의
const StatusText = styled.span<{ $status?: string }>`
  color: ${({ $status }) => {
    switch ($status) {
      case "여유":
        return "var(--border-success)";
      case "보통":
        return "var(--text-brand)";
      case "혼잡":
        return "var(--text-error)";
      default:
        return "inherit";
    }
  }};
`;

const LastBus = styled.span`
  font-weight: 500;
  color: var(--text-error);
`;
