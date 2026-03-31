import styled from "styled-components";
import { BusData } from "@/types/bus.ts";
import BusCircle from "./BusCircle.tsx";
import Box from "@/components/common/Box";
import { FiChevronRight } from "react-icons/fi";
import { getArrivalStationText } from "@/components/mobile/bus/busArrivalDisplay";

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
  const stationText = getArrivalStationText(arrivalInfo);

  return (
    <Box onClick={onClick}>
      <BusItemWrapper>
        <TopSection>
          {routeNotice ? (
            <RouteText>{routeNotice}</RouteText>
          ) : (
            <RouteText>{route.filter(Boolean).join(" → ")}</RouteText>
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
                {(arrivalInfo.status || stationText) && (
                  <LabelWrapper>
                    <StatusInfo>
                      {stationText}{" "}
                      {arrivalInfo.isLastBus ? (
                        <LastBus>🚨막차</LastBus>
                      ) : (
                        /* 상태 텍스트에만 색상 적용 */
                        <StatusText $status={arrivalInfo.status}>
                          {arrivalInfo.status}
                        </StatusText>
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
`;

const TopSection = styled.div``;

const RouteText = styled.div`
  font-size: 12px;
  font-weight: 600;
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
  //justify-content: center;
  gap: 12px;
  padding-left: 32px;
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
  border: 0.5px solid #cecece;
  padding: 2px;
  font-size: 12px;
  color: #666;
  font-weight: 400;
  word-break: keep-all;
`;

// 상태별 텍스트 색상 정의
const StatusText = styled.span<{ $status?: string }>`
  color: ${({ $status }) => {
    switch ($status) {
      case "여유":
        return "#006F1E";
      case "보통":
        return "#0E4D9D";
      case "혼잡":
        return "#D10000";
      default:
        return "inherit";
    }
  }};
`;

const LastBus = styled.span`
  font-weight: 500;
  color: red;
`;
