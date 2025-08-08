import styled from "styled-components";
import SectionLabel from "mobile/components/bus/SectionLabel";
import InfoIcon from "mobile/components/bus/InfoIcon";
import BusItem from "mobile/components/bus/BusItem";
import { BusStopBoxProps } from "types/bus.ts";
import useMobileNavigate from "../../../hooks/useMobileNavigate.ts";
import useBusArrival from "../../../hooks/useBusArrival.ts";

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
  const mobileNavigate = useMobileNavigate();
  const busArrivalList = useBusArrival(bstopId, busList);

  return (
    <BusStopBoxWrapper>
      <BusStopBoxHeader>
        <LabelGroup>
          <SectionLabel text={sectionName} />
          {showInfoIcon && <InfoIcon onClick={onClickInfo} />}
        </LabelGroup>
      </BusStopBoxHeader>

      <BusList>
        {busArrivalList.map((bus) => (
          <BusItem
            key={bus.id}
            {...bus}
            onClick={() =>
              mobileNavigate(`/bus/detail?bstopId=${bstopId}&id=${bus.id}`)
            }
          />
        ))}
      </BusList>
    </BusStopBoxWrapper>
  );
}

const BusStopBoxWrapper = styled.div`
  padding: 16px;
  background-color: transparent;
  border: 1px solid #7aa7e5;
  margin-bottom: 12px;
  border-radius: 10px;
  box-sizing: border-box;
`;

const BusStopBoxHeader = styled.div`
  margin-bottom: 6px;
`;

const LabelGroup = styled.div`
  display: flex;
  align-items: center;
`;

const BusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
