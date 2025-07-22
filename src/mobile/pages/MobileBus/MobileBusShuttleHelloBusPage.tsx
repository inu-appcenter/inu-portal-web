import styled from "styled-components";
import HelloBus from "../../components/bus/HelloBus.tsx";

const MobileBusShuttleHelloBusPage = () => {
  return (
    <Wrapper>
      <HelloBus />
    </Wrapper>
  );
};

export default MobileBusShuttleHelloBusPage;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;

  img {
    width: 100%;
  }
`;
