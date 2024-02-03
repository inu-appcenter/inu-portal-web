import { useState } from 'react';
import styled from 'styled-components';
import UserIdInput from '../../component/login/UserIdInput';
import UserPasswordInput from '../../component/login/UserPasswordInput';
import LoginButton from '../../component/login/LoginButton';
import RegisterButton from '../../component/login/RegisterButton';
import FindUserIdButton from '../../component/login/FindUserIdButton';
import FindPasswordButton from '../../component/login/FindPasswordButton';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const handleUserIdInputChange = (userId: string) => {
    setUserId(userId);
  }

  const handleUserPasswordInputChange = (userPassword: string) => {
    setUserPassword(userPassword);
  }

  const handleLoginButtonClick = () => {
    // 로그인 구현
    alert('로그인' + userId + userPassword);
  }

  const handleRegisterButtonClick = () => {
    // 회원가입 페이지로 이동 구현
    alert('회원가입');
  }

  const handleFindUserIdButtonClick = () => {
    // 아이디 찾기 페이지로 이동 구현
    alert('아이디 찾기');
  }

  const handleFindPasswordButtonClick = () => {
    // 비밀번호 찾기 페이지로 이동 구현
    alert('비밀번호 찾기');
  }

  return (
    <LoginContainer>
      <h3>로그인</h3>
      <UserIdInput onInputChange={handleUserIdInputChange}/>
      <UserPasswordInput onInputChange={handleUserPasswordInputChange} />
      <LoginButton onButtonClick={handleLoginButtonClick} />
      <RegisterButton onButtonClick={handleRegisterButtonClick} />
      <FindUserIdButton onButtonClick={handleFindUserIdButtonClick} />
      <FindPasswordButton onButtonClick={handleFindPasswordButtonClick} />
    </LoginContainer>
  )
}

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
`;