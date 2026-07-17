import { useEffect, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";

import MobileNav from "@/containers/mobile/common/MobileNav";
import MobileBottomNav, { BOTTOM_NAV_HEIGHT } from "@/containers/mobile/common/MobileBottomNav";
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
  const { setIsScrolled, pageBgColor } = useHeaderConfig(location.pathname);
  const headerRef = useRef<HTMLElement | null>(null);

  const isHome =
    location.pathname === ROUTES.HOME ||
    location.pathname === ROUTES.MOBILE_HOME ||
    location.pathname === "/" ||
    location.pathname === ROUTES.HOME_V2;

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

  const [isV2Mode, setIsV2Mode] = useState(false);

  useEffect(() => {
    if (location.pathname === ROUTES.HOME_V2) {
      setIsV2Mode(true);
    } else if (
      location.pathname === ROUTES.HOME ||
      location.pathname === ROUTES.MOBILE_HOME ||
      location.pathname === "/"
    ) {
      setIsV2Mode(false);
    }
  }, [location.pathname]);

  const navHeight = showNav
    ? isV2Mode
      ? `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`
      : "100px"
    : "40px";

  return (
    <LayoutContainer
      id="app-scroll-view"
      $isHome={isHome}
      $pageBgColor={pageBgColor}
      style={{
        "--header-height": `${headerHeight + (isHome ? 0 : 12)}px`,
        "--nav-height": navHeight,
      } as React.CSSProperties}
    >
      {isHome && (
        <HomeBackground aria-hidden="true">
          <UpperBackground src={UpperBackgroundImg} alt="" />
        </HomeBackground>
      )}
      {showHeader && (
        <HeaderFloating>
          <MobileHeader
            ref={headerRef}
            targetPath={location.pathname as any}
            contained
          />
        </HeaderFloating>
      )}
      <ContentArea $isV2Home={location.pathname === ROUTES.HOME_V2}>
        {outlet}
      </ContentArea>

      {showNav && (
        <NavFloating $isHomeV2={isV2Mode}>
          {isV2Mode ? <MobileBottomNav /> : <MobileNav />}
        </NavFloating>
      )}
    </LayoutContainer>
  );
}

const LayoutContainer = styled.div<{ $isHome: boolean; $pageBgColor?: string }>`
  width: 100%;
  min-height: 100vh;
  position: relative;
  isolation: isolate;
  background-color: ${(props) => props.$pageBgColor ?? (props.$isHome ? "transparent" : "#f1f1f3")};
`;

const HomeBackground = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(
      76% 58% at 92% 88%,
      rgba(207, 233, 234, 0.94) 0%,
      rgba(207, 233, 234, 0) 100%
    ),
    radial-gradient(
      64% 48% at 86% 14%,
      rgba(212, 227, 239, 0.88) 0%,
      rgba(212, 227, 239, 0) 100%
    ),
    radial-gradient(
      82% 58% at 18% 18%,
      rgba(221, 238, 255, 0.9) 0%,
      rgba(221, 238, 255, 0) 100%
    ),
    linear-gradient(180deg, #f4fbff 0%, #edf6ff 48%, #f3f9ff 100%);
`;

const UpperBackground = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-width: none;
  opacity: 0.72;
`;

const ContentArea = styled.div<{ $isV2Home?: boolean }>`
  width: 100%;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    width: ${({ $isV2Home }) => ($isV2Home ? "100%" : `min(100%, ${DESKTOP_CONTENT_MAX_WIDTH})`)};
    margin: 0 auto;
    padding-left: ${({ $isV2Home }) => ($isV2Home ? "0" : DESKTOP_GUTTER)};
    padding-right: ${({ $isV2Home }) => ($isV2Home ? "0" : DESKTOP_GUTTER)};
  }
`;

const HeaderFloating = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 100;
  pointer-events: none;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
    padding: 0 ${DESKTOP_GUTTER};
    box-sizing: border-box;
  }
`;

const NavFloating = styled.div<{ $isHomeV2?: boolean }>`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 100;
  pointer-events: none;

  @media ${DESKTOP_MEDIA} {
    width: ${({ $isHomeV2 }) => ($isHomeV2 ? "100%" : `min(100%, ${DESKTOP_CONTENT_MAX_WIDTH})`)};
    max-width: ${({ $isHomeV2 }) => ($isHomeV2 ? "none" : DESKTOP_CONTENT_MAX_WIDTH)};
    padding: ${({ $isHomeV2 }) => ($isHomeV2 ? "0" : `0 ${DESKTOP_GUTTER}`)};
    box-sizing: border-box;
    bottom: ${({ $isHomeV2 }) => ($isHomeV2 ? "0" : "20px")};
  }
`;
