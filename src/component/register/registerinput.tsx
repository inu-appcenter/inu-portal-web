// RegisterInput.tsx
import React, { useState } from 'react';
import registerUser from "../../utils/RegisterUser";
import { useNavigate } from 'react-router-dom';
import './registerinput.css';
import loginUserImg from '../../resource/assets/login-user.png';
import loginPasswordImg from '../../resource/assets/login-password.png';
import sendMail from '../../utils/sendMail';
import checkMail from '../../utils/checkMail';

export default function RegisterInput() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [verificationStatus, setVerificationStatus] = useState("notVerified");

  const navigate = useNavigate();

  const handleVerifyEmail = async () => {
    if (email.endsWith('@inu.ac.kr')) {
      try {
        const response = await sendMail(email);
        console.log(response);
        if (response.data === email) {
          setVerificationStatus("emailVerified");
        }
      }
      catch (error) {
        alert(error);
      }
    } else {
      alert('인천대학교 이메일(@inu.ac.kr)을 사용해주세요.');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await checkMail(email, verificationCode);
      console.log(response);
      if (response.data) {
        setVerificationStatus("codeVerified");
      }
      else {
        alert('인증번호가 일치하지 않습니다.');
      }
    }
    catch (error) {
      alert(error);
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    const data = {
      email: email,
      password: password,
      nickname: nickname
    };
    console.log(data);
    try {
      const token = await registerUser(data);

      if (token) {
        alert(email+' 회원가입 성공');
        navigate('/login');
      }
    } catch (error) {
      alert('회원가입 에러');
      console.error('회원가입 에러:', error);
    }

  };

  switch (verificationStatus) {
    case "codeVerified":
      return (
        <div className='register-input-wrapper'>
          <div className='div-input'>
            <input
              className='register-input' type="email" value={email} readOnly />
              <img src={loginUserImg} alt='loginUserImg'></img>
          </div>
          <div className='register-input-line'></div>
          <div className='div-input'>
            <input
              className='register-input'
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
            />
            <img src={loginPasswordImg} alt='loginPasswordImg'></img>
          </div>
          <div className='register-input-line'></div>
          <div className='div-input'>
            <input
              className='register-input'
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 재확인"
            />
            <img src={loginPasswordImg} alt='loginPasswordImg'></img>
          </div>
          <div className='register-input-line'></div>
          <div className='div-input'>
            <input
              className='register-input'
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 입력"
            />
          </div>
          <div className='register-input-line'></div>
          <div className='RegisterClickButton' onClick={handleRegister}>가입하기</div>
        </div>
      );
    case "emailVerified":
      return (
        <div className='register-input-wrapper'>
          <div className='div-input'>
            <input
              className='register-input'
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="인증번호 입력"
            />
          </div>
          <div className='register-input-line'></div>
          <div className='RegisterClickButton' onClick={handleVerifyCode}>인증번호 확인</div>
        </div>
      );
    case "notVerified":
    default:
      return (
        <div className='register-input-wrapper'>
          <div className='div-input'>
            <input
              className='register-input'
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="학교 이메일"
            />
            {/* <img src={loginUserImg} alt='loginUserImg'></img> */}
          </div>
          <div className='register-input-line'></div>
          <div className='RegisterClickButton' onClick={handleVerifyEmail}>인증하기</div>
        </div>
      );
  }
}
