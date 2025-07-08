import styled from "styled-components";
import BusCircle from "mobile/components/bus/BusCircle";

interface Props {
  busList: string[];
}

export default function BusCircleList({ busList }: Props) {
  return (
    <BusCircleListWrapper>
      <CircleList>
        {busList.map((num, index) => (
          <BusCircle
            key={index}
            number={num}
            isGreen={num === "41" || num === "46"}
          />
        ))}
      </CircleList>
    </BusCircleListWrapper>
  );
}

const BusCircleListWrapper = styled.div`
  background-color: #e8f0fe;
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 24px;
`;

const CircleList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;
