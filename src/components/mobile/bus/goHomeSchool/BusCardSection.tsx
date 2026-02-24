import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ROUTES } from "@/constants/routes"; // ROUTES 경로 확인 필요

export default function BusCardSection() {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <CardImg
        src="/Bus/학교갈래요버튼.webp"
        alt="학교갈래요버튼"
        onClick={() => navigate(`${ROUTES.BUS.INFO}?type=go-school`)}
      />
      <CardImg
        src="/Bus/집갈래요버튼.webp"
        alt="집갈래요버튼"
        onClick={() => navigate(`${ROUTES.BUS.INFO}?type=go-home`)}
      />
      <CardImg
        src="/Bus/셔틀버스버튼.webp"
        alt="셔틀버스버튼"
        onClick={() => navigate(`${ROUTES.BUS.INFO}?type=shuttle`)}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  align-self: stretch;
  justify-items: center;
  justify-content: center;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CardImg = styled.img`
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  cursor: pointer;
  margin: 0 auto;
`;
