import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import MobileNav from '../containers/common/MobileNav';
import MobileHeader from '../containers/common/MobileHeader';
import MobileWritePage from './MobileWritePage';
// import MobileSavePage from './MobileSavePage';
// import MobileMypage from './MobileMypage';
import MobileLoginPage from './MobileLoginPage';

const Page = styled.div<{ $active: boolean }>`
  display: ${props => (props.$active ? 'block' : 'none')};
  width: 100%;
  height: 100%;
`;

export default function MobileMainPage() {
  const location = useLocation();
  const [activePage, setActivePage] = useState('/m');
  const [pagesLoaded, setPagesLoaded] = useState<Record<string, boolean>>({
    home: true,
    write: false,
    save: false,
    mypage: false,
    login: false,
  });

  useEffect(() => {
    const path = location.pathname.split('/')[2] || 'home';
    setActivePage(location.pathname);
    if (path && !pagesLoaded[path]) {
      setPagesLoaded(prevState => ({
        ...prevState,
        [path]: true,
      }));
    }
  }, [location.pathname, pagesLoaded]);

  const isLoginPage = location.pathname === '/m/login';

  return (
    <MobileMainPageWrapper>
      {!isLoginPage && (
        <header>
          <MobileHeader />
        </header>
      )}
      <main style={{ flexGrow: 1 }}>
        <Page $active={activePage.includes('/m/home')}>
        </Page>
        {pagesLoaded.write && (
          <Page $active={activePage.includes('/m/write')}>
            <MobileWritePage />
          </Page>
        )}
        {pagesLoaded.save && (
          <Page $active={activePage.includes('/m/save')}>
            { /* <MobileSavePage /> */}
          </Page>
        )}
        {pagesLoaded.mypage && (
          <Page $active={activePage.includes('/m/mypage')}>
            {/* <MobileMypage /> */}
          </Page>
        )}
        {pagesLoaded.login && (
          <Page $active={activePage === '/m/login'}>
            <MobileLoginPage />
          </Page>
        )}
      </main>
      {!isLoginPage && (
        <nav>
          <MobileNav />
        </nav>
      )}
    </MobileMainPageWrapper>
  );
}

const MobileMainPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;
