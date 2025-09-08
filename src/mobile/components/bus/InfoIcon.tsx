import styled from "styled-components";
import infoIcon from "resources/assets/mobile-bus/busInfo.svg";

interface Props {
  onClick?: () => void;
}

export default function InfoIcon({ onClick }: Props) {
  return (
    <Icon onClick={onClick}>
      <img src={infoIcon} alt="정류장 정보" />
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
  img {
    width: 20px;
    height: 20px;
  }
`;
