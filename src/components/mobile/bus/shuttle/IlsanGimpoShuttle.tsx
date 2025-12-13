import styled from "styled-components";
import 일산김포시간표 from "@/resources/assets/bus/일산김포시간표.jpeg";

const IlsanGimpoShuttle = () => {
  return (
    <Wrapper>
      <img src={일산김포시간표} />
    </Wrapper>
  );
};

export default IlsanGimpoShuttle;

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
