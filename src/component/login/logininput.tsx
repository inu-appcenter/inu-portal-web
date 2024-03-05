// LoginInput.tsx
import React, {  useState } from 'react';
import { useDispatch } from 'react-redux';
import loginUser from "../../utils/LoginUser";
import { useNavigate } from 'react-router-dom'; // useNavigate 추가
import './logininput.css';
import loginUserImg from '../../resource/assets/login-user.png';
import loginPasswordImg from '../../resource/assets/login-password.png';



export default function LoginInput() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // useNavigate 추가
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");




  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Username changed:', e.target.value);
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Password changed:', e.target.value);
    setPassword(e.target.value);
  };

  const handleLoginClick = async () => {
    console.log('로그인', username, password);
    const data = {
      email: username,
      password: password
    };

    try {
      const token = await loginUser(dispatch, data);

      if (token) {
        navigate('/');
      }

    } catch (error) {
      console.error('로그인 에러:', error);
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
          type="text"  // Corrected from "username" to "text"
          placeholder="이메일"
          value={username}
          onChange={handleUsernameChange}
        />
        <img src={loginUserImg} alt='loginUserImg'></img>
      </div>
        <div className="line"></div>

      <div className='div-input'>
        <input
          className='login-input'
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={handlePasswordChange}
          onKeyDown={handleKeyPress}
        />
        <img src={loginPasswordImg} alt='loginPasswordImg'></img>
      </div>
      <div className="line"></div>

      <div className='LoginClickButton' onClick={handleLoginClick}>로그인</div>
    </>
  );
}
