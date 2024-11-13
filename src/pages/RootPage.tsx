import Footer from "components/common/Footer";
import Header from "components/common/Header";
import Nav from "components/common/Nav";
import { Outlet } from "react-router-dom";
import styled from "styled-components";

export default function RootPage() {
  return (
    <RootPageWrapper>
      <Header />
      <Nav />
      <main>
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
