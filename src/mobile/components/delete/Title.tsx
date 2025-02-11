import styled from "styled-components";

export default function Title() {
  return (
    <TitleWrapper>
      <h1>회원탈퇴</h1>
    </TitleWrapper>
  );
}

const TitleWrapper = styled.div`
  margin: 28px auto;
  h1 {
    font-size: 32px;
    font-weight: 700;
    line-height: 20px;
  }
`;
