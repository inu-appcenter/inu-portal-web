import styled from "styled-components";

interface SectionLabelProps {
  text: string;
}

export default function SectionLabel({ text }: SectionLabelProps) {
  return <Label>{text}</Label>;
}

const Label = styled.span`
  display: flex;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  background-color: #7aa7e5;
  padding: 1px 8px;
  border-radius: 4px;
  align-items: center;
  max-width: fit-content;
  margin: 0;
`;
