import styled from "styled-components";
import { isRedBusSectionLabel } from "@/components/mobile/bus/busCircleTone";

interface SectionLabelProps {
  text: string;
}

export default function SectionLabel({ text }: SectionLabelProps) {
  return <Label $isRed={isRedBusSectionLabel(text)}>{text}</Label>;
}

const Label = styled.span<{ $isRed: boolean }>`
  display: flex;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  background-color: ${({ $isRed }) => ($isRed ? "#d64a3a" : "#7aa7e5")};
  padding: 1px 8px;
  border-radius: 4px;
  align-items: center;
  max-width: fit-content;
  margin: 0;
`;
