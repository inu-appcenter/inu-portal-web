import styled from "styled-components";
import MobileBusCardSection from "../../components/mobilebus/MobileBusCardSection.tsx";

// import { useLocation } from "react-router-dom";
// import useMobileNavigate from "hooks/useMobileNavigate.ts";
// import useUserStore from "../../stores/useUserStore.ts";

export default function MobileBusPage() {
  // const location = useLocation();
  // const { userInfo } = useUserStore();
  //
  // const mobileNavigate = useMobileNavigate();

  return (
    <MobileBusPageWrapper>
      <MobileBusCardSection />
    </MobileBusPageWrapper>
  );
}

const MobileBusPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;
