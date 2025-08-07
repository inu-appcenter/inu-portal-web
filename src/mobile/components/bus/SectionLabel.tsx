import styled from "styled-components";

interface SectionLabelProps {
  text: string;
}

export default function SectionLabel({ text }: SectionLabelProps) {
  return <Label>{text}</Label>;
}

const Label = styled.span`
  color: #fff;
  font-size: 14px;
  background-color: #7aa7e5;
  padding: 2px 6px;
  border-radius: 2px;
  width: auto;
  max-width: fit-content;
  gap: 12px;
`;
