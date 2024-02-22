// LoginInput.tsx
import React, {  useState } from 'react';
import { useDispatch } from 'react-redux';
import loginUser from "../../utils/LoginUser";
import { useNavigate } from 'react-router-dom'; // useNavigate 추가
import './logininput.css';
import loginUserImg from '../../resource/assets/login-user.png';
import loginPasswordImg from '../../resource/assets/login-password.png';


// import { useSelector } from "react-redux";

// interface loginInfo {
//   user: {
//     token: string;
//   };
// }

export default function LoginInput() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // useNavigate 추가
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // state에 잘 들어갔는지 확인용 
  // const user = useSelector((state: loginInfo) => state.user);

  // useEffect(() => {
  //   // Log the user state whenever it changes
  //   console.log("Updated user state:", user);
  // }, [user]); // Run this effect when the 'user' state changes


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
