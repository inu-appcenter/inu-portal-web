import styled from "styled-components";
import BusCardSection from "../../components/bus/BusCardSection.tsx";

export default function MobileBusPage() {
  return (
    <MobileBusPageWrapper>
      <BusCardSection />
    </MobileBusPageWrapper>
  );
}

const MobileBusPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  padding-top: 32px;
  box-sizing: border-box;
`;
