import styled from "styled-components";
import BusCardSection from "../../components/bus/goHomeSchool/BusCardSection.tsx";
import MobileHeader from "../../containers/common/MobileHeader.tsx";
import MobileNav from "../../containers/common/MobileNav.tsx";

export default function MobileBusPage() {
  return (
    <MobileBusPageWrapper>
      <MobileHeader showAlarm={true} />
      <BusCardSection />
      <MobileNav />
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
