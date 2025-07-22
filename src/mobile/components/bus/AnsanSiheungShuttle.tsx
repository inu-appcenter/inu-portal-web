import styled from "styled-components";

const AnsanSiheungShuttle = () => {
  return (
    <Wrapper>
      <img src={"/public/Bus/안산시흥시간표.jpeg"} />
    </Wrapper>
  );
};

export default AnsanSiheungShuttle;

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
