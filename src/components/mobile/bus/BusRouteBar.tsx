import { useCallback, useMemo, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { RotateCw } from "lucide-react";
import Box from "@/components/common/Box";
import useBusArrival from "@/hooks/useBusArrival";
import type { ArrivalInfo, BusData, BusStatus } from "@/types/bus";
import { getArrivalStationText } from "@/components/mobile/bus/busArrivalDisplay";

interface ControlledCurrentArrival {
  arrivalInfo?: ArrivalInfo;
  isFetching: boolean;
  lastUpdated: Date;
  refetch: () => void;
  isCooldown?: boolean;
  startCooldown?: () => void;
}

interface BusRouteBarProps {
  bus: BusData;
  bstopId: string;
  embedded?: boolean;
  currentArrival?: ControlledCurrentArrival;
}

const BUS_ICON_SRC = "/Bus/busIcon.svg";

export default function BusRouteBar({
  bus,
  bstopId,
  embedded = false,
  currentArrival,
}: BusRouteBarProps) {
  const singleBusList = useMemo(() => [bus], [bus]);
  const {
    busArrivalList: internalCurrentArrivals,
    refetch: refetchCurrentInternal,
    isFetching: isFetchingCurrentInternal,
    lastUpdated: internalLastUpdated,
  } = useBusArrival(currentArrival ? "" : bstopId, singleBusList);
  const {
    busArrivalList: passArrivals,
    refetch: refetchPass,
    isFetching: isFetchingPass,
  } = useBusArrival(bus.lastStopId ?? "", singleBusList);
  const [isLocalCooldown, setIsLocalCooldown] = useState(false);

  const arrivalInfo =
    currentArrival?.arrivalInfo ??
    internalCurrentArrivals[0]?.arrivalInfo ??
    bus.arrivalInfo;
  const refetchCurrent = currentArrival?.refetch ?? refetchCurrentInternal;
  const isFetchingCurrent =
    currentArrival?.isFetching ?? isFetchingCurrentInternal;
  const lastUpdated = currentArrival?.lastUpdated ?? internalLastUpdated;
  const isCooldown = currentArrival?.isCooldown ?? isLocalCooldown;

  const startCooldown = useCallback(() => {
    if (currentArrival?.startCooldown) {
      currentArrival.startCooldown();
      return;
    }

    setIsLocalCooldown(true);
    window.setTimeout(() => {
      setIsLocalCooldown(false);
    }, 10000);
  }, [currentArrival]);

  const handleRefresh = useCallback(() => {
    if (isCooldown || isFetchingCurrent || isFetchingPass) {
      return;
    }

    refetchCurrent();
    refetchPass();
    startCooldown();
  }, [
    isCooldown,
    isFetchingCurrent,
    isFetchingPass,
    refetchCurrent,
    refetchPass,
    startCooldown,
  ]);

function shortenStopName(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();

  // 1. 역/캠퍼스 주요 정류소 직관적 별칭 우선 치환
  if (trimmed.includes("인천대입구역")) return "인입";
  if (trimmed.includes("지식정보단지역")) return "지정단";
  if (trimmed.includes("자연과학대학") || trimmed.includes("자연대")) return "자연대";
  if (trimmed.includes("공과대학") || trimmed.includes("공대")) return "공대";
  if (trimmed.includes("기숙사") || trimmed.includes("송도캠퍼스")) return "기숙사";
  if (trimmed.includes("북문")) return "북문";
  if (trimmed.includes("정문")) return "정문";
  if (trimmed.includes("타임스페이스")) return "타임스페이스";
  if (trimmed.includes("퍼스트월드")) return "퍼스트월드";
  if (trimmed.includes("마스터뷰")) return "마스터뷰";
  if (trimmed.includes("웰카운티")) return "웰카운티";
  if (trimmed.includes("칼빈매니토바")) return "칼빈국제학교";
  if (trimmed.includes("소리공원")) return "소리공원";
  if (trimmed.includes("미추홀공원")) return "미추홀공원";
  if (trimmed.includes("해양경찰청")) return "해경";

  return trimmed
    .replace(/^인천대(?:학교)?\s*/, "")
    .replace(/\(하모니로\)|\(미정차\)|\(서문\)|\(앞\)/g, "")
    .trim();
}

  const passArrival = passArrivals[0]?.arrivalInfo;
  const arrivalStationText = getArrivalStationText(arrivalInfo, {
    compact: true,
  });
  const restCount = arrivalInfo?.restCount ?? -1;
  const passRestCount = passArrival?.restCount ?? -1;
  const route = bus.route;
  const totalDots = 4 + route.length;
  const lastIndex = route.length - 1;
  const passIndex = lastIndex - passRestCount;

  const dots = Array.from({ length: totalDots }, (_, index) => {
    const isCurrent = index === 4;
    const isLastStop = index === totalDots - 1;
    const rawLabel =
      index >= 5 ? (route[index - 4] ?? "") : index === 4 ? route[0] : "";
    const shortLabel = shortenStopName(rawLabel);

    const showBus =
      arrivalInfo?.time === "도착정보 없음"
        ? index === 0
        : restCount >= 4
          ? index === 0
          : restCount > 0
            ? index === 4 - restCount
            : false;
    const showPassBus =
      passRestCount >= 0 &&
      passIndex >= 1 &&
      passIndex < route.length &&
      index === passIndex + 4;

    // 1번 방식: 정류소가 많을 때는 [현재 정류소], [종점], [버스 위치] 등 핵심 정류소만 선별 표시
    const shouldShowLabel =
      route.length <= 4 || isCurrent || isLastStop || showBus || showPassBus;

    return {
      label: shouldShowLabel ? shortLabel : "",
      fullLabel: rawLabel,
      isCurrent,
      isLastStop,
      showBus,
      showInfoBox: showBus,
      showPassBus,
      passText: `${route.length - passRestCount - 1} 정류장 지남`,
    };
  });

  const lineContent = (
    <LineArea $embedded={embedded}>
      <Line>
        <Arrow />
        <DotList>
          {dots.map((dot, index) => (
            <DotBox key={index}>
              {dot.showInfoBox && arrivalInfo ? (
                <InfoBox>
                  <div>
                    {arrivalStationText}{" "}
                    {arrivalInfo.isLastBus ? (
                      <LastBus>막차</LastBus>
                    ) : (
                      <StatusText $status={arrivalInfo.status}>
                        {arrivalInfo.status}
                      </StatusText>
                    )}
                  </div>
                  <div>{arrivalInfo.time}</div>
                </InfoBox>
              ) : null}

              {dot.showPassBus ? (
                <>
                  <BusIcon src={BUS_ICON_SRC} alt="" />
                  <InfoBox>{dot.passText}</InfoBox>
                </>
              ) : null}

              {dot.showBus ? <BusIcon src={BUS_ICON_SRC} alt="" /> : null}
              <Dot $current={dot.isCurrent} />
              {dot.label ? (
                <Label $current={dot.isCurrent} title={dot.fullLabel}>
                  {dot.label}
                </Label>
              ) : null}
            </DotBox>
          ))}
        </DotList>
      </Line>
    </LineArea>
  );

  return (
    <BusRouteBarWrapper $embedded={embedded}>
      <HeaderArea $embedded={embedded}>
        <LastUpdated>업데이트: {formatTime(lastUpdated)}</LastUpdated>
        <RefreshButton
          type="button"
          onClick={handleRefresh}
          $isFetching={isFetchingCurrent || isFetchingPass}
          $isCooldown={isCooldown}
          disabled={isCooldown || isFetchingCurrent || isFetchingPass}
        >
          <RotateCw size={14} />
        </RefreshButton>
      </HeaderArea>

      {embedded ? (
        <EmbeddedBody>{lineContent}</EmbeddedBody>
      ) : (
        <Box>{lineContent}</Box>
      )}
    </BusRouteBarWrapper>
  );
}

function formatTime(date: Date) {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const BusRouteBarWrapper = styled.div<{ $embedded: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  // padding: ${({ $embedded }) => ($embedded ? "0 16px 18px" : "8px 0")};
`;

const HeaderArea = styled.div<{ $embedded: boolean }>`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  //margin-bottom: ${({ $embedded }) => ($embedded ? "6px" : "8px")};
`;

const LastUpdated = styled.span`
  font-size: 11px;
  color: #888;
`;

const RefreshButton = styled.button<{
  $isFetching: boolean;
  $isCooldown: boolean;
}>`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $isCooldown }) => ($isCooldown ? "#ccc" : "#666")};
  transition: color 0.2s;

  ${({ $isFetching }) =>
    $isFetching &&
    css`
      animation: ${rotate} 1s linear infinite;
    `}

  &:active {
    transform: scale(0.9);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const EmbeddedBody = styled.div`
  width: 100%;
  margin-top: 4px;
  padding: 14px 10px 4px;
  border-top: 1px solid rgba(123, 152, 196, 0.16);
  border-radius: 14px;
  background: rgba(245, 249, 255, 0.55);
`;

const LineArea = styled.div<{ $embedded: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $embedded }) => ($embedded ? "64px 16px 24px" : "64px 20px 20px")};
`;

const Line = styled.div`
  position: relative;
  width: 100%;
  height: 2px;
  display: flex;
  align-items: center;
`;

const Arrow = styled.div`
  position: absolute;
  top: 50%;
  left: 18px;
  right: 18px;
  height: 2px;
  transform: translateY(-50%);
  background-color: #a1c3ff;
  z-index: 0;
`;

const DotList = styled.div`
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
`;

const DotBox = styled.div`
  position: relative;
  width: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Dot = styled.div<{ $current: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  z-index: 1;
  background-color: ${({ $current }) => ($current ? "#A1C3FF" : "#fff")};
  border: ${({ $current }) =>
    $current ? "1.5px solid #A1C3FF" : "1.5px solid #C7DAF5"};
`;

const BusIcon = styled.img`
  position: absolute;
  bottom: 12px;
  width: 24px;
`;

const InfoBox = styled.div`
  position: absolute;
  bottom: 40px;
  width: 66px;
  height: 30px;
  font-size: 10px;
  line-height: 1.4;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fff;
  border: 1px solid #7aa7e5;
  border-radius: 6px;
  z-index: 10;
`;

const LastBus = styled.span`
  font-weight: 500;
  color: red;
`;

const StatusText = styled.span<{ $status?: BusStatus }>`
  color: ${({ $status }) => {
    switch ($status) {
      case "\uC5EC\uC720":
        return "#006F1E";
      case "\uBCF4\uD1B5":
        return "#0E4D9D";
      case "\uD63C\uC7A1":
        return "#D10000";
      default:
        return "inherit";
    }
  }};
`;

const Label = styled.div<{ $current?: boolean }>`
  position: absolute;
  top: 16px;
  font-size: 11px;
  font-weight: ${({ $current }) => ($current ? "700" : "500")};
  color: ${({ $current }) => ($current ? "#2563eb" : "#475569")};
  white-space: nowrap;
  text-align: center;
  pointer-events: none;
`;
