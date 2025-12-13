import { ROUTES } from "@/constants/routes";
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
    setIsAppUrl(ROUTES.ROOT); // MobileRootPage에 진입하면 isAppUrl 상태 설정
  }, [setIsAppUrl]);

  const location = useLocation();

  const isLoginPage = location.pathname === ROUTES.LOGIN;
  const isPostDetailPage =
    location.pathname.includes(ROUTES.DETAIL.POST) ||
    location.pathname.includes(ROUTES.DETAIL.COUNCIL_NOTICE);

  return (
    <MobileRootPageWrapper>
      <UpperBackground src={UpperBackgroundImg} />
      {!isLoginPage && !isPostDetailPage && <MobileHeader />}
      <main>
        <Page>
          <Routes>
            <Route path={ROUTES.HOME} element={<MobileHomePage />} />
            <Route path={ROUTES.BOARD.NOTICE} element={<MobileBoardPage />} />
            <Route path={ROUTES.BOARD.TIPS} element={<MobileBoardPage />} />
            <Route path={ROUTES.BOARD.MENU} element={<MobileMenuPage />} />
            <Route
              path={ROUTES.BOARD.CALENDAR}
              element={<MobileCalendarPage />}
            />
            <Route path={ROUTES.BOARD.CAMPUS} element={<MobileCampusPage />} />
            <Route path={ROUTES.BOARD.UTIL} element={<MobileUtilPage />} />
            <Route
              path={ROUTES.DETAIL.POST}
              element={<MobilePostDetailPage />}
            />
            <Route
              path={ROUTES.DETAIL.COUNCIL_NOTICE}
              element={<MobileCouncilNoticeDetailPage />}
            />
            <Route
              path={ROUTES.DETAIL.PETITION}
              element={<MobilePetitionDetailPage />}
            />
            <Route
              path={ROUTES.BOARD.COUNCIL}
              element={<MobileCouncilPage />}
            />
            <Route path={ROUTES.BOARD.CLUB} element={<MobileClubPage />} />
            <Route
              path={ROUTES.BOARD.CLUB_RECRUIT_DETAIL}
              element={<MobileClubRecruitDetailPage />}
            />

            <Route path={ROUTES.AI} element={<AiPage />} />
            {/* "/write"는 ROUTES에 정의된 상수(TIPS_WRITE 등)와 경로가 일치하는지 확인 후 교체 권장 */}
            <Route path="/write" element={<MobileWritePage />} />
            <Route path={ROUTES.SAVE} element={<MobileSavePage />} />
            <Route path={ROUTES.MYPAGE.ROOT} element={<MobileMyPage />} />
            <Route
              path={ROUTES.MYPAGE.PROFILE}
              element={<MobileProfilePage />}
            />
            <Route path={ROUTES.MYPAGE.POSTS} element={<MobileMyPagePost />} />
            <Route path={ROUTES.MYPAGE.LIKES} element={<MobileMyPageLike />} />
            <Route
              path={ROUTES.MYPAGE.COMMENTS}
              element={<MobileMyPageComment />}
            />
            <Route path={ROUTES.MYPAGE.DELETE} element={<MobileDeletePage />} />
            <Route path={ROUTES.LOGIN} element={<MobileLoginPage />} />
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
