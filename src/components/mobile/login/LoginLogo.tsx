import styled from "styled-components";
import { mobileLoginLogoWithText as logoWithText } from "@/resources/assets/illustrations/login";

export default function LoginLogo() {
  return <LogoImage src={logoWithText} alt="App Logo" />;
}

const LogoImage = styled.img`
  width: 100%;
`;
