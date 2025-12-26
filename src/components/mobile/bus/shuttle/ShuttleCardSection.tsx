import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function ShuttleCardSection() {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <CardImg
        src="/Bus/탑승방법버튼.svg"
        alt="탑승방법버튼"
        onClick={() => {
          navigate("/Bus/shuttle/hellobus");
        }}
      />
      <CardImg
        src="/Bus/일산김포버튼.svg"
        alt="일산김포버튼"
        onClick={() => navigate("/Bus/shuttle?route=ilsan-gimpo")}
      />
      <CardImg
        src="/Bus/부천송내버튼.svg"
        alt="부천송내버튼"
        onClick={() => navigate("/Bus/shuttle?route=bucheon")}
      />
      <CardImg
        src="/Bus/안산시흥버튼.svg"
        alt="안산시흥버튼"
        onClick={() => {
          navigate("/Bus/shuttle?route=ansan-siheung");
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
  border-radius: 16px;
  cursor: pointer;
`;
