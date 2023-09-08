import Header from "../container/common/HeaderContainer"
import Nav from "../container/common/NavContainer"
import { Outlet } from 'react-router-dom';

export default function MainPage() {
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