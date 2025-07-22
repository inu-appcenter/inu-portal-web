import styled from "styled-components";

const GimpoCheongnaShuttle = () => {
  return (
    <Wrapper>
      <img src={"/public/Bus/김포청라시간표.jpeg"} />
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
