import styled from "styled-components";

export default function LoginTitle() {
    return (
        <>
          <LoginInputText>로그인</LoginInputText>
        </>
    )
}

const LoginInputText = styled.div`
  font-family: Inter;
  font-size: 40px;
  font-weight: 500;
  line-height: 48px;
  letter-spacing: 0em;
  text-align: left;
  
  color: #0E4D9D;
  margin-bottom: 20px;
`