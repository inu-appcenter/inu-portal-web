import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function TipTitle() {
  const navigate = useNavigate();
  const goToAllTips = () => {
    navigate("/tips"); // '/Tips' 경로로 이동
  };
  return <TipTile onClick={goToAllTips}>🍯 TIPS</TipTile>;
}

const TipTile = styled.div`
  flex-grow: 0;
  flex-shrink: 0;

  font-size: 28px;
  font-weight: 700;
  line-height: 29px;
  letter-spacing: 0em;
  text-align: left;
  color: #0e4d9d;
  &:hover {
    cursor: url("/pointers/cursor-pointer.svg"), pointer;
  }
`;
