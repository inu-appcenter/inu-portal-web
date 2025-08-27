import styled from "styled-components";
import useMobileNavigate from "hooks/useMobileNavigate";

export default function ShuttleCardSection() {
  const mobileNavigate = useMobileNavigate();

  return (
    <Wrapper>
      <CardImg
        src="/Bus/탑승방법버튼.svg"
        alt="탑승방법버튼"
        onClick={() => {
          mobileNavigate("/Bus/shuttle/hellobus");
        }}
      />
      <CardImg
        src="/Bus/김포청라버튼.svg"
        alt="김포청라버튼"
        onClick={() => mobileNavigate("/Bus/shuttle?route=gimpo-cheongna")}
      />
      <CardImg
        src="/Bus/부천송내버튼.svg"
        alt="부천송내버튼"
        onClick={() => mobileNavigate("/Bus/shuttle?route=bucheon")}
      />
      <CardImg
        src="/Bus/안산시흥버튼.svg"
        alt="안산시흥버튼"
        onClick={() => {
          mobileNavigate("/Bus/shuttle?route=ansan-siheung");
        }}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  //padding: 16px;

  box-sizing: border-box;
  width: 100%;
  height: 100%;
`;

const CardImg = styled.img`
  width: 100%;
  border-radius: 16px;
  cursor: pointer;
`;
