import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import InfoIcon from "@/components/mobile/bus/InfoIcon";
import BusItem from "@/components/mobile/bus/BusItem";
import { BusStopBoxProps } from "@/types/bus.ts";
import useBusArrival from "../../../hooks/useBusArrival.ts";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";

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
  const busArrivalList = useBusArrival(bstopId, busList);

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
          {busArrivalList.map((bus) => (
            <BusItem
              key={bus.id}
              {...bus}
              onClick={() =>
                bus.number === "셔틀"
                  ? navigate("/Bus/info?type=shuttle&tab=subwayShuttle")
                  : navigate(`/bus/detail?bstopId=${bstopId}&id=${bus.id}`)
              }
            />
          ))}
        </BusList>
      </BusStopBoxWrapper>
    </TitleContentArea>
  );
}

const BusStopBoxWrapper = styled.div`
  //padding: 16px;
  background-color: transparent;
  width: 100%;
  //border: 1px solid #7aa7e5;
  //margin-bottom: 12px;
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
