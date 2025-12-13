import styled from "styled-components";
import useMobileNavigate from "@/hooks/useMobileNavigate";

export default function LoginNavigateButton() {
  const mobileNavigate = useMobileNavigate();

  return (
    <LoginNavigateButtonWrapper onClick={() => mobileNavigate("/login")}>
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
  color: black;
`;
