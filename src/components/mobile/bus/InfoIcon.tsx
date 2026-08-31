import styled from "styled-components";
import { BusInfoIcon } from "@/resources/assets/icons/ui";

interface Props {
  onClick?: () => void;
}

export default function InfoIcon({ onClick }: Props) {
  return (
    <Icon onClick={onClick}>
      <BusInfoIcon aria-label="정류장 정보" />
    </Icon>
  );
}

const Icon = styled.button`
  display: flex;
  align-items: center;
  border: none;
  background: none;
  padding: 0;
  margin-bottom: 1px;
  color: #9b9b9b;

  svg {
    width: 20px;
    height: 20px;
  }
`;
