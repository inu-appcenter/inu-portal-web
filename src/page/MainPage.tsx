import { useEffect } from "react";
import Header from "../container/common/HeaderContainer"
import Nav from "../container/common/NavContainer"
import { Outlet, useLocation } from 'react-router-dom';

export default function MainPage() {
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname !== '/home') {
            window.scrollTo(0, 0);
        }
    }, [pathname]);
    return (
        <>
            <header>
                <Header />
            </header>
            <nav>
                <Nav />
            </nav>
            <main>
                <Outlet />
            </main>
        </>

    )
}