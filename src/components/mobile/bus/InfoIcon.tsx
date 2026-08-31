import styled from "styled-components";
import FontelloIcon from "@/components/common/Icon";

interface Props {
  onClick?: () => void;
}

export default function InfoIcon({ onClick }: Props) {
  return (
    <Icon onClick={onClick}>
      <FontelloIcon name="info" size={20} label="정류장 정보" />
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

`;
