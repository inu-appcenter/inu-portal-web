import styled from "styled-components";
import SectionLabel from "@/components/mobile/bus/SectionLabel";
import BusCircleList from "@/components/mobile/bus/BusCircleList";

interface Props {
  label: string;
  busList: string[];
}

export default function BusCircleBox({ label, busList }: Props) {
  return (
    <CircleBusBoxWrapper>
      <SectionLabel text={label} />
      <BusCircleList busList={busList} />
    </CircleBusBoxWrapper>
  );
}

const CircleBusBoxWrapper = styled.div`
  padding: 12px 0;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;
