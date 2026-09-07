import styled from "styled-components";
import { intipLogoWordmark } from "@/resources/assets/illustrations/brand";

export default function LoginLogo() {
  return <LogoImage src={intipLogoWordmark} alt="INTIP" />;
}

const LogoImage = styled.img`
  width: 200px;
  height: 100px;
  object-fit: contain;
`;
