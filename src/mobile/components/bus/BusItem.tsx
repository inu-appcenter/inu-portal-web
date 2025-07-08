import styled from "styled-components";
import { BusData } from "types/buses.ts";
import BusCircle from "./BusCircle.tsx";

interface Props extends BusData {}

export default function BusItem({ number, route, arrivalInfo }: Props) {
  return (
    <BusCardWrapper>
      <TopSection>
        <RouteText>{route}</RouteText>
      </TopSection>
      <MainSection>
        <BusCircle
          number={number}
          isGreen={number === "41" || number === "46"}
        />
        <TimeInfo>
          {arrivalInfo.map((info, index) => (
            <ArrivalWrapper key={index}>
              <MainTime>{info.time}</MainTime>
              <LabelWrapper>
                <StatusInfo>
                  {info.station} {info.status}
                </StatusInfo>
              </LabelWrapper>
            </ArrivalWrapper>
          ))}
        </TimeInfo>
        <Arrow>{">"}</Arrow>
      </MainSection>
    </BusCardWrapper>
  );
}

const BusCardWrapper = styled.div`
  background-color: #e8f0fe;
  border-radius: 12px;
  padding: 12px 16px;
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
  align-items: flex-start;
  justify-content: space-between;
`;

const TimeInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 12px;
`;

const ArrivalWrapper = styled.div`
  display: flex;
  align-self: center;
  gap: 8px;
  margin-bottom: 4px;
`;
const MainTime = styled.div`
  font-weight: 650;
  font-size: 15px;
`;

const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StatusInfo = styled.span`
  background-color: #ffffff;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  color: #666;
  font-weight: normal;
`;

const Arrow = styled.span`
  font-size: 20px;
  color: #3b566e;
  margin-left: auto;
  cursor: pointer;
`;
