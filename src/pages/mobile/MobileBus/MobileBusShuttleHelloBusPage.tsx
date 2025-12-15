import styled from "styled-components";
import HelloBus from "@/components/mobile/bus/shuttle/HelloBus.tsx";
import MobileHeader from "../../../containers/mobile/common/MobileHeader.tsx";

const MobileBusShuttleHelloBusPage = () => {
  return (
    <Wrapper>
      <MobileHeader title={"셔틀버스 안내"} />
      <HelloBus />
    </Wrapper>
  );
};

export default MobileBusShuttleHelloBusPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px;
  //padding-top: calc(56px + 16px);
  box-sizing: border-box;

  img {
    width: 100%;
  }
`;
