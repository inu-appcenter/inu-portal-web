import styled from 'styled-components';
import { Routes, Route } from 'react-router-dom';
import LoginImgContainer from '../../container/login/LoginImgContainer';
import LoginDetailContainer from '../../container/login/LoginDetailContainer';
// import RegisterDetailContainer from '../../container/register/RegisterDetailContainer';
import './LoginPage.css';

export default function LoginPage() {

  return (
    <>
      <LoginWrapper>
        <LoginImgContainer />
        <Routes>
          <Route index element={<LoginDetailContainer />} />
          { /*<Route path='register' element={<RegisterDetailContainer />} /> */}
        </Routes>
      </LoginWrapper>
    </>
  )
}
const LoginWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;

  padding-left: 32px;
  padding-right: 32px;
  height: 80vh;
`
