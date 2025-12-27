import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import InfoIcon from "@/components/mobile/bus/InfoIcon";
import BusItem from "@/components/mobile/bus/BusItem";
import { BusStopBoxProps } from "@/types/bus.ts";
import useBusArrival from "@/hooks/useBusArrival.ts";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import BusItemSkeleton from "@/components/mobile/bus/BusItemSkeleton";
import { ROUTES } from "@/constants/routes"; // ROUTES 상수 임포트

interface Props extends BusStopBoxProps {
  bstopId: string;
}

export default function BusStopBox({
  sectionName,
  onClickInfo,
  busList,
  showInfoIcon = false,
  bstopId,
}: Props) {
  const navigate = useNavigate();
  const { busArrivalList, isLoading } = useBusArrival(bstopId, busList);

  return (
    <TitleContentArea
      title={
        <LabelGroup>
          {sectionName} {showInfoIcon && <InfoIcon onClick={onClickInfo} />}
        </LabelGroup>
      }
    >
      <BusStopBoxWrapper>
        <BusList>
          {isLoading
            ? // 로딩 상태 스켈레톤 표시
              Array.from({ length: busList.length || 2 }).map((_, i) => (
                <BusItemSkeleton key={`bus-skeleton-${i}`} />
              ))
            : busArrivalList.map((bus) => (
                <BusItem
                  key={bus.id}
                  {...bus}
                  onClick={() =>
                    bus.number === "셔틀"
                      ? navigate(
                          `${ROUTES.BUS.INFO}?type=shuttle&tab=subwayShuttle`,
                        )
                      : navigate(
                          `${ROUTES.BUS.DETAIL}?bstopId=${bstopId}&id=${bus.id}`,
                        )
                  }
                />
              ))}
        </BusList>
      </BusStopBoxWrapper>
    </TitleContentArea>
  );
}

const BusStopBoxWrapper = styled.div`
  background-color: transparent;
  width: 100%;
  border-radius: 10px;
  box-sizing: border-box;
`;

const LabelGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
