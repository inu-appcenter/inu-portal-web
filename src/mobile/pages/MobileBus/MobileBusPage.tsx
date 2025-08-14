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
  padding: 32px 16px;
  box-sizing: border-box;
  width: 100%;
`;
