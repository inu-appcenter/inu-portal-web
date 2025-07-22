import styled from "styled-components";
import 사범대셔틀시간표 from "resources/assets/bus/사범대셔틀시간표.jpeg";

const MichuholShuttle = () => {
  return (
    <Wrapper>
      <img src={사범대셔틀시간표} alt={"사범대셔틀시간표"} />
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
