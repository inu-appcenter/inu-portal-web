import styled from "styled-components";
import busIcon from "/Bus/busIcon.svg";
import useBusArrival from "../../../hooks/useBusArrival";
import { BusData } from "@/types/bus";
import Box from "@/components/common/Box";

interface BusRouteBarProps {
  bus: BusData;
  bstopId: string;
}

export default function BusRouteBar({ bus, bstopId }: BusRouteBarProps) {
  // 구조 분해 할당을 통해 busArrivalList 추출
  const { busArrivalList: currentArrivals } = useBusArrival(bstopId, [bus]);
  const { busArrivalList: passArrivals } = useBusArrival(bus.lastStopId!, [
    bus,
  ]);

  // 첫 번째 요소의 arrivalInfo 참조
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

    // 현재 정류장 기준 도착 예정 버스 표시 여부
    const showBus =
      arrivalInfo?.time === "도착정보 없음"
        ? i === 0
        : restCount >= 4
          ? i === 0
          : restCount > 0
            ? i === 4 - restCount
            : false;

    // 정보 박스 표시 여부
    const showInfoBox = showBus;

    // 지나간 버스 표시 여부
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
    <Box>
      <BusRouteBarWrapper>
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
      </BusRouteBarWrapper>
    </Box>
  );
}

const BusRouteBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
  box-sizing: border-box;
  width: 100%;
`;

const Line = styled.div`
  position: relative;
  width: 100%;
  height: 36px;
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
`;

const Dot = styled.div<{ $current: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  z-index: 1;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  background-color: ${({ $current }) => ($current ? "#A1C3FF" : "#fff")};
  border: ${({ $current }) =>
    $current ? "1.5px solid #A1C3FF" : "1.5px solid #C7DAF5"};
`;

const BusIcon = styled.img`
  position: absolute;
  top: -5px;
  width: 24px;
`;

const InfoBox = styled.div`
  position: absolute;
  top: -40px;
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
`;

const LastBus = styled.span`
  font-weight: 500;
  color: red;
`;

const Label = styled.div`
  margin-top: 20px;
  font-size: 12px;
  white-space: nowrap;
`;
