import Footer from "components/common/Footer";
import Header from "components/common/Header";
import Nav from "components/common/Nav";
import IntroPage from "pages/IntroPage";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";

export default function RootPage() {
  const [showIntro, setShowIntro] = useState(true);
  useEffect(() => {
    // 세션 스토리지에서 'introShown' 키 확인
    const introShown = sessionStorage.getItem("introShown");
    if (introShown) {
      // 'introShown' 키가 있으면, 새로고침으로 간주하고 IntroPage를 보여주지 않음
      setShowIntro(false);
    } else {
      // 처음 로드시, 'introShown' 키를 세션 스토리지에 추가
      sessionStorage.setItem("introShown", "true");

      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <RootPageWrapper>
      <Header />
      <Nav />
      <main style={{ minHeight: 1024 }}>
        {showIntro ? <IntroPage /> : <></>}
        <Outlet />
      </main>
      <Footer />
    </RootPageWrapper>
  );
}

const RootPageWrapper = styled.div`
  width: 1440px;
  margin: auto;
`;
