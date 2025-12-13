import styled from "styled-components";
import BusCardSection from "@/components/mobile/bus/goHomeSchool/BusCardSection.tsx";
import MobileHeader from "../../../containers/mobile/common/MobileHeader.tsx";

export default function MobileBusPage() {
  return (
    <MobileBusPageWrapper>
      <MobileHeader showAlarm={true} />
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
