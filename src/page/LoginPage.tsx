import styled from 'styled-components';
import LoginSide from '../container/login/LoginSideContainer';
import Login from '../container/login/LoginContainer';

export default function HomePage() {
    
    return (
      <LoginWrapper>
        <LoginSide/>
        <Login/>
      </LoginWrapper>
    );
}

const LoginWrapper = styled.div`
  display: flex;
  flex-direction: row;
`