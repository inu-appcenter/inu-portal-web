import styled from "styled-components";
import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import UpperBackgroundImg from "@/resources/assets/mobile-common/upperBackgroundImg.svg";
import MobileHeader from "@/containers/mobile/common/MobileHeader";
import MobileHomePage from "@/pages/mobile/MobileHomePage";
import MobileBoardPage from "@/pages/mobile/MobileBoardPage.tsx";
import MobileSavePage from "@/pages/mobile/MobileSavePage";
import MobileWritePage from "@/pages/mobile/MobileWritePage";
import MobileLoginPage from "@/pages/mobile/MobileLoginPage";
import MobilePostDetailPage from "@/pages/mobile/MobilePostDetailPage";
import MobileCouncilNoticeDetailPage from "@/pages/mobile/MobileCouncilNoticeDetailPage";
import MobilePetitionDetailPage from "@/pages/mobile/MobilePetitionDetailPage";
import MobileCampusPage from "@/pages/mobile/MobileCampusPage.tsx";
import MobileCouncilPage from "@/pages/mobile/MobileCouncilPage";
import MobileUtilPage from "@/pages/mobile/MobileUtilPage";
import MobileMyPage from "@/pages/mobile/MobileMyPage";
import MobileProfilePage from "@/pages/mobile/MobileProfilePage";
import MobileMenuPage from "@/pages/mobile/MobileMenuPage";
import MobileMyPagePost from "@/pages/mobile/MobileMyPagePost";
import MobileMyPageComment from "@/pages/mobile/MobileMyPageComment";
import MobileMyPageLike from "@/pages/mobile/MobileMyPageLike";
import MobileDeletePage from "@/pages/mobile/MobileDelete";
import MobileCalendarPage from "@/pages/mobile/MobileCalendarPage";
import useAppStateStore from "@/stores/useAppStateStore";
import MobileClubPage from "./MobileClubPage";
import MobileClubRecruitDetailPage from "./MobileClubRecruitDetailPage.tsx";
import AiPage from "@/pages/desktop/AiPage";

const Page = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
`;

export default function AppRoutePage() {
  const { setIsAppUrl } = useAppStateStore();

  useEffect(() => {
    setIsAppUrl("/app"); // MobileRootPage에 진입하면 isAppUrl 상태 설정
  }, [setIsAppUrl]);

  const location = useLocation();

  const isLoginPage = location.pathname === "/app/login";
  const isPostDetailPage =
    location.pathname.includes("/app/postdetail") ||
    location.pathname.includes("/app/councilnoticedetail");

  return (
    <MobileRootPageWrapper>
      <UpperBackground src={UpperBackgroundImg} />
      {!isLoginPage && !isPostDetailPage && <MobileHeader />}
      <main>
        <Page>
          <Routes>
            <Route path="/home" element={<MobileHomePage />} />
            <Route path="/home/notice" element={<MobileBoardPage />} />
            <Route path="/home/tips" element={<MobileBoardPage />} />
            <Route path="/home/menu" element={<MobileMenuPage />} />
            <Route path="/home/calendar" element={<MobileCalendarPage />} />
            <Route path="/home/campus" element={<MobileCampusPage />} />
            <Route path="/home/util" element={<MobileUtilPage />} />
            <Route path="/postdetail" element={<MobilePostDetailPage />} />
            <Route
              path="/councilnoticedetail"
              element={<MobileCouncilNoticeDetailPage />}
            />
            <Route
              path="/petitiondetail"
              element={<MobilePetitionDetailPage />}
            />
            <Route path="/home/council" element={<MobileCouncilPage />} />
            <Route path="/home/club" element={<MobileClubPage />} />
            <Route
              path="/home/recruitdetail"
              element={<MobileClubRecruitDetailPage />}
            />

            <Route path="/ai" element={<AiPage />} />
            <Route path="/write" element={<MobileWritePage />} />
            <Route path="/save" element={<MobileSavePage />} />
            <Route path="/mypage" element={<MobileMyPage />} />
            <Route path="/mypage/profile" element={<MobileProfilePage />} />
            <Route path="/mypage/post" element={<MobileMyPagePost />} />
            <Route path="/mypage/like" element={<MobileMyPageLike />} />
            <Route path="/mypage/comment" element={<MobileMyPageComment />} />
            <Route path="/mypage/delete" element={<MobileDeletePage />} />
            <Route path="/login" element={<MobileLoginPage />} />
          </Routes>
        </Page>
      </main>
    </MobileRootPageWrapper>
  );
}

const MobileRootPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  // padding-bottom: 72px; // Nav
  overflow-y: auto;
`;

const UpperBackground = styled.img`
  position: absolute;
  z-index: -1;
  width: 100%;
`;
