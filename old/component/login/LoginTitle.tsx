import styled from "styled-components";

export default function LoginTitle() {
    return (
        <>
          <LoginInputText>로그인</LoginInputText>
        </>
    )
}

const LoginInputText = styled.div`
  font-size: 40px;
  font-weight: 400;
  text-align: left;
  
  color: #0E4D9D;
  margin-bottom: 50px;
`