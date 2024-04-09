import styled from "styled-components";
import { useEffect, useState } from "react";
import Header from "../container/common/HeaderContainer";
import Nav from "../container/common/NavContainer";
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
        const timer = setTimeout(() => {
          setShowIntro(false);
        }, 3000);
    
        return () => clearTimeout(timer);
      }, [])
      
    return (
        <MainPageWrapper>
            <header>
                <Header />
            </header>
            <nav>
                <Nav />
            </nav>
            <main style={{flexGrow: 1}}>
                {showIntro ? (<IntroPage/>) : (<></>)}
                <Outlet />
            </main>
        </MainPageWrapper>

    )
}

const MainPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
    height: 100vh;
  overflow-y: scroll;
`;
