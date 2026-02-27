import { useEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import styled from "styled-components";
import MobileHeader from "@/containers/mobile/common/MobileHeader";
import { useHeaderConfig } from "@/context/HeaderContext";

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

  // 헤더 설정 로드
  const config = useHeaderConfig(location.pathname);
  const hasSubHeader = !!config.subHeader;

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

  // 헤더 및 네비게이션 높이 계산
  const headerHeight = showHeader ? (hasSubHeader ? 140 : 100) : 20;
  const navHeight = showNav ? 100 : 40;

  return (
    <LayoutContainer id="app-scroll-view">
      <div style={{ position: "relative", minHeight: "100vh" }}>
        {showHeader && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: "768px", // Keep the content width manageable if desired, or remove if truly "web"
              zIndex: 100,
              pointerEvents: "none",
            }}
          >
            <div style={{ pointerEvents: "auto" }}>
              <MobileHeader targetPath={location.pathname as any} />
            </div>
          </div>
        )}

        <div
          style={{
            paddingTop: headerHeight,
            paddingBottom: navHeight,
          }}
        >
          {outlet}
        </div>
      </div>

      {showNav && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "768px",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          <div style={{ pointerEvents: "auto" }}>{/* Nav Component */}</div>
        </div>
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
