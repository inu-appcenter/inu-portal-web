import styled from "styled-components";
import useMobileNavigate from "hooks/useMobileNavigate";

export default function MobileBusCardSection() {
  const mobileNavigate = useMobileNavigate();

  return (
    <Wrapper>
      <CardImg
        src="/MobileBusCard/SchoolCard.svg"
        alt="학교갈래요"
        onClick={() => mobileNavigate("/bus/go-school")}
      />
      <CardImg
        src="/MobileBusCard/HomeCard.svg"
        alt="집갈래요"
        onClick={() => mobileNavigate("/bus/go-home")}
      />
      <CardImg
        src="/MobileBusCard/ShuttleCard.svg"
        alt="셔틀버스"
        onClick={() => {
          mobileNavigate("/bus/shuttle");
        }}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
`;

const CardImg = styled.img`
  width: 100%;
  border-radius: 16px;
  cursor: pointer;
`;
