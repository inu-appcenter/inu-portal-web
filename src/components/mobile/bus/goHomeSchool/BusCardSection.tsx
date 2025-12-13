import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function BusCardSection() {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <CardImg
        src="/Bus/학교갈래요버튼.webp"
        alt="학교갈래요버튼"
        onClick={() => navigate("/bus/info?type=go-school")}
      />
      <CardImg
        src="/Bus/집갈래요버튼.webp"
        alt="집갈래요버튼"
        onClick={() => navigate("/bus/info?type=go-home")}
      />
      <CardImg
        src="/Bus/셔틀버스버튼.webp"
        alt="셔틀버스버튼"
        onClick={() => {
          navigate("/bus/info?type=shuttle");
        }}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  //padding: 16px;
`;

const CardImg = styled.img`
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  cursor: pointer;
`;
