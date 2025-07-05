import styled from "styled-components";

// import { useLocation } from "react-router-dom";
// import useMobileNavigate from "hooks/useMobileNavigate.ts";
// import useUserStore from "../../stores/useUserStore.ts";

export default function MobileBusPage() {
  // const location = useLocation();
  // const { userInfo } = useUserStore();
  //
  // const mobileNavigate = useMobileNavigate();

  return <MobileBusPageWrapper>인입런 페이지입니다.</MobileBusPageWrapper>;
}

const MobileBusPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  width: 100%;
`;
