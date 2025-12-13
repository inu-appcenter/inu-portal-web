import { ROUTES } from "@/constants/routes";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import IntipLogo from "@/resources/assets/intip-logo.svg";
import NavMenu from "@/components/desktop/common/NavMenu";

export default function Nav() {
  const navigate = useNavigate();

  return (
    <StyledNav>
      <img onClick={() => navigate(ROUTES.ROOT)} src={IntipLogo} alt="INTIP" />
      <NavMenu isInFooter={false} />
    </StyledNav>
  );
}

const StyledNav = styled.nav`
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  img {
    width: 220px;
  }
`;
