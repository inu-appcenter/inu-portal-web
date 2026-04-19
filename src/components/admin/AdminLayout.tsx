import React, { ReactNode } from "react";
import styled from "styled-components";

import { DESKTOP_MEDIA } from "@/styles/responsive";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <Container>
      <MainContent>
        <ContentWrapper>{children}</ContentWrapper>
      </MainContent>
    </Container>
  );
};

export default AdminLayout;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  width: 100%;

  @media ${DESKTOP_MEDIA} {
    max-width: 1200px;
    margin: 0 auto;
  }
`;
