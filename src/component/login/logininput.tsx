import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../utils/API/Members';
import { tokenUser as tokenUserAction, studentIdUser as studentIdUserAction } from "../../reducer/userSlice";
import './logininput.css';
import loginUserImg from '../../resource/assets/login-user.svg';
import loginPasswordImg from '../../resource/assets/login-password.svg';

export default function LoginInput() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLoginClick = async () => {
    const data = {
      studentId: username,
      password: password
    };

    try {
      const response = await login(data);

      if (response.status === 200) {
        console.log("로그인 성공, 토근이 발급되었습니다.");
        const responseData = response.body.data;
        const token = responseData.accessToken;
        const tokenExpiredTime = responseData.accessTokenExpiredTime;
        const refreshToken = responseData.refreshToken;
        const refreshTokenExpiredTime = responseData.refreshTokenExpiredTime;

        localStorage.setItem('token', token);
        localStorage.setItem('tokenExpiredTime', tokenExpiredTime);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('refreshTokenExpiredTime', refreshTokenExpiredTime);
        
        dispatch(studentIdUserAction({ studentId: username }));
        dispatch(tokenUserAction({ token, tokenExpiredTime, refreshToken, refreshTokenExpiredTime }));

        navigate(-1);
      } else if (response.status === 401) {
        alert("학번 또는 비밀번호가 틀립니다.");
      } else if (response.status === 404) {
        alert("존재하지 않는 회원입니다.")
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLoginClick();
    }
  };

  return (
    <>
      <div className='div-input'>
        <input
          className='login-input'
          type="text"
          placeholder="학번"
          value={username}
          onChange={handleUsernameChange}
        />
        <img src={loginUserImg} alt='loginUserImg' />
      </div>
      <div className="login-input-line"></div>

      <div className='div-input'>
        <input
          className='login-input'
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={handlePasswordChange}
          onKeyDown={handleKeyPress}
        />
        <img src={loginPasswordImg} alt='loginPasswordImg' />
      </div>
      <div className="login-input-line"></div>

      <div className='LoginClickButton' onClick={handleLoginClick}>로그인</div>
    </>
  );
}
