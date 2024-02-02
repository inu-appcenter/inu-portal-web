import React from 'react';
import LoginDetail from '../container/login/LoginDetailContainer';
import LoginImg from '../container/login/LoginImgContainer';
import LoginTitle from '../component/login/logintitle';

const Login: React.FC = () => {

  return (
    <>
      <div className="login-container">
        <LoginImg/>
        <LoginTitle/>
        <LoginDetail/>
      </div>
    </>
  )
};

export default Login;
