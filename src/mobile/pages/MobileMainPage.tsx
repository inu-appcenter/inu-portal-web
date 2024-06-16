import styled from "styled-components";
import MobileNav from "../containers/common/MobileNav";
import MobileHeader from "../containers/common/MobileHeader";
import { Outlet } from "react-router-dom";

export default function MobileMainPage() {
      
  return (
    <MobileMainPageWrapper>
      <header>
        <MobileHeader />
      </header>
      <main style={{flexGrow: 1}}>
        <Outlet />
      </main>
      <nav>
        <MobileNav />
      </nav>
    </MobileMainPageWrapper>
  )
}

const MobileMainPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;