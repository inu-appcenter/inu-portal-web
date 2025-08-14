import styled from "styled-components";
import busIcon from "/Bus/busIcon.svg";
import useBusArrival from "../../../hooks/useBusArrival";
import { BusData } from "types/bus";

interface BusRouteBarProps {
  bus: BusData;
  bstopId: string;
}

export default function BusRouteBar({ bus, bstopId }: BusRouteBarProps) {
  const arrivalInfo = useBusArrival(bstopId, [bus])[0]?.arrivalInfo;
  const restCount = arrivalInfo?.restCount ?? -1;

  const route = bus.route;
  const totalDots = 4 + route.length;
  const dots = [];

  for (let i = 0; i < totalDots; i++) {
    const isCurrent = i === 4;

    const label = i >= 5 ? (route[i - 4] ?? "") : i == 4 ? route[0] : "";

    //버스 아이콘 위치
    const showBus =
      arrivalInfo?.time === "곧 도착"
        ? isCurrent
        : arrivalInfo?.time === "도착정보 없음"
          ? i === 0
          : restCount >= 4
            ? i === 0
            : i === 4 - restCount;

    //네모박스 표시
    const showInfoBox = showBus;

    dots.push({ label, showBus, showInfoBox, isCurrent });
  }

  return (
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
                    {arrivalInfo.isLastBus ? "🚨막차" : arrivalInfo.status}
                  </div>
                  <div>{arrivalInfo.time}</div>
                </InfoBox>
              )}
              {dot.showBus && <BusIcon src={busIcon} />}
              <Dot $current={dot.isCurrent} />
              {dot.label && <Label>{dot.label}</Label>}
            </DotBox>
          ))}
        </DotList>
      </Line>
    </BusRouteBarWrapper>
  );
}
const BusRouteBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  padding: 0 16px;
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
  width: 12px;
  height: 12px;
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

const Label = styled.div`
  margin-top: 20px;
  font-size: 12px;
  white-space: nowrap;
`;
