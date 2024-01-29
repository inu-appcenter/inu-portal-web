import React, { useState } from 'react';
import './Login.css';
import LoginDetail from './LoginDetail';

const Login: React.FC = () => {

  return (
    <>
      <div className="login-container">
        <div className="login-left-side">
          <h2>홈페이지 활용법 간단하게 이미지와 함께 배치</h2>
        </div>
        <div className="login-right-side">
          <LoginDetail></LoginDetail>
        </div>
      </div>
    </>
  )
};

export default Login;
