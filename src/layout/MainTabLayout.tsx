import { useEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";

import MobileNav from "@/containers/mobile/common/MobileNav";
import MobileHeader from "@/containers/mobile/common/MobileHeader";
import { useHeaderConfig } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import UpperBackgroundImg from "@/resources/assets/mobile-common/upperBackgroundImg.svg";

export default function MainTabLayout({
  showHeader = true,
  showNav = true,
}: {
  showHeader?: boolean;
  showNav?: boolean;
}) {
  const location = useLocation();
  const outlet = useOutlet();
  const { setIsScrolled } = useHeaderConfig();

  const isHome = location.pathname === ROUTES.HOME || location.pathname === "/";

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsScrolled(false);
  }, [location.pathname, setIsScrolled]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop >= 24);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setIsScrolled]);

  const headerHeight = showHeader ? 100 : 20;
  const navHeight = showNav ? 100 : 40;

  return (
    <LayoutContainer id="app-scroll-view" $isHome={isHome}>
      {isHome && <UpperBackground src={UpperBackgroundImg} alt="" />}
      {showHeader && (
        <HeaderFloating>
          <MobileHeader targetPath={location.pathname as any} />
        </HeaderFloating>
      )}
      <ContentArea $pt={headerHeight} $pb={navHeight}>
        {outlet}
      </ContentArea>

      {showNav && (
        <NavFloating>
          <MobileNav />
        </NavFloating>
      )}
    </LayoutContainer>
  );
}

const LayoutContainer = styled.div<{ $isHome: boolean }>`
  width: 100%;
  min-height: 100vh;
  position: relative;
  background-color: #f1f1f3;

  ${(props) =>
    props.$isHome &&
    `
    background: conic-gradient(
      from 85deg at 50.89% 49.77%,
      #cfe9ea 76.62deg,
      #d4e3ef 135.72deg,
      #def 265.16deg,
      #d4e3ef 314.83deg
    );
  `}
`;

const UpperBackground = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
  pointer-events: none;
`;

const ContentArea = styled.div<{ $pt: number; $pb: number }>`
  width: 100%;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  padding-top: ${(props) => props.$pt}px;
  padding-bottom: ${(props) => props.$pb}px;
  box-sizing: border-box;
`;

const HeaderFloating = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 768px;
  z-index: 100;
`;

const NavFloating = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 768px;
  z-index: 100;
`;
