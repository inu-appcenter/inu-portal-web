import styled from "styled-components";
import useMobileNavigate from "hooks/useMobileNavigate.ts";

export default function BusCardSection() {
  const mobileNavigate = useMobileNavigate();

  return (
    <Wrapper>
      <CardImg
        src="/Bus/SchoolCard.svg"
        alt="학교갈래요"
        onClick={() => mobileNavigate("/bus/info?type=go-school")}
      />
      <CardImg
        src="/Bus/HomeCard.svg"
        alt="집갈래요"
        onClick={() => mobileNavigate("/bus/info?type=go-home")}
      />
      <CardImg
        src="/Bus/ShuttleCard.svg"
        alt="셔틀버스"
        onClick={() => {
          mobileNavigate("/bus/info?type=shuttle");
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
  border-radius: 16px;
  cursor: pointer;
`;
