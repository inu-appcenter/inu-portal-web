import styled from "styled-components";

const BucheonShuttle = () => {
  return (
    <Wrapper>
      <img src={"/public/Bus/부천송내시간표.jpeg"} />
    </Wrapper>
  );
};

export default BucheonShuttle;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  //padding: 16px;
  //box-sizing: border-box;

  img {
    width: 100%;
    border-radius: 10px;
  }
`;
