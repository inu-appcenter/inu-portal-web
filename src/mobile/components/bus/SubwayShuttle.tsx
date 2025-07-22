import styled from "styled-components";

const MichuholShuttle = () => {
  return (
    <Wrapper>
      <img src={"/public/Bus/등하교셔틀시간표.jpeg"} />
    </Wrapper>
  );
};

export default MichuholShuttle;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;

  img {
    width: 100%;
    border-radius: 10px;
  }
`;
