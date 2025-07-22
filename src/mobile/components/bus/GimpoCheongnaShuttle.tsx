import styled from "styled-components";
import 김포청라시간표 from "resources/assets/bus/김포청라시간표.jpeg";

const GimpoCheongnaShuttle = () => {
  return (
    <Wrapper>
      <img src={김포청라시간표} />
    </Wrapper>
  );
};

export default GimpoCheongnaShuttle;

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
