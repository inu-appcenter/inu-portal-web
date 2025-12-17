import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import GlobalLayout from "@/layout/GlobalLayout"; // RootLayout이 GlobalLayout으로 명명된 것으로 가정

// 페이지 컴포넌트 임포트
import MobileHomePage from "@/pages/mobile/MobileHomePage";
import MobileBusPage from "@/pages/mobile/MobileBus/MobileBusPage";
import AiPage from "@/pages/desktop/AiPage";
import MobileSavePage from "@/pages/mobile/MobileSavePage";
import MobileMyPage from "@/pages/mobile/MobileMyPage";
import MobileBoardPage from "@/pages/mobile/MobileBoardPage";
import MobileWritePage from "@/pages/mobile/MobileWritePage";
import MobileDeptAlarmSettingPage from "@/pages/mobile/MobileDeptAlarmSettingPage";
import MobileMenuPage from "@/pages/mobile/MobileMenuPage";
import MobileCalendarPage from "@/pages/mobile/MobileCalendarPage";
import MobileCampusPage from "@/pages/mobile/MobileCampusPage";
import MobileUtilPage from "@/pages/mobile/MobileUtilPage";
import MobileCouncilPage from "@/pages/mobile/MobileCouncilPage";
import MobileClubPage from "@/pages/mobile/MobileClubPage";
import MobileClubRecruitDetailPage from "@/pages/mobile/MobileClubRecruitDetailPage";
import MobilePostDetailPage from "@/pages/mobile/MobilePostDetailPage";
import MobileCouncilNoticeDetailPage from "@/pages/mobile/MobileCouncilNoticeDetailPage";
import MobilePetitionDetailPage from "@/pages/mobile/MobilePetitionDetailPage";
import MobileProfilePage from "@/pages/mobile/MobileProfilePage";
import MobileMyPagePost from "@/pages/mobile/MobileMyPagePost";
import MobileMyPageLike from "@/pages/mobile/MobileMyPageLike";
import MobileMyPageComment from "@/pages/mobile/MobileMyPageComment";
import MobileDeletePage from "@/pages/mobile/MobileDelete";
import MobileLoginPage from "@/pages/mobile/MobileLoginPage";
import MobileBusInfoPage from "@/pages/mobile/MobileBus/MobileBusInfoPage";
import MobileBusDetailPage from "@/pages/mobile/MobileBus/MobileBusDetailPage";
import MobileBusStopPage from "@/pages/mobile/MobileBus/MobileBusStopPage";
import MobileBusShuttleHelloBusPage from "@/pages/mobile/MobileBus/MobileBusShuttleHelloBusPage";
import MobileBusShuttleRouteInfoPage from "@/pages/mobile/MobileBus/MobileBusShuttleRouteInfoPage";
import MobileUnidormPage from "@/pages/mobile/MobileUnidormPage";
import MobileAdminPage from "@/pages/mobile/Admin/MobileAdminPage";
import MobileAdminUserStatisticsPage from "@/pages/mobile/Admin/MobileAdminUserStatisticsPage";
import MobileAdminApiStatisticsPage from "@/pages/mobile/Admin/MobileAdminApiStatisticsPage";

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <Outlet />,
    children: [
      // ----------------------------------------------------------------
      // 1. 하단 네비게이션 노출 (Main Tabs)
      // ----------------------------------------------------------------
      {
        element: <GlobalLayout showNav={true} />,
        children: [
          { path: "", element: <Navigate to={ROUTES.HOME} replace /> },
          { path: ROUTES.HOME, element: <MobileHomePage /> },
          { path: ROUTES.BUS.ROOT, element: <MobileBusPage /> },
          { path: ROUTES.AI, element: <AiPage /> },
          { path: ROUTES.SAVE, element: <MobileSavePage /> },
          { path: ROUTES.MYPAGE.ROOT, element: <MobileMyPage /> },
        ],
      },

      // ----------------------------------------------------------------
      // 2. 하단 네비게이션 미노출 (Sub Pages) - SubLayout 제거됨
      // ----------------------------------------------------------------
      {
        element: <GlobalLayout showNav={false} showHeader={true} />, // 기본값 false 적용
        children: [
          // 로그인
          { path: ROUTES.LOGIN, element: <MobileLoginPage /> },

          // 게시판
          { path: ROUTES.BOARD.ALERT, element: <MobileBoardPage /> },
          { path: ROUTES.BOARD.TIPS, element: <MobileBoardPage /> },
          { path: ROUTES.BOARD.TIPS_WRITE, element: <MobileWritePage /> },
          {
            path: `${ROUTES.BOARD.TIPS_WRITE}/:id`,
            element: <MobileWritePage />,
          },
          { path: ROUTES.BOARD.NOTICE, element: <MobileBoardPage /> },
          {
            path: `${ROUTES.BOARD.DEPT_NOTICE}/:dept?`,
            element: <MobileBoardPage />,
          },
          {
            path: ROUTES.BOARD.DEPT_SETTING,
            element: <MobileDeptAlarmSettingPage />,
          },

          // 기능 메뉴
          { path: ROUTES.BOARD.MENU, element: <MobileMenuPage /> },
          { path: ROUTES.BOARD.CALENDAR, element: <MobileCalendarPage /> },
          { path: ROUTES.BOARD.CAMPUS, element: <MobileCampusPage /> },
          { path: ROUTES.BOARD.UTIL, element: <MobileUtilPage /> },
          { path: ROUTES.BOARD.COUNCIL, element: <MobileCouncilPage /> },
          { path: ROUTES.BOARD.CLUB, element: <MobileClubPage /> },
          {
            path: ROUTES.BOARD.CLUB_RECRUIT_DETAIL,
            element: <MobileClubRecruitDetailPage />,
          },

          // 상세
          { path: ROUTES.DETAIL.POST, element: <MobilePostDetailPage /> },
          {
            path: ROUTES.DETAIL.COUNCIL_NOTICE,
            element: <MobileCouncilNoticeDetailPage />,
          },
          {
            path: ROUTES.DETAIL.PETITION,
            element: <MobilePetitionDetailPage />,
          },

          // 마이페이지 상세
          { path: ROUTES.MYPAGE.PROFILE, element: <MobileProfilePage /> },
          { path: ROUTES.MYPAGE.POSTS, element: <MobileMyPagePost /> },
          { path: ROUTES.MYPAGE.LIKES, element: <MobileMyPageLike /> },
          { path: ROUTES.MYPAGE.COMMENTS, element: <MobileMyPageComment /> },
          { path: ROUTES.MYPAGE.DELETE, element: <MobileDeletePage /> },

          // 버스 상세
          { path: ROUTES.BUS.INFO, element: <MobileBusInfoPage /> },
          { path: ROUTES.BUS.DETAIL, element: <MobileBusDetailPage /> },
          { path: ROUTES.BUS.STOP_INFO, element: <MobileBusStopPage /> },
          {
            path: ROUTES.BUS.SHUTTLE_HELLO,
            element: <MobileBusShuttleHelloBusPage />,
          },
          {
            path: ROUTES.BUS.SHUTTLE_ROUTE,
            element: <MobileBusShuttleRouteInfoPage />,
          },

          // 기타
          { path: ROUTES.UNIDORM, element: <MobileUnidormPage /> },

          // 관리자
          { path: ROUTES.ADMIN.ROOT, element: <MobileAdminPage /> },
          {
            path: ROUTES.ADMIN.USER_STAT,
            element: <MobileAdminUserStatisticsPage />,
          },
          {
            path: ROUTES.ADMIN.API_STAT,
            element: <MobileAdminApiStatisticsPage />,
          },
        ],
      },
    ],
  },
]);
