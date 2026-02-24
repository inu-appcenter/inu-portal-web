import { useEffect, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // 경로 고정
  const [frozenPath] = useState(location.pathname);

  // 헤더 설정 로드
  const config = useHeaderConfig(frozenPath);
  const hasSubHeader = !!config.subHeader;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setIsScrolled(false);
  }, [frozenPath, setIsScrolled]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop >= 24);
  };

  // 헤더 및 네비게이션 높이 계산
  const headerHeight = showHeader ? (hasSubHeader ? 140 : 100) : 20;
  const navHeight = showNav ? 100 : 40;

  return (
    <LayoutContainer>
      <ScrollArea
        id="app-scroll-view" // 인피니티 스크롤 타겟 ID
        ref={scrollRef}
        onScroll={handleScroll}
        $paddingTop={0}
        $paddingBottom={0}
      >
        <div style={{ position: "relative", minHeight: "100%" }}>
          {showHeader && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                zIndex: 100,
                pointerEvents: "none",
              }}
            >
              <div style={{ pointerEvents: "auto" }}>
                <MobileHeader targetPath={frozenPath} />
              </div>
            </div>
          )}

          <div
            style={{
              paddingTop: headerHeight,
              paddingBottom: navHeight,
              transition: "padding-top 0.2s ease",
            }}
          >
            {outlet}
          </div>
        </div>
      </ScrollArea>

      {showNav && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
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
  height: 100%;
  position: relative;
  background-color: #f1f1f3;
`;

const ScrollArea = styled.div<{ $paddingTop: number; $paddingBottom: number }>`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
  }
`;
