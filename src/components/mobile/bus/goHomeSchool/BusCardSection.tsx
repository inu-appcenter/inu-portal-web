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
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  gap: 12px;
  align-self: stretch;

  /* 그리드 아이템 및 트랙 중앙 정렬 */
  justify-items: center;
  justify-content: center;
`;

const CardImg = styled.img`
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  cursor: pointer;

  /* 이미지 중앙 정렬 */
  margin: 0 auto;
`;
