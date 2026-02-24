import styled from "styled-components";
import 부천송내시간표 from "@/resources/assets/bus/부천송내시간표.jpeg";

const BucheonShuttle = () => {
  return (
    <Wrapper>
      <img src={부천송내시간표} />
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
