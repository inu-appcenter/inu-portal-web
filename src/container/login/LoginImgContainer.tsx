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
    background: linear-gradient(90deg, #C6D8F3 0%, #91A7E3 100%);
    border-radius: 40px 0px 0px 0px;
    height: 100%;
    width: 769px;
`



