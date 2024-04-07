import styled from "styled-components";
import { useEffect } from "react";
import Header from "../container/common/HeaderContainer";
import Nav from "../container/common/NavContainer";
import { Outlet, useLocation } from 'react-router-dom';
export default function MainPage() {
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname !== '/') {
            window.scrollTo(0, 0);
        }
    }, [pathname]);
    return (
        <MainPageWrapper>
            <header>
                <Header />
            </header>
            <nav>
                <Nav />
            </nav>
            <main style={{flexGrow: 1}}>
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
