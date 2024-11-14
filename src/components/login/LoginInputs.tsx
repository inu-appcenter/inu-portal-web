import { useState } from "react";
import styled from "styled-components";
import { login } from "apis/members";
import useUserStore from "stores/useUserStore";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import loginUser from "resources/assets/login/login-user.svg";
import loginPassword from "resources/assets/login/login-password.svg";

export default function LoginInputs() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const { setTokenInfo } = useUserStore();
  const navigate = useNavigate();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    if (!studentId || !password) {
      alert("학번과 비밀번호를 입력해주세요.");
      return;
    }
    try {
      const reponse = await login(studentId, password);
      setTokenInfo(reponse.data);
      navigate(-1);
    } catch (error) {
      console.error("로그인 실패", error);
      if (axios.isAxiosError(error) && error.response) {
        switch (error.response.status) {
          case 401:
            alert("학번 또는 비밀번호가 틀립니다.");
            break;
          default:
            alert("로그인 실패");
            break;
        }
      }
    }
  };

  return (
    <LoginInputsWrapper>
      <h1>로그인</h1>
      <span>
        <input
          type="text"
          placeholder="학번"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <img src={loginUser} alt="" />
      </span>
      <span>
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <img src={loginPassword} alt="" />
      </span>
      <button onClick={handleLogin}>로그인</button>
    </LoginInputsWrapper>
  );
}

const LoginInputsWrapper = styled.div`
  flex-grow: 1;
  z-index: 2;
  height: 100%;
  border-radius: 40px 0px 0px 40px;
  background-color: white;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 48px;

  padding: 0 72px;

  h1 {
    font-size: 40px;
    font-weight: 400;

    color: #0e4d9d;
    margin: 0;
  }
  span {
    border-bottom: 1px solid rgba(150, 150, 150, 1);
    display: flex;
    align-items: center;
    input {
      flex: 1;
      border: none;
      font-size: 20px;
      margin: 8px;
    }
    img {
      margin: 8px;
      width: 24px;
    }
  }
  button {
    height: 48px;
    background: linear-gradient(
      90deg,
      rgba(156, 175, 226, 0.7) 0%,
      rgba(181, 197, 242, 0.7) 55%,
      rgba(156, 175, 226, 0.7) 100%
    );
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 24px;
    color: white;
  }
`;
