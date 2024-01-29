import React, { useState } from 'react';
import './LoginDetail.css';

const LoginDetail: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginClick = () => {
    // 로그인 구현
    console.log('로그인', username, password);
  }

  const handleRegisterClick = () => {
    // 회원가입 페이지로 이동 구현
    console.log('회원가입')
  }

  const handleFindIdClick = () => {
    // 아이디 찾기 페이지로 이동 구현
    console.log('아이디 찾기')
  }

  const handleFindPasswordClick = () => {
    // 비밀번호 찾기 페이지로 이동 구현
    console.log('비밀번호 찾기')
  }

  return (
    <>
      <div className='login-detail'>
        <div className='login-text'>로그인</div>
        <input
          type="text"
          placeholder="아이디"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
        <div className="line"></div>
        <input
          type="password"
          placeholder="비밀번호"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <div className="line"></div>

        <div className='login-button' onClick={handleLoginClick}>
          <div className='login-button-text'>로그인</div>
        </div>

        <div className='bottom-container'>
          <div className='bottom-container-text' onClick={handleRegisterClick}>회원가입 &gt;</div>
          <div className='find-container'> 
            <div className='bottom-container-text' onClick={handleFindIdClick}>아이디 찾기</div>
            |
            <div className='bottom-container-text' onClick={handleFindPasswordClick}>비밀번호 찾기</div>
          </div>
        </div>
      </div>
    </>
  )
};

export default LoginDetail;
