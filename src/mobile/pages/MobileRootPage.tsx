import styled from "styled-components";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import MobileIntroPage from "mobile/pages/MobileIntroPage";
import MobileHomePage from "mobile/pages/MobileHomePage";
import MobileBoardPage from "mobile/pages/MobileBoardPage.tsx";
import MobileSavePage from "mobile/pages/MobileSavePage";
import MobileWritePage from "mobile/pages/MobileWritePage";
import MobileLoginPage from "mobile/pages/MobileLoginPage";
import MobilePostDetailPage from "mobile/pages/MobilePostDetailPage";
import MobileCouncilNoticeDetailPage from "mobile/pages/MobileCouncilNoticeDetailPage";
import MobilePetitionDetailPage from "mobile/pages/MobilePetitionDetailPage";
import MobileCampusPage from "mobile/pages/MobileCampusPage";
import MobileCouncilPage from "mobile/pages/MobileCouncilPage";
import MobileUtilPage from "mobile/pages/MobileUtilPage";
import MobileMyPage from "mobile/pages/MobileMyPage";
import MobileProfilePage from "mobile/pages/MobileProfilePage";
import MobileMenuPage from "mobile/pages/MobileMenuPage";
import MobileMyPagePost from "mobile/pages/MobileMyPagePost";
import MobileMyPageComment from "mobile/pages/MobileMyPageComment";
import MobileMyPageLike from "mobile/pages/MobileMyPageLike";
import MobileDeletePage from "mobile/pages/MobileDelete";
import MobileCalendarPage from "mobile/pages/MobileCalendarPage";
import MobileClubPage from "./MobileClubPage";
import MobileClubRecruitDetailPage from "./MobileClubRecruitDetailPage";
import AiPage from "pages/AiPage";
import useAppStateStore from "stores/useAppStateStore";
import MainLayout from "../MainLayout.tsx";
import SubLayout from "../SubLayout.tsx";
import MobileBusPage from "./MobileBus/MobileBusPage.tsx";

import MobileBusInfoPage from "mobile/pages/MobileBus/MobileBusInfoPage.tsx";
import MobileBusDetailPage from "mobile/pages/MobileBus/MobileBusDetailPage.tsx";
import MobileBusStopPage from "mobile/pages/MobileBus/MobileBusStopPage.tsx";
import MobileBusShuttleHelloBusPage from "./MobileBus/MobileBusShuttleHelloBusPage.tsx";
import MobileBusShuttleRouteInfoPage from "./MobileBus/MobileBusShuttleRouteInfoPage.tsx";
import MobileUnidormPage from "./MobileUnidormPage.tsx";
import MobileDeptAlarmSettingPage from "./MobileDeptAlarmSettingPage.tsx";
import MobileAdminPage from "./Admin/MobileAdminPage.tsx";
import MobileAdminUserStatisticsPage from "./Admin/MobileAdminUserStatisticsPage.tsx";
import MobileAdminApiStatisticsPage from "./Admin/MobileAdminApiStatisticsPage.tsx";
import MobileAdminNotificationPage from "mobile/pages/Admin/MobileAdminNotificationPage";

// import MobileHeader from "mobile/containers/common/MobileHeader";
// const Page = styled.div`
//   display: flex;
//   width: 100%;
//   height: 100%;
//   justify-content: center;
// `;

export default function MobileRootPage() {
  const { setIsAppUrl } = useAppStateStore();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    setIsAppUrl("/m");
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

  // const isLoginPage = location.pathname === "/login";
  // const isPostDetailPage =
  //   location.pathname.includes("/postdetail") ||
  //   location.pathname.includes("/councilnoticedetail") ||
  //   location.pathname.includes("/petitiondetail");

  return (
    <MobileRootPageWrapper>
      {showIntro && <MobileIntroPage />}
      {/*{!isLoginPage && !isPostDetailPage && }*/}

      <Routes>
        {/*내비바가 필요한 루트페이지*/}
        <Route path="/" element={<MainLayout />}>
          <Route path="/home" element={<MobileHomePage />} />
          <Route path="/bus" element={<MobileBusPage />} />

          <Route path="/ai" element={<AiPage />} />
          <Route path="/save" element={<MobileSavePage />} />
          <Route path="/mypage" element={<MobileMyPage />} />
        </Route>

        {/*내비바가 필요없는 서브페이지들*/}
        <Route path="/" element={<SubLayout />}>
          <Route path="/home/alert" element={<MobileBoardPage />} />
          <Route path="/home/tips" element={<MobileBoardPage />} />
          <Route path="/home/tips/write" element={<MobileWritePage />} />
          <Route path="/home/tips/write/:id" element={<MobileWritePage />} />

          <Route path="/home/notice" element={<MobileBoardPage />} />
          <Route path="/home/deptnotice/:dept?" element={<MobileBoardPage />} />
          <Route
            path="/home/deptnotice/setting"
            element={<MobileDeptAlarmSettingPage />}
          />
          <Route path="/home/menu" element={<MobileMenuPage />} />
          <Route path="/home/calendar" element={<MobileCalendarPage />} />
          <Route path="/home/campus" element={<MobileCampusPage />} />
          <Route path="/home/util" element={<MobileUtilPage />} />
          <Route path="/home/council" element={<MobileCouncilPage />} />
          <Route path="/home/club" element={<MobileClubPage />} />
          <Route
            path="/home/recruitdetail"
            element={<MobileClubRecruitDetailPage />}
          />
          <Route path="/postdetail" element={<MobilePostDetailPage />} />
          <Route
            path="/councilnoticedetail"
            element={<MobileCouncilNoticeDetailPage />}
          />
          <Route
            path="/petitiondetail"
            element={<MobilePetitionDetailPage />}
          />
          <Route path="/mypage/profile" element={<MobileProfilePage />} />
          <Route path="/mypage/post" element={<MobileMyPagePost />} />
          <Route path="/mypage/like" element={<MobileMyPageLike />} />
          <Route path="/mypage/comment" element={<MobileMyPageComment />} />
          <Route path="/mypage/delete" element={<MobileDeletePage />} />
          <Route path="/login" element={<MobileLoginPage />} />

          <Route path="/bus/info" element={<MobileBusInfoPage />} />
          <Route path="/bus/detail" element={<MobileBusDetailPage />} />
          <Route path="/bus/stopinfo" element={<MobileBusStopPage />} />
          <Route
            path="/bus/shuttle/hellobus"
            element={<MobileBusShuttleHelloBusPage />}
          />
          <Route
            path="/bus/shuttle"
            element={<MobileBusShuttleRouteInfoPage />}
          />
          <Route path="/unidorm" element={<MobileUnidormPage />} />
          <Route path="/admin" element={<MobileAdminPage />} />
          <Route
            path="/admin/userstatistics"
            element={<MobileAdminUserStatisticsPage />}
          />
          <Route
            path="/admin/apistatistics"
            element={<MobileAdminApiStatisticsPage />}
          />
          <Route
            path="/admin/notification"
            element={<MobileAdminNotificationPage />}
          />
        </Route>
      </Routes>

      {/*{!isLoginPage && !isPostDetailPage && <MobileNav />}*/}
    </MobileRootPageWrapper>
  );
}

const MobileRootPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;
