import styled from "styled-components";

export default function RegisterTitle() {
    return (
        <>
          <RegisterInputText>회원가입</RegisterInputText>
        </>
    )
}

const RegisterInputText = styled.div`
  font-size: 40px;
  font-weight: 400;
  line-height: 48px;
  letter-spacing: 0em;
  text-align: left;

  color: #0E4D9D;
  margin-bottom: 20px;
    
`