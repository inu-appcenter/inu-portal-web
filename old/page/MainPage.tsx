import styled from "styled-components";
import { useEffect, useState } from "react";
import Header from "../container/common/HeaderContainer";
import Nav from "../container/common/NavContainer";
import Footer from "../container/common/FooterContainer";
import { Outlet, useLocation } from 'react-router-dom';
import IntroPage from "./IntroPage";

export default function MainPage() {
  const [showIntro, setShowIntro] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== '/') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  useEffect(() => {
    // 세션 스토리지에서 'introShown' 키 확인
    const introShown = sessionStorage.getItem('introShown');
    if (introShown) {
      // 'introShown' 키가 있으면, 새로고침으로 간주하고 IntroPage를 보여주지 않음
      setShowIntro(false);
    } else {
      // 처음 로드시, 'introShown' 키를 세션 스토리지에 추가
      sessionStorage.setItem('introShown', 'true');
      
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const hideFooter = pathname.includes('/tips');

  return (
    <MainPageWrapper>
      <header>
        <Header />
      </header>
      <nav>
        <Nav />
      </nav>
      <main style={{ flexGrow: 1 }}>
        {showIntro ? (<IntroPage />) : (<></>)}
        <Outlet />
        <MobileMargin />
      </main>
      {!hideFooter && ( // 'tips/*' 경로에 없을 때만 Footer 렌더링
        <footer>
          <Footer />
        </footer>
      )}
    </MainPageWrapper>
  );
}

const MainPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 1340px;
`;

const MobileMargin = styled.div`
  @media (max-width: 768px) { /* 모바일 */
    height: 100px;
  }
`;
