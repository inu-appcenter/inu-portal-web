import { useState, useEffect } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import MobileIntroPage from "./MobileIntroPage";
import MobileHeader from "../containers/common/MobileHeader";
import MobileNav from "../containers/common/MobileNav";
import MobileHomePage from "./MobileHomePage";
import MobileTipsPage from "./MobileTipsPage";
import MobileSavePage from "./MobileSavePage";
import MobileWritePage from "./MobileWritePage";
// import MobileMypage from './MobileMypage';
import MobileLoginPage from "./MobileLoginPage";
import { usePreviousPage } from "../../hooks/usePreviousPage";
import MobilePostDetailPage from "./MobilePostDetailPage";
import UpperBackgroundImg from "../../resource/assets/mobile/common/upperBackgroundImg.svg";
import MobileMyPage from "./MobileMyPage";
import MobileProfilePage from "./MobileProfilePage";
import MobileMenuPage from "./MobileMenuPage";
import MobileMyPagePost from "./MobileMyPagePost";
import MobileMyPageComment from "./MobileMyPageComment";
import MobileMyPageLike from "./MobileMyPageLike";
import MobileDeletePage from "./MobileDelete";
import MobileCalendarPage from "./MobileCalendarPage";

const Page = styled.div<{ $active: boolean }>`
  display: ${(props) => (props.$active ? "flex" : "none")};
  width: 100%;
  height: 100%;
  justify-content: center;
`;

export default function MobileMainPage() {
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

  const { previousPages } = usePreviousPage();

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
    console.log("왓니");
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
  const isPostDetailPage = location.pathname.includes("/m/postdetail");
  return (
    <>
      <MobileMainPageWrapper>
        <UpperBackground src={UpperBackgroundImg} />
        {showIntro ? <MobileIntroPage /> : <></>}
        {!isLoginPage && !isPostDetailPage && <MobileHeader />}
        <main style={{ flexGrow: 1 }}>
          <Page
            $active={
              activePage.includes("/m/home") &&
              !activePage.includes("/m/home/tips") &&
              !activePage.includes("/m/home/menu") &&
              !activePage.includes("/m/home/calendar")
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
          <Page $active={activePage.includes("/m/postdetail")}>
            <MobilePostDetailPage />
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
      </MobileMainPageWrapper>
      {!isLoginPage && !isPostDetailPage && (
        <MobileNav previousPages={previousPages} />
      )}
    </>
  );
}

const MobileMainPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100svh - 64px); // nav 만큼 빼기
  overflow-y: auto;
`;

const UpperBackground = styled.img`
  position: absolute;
  z-index: -1;
  width: 100%;
`;
