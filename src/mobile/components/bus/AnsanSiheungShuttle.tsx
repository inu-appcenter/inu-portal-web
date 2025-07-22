import styled from "styled-components";

import 안산시흥시간표 from "resources/assets/bus/안산시흥시간표.jpeg";

const AnsanSiheungShuttle = () => {
  return (
    <Wrapper>
      <img src={안산시흥시간표} />
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
