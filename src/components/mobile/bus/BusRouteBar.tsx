import styled, { keyframes, css } from "styled-components";
import busIcon from "/Bus/busIcon.svg";
import useBusArrival from "../../../hooks/useBusArrival";
import { BusData } from "@/types/bus";
import Box from "@/components/common/Box";
import { RotateCw } from "lucide-react";
import { useState, useCallback } from "react";

interface BusRouteBarProps {
  bus: BusData;
  bstopId: string;
}

export default function BusRouteBar({ bus, bstopId }: BusRouteBarProps) {
  // 현재 정류장 기준 도착 정보
  const {
    busArrivalList: currentArrivals,
    refetch: refetchCurrent,
    isFetching: isFetchingCurrent,
    lastUpdated,
  } = useBusArrival(bstopId, [bus]);

  // 지나간 정류장 기준 정보 (전체 노선 상의 위치 파악용)
  const {
    busArrivalList: passArrivals,
    refetch: refetchPass,
    isFetching: isFetchingPass,
  } = useBusArrival(bus.lastStopId!, [bus]);

  const [isCooldown, setIsCooldown] = useState(false);

  const handleRefresh = useCallback(() => {
    if (isCooldown || isFetchingCurrent || isFetchingPass) return;

    refetchCurrent();
    refetchPass();
    setIsCooldown(true);

    setTimeout(() => {
      setIsCooldown(false);
    }, 10000); // 10초 쿨타임
  }, [
    isCooldown,
    isFetchingCurrent,
    isFetchingPass,
    refetchCurrent,
    refetchPass,
  ]);

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
  };

  const arrivalInfo = currentArrivals[0]?.arrivalInfo;
  const passArrival = passArrivals[0]?.arrivalInfo;

  const restCount = arrivalInfo?.restCount ?? -1;
  const passRestCount = passArrival?.restCount ?? -1;

  const route = bus.route;
  const totalDots = 4 + route.length;
  const dots = [];

  const lastIndex = route.length - 1;
  const passIndex = lastIndex - passRestCount;

  for (let i = 0; i < totalDots; i++) {
    const isCurrent = i === 4;
    const label = i >= 5 ? (route[i - 4] ?? "") : i == 4 ? route[0] : "";

    const showBus =
      arrivalInfo?.time === "도착정보 없음"
        ? i === 0
        : restCount >= 4
          ? i === 0
          : restCount > 0
            ? i === 4 - restCount
            : false;

    const showInfoBox = showBus;

    const showPassBus =
      passRestCount >= 0 &&
      passIndex >= 1 &&
      passIndex < route.length &&
      i === passIndex + 4;

    const passText = `${route.length - passRestCount - 1}정류장 지남`;

    dots.push({
      label,
      showBus,
      showInfoBox,
      isCurrent,
      showPassBus,
      passText,
    });
  }

  return (
    <BusRouteBarWrapper>
      <HeaderArea>
        <LastUpdated>업데이트: {formatTime(lastUpdated)}</LastUpdated>
        <RefreshButton
          onClick={handleRefresh}
          $isFetching={isFetchingCurrent || isFetchingPass}
          $isCooldown={isCooldown}
          disabled={isCooldown || isFetchingCurrent || isFetchingPass}
        >
          <RotateCw size={14} />
        </RefreshButton>
      </HeaderArea>

      <Box>
        <LineArea>
          <Line>
            <Arrow />
            <DotList>
              {dots.map((dot, i) => (
                <DotBox key={i}>
                  {dot.showInfoBox && arrivalInfo && (
                    <InfoBox>
                      <div>
                        {arrivalInfo.station}{" "}
                        {arrivalInfo.isLastBus ? (
                          <LastBus>막차</LastBus>
                        ) : (
                          arrivalInfo.status
                        )}
                      </div>
                      <div>{arrivalInfo.time}</div>
                    </InfoBox>
                  )}
                  {dot.showPassBus && (
                    <>
                      <BusIcon src={busIcon} />
                      <InfoBox>{dot.passText}</InfoBox>
                    </>
                  )}
                  {dot.showBus && <BusIcon src={busIcon} />}
                  <Dot $current={dot.isCurrent} />
                  {dot.label && <Label>{dot.label}</Label>}
                </DotBox>
              ))}
            </DotList>
          </Line>
        </LineArea>
      </Box>
    </BusRouteBarWrapper>
  );
}

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const BusRouteBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: 8px 0;
`;

const HeaderArea = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
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
  color: ${(props) => (props.$isCooldown ? "#ccc" : "#666")};
  transition: color 0.2s;

  ${(props) =>
    props.$isFetching &&
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

const LineArea = styled.div`
  padding: 64px 0 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  height: 2px;
  transform: translateY(-50%);
  background-color: #a1c3ff;
  z-index: 0;
  left: 18px;
  right: 18px;
`;

const DotList = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  width: 100%;
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
  bottom: 20px;
  width: 24px;
`;

const InfoBox = styled.div`
  position: absolute;
  bottom: 48px;
  width: 66px;
  height: 30px;
  font-size: 10px;
  background: #fff;
  border: 1px solid #7aa7e5;
  border-radius: 6px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.4;
  z-index: 10;
`;

const LastBus = styled.span`
  font-weight: 500;
  color: red;
`;

const Label = styled.div`
  position: absolute;
  top: 15px;
  font-size: 12px;
  white-space: nowrap;
`;
