import LoginImage from '../../component/login/loginimg';
import styled from 'styled-components';
export default function LoginImg () {


  return (
    <LoginImageWrapper>
      <LoginImage/>
    </LoginImageWrapper>
  );

}

const LoginImageWrapper = styled.div`
    background-color: #0E4D9D;
    border-radius: 40px 0px 0px 0px;
    height: 100%;
    width: 769px;
`



