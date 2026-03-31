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
}

export default function SubLayout({
  showHeader = true,
  showNav = false,
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
    <LayoutContainer id="app-scroll-view">
      <ContentShell>
        {showHeader && (
          <HeaderFloating>
            <MobileHeader
              ref={headerRef}
              contained
              targetPath={location.pathname as any}
            />
          </HeaderFloating>
        )}

        <ContentArea $pt={headerHeight} $pb={navHeight}>
          {outlet}
        </ContentArea>
      </ContentShell>

      {showNav && (
        <NavFloating>
          {/* Nav Component */}
        </NavFloating>
      )}
    </LayoutContainer>
  );
}

const LayoutContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  background-color: #f1f1f3;
  margin: 0 auto;
`;

const ContentShell = styled.div`
  position: relative;
  min-height: 100vh;
`;

const ContentArea = styled.div<{ $pt: number; $pb: number }>`
  padding-top: ${(props) => props.$pt}px;
  padding-bottom: ${(props) => props.$pb}px;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    margin: 0 auto;
    padding-left: ${DESKTOP_GUTTER};
    padding-right: ${DESKTOP_GUTTER};
    box-sizing: border-box;
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

