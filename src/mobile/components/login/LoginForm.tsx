import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "apis/members";
import styled from "styled-components";
import LoginUser from "resources/assets/login/login-user.svg";
import LoginPassword from "resources/assets/login/login-password.svg";
import useUserStore from "stores/useUserStore";
import axios from "axios";

export default function LoginForm() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordType, setPasswordType] = useState<"password" | "text">(
    "password"
  );
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

  const togglePasswordVisibility = () => {
    setPasswordType((prev) => (prev === "password" ? "text" : "password"));
  };

  return (
    <FormWrapper>
      <FormItemWrapper>
        <Label>학번</Label>
        <FormInputWrapper>
          <Input
            type="text"
            placeholder="예) 202100000"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <FormIcon src={LoginUser} alt="LoginUser" />
        </FormInputWrapper>
        <InputLine />
      </FormItemWrapper>
      <FormItemWrapper>
        <Label>비밀번호</Label>
        <FormInputWrapper>
          <Input
            type={passwordType}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <FormIcon
            src={LoginPassword}
            alt="LoginPassword"
            onClick={togglePasswordVisibility}
          />
        </FormInputWrapper>
        <InputLine />
      </FormItemWrapper>
      <LoginButton onClick={handleLogin}>로그인</LoginButton>

      <span className="info">
        인천대학교 포털시스템 계정으로 로그인 할 수 있습니다.
      </span>
    </FormWrapper>
  );
}

const FormWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const FormItemWrapper = styled.div`
  width: 90%;
  max-width: 384px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.div`
  font-size: 18px;
  font-weight: 600;
`;

const FormInputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 0 8px 0 8px;
`;

const Input = styled.input`
  border: none;
  font-size: 18px;
  flex: 1;
`;

const FormIcon = styled.img`
  width: 24px;
`;

const InputLine = styled.div`
  border: 1px solid #969696;
`;

const LoginButton = styled.div`
  width: 90%;
  max-width: 384px;
  height: 56px;
  background: linear-gradient(
    90deg,
    rgba(156, 175, 226, 0.7) 0%,
    rgba(181, 197, 242, 0.7) 55%,
    rgba(156, 175, 226, 0.7) 100%
  );
  color: white;
  border-radius: 16px;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
`;
