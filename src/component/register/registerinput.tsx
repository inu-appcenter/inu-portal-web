// RegisterInput.tsx
import React, { useState } from 'react';
import registerUser from "../../utils/RegisterUser";
import { useNavigate } from 'react-router-dom';

export default function RegisterInput() {
  // 확인: 유저가 클라이언트(웹 브라우저) 상에서 verificationStatus를 임의로 바꿀 수 있기 때문에, 인증번호확인 때 얻은 token을 회원가입할 때 같이 서버로 전송해야 할 듯 (현재는 이메일과 비밀번호만 전송)
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationStatus, setVerificationStatus] = useState("notVerified");

  const navigate = useNavigate();

  const handleVerifyEmail = () => {
    if (email.endsWith('@inu.ac.kr')) {
      // 인증번호 발송 API 호출 구현 필요
      setVerificationStatus("emailVerified");
    } else {
      alert('인천대학교 이메일(@inu.ac.kr)을 사용해주세요.');
    }
  };

  const handleVerifyCode = () => {
    const token = '인증번호확인API(email, verificationCode)' // (임시로 토큰 반환됐다고 가정) 인증번호 확인 API 호출 구현 필요
    if (token) {
      setVerificationStatus("codeVerified");
    } else {
      alert('인증 실패');
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    const data = {
      email: email,
      password: password
    };

    try {
      const token = await registerUser(data);

      if (token) {
        alert(email+'회원가입 성공');
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
        <div>
          <input type="email" value={email} readOnly />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 재확인"
          />
          <button onClick={handleRegister}>가입하기</button>
        </div>
      );
    case "emailVerified":
      return (
        <div>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="인증번호 입력"
          />
          <button onClick={handleVerifyCode}>인증번호 확인</button>
        </div>
      );
    case "notVerified":
    default:
      return (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 입력"
          />
          <button onClick={handleVerifyEmail}>인증하기</button>
        </div>
      );
  }
}
