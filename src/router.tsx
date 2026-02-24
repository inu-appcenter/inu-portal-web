import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

// Layouts
import RootLayout from "@/layout/RootLayout";
import MainTabLayout from "@/layout/MainTabLayout";
import SubLayout from "@/layout/SubLayout";

// Pages (Imports 생략 - 기존과 동일)
import MobileHomePage from "@/pages/mobile/MobileHomePage";
import MobileBusPage from "@/pages/mobile/MobileBus/MobileBusPage";
import AiPage from "@/pages/desktop/AiPage";
import MobileSavePage from "@/pages/mobile/MobileSavePage";
import MobileMyPage from "@/pages/mobile/MobileMyPage";
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
import MobileSchoolNoticePage from "@/pages/mobile/MobileSchoolNoticePage";
import MobileDeptNoticePage from "@/pages/mobile/MobileDeptNoticePage";
import MobileTipsPage from "@/pages/mobile/MobileTipsPage";
import MobileTipsCategoryPage from "@/pages/mobile/MobileTipsCategoryPage";
import MobileAlertPage from "@/pages/mobile/MobileAlertPage";
import MobileTimeTablePage from "@/pages/mobile/MobileTimeTablePage";
import MobileTimeTableEditPage from "@/pages/mobile/MobileTimeTableEditPage";
import MobilePhoneBookPage from "@/pages/mobile/phonebook/MobilePhoneBookPage";

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <RootLayout />, // 최상위 슬라이드 제어
    children: [
      // ----------------------------------------------------------------
      // 1. 메인 탭 (MainTabLayout) - 페이드 전환, 하단 탭바 노출
      // ----------------------------------------------------------------
      {
        element: <MainTabLayout showNav={true} showHeader={true} />,
        children: [
          { path: "", element: <Navigate to={ROUTES.HOME} replace /> },
          { path: ROUTES.HOME, element: <MobileHomePage /> },
          { path: ROUTES.BUS.ROOT, element: <MobileBusPage /> },
          { path: ROUTES.SAVE, element: <MobileSavePage /> },
          { path: ROUTES.MYPAGE.ROOT, element: <MobileMyPage /> },
          { path: ROUTES.TIMETABLE.ROOT, element: <MobileTimeTablePage /> },
        ],
      },

      // ----------------------------------------------------------------
      // 2. 서브 페이지 (SubLayout) - RootLayout에 의해 슬라이드, 하단 탭바 숨김
      // ----------------------------------------------------------------
      {
        element: <SubLayout showNav={false} />,
        children: [
          // 로그인
          { path: ROUTES.LOGIN, element: <MobileLoginPage /> },

          //시간표
          { path: ROUTES.TIMETABLE.EDIT, element: <MobileTimeTableEditPage /> },

          //전화번호부
          { path: ROUTES.PHONEBOOK.ROOT, element: <MobilePhoneBookPage /> },

          // 횃불이 AI
          { path: ROUTES.AI, element: <AiPage /> },

          // 게시판
          { path: ROUTES.BOARD.ALERT, element: <MobileAlertPage /> },
          {
            path: ROUTES.BOARD.TIPS,
            children: [
              { index: true, element: <MobileTipsPage /> },
              {
                path: "category/:category",
                element: <MobileTipsCategoryPage />,
              },
              { path: ":id", element: <MobilePostDetailPage /> },
            ],
          },
          { path: ROUTES.BOARD.TIPS_WRITE, element: <MobileWritePage /> },
          {
            path: `${ROUTES.BOARD.TIPS_WRITE}/:id`,
            element: <MobileWritePage />,
          },
          { path: ROUTES.BOARD.NOTICE, element: <MobileSchoolNoticePage /> },
          {
            path: ROUTES.BOARD.DEPT_NOTICE,
            element: <MobileDeptNoticePage />,
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
