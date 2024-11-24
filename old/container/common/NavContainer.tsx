import styled from "styled-components"
import Navbar from "../../component/common/Navbar"

export default function Nav() {
    return (
        <NavbarWrapper>
            <Navbar />
        </NavbarWrapper>
    )
}

const NavbarWrapper = styled.div`
    margin:0 3rem;
`