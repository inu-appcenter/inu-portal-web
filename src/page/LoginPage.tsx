import styled from 'styled-components';
import LoginImgContainer from '../container/login/LoginImgContainer';
import LoginDetailContainer from '../container/login/LoginDetailContainer';

export default function LoginPage() {

  return (
    <>
      <LoginWrapper>
        <LoginImgContainer/>
        <LoginDetailContainer/>
      </LoginWrapper>
    </>
  )
};

const LoginWrapper = styled.div `
  display: flex;
  flex-direction: row;

  padding-top: 200px; // 임시 (나중에 MainPage에서 위치 조절 필요)
`
