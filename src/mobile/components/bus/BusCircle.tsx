import styled from "styled-components";

interface Props {
  number: string;
  isGreen?: boolean;
}

export default function BusCircle({ number, isGreen }: Props) {
  return <Circle $isGreen={isGreen}>{number}</Circle>;
}

const Circle = styled.div<{ $isGreen?: boolean }>`
  background-color: #ffffff;
  box-shadow: 1px 2px 5px rgba(0, 0, 0, 0.15);
  color: ${(props) => (props.$isGreen ? "#2c9b37" : "#1b4e9b")};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
