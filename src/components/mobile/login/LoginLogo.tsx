import styled from "styled-components";
import logoWithText from "@/resources/assets/mobile-login/logo-with-text.svg";

export default function LoginLogo() {
  return <LogoImage src={logoWithText} alt="App Logo" />;
}

const LogoImage = styled.img`
  width: 75%;
`;
