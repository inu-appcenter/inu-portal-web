import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import backIcon from "resources/assets/mobile-common/backbtn.svg";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate("/m/home")} src={backIcon} alt="backIcon" />
  );
}

const Button = styled.img`
  height: 16px;
`;
