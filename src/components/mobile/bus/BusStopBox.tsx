import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import InfoIcon from "@/components/mobile/bus/InfoIcon";
import BusItem from "@/components/mobile/bus/BusItem";
import { BusStopBoxProps } from "@/types/bus.ts";
import useBusArrival from "@/hooks/useBusArrival.ts";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import BusItemSkeleton from "@/components/mobile/bus/BusItemSkeleton";
import { ROUTES } from "@/constants/routes";
import { RotateCw } from "lucide-react";
import { useState, useCallback } from "react";
import { isRedBusSectionLabel } from "@/components/mobile/bus/busCircleTone";

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
  const { busArrivalList, isLoading, refetch, isFetching, lastUpdated } =
    useBusArrival(bstopId, busList);

  const [isCooldown, setIsCooldown] = useState(false);

  const handleRefresh = useCallback(() => {
    if (isCooldown || isFetching) return;

    refetch();
    setIsCooldown(true);

    // 10초 쿨타임 (여러 번 누름 방지)
    setTimeout(() => {
      setIsCooldown(false);
    }, 10000);
  }, [isCooldown, isFetching, refetch]);

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
  };

  return (
    <TitleContentArea
      title={
        <HeaderGroup>
          <LabelGroup>
            <SectionNameText $isRed={isRedBusSectionLabel(sectionName)}>
              {sectionName}
            </SectionNameText>
            {showInfoIcon && <InfoIcon onClick={onClickInfo} />}
          </LabelGroup>
          <RefreshArea>
            <LastUpdated>업데이트: {formatTime(lastUpdated)}</LastUpdated>
            <RefreshButton
              onClick={handleRefresh}
              $isFetching={isFetching}
              $isCooldown={isCooldown}
              disabled={isCooldown || isFetching}
            >
              <RotateCw size={14} />
            </RefreshButton>
          </RefreshArea>
        </HeaderGroup>
      }
    >
      <BusStopBoxWrapper>
        <BusList>
          {isLoading
            ? Array.from({ length: busList.length || 2 }).map((_, i) => (
                <BusItemSkeleton key={`bus-skeleton-${i}`} />
              ))
            : busArrivalList.map((bus) => (
                <BusItem
                  key={bus.id}
                  {...bus}
                  onClick={() =>
                    bus.number === "셔틀"
                      ? navigate(
                          `${ROUTES.BUS.INFO}?type=shuttle&category=인천대입구 셔틀`,
                        )
                      : navigate(
                          `${ROUTES.BUS.DETAIL}?bstopId=${bstopId}&id=${bus.id}`,
                          { state: { bus } },
                        )
                  }
                />
              ))}
        </BusList>
      </BusStopBoxWrapper>
    </TitleContentArea>
  );
}

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const BusStopBoxWrapper = styled.div`
  background-color: transparent;
  width: 100%;
  border-radius: 10px;
  box-sizing: border-box;
`;

const HeaderGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LabelGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SectionNameText = styled.span<{ $isRed: boolean }>`
  color: ${({ $isRed }) => ($isRed ? "#d64a3a" : "inherit")};
`;

const RefreshArea = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LastUpdated = styled.span`
  font-size: 11px;
  color: #888;
  font-weight: normal;
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

const BusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
