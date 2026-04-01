import styled from "styled-components";
import BusCircle from "@/components/mobile/bus/BusCircle";
import { getBusCircleTone } from "@/components/mobile/bus/busCircleTone";

interface Props {
  busList: string[];
}

export default function BusCircleList({ busList }: Props) {
  return (
    <BusCircleListWrapper>
      <CircleList>
        {busList.map((num, index) => (
          <BusCircle key={index} number={num} tone={getBusCircleTone(num)} />
        ))}
      </CircleList>
    </BusCircleListWrapper>
  );
}

const BusCircleListWrapper = styled.div`
  background-color: #e8f0fe;
  border-radius: 12px;
  padding: 12px 16px;
  //margin-bottom: 24px;
`;

const CircleList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;
