import { useEffect, useRef } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";

import MobileNav from "@/containers/mobile/common/MobileNav";
import MobileHeader from "@/containers/mobile/common/MobileHeader";
import { useHeaderConfig } from "@/context/HeaderContext";
import useMeasuredElementHeight from "@/hooks/useMeasuredElementHeight";
import { ROUTES } from "@/constants/routes";
import UpperBackgroundImg from "@/resources/assets/mobile-common/upperBackgroundImg.svg";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_GUTTER,
  DESKTOP_MEDIA,
} from "@/styles/responsive";

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
  const headerRef = useRef<HTMLElement | null>(null);

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

  const measuredHeaderHeight = useMeasuredElementHeight(headerRef, showHeader);
  const headerHeight = showHeader ? measuredHeaderHeight : 20;
  const navHeight = showNav ? 100 : 40;

  return (
    <LayoutContainer id="app-scroll-view" $isHome={isHome}>
      {isHome && <UpperBackground src={UpperBackgroundImg} alt="" />}
      {showHeader && (
        <HeaderFloating>
          <MobileHeader
            ref={headerRef}
            targetPath={location.pathname as any}
            contained
          />
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

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    margin: 0 auto;
    padding-left: ${DESKTOP_GUTTER};
    padding-right: ${DESKTOP_GUTTER};
  }
`;

const HeaderFloating = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 100;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
    padding: 0 ${DESKTOP_GUTTER};
    box-sizing: border-box;
  }
`;

const NavFloating = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 100;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
    padding: 0 ${DESKTOP_GUTTER};
    box-sizing: border-box;
    bottom: 20px;
  }
`;
