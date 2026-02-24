import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ROUTES } from "@/constants/routes"; // ROUTES 경로 확인

export default function ShuttleCardSection() {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <CardImg
        src="/Bus/탑승방법버튼.svg"
        alt="탑승방법버튼"
        onClick={() => {
          navigate(ROUTES.BUS.SHUTTLE_HELLO);
        }}
      />
      <CardImg
        src="/Bus/일산김포버튼.svg"
        alt="일산김포버튼"
        onClick={() =>
          navigate(`${ROUTES.BUS.SHUTTLE_ROUTE}?route=ilsan-gimpo`)
        }
      />
      <CardImg
        src="/Bus/부천송내버튼.svg"
        alt="부천송내버튼"
        onClick={() => navigate(`${ROUTES.BUS.SHUTTLE_ROUTE}?route=bucheon`)}
      />
      <CardImg
        src="/Bus/안산시흥버튼.svg"
        alt="안산시흥버튼"
        onClick={() => {
          navigate(`${ROUTES.BUS.SHUTTLE_ROUTE}?route=ansan-siheung`);
        }}
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
  border-radius: 16px;
  cursor: pointer;
`;
