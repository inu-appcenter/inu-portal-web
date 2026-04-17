import { useEffect, useRef } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";

import MobileHeader from "@/containers/mobile/common/MobileHeader";
import { useHeaderConfig } from "@/context/HeaderContext";
import useMeasuredElementHeight from "@/hooks/useMeasuredElementHeight";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_GUTTER,
  DESKTOP_MEDIA,
} from "@/styles/responsive";

interface SubLayoutProps {
  showHeader?: boolean;
  showNav?: boolean;
  fillsViewportOnDesktop?: boolean;
}

export default function SubLayout({
  showHeader = true,
  showNav = false,
  fillsViewportOnDesktop = false,
}: SubLayoutProps) {
  const location = useLocation();
  const outlet = useOutlet();
  const { setIsScrolled } = useHeaderConfig();
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsScrolled(false);
  }, [location.pathname, setIsScrolled]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY >= 24);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setIsScrolled]);

  const measuredHeaderHeight = useMeasuredElementHeight(headerRef, showHeader);
  const headerHeight = showHeader ? measuredHeaderHeight : 20;
  const navHeight = showNav ? 100 : 40;

  return (
    <LayoutContainer
      id="app-scroll-view"
      $fillsViewportOnDesktop={fillsViewportOnDesktop}
    >
      <ContentShell $fillsViewportOnDesktop={fillsViewportOnDesktop}>
        {showHeader && (
          <HeaderFloating $fillsViewportOnDesktop={fillsViewportOnDesktop}>
            <MobileHeader
              ref={headerRef}
              contained
              targetPath={location.pathname as any}
            />
          </HeaderFloating>
        )}

        <ContentArea
          $pt={headerHeight}
          $pb={navHeight}
          $fillsViewportOnDesktop={fillsViewportOnDesktop}
        >
          {outlet}
        </ContentArea>
      </ContentShell>

      {showNav && <NavFloating>{/* Nav Component */}</NavFloating>}
    </LayoutContainer>
  );
}

const LayoutContainer = styled.div<{ $fillsViewportOnDesktop: boolean }>`
  width: 100%;
  min-height: 100vh;
  position: relative;
  background-color: #f1f1f3;
  margin: 0 auto;

  @media ${DESKTOP_MEDIA} {
    ${({ $fillsViewportOnDesktop }) =>
      $fillsViewportOnDesktop
        ? `
          height: 100dvh;
          min-height: 0;
          overflow: hidden;
        `
        : ""}
  }
`;

const ContentShell = styled.div<{ $fillsViewportOnDesktop: boolean }>`
  position: relative;
  min-height: 100vh;

  @media ${DESKTOP_MEDIA} {
    ${({ $fillsViewportOnDesktop }) =>
      $fillsViewportOnDesktop
        ? `
          height: 100%;
          min-height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        `
        : ""}
  }
`;

const ContentArea = styled.div<{
  $pt: number;
  $pb: number;
  $fillsViewportOnDesktop: boolean;
}>`
  padding-top: ${(props) => props.$pt}px;
  padding-bottom: ${(props) => props.$pb}px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    margin: 0 auto;
    padding-left: ${DESKTOP_GUTTER};
    padding-right: ${DESKTOP_GUTTER};
    ${({ $fillsViewportOnDesktop }) =>
      $fillsViewportOnDesktop
        ? `
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding-top: 0;
          padding-bottom: 20px;

          & > * {
            flex: 1;
            min-height: 0;
          }
        `
        : ""}
  }
`;

const HeaderFloating = styled.div<{ $fillsViewportOnDesktop: boolean }>`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 100;
  pointer-events: none;

  @media ${DESKTOP_MEDIA} {
    ${({ $fillsViewportOnDesktop }) =>
      $fillsViewportOnDesktop
        ? `
          position: relative;
          top: auto;
          left: auto;
          transform: none;
          width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
          max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
          margin: 0 auto;
          padding: 0 ${DESKTOP_GUTTER};
          box-sizing: border-box;
          flex-shrink: 0;
        `
        : `
          width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
          max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
          padding: 0 ${DESKTOP_GUTTER};
          box-sizing: border-box;
        `}
  }
`;

const NavFloating = styled.div`
  position: fixed;
  bottom: 0;
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
    bottom: 20px;
  }
`;
