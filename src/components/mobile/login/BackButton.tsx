import useMobileNavigate from "@/hooks/useMobileNavigate";
import styled from "styled-components";
import backIcon from "@/resources/assets/mobile-common/backbtn.svg";

export default function BackButton() {
  const mobileNavigate = useMobileNavigate();
  return (
    <Button onClick={() => mobileNavigate(-1)} src={backIcon} alt="backIcon" />
  );
}

const Button = styled.img`
  height: 16px;
`;
