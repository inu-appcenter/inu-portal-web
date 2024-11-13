import { useState } from "react";
import styled from "styled-components";
import { login } from "apis/members";
import useUserStore from "stores/useUserStore";
import { useNavigate } from "react-router-dom";

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
    try {
      const reponse = await login(studentId, password);
      setTokenInfo(reponse.data);
      navigate(-1);
    } catch (error) {
      console.error("로그인 실패", error);
    }
  };

  return (
    <LoginInputsWrapper>
      <h1>로그인</h1>
      <div>
        <span>
          <input
            type="text"
            placeholder="학번"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </span>
        <span>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </span>
      </div>
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
  align-items: center;
  justify-content: center;

  h1 {
    font-size: 40px;
    font-weight: 400;

    color: #0e4d9d;
    margin: 0;
  }
`;
