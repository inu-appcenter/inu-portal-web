import Header from "../container/home/HeaderContainer"
import Nav from "../container/home/NavContainer"
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