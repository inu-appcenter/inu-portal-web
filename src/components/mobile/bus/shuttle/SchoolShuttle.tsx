import styled from "styled-components";
import ShuttleCardSection from "./ShuttleCardSection.tsx";

const MichuholShuttle = () => {
  return (
    <Wrapper>
      <ShuttleCardSection />
    </Wrapper>
  );
};

export default MichuholShuttle;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding-top: 16px;
  box-sizing: border-box;

  display: flex;
  justify-content: center;

  img {
    width: 100%;
  }
`;
