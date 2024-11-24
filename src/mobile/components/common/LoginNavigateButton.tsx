import styled from "styled-components";
import { useNavigate } from "react-router-dom";

export default function LoginNavigateButton() {
  const navigate = useNavigate();

  return (
    <LoginNavigateButtonWrapper onClick={() => navigate("/m/login")}>
      Login
    </LoginNavigateButtonWrapper>
  );
}

const LoginNavigateButtonWrapper = styled.button`
  width: 56px;
  height: 24px;
  border-radius: 8px;
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;
