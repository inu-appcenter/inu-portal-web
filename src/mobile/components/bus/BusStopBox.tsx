import styled from "styled-components";
import SectionLabel from "mobile/components/bus/SectionLabel";
import InfoIcon from "mobile/components/bus/InfoIcon";
import BusItem from "mobile/components/bus/BusItem";
import { BusData } from "types/buses.ts";

interface Props {
  sectionName: string;
  onClickInfo?: () => void;
  showInfoIcon?: boolean;
  busList: BusData[];
}

export default function BusStopBox({
  sectionName,
  onClickInfo,
  busList,
  showInfoIcon = false, //기본값
}: Props) {
  return (
    <BusStopBoxWrapper>
      <BusStopBoxHeader>
        <LabelGroup>
          <SectionLabel text={sectionName} />
          {showInfoIcon && <InfoIcon onClick={onClickInfo} />}
        </LabelGroup>
      </BusStopBoxHeader>

      <BusList>
        {busList.map((bus) => (
          <BusItem key={bus.id} {...bus} />
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
`;

const BusStopBoxHeader = styled.div`
  margin-bottom: 12px;
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
