import styled from "styled-components";
import logoWithText from "@/resources/assets/mobile-login/logo-with-text.webp";

export default function LoginLogo() {
  return <LogoImage src={logoWithText} alt="App Logo" />;
}

const LogoImage = styled.img`
  width: 100%;
`;
