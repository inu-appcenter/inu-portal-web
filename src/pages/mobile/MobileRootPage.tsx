import { ROUTES } from "@/constants/routes";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import MobileIntroPage from "@/pages/mobile/MobileIntroPage";
import MobileHomePage from "@/pages/mobile/MobileHomePage";
import MobileBoardPage from "@/pages/mobile/MobileBoardPage.tsx";
import MobileSavePage from "@/pages/mobile/MobileSavePage";
import MobileWritePage from "@/pages/mobile/MobileWritePage";
import MobileLoginPage from "@/pages/mobile/MobileLoginPage";
import MobilePostDetailPage from "@/pages/mobile/MobilePostDetailPage";
import MobileCouncilNoticeDetailPage from "@/pages/mobile/MobileCouncilNoticeDetailPage";
import MobilePetitionDetailPage from "@/pages/mobile/MobilePetitionDetailPage";
import MobileCampusPage from "@/pages/mobile/MobileCampusPage";
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
import MobileClubPage from "./MobileClubPage";
import MobileClubRecruitDetailPage from "./MobileClubRecruitDetailPage";
import AiPage from "@/pages/desktop/AiPage";
import useAppStateStore from "@/stores/useAppStateStore";
import MainLayout from "../../layout/MainLayout.tsx";
import SubLayout from "../../layout/SubLayout.tsx";
import MobileBusPage from "./MobileBus/MobileBusPage.tsx";

import MobileBusInfoPage from "@/pages/mobile/MobileBus/MobileBusInfoPage.tsx";
import MobileBusDetailPage from "@/pages/mobile/MobileBus/MobileBusDetailPage.tsx";
import MobileBusStopPage from "@/pages/mobile/MobileBus/MobileBusStopPage.tsx";
import MobileBusShuttleHelloBusPage from "./MobileBus/MobileBusShuttleHelloBusPage.tsx";
import MobileBusShuttleRouteInfoPage from "./MobileBus/MobileBusShuttleRouteInfoPage.tsx";
import MobileUnidormPage from "./MobileUnidormPage.tsx";
import MobileDeptAlarmSettingPage from "./MobileDeptAlarmSettingPage.tsx";
import MobileAdminPage from "./Admin/MobileAdminPage.tsx";
import MobileAdminUserStatisticsPage from "./Admin/MobileAdminUserStatisticsPage.tsx";
import MobileAdminApiStatisticsPage from "./Admin/MobileAdminApiStatisticsPage.tsx";

export default function MobileRootPage() {
  const { setIsAppUrl } = useAppStateStore();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    setIsAppUrl(ROUTES.ROOT);
  }, [setIsAppUrl]);

  useEffect(() => {
    const introShown = sessionStorage.getItem("introShown");
    if (introShown) {
      setShowIntro(false);
    } else {
      sessionStorage.setItem("introShown", "true");
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <MobileRootPageWrapper>
      {showIntro && <MobileIntroPage />}

      <Routes>
        {/*내비바가 필요한 루트페이지*/}
        {/* path={ROUTES.ROOT} 처럼 중괄호로 감싸야 함 */}
        <Route path={ROUTES.ROOT} element={<MainLayout />}>
          <Route path={ROUTES.HOME} element={<MobileHomePage />} />
          <Route path={ROUTES.BUS.ROOT} element={<MobileBusPage />} />

          <Route path={ROUTES.AI} element={<AiPage />} />
          <Route path={ROUTES.SAVE} element={<MobileSavePage />} />
          <Route path={ROUTES.MYPAGE.ROOT} element={<MobileMyPage />} />
        </Route>

        {/*내비바가 필요없는 서브페이지들*/}
        <Route path={ROUTES.ROOT} element={<SubLayout />}>
          {/*<Route path={ROUTES.BOARD.ALERT} element={<MobileBoardPage />} />*/}
          <Route path={ROUTES.BOARD.TIPS} element={<MobileBoardPage />} />
          <Route path={ROUTES.BOARD.TIPS_WRITE} element={<MobileWritePage />} />

          {/* 동적 파라미터가 있는 경우: 템플릿 리터럴 사용 */}
          <Route
            path={`${ROUTES.BOARD.TIPS_WRITE}/:id`}
            element={<MobileWritePage />}
          />

          <Route path={ROUTES.BOARD.NOTICE} element={<MobileBoardPage />} />

          {/* 동적 파라미터가 있는 경우 */}
          <Route
            path={`${ROUTES.BOARD.DEPT_NOTICE}/:dept?`}
            element={<MobileBoardPage />}
          />

          <Route
            path={ROUTES.BOARD.DEPT_SETTING}
            element={<MobileDeptAlarmSettingPage />}
          />
          <Route path={ROUTES.BOARD.MENU} element={<MobileMenuPage />} />
          <Route
            path={ROUTES.BOARD.CALENDAR}
            element={<MobileCalendarPage />}
          />
          <Route path={ROUTES.BOARD.CAMPUS} element={<MobileCampusPage />} />
          <Route path={ROUTES.BOARD.UTIL} element={<MobileUtilPage />} />
          <Route path={ROUTES.BOARD.COUNCIL} element={<MobileCouncilPage />} />
          <Route path={ROUTES.BOARD.CLUB} element={<MobileClubPage />} />
          <Route
            path={ROUTES.BOARD.CLUB_RECRUIT_DETAIL}
            element={<MobileClubRecruitDetailPage />}
          />
          <Route path={ROUTES.DETAIL.POST} element={<MobilePostDetailPage />} />
          <Route
            path={ROUTES.DETAIL.COUNCIL_NOTICE}
            element={<MobileCouncilNoticeDetailPage />}
          />
          <Route
            path={ROUTES.DETAIL.PETITION}
            element={<MobilePetitionDetailPage />}
          />
          <Route path={ROUTES.MYPAGE.PROFILE} element={<MobileProfilePage />} />
          <Route path={ROUTES.MYPAGE.POSTS} element={<MobileMyPagePost />} />
          <Route path={ROUTES.MYPAGE.LIKES} element={<MobileMyPageLike />} />
          <Route
            path={ROUTES.MYPAGE.COMMENTS}
            element={<MobileMyPageComment />}
          />
          <Route path={ROUTES.MYPAGE.DELETE} element={<MobileDeletePage />} />
          <Route path={ROUTES.LOGIN} element={<MobileLoginPage />} />

          <Route path={ROUTES.BUS.INFO} element={<MobileBusInfoPage />} />
          <Route path={ROUTES.BUS.DETAIL} element={<MobileBusDetailPage />} />
          <Route path={ROUTES.BUS.STOP_INFO} element={<MobileBusStopPage />} />
          <Route
            path={ROUTES.BUS.SHUTTLE_HELLO}
            element={<MobileBusShuttleHelloBusPage />}
          />
          <Route
            path={ROUTES.BUS.SHUTTLE_ROUTE}
            element={<MobileBusShuttleRouteInfoPage />}
          />
          <Route path={ROUTES.UNIDORM} element={<MobileUnidormPage />} />
          <Route path={ROUTES.ADMIN.ROOT} element={<MobileAdminPage />} />
          <Route
            path={ROUTES.ADMIN.USER_STAT}
            element={<MobileAdminUserStatisticsPage />}
          />
          <Route
            path={ROUTES.ADMIN.API_STAT}
            element={<MobileAdminApiStatisticsPage />}
          />
        </Route>
      </Routes>
    </MobileRootPageWrapper>
  );
}

const MobileRootPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;
