import styled from "styled-components";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MobileIntroPage from "mobile/pages/MobileIntroPage";
import MobileHeader from "mobile/containers/common/MobileHeader";
import MobileNav from "mobile/containers/common/MobileNav";
import MobileHomePage from "mobile/pages/MobileHomePage";
import MobileTipsPage from "mobile/pages/MobileTipsPage";
import MobileSavePage from "mobile/pages/MobileSavePage";
import MobileWritePage from "mobile/pages/MobileWritePage";
import MobileLoginPage from "mobile/pages/MobileLoginPage";
import MobilePostDetailPage from "mobile/pages/MobilePostDetailPage";
import MobileCouncilNoticeDetailPage from "mobile/pages/MobileCouncilNoticeDetailPage";
import MobilePetitionDetailPage from "mobile/pages/MobilePetitionDetailPage";
import MobileMapPage from "mobile/pages/MobileMapPage";
import MobileCouncilPage from "mobile/pages/MobileCouncilPage";
import MobileUtilPage from "mobile/pages/MobileUtilPage";
import UpperBackgroundImg from "resources/assets/mobile-common/upperBackgroundImg.svg";
import MobileMyPage from "mobile/pages/MobileMyPage";
import MobileProfilePage from "mobile/pages/MobileProfilePage";
import MobileMenuPage from "mobile/pages/MobileMenuPage";
import MobileMyPagePost from "mobile/pages/MobileMyPagePost";
import MobileMyPageComment from "mobile/pages/MobileMyPageComment";
import MobileMyPageLike from "mobile/pages/MobileMyPageLike";
import MobileDeletePage from "mobile/pages/MobileDelete";
import MobileCalendarPage from "mobile/pages/MobileCalendarPage";
import useAppStateStore from "stores/useAppStateStore";
import MobileRentalPage from "mobile/pages/MobileRentalPage";
import MobileClubPage from "./MobileClubPage";

const Page = styled.div<{ $active: boolean }>`
  display: ${(props) => (props.$active ? "flex" : "none")};
  width: 100%;
  height: 100%;
  justify-content: center;
`;

export default function MobileRootPage() {
  const { setIsAppUrl } = useAppStateStore();

  useEffect(() => {
    setIsAppUrl("/m"); // MobileRootPage에 진입하면 isAppUrl 상태 설정
  }, [setIsAppUrl]);

  const [showIntro, setShowIntro] = useState(true);
  const location = useLocation();
  const [activePage, setActivePage] = useState("/m");
  const [pagesLoaded, setPagesLoaded] = useState<Record<string, boolean>>({
    home: true,
    menu: false,
    tips: false,
    write: false,
    save: false,
    mypage: false,
    login: false,
  });

  useEffect(() => {
    // 세션 스토리지에서 'introShown' 키 확인
    const introShown = sessionStorage.getItem("introShown");
    if (introShown) {
      // 'introShown' 키가 있으면, 새로고침으로 간주하고 IntroPage를 보여주지 않음
      setShowIntro(false);
    } else {
      // 처음 로드시, 'introShown' 키를 세션 스토리지에 추가
      sessionStorage.setItem("introShown", "true");

      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const path = location.pathname.split("/")[2] || "home";
    setActivePage(location.pathname);
    if (path && !pagesLoaded[path]) {
      setPagesLoaded((prevState) => ({
        ...prevState,
        [path]: true,
      }));
    }
  }, [location.pathname, pagesLoaded]);

  const isLoginPage = location.pathname === "/m/login";
  const isPostDetailPage =
    location.pathname.includes("/m/postdetail") ||
    location.pathname.includes("/m/councilnoticedetail") ||
    location.pathname.includes("/m/petitiondetail");
  return (
    <MobileRootPageWrapper>
      <UpperBackground src={UpperBackgroundImg} />
      {showIntro && <MobileIntroPage />}
      {!isLoginPage && !isPostDetailPage && <MobileHeader />}
      <main>
        <Page
          $active={
            activePage.includes("/m/home") &&
            !activePage.includes("/m/home/tips") &&
            !activePage.includes("/m/home/menu") &&
            !activePage.includes("/m/home/calendar") &&
            !activePage.includes("/m/home/map") &&
            !activePage.includes("/m/home/council") &&
            !activePage.includes("/m/home/club") &&
            !activePage.includes("/m/home/util")
          }
        >
          <MobileHomePage />
        </Page>
        <Page $active={activePage.includes("/m/home/menu")}>
          <MobileMenuPage />
        </Page>
        <Page $active={activePage.includes("/m/home/calendar")}>
          <MobileCalendarPage />
        </Page>
        <Page $active={activePage.includes("/m/home/tips")}>
          <MobileTipsPage />
        </Page>
        <Page $active={activePage.includes("/m/home/map")}>
          <MobileMapPage />
        </Page>
        <Page $active={activePage.includes("/m/rental")}>
          <MobileRentalPage />
        </Page>
        <Page $active={activePage.includes("/m/postdetail")}>
          <MobilePostDetailPage />
        </Page>
        <Page $active={activePage.includes("/m/home/council")}>
          <MobileCouncilPage />
        </Page>
        <Page $active={activePage.includes("/m/home/club")}>
          <MobileClubPage />
        </Page>
        <Page $active={activePage.includes("/m/home/util")}>
          <MobileUtilPage />
        </Page>
        <Page $active={activePage.includes("/m/councilnoticedetail")}>
          <MobileCouncilNoticeDetailPage />
        </Page>
        <Page $active={activePage.includes("/m/petitiondetail")}>
          <MobilePetitionDetailPage />
        </Page>
        {pagesLoaded.write && (
          <Page $active={activePage.includes("/m/write")}>
            <MobileWritePage />
          </Page>
        )}
        {pagesLoaded.save && (
          <Page $active={activePage.includes("/m/save")}>
            <MobileSavePage />
          </Page>
        )}
        {pagesLoaded.mypage ? (
          activePage.includes("/m/mypage/profile") ? (
            <Page $active={activePage.includes("/m/mypage/profile")}>
              <MobileProfilePage />
            </Page>
          ) : activePage.includes("/m/mypage/post") ? (
            <MobileMyPagePost />
          ) : activePage.includes("/m/mypage/like") ? (
            <MobileMyPageLike />
          ) : activePage.includes("/m/mypage/comment") ? (
            <MobileMyPageComment />
          ) : activePage.includes("/m/mypage/delete") ? (
            <MobileDeletePage />
          ) : (
            <Page $active={activePage.includes("/m/mypage")}>
              <MobileMyPage />
            </Page>
          )
        ) : null}
        {pagesLoaded.login && (
          <Page $active={activePage === "/m/login"}>
            <MobileLoginPage />
          </Page>
        )}
      </main>
      {!isLoginPage && !isPostDetailPage && <MobileNav />}
    </MobileRootPageWrapper>
  );
}

const MobileRootPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 72px; // Nav
  overflow-y: auto;
`;

const UpperBackground = styled.img`
  position: absolute;
  z-index: -1;
  width: 100%;
`;
