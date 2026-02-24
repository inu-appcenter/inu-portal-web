import styled from "styled-components";

export default function TermOfUse() {
  return (
    <StyledDiv>
      로그인 시{" "}
      <a href="/terms-of-use.html" target="_blank" rel="noopener noreferrer">
        이용약관
      </a>{" "}
      및{" "}
      <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">
        개인정보 처리방침
      </a>
      에 동의한 것으로 간주됩니다.
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  width: 100%;
`;
