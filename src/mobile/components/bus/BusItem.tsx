import styled from "styled-components";
import { BusData } from "types/bus.ts";
import BusCircle from "./BusCircle.tsx";

interface BusItemProps extends BusData {
  onClick?: () => void;
}

export default function BusItem({
  number,
  route,
  routeNotice,
  arrivalInfo,
  onClick,
}: BusItemProps) {
  return (
    <BusItemWrapper onClick={onClick}>
      <TopSection>
        {routeNotice ? (
          <RouteText>{routeNotice}</RouteText>
        ) : (
          <RouteText>{route.filter(Boolean).join("→")}</RouteText>
        )}
      </TopSection>
      <MainSection>
        <BusCircle
          number={number}
          isGreen={number === "41" || number === "46"}
        />
        {arrivalInfo && (
          <TimeInfo>
            <ArrivalWrapper>
              <MainTime>{arrivalInfo.time}</MainTime>
              {(arrivalInfo.status || arrivalInfo.station) && (
                <LabelWrapper>
                  <StatusInfo>
                    {arrivalInfo.station}{" "}
                    {arrivalInfo.isLastBus ? (
                      <LastBus>🚨막차</LastBus>
                    ) : (
                      arrivalInfo.status
                    )}
                  </StatusInfo>
                </LabelWrapper>
              )}
            </ArrivalWrapper>
          </TimeInfo>
        )}
        <Arrow>{">"}</Arrow>
      </MainSection>
    </BusItemWrapper>
  );
}

const BusItemWrapper = styled.div`
  background-color: #e8f0fe;
  border-radius: 12px;
  padding: 8px 16px 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TopSection = styled.div``;

const RouteText = styled.div`
  font-size: 12px;
  color: #0e4d9d;
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
  justify-content: center;
  gap: 8px;
`;

const MainTime = styled.div`
  font-weight: 600;
  font-size: 15px;
`;

const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1px;
`;

const StatusInfo = styled.span`
  background-color: #ffffff;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  color: #666;
  font-weight: 400;
`;

const LastBus = styled.span`
  font-weight: 500;
  color: red;
`;

const Arrow = styled.span`
  font-size: 16px;
  color: #666;
  margin-left: auto;
`;
