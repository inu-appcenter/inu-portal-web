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
  justify-content: center;
  border: none;
  background: none;
  padding: 0;

  img {
    width: 24px;
    height: 24px;
  }
`;
