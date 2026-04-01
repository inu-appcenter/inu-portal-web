import styled from "styled-components";

import type { BusCircleTone } from "@/components/mobile/bus/busCircleTone";

interface BusCircleProps {
  number: string;
  tone?: BusCircleTone;
}

export default function BusCircle({
  number,
  tone = "default",
}: BusCircleProps) {
  return <Circle $tone={tone}>{number}</Circle>;
}

const Circle = styled.div<{ $tone: BusCircleTone }>`
  //background-color: #ffffff;
  //box-shadow: 1px 2px 5px rgba(0, 0, 0, 0.15);
  color: ${({ $tone }) => {
    switch ($tone) {
      case "green":
        return "#2c9b37";
      case "red":
        return "#d64a3a";
      default:
        return "#1b4e9b";
    }
  }};
  width: fit-content;
  min-width: fit-content;
  height: 40px;
  border-radius: 50%;
  font-weight: 600;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
