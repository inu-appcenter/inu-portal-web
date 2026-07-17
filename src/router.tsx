import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { appBridge, supportsMultiWebView } from "@/utils/appBridgeAdapter";


// Layouts
import RootLayout from "@/layout/RootLayout";
import MainTabLayout from "@/layout/MainTabLayout";
import FullscreenSubLayout from "@/layout/FullscreenSubLayout";
import SubLayout from "@/layout/SubLayout";
import RouteErrorBoundary from "@/components/common/RouteErrorBoundary";

// Pages (Imports 생략 - 기존과 동일)
import MobileHomePage from "@/pages/mobile/MobileHomePage";
import MobileHomePageV2 from "@/pages/mobile/MobileHomePageV2";
import MobileBusPage from "@/pages/mobile/MobileBus/MobileBusPage";
import AiPage from "@/pages/desktop/AiPage";
import MobileSavePage from "@/pages/mobile/MobileSavePage";
import MobileMyPage from "@/pages/mobile/MobileMyPage";
import MobileWritePage from "@/pages/mobile/MobileWritePage";
import AlarmSettingPage from "@/pages/mobile/AlarmSettingPage";
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
import MobileFcmStatusPage from "@/pages/mobile/MobileFcmStatusPage";
import MobileLoginPage from "@/pages/mobile/MobileLoginPage";
import MobileBusInfoPage from "@/pages/mobile/MobileBus/MobileBusInfoPage";
import MobileBusDetailPage from "@/pages/mobile/MobileBus/MobileBusDetailPage";
import MobileBusStopPage from "@/pages/mobile/MobileBus/MobileBusStopPage";
import MobileBusMapPage from "@/pages/mobile/MobileBus/MobileBusMapPage";
import MobileBusShuttleHelloBusPage from "@/pages/mobile/MobileBus/MobileBusShuttleHelloBusPage";
import MobileBusShuttleRouteInfoPage from "@/pages/mobile/MobileBus/MobileBusShuttleRouteInfoPage";
import MobileUnidormPage from "@/pages/mobile/MobileUnidormPage";
import MobileAdminPage from "@/pages/mobile/Admin/MobileAdminPage";
import MobileAdminUserStatisticsPage from "@/pages/mobile/Admin/MobileAdminUserStatisticsPage";
import MobileAdminApiStatisticsPage from "@/pages/mobile/Admin/MobileAdminApiStatisticsPage";
import MobileAdminFeatureFlagsPage from "@/pages/mobile/Admin/MobileAdminFeatureFlagsPage";
import MobileSchoolNoticePage from "@/pages/mobile/MobileSchoolNoticePage";
import MobileDeptNoticePage from "@/pages/mobile/MobileDeptNoticePage";
import MobileTipsPage from "@/pages/mobile/MobileTipsPage";
import MobileTipsCategoryPage from "@/pages/mobile/MobileTipsCategoryPage";
import MobileAlertPage from "@/pages/mobile/MobileAlertPage";
import MobileTimeTablePage from "@/pages/mobile/MobileTimeTablePage";
import MobileTimeTableEditPage from "@/pages/mobile/MobileTimeTableEditPage";
import MobileFriendListPage from "@/pages/mobile/MobileFriendListPage";
import MobileTimeTableComparePage from "@/pages/mobile/timetable/MobileTimeTableComparePage";
import MobileTimeTableVisibilityPage from "@/pages/mobile/timetable/MobileTimeTableVisibilityPage";
import MobileCourseAddPage from "@/pages/mobile/timetable/MobileCourseAddPage";
import MobileSugangSimulatorPage from "@/pages/mobile/timetable/MobileSugangSimulatorPage";
import MobileCourseFilterPage from "@/pages/mobile/timetable/MobileCourseFilterPage";
import MobileTimeTableListPage from "@/pages/mobile/timetable/MobileTimeTableListPage";
import MobileGradeCalculatorPage from "@/pages/mobile/timetable/MobileGradeCalculatorPage";
import MobileSyllabusPage from "@/pages/mobile/timetable/MobileSyllabusPage";
import MobilePhoneBookPage from "@/pages/mobile/phonebook/MobilePhoneBookPage";
import MobilePhoneBookDetailPage from "@/pages/mobile/phonebook/MobilePhoneBookDetailPage";
import MobilePhoneBookSearchPage from "@/pages/mobile/phonebook/MobilePhoneBookSearchPage";
import MobileAdminNotificationPage from "@/pages/mobile/Admin/MobileAdminNotificationPage";
import MobileAdminChatPage from "@/pages/mobile/Admin/MobileAdminChatPage";
import MoreAppsPage from "@/pages/mobile/MoreApps/MoreAppsPage";
import LabsPage from "@/pages/mobile/Labs/LabsPage";
import BasicInfoPage from "@/pages/mobile/Labs/BasicInfoPage";
import Festival2026Page from "@/pages/mobile/Festival2026Page";
import Festival2026DetailPage from "@/pages/mobile/Festival2026DetailPage";
import ChattingPage from "@/pages/mobile/ChattingPage";
import MobileChatListPage from "@/pages/mobile/MobileChatListPage";
import CreatePersonalChatPage from "@/pages/mobile/CreatePersonalChatPage";
import MobileNotificationSettingsPage from "@/pages/mobile/MobileNotificationSettingsPage";

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    errorElement: <RouteErrorBoundary />,
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
          { path: ROUTES.HOME_V2, element: <MobileHomePageV2 /> },
          { path: ROUTES.BUS.ROOT, element: <MobileBusPage /> },
          { path: ROUTES.CHAT.LIST, element: <MobileChatListPage /> },
          { path: ROUTES.SAVE, element: <MobileSavePage /> },
          { path: ROUTES.MYPAGE.ROOT, element: <MobileMyPage /> },
          { path: ROUTES.TIMETABLE.ROOT, element: <MobileTimeTablePage /> },
        ],
      },

      // ---------------------------------------
      // /m 전용 경로 추가
      // ---------------------------------------
      {
        path: ROUTES.MOBILE_ROOT, // "/m"
        element: <MainTabLayout showNav={true} showHeader={true} />,
        children: [
          { path: "", element: <Navigate to={ROUTES.MOBILE_HOME} replace /> },
          { path: "home", element: <MobileHomePage /> },
          { path: "bus", element: <MobileBusPage /> },
          { path: "chat/list", element: <MobileChatListPage /> },
          { path: "save", element: <MobileSavePage /> },
          { path: "mypage", element: <MobileMyPage /> },
          { path: "timetable", element: <MobileTimeTablePage /> },
        ],
      },

      // ----------------------------------------------------------------
      // 2. 서브 페이지 (SubLayout) - RootLayout에 의해 슬라이드, 하단 탭바 숨김
      // ----------------------------------------------------------------
      {
        element: <SubLayout showNav={false} backgroundColor="transparent" />,
        children: [
          // 로그인
          { path: ROUTES.LOGIN, element: <MobileLoginPage /> },

          // 채팅
          { path: "/chat/:roomId", element: <ChattingPage /> },
          { path: ROUTES.CHAT.CREATE_PERSONAL, element: <CreatePersonalChatPage /> },

          //시간표
          { path: ROUTES.TIMETABLE.EDIT, element: <MobileTimeTableEditPage /> },
          { path: ROUTES.FRIEND.LIST, element: <MobileFriendListPage /> },
          { path: ROUTES.TIMETABLE.COMPARE, element: <MobileTimeTableComparePage /> },
          { path: ROUTES.TIMETABLE.VISIBILITY, element: <MobileTimeTableVisibilityPage /> },
          { path: ROUTES.TIMETABLE.ADD, element: <MobileCourseAddPage /> },
          { path: ROUTES.TIMETABLE.FILTER, element: <MobileCourseFilterPage /> },
          { path: ROUTES.TIMETABLE.LIST, element: <MobileTimeTableListPage /> },
          { path: ROUTES.TIMETABLE.CALCULATOR, element: <MobileGradeCalculatorPage /> },
          { path: ROUTES.TIMETABLE.SYLLABUS, element: <MobileSyllabusPage /> },

          //전화번호부
          { path: ROUTES.PHONEBOOK.ROOT, element: <MobilePhoneBookPage /> },

          //앱센터의 다른 앱
          { path: ROUTES.MORE_APPS.ROOT, element: <MoreAppsPage /> },
          
          { path: ROUTES.FESTIVAL2026, element: <Festival2026Page /> },
          { path: ROUTES.FESTIVAL2026_DETAIL, element: <Festival2026DetailPage /> },

          //실험실
          {
            path: ROUTES.LABS.ROOT, // "/labs"
            children: [
              {
                index: true,
                element: <LabsPage />,
              },
              {
                /* 실제 경로: /labs/portal/basic-info */
                path: "portal/basic-info",
                element: <BasicInfoPage />,
              },
            ],
          },
          {
            path: ROUTES.PHONEBOOK.SEARCH,
            element: <MobilePhoneBookSearchPage />,
          },
          {
            path: ROUTES.PHONEBOOK.DETAIL,
            element: <MobilePhoneBookDetailPage />,
          },

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
            element: <AlarmSettingPage />,
          },

          // 기능 메뉴
          { path: ROUTES.BOARD.MENU, element: <MobileMenuPage /> },
          { path: ROUTES.BOARD.CALENDAR, element: <MobileCalendarPage /> },
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
          { path: ROUTES.MYPAGE.FCM, element: <MobileFcmStatusPage /> },
          { path: ROUTES.MYPAGE.NOTIFICATION, element: <MobileNotificationSettingsPage /> },

          // 버스 상세
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
          {
            path: ROUTES.ADMIN.USER_NOTIFICATIION,
            element: <MobileAdminNotificationPage />,
          },
          {
            path: ROUTES.ADMIN.FEATURE_FLAGS,
            element: <MobileAdminFeatureFlagsPage />,
          },
          {
            path: ROUTES.ADMIN.CHAT,
            element: <MobileAdminChatPage />,
          },
        ],
      },
      // ----------------------------------------------------------------
      // 3. 서브 페이지 (풀스크린 뷰포트 고정 - 지도 등)
      // ----------------------------------------------------------------
      {
        element: <SubLayout showNav={false} fillsViewportOnDesktop={true} />,
        children: [
          { path: ROUTES.BOARD.CAMPUS, element: <MobileCampusPage /> },
          { path: ROUTES.BUS.INFO, element: <MobileBusInfoPage /> },
          { path: ROUTES.BUS.INFO_MAP, element: <MobileBusMapPage /> },
        ],
      },
      {
        element: <FullscreenSubLayout backgroundColor="#ffffff" />,
        children: [
          { path: ROUTES.TIMETABLE.SIMULATOR, element: <MobileSugangSimulatorPage /> },
        ],
      },
    ],
  },
]);

const MAIN_TAB_PATHS = new Set([
  "/",
  "/home",
  "/bus",
  "/chat/list",
  "/save",
  "/mypage",
  "/timetable",
  "/m",
  "/m/home",
  "/m/bus",
  "/m/chat/list",
  "/m/save",
  "/m/mypage",
  "/m/timetable"
]);

function isMainTabPath(path: string): boolean {
  if (!path) return false;
  const cleanPath = path.split("?")[0].split("#")[0];
  return MAIN_TAB_PATHS.has(cleanPath);
}

function getPathname(to: any): string {
  if (!to) return "";
  if (typeof to === "string") {
    return to.split("?")[0].split("#")[0];
  }
  if (typeof to === "object" && to !== null) {
    return to.pathname || "";
  }
  return "";
}

if (typeof window !== "undefined") {
  const originalNavigate = router.navigate;

  (router as any).navigate = function (to: any, opts?: any) {
    // 1. 숫자가 전달된 경우 (뒤로가기)
    if (typeof to === "number") {
      if (to === -1 && supportsMultiWebView()) {
        appBridge.goBack();
        return Promise.resolve();
      }
      return (originalNavigate as any).call(router, to, opts);
    }

    const path = getPathname(to);
    const isTabNavigation = opts?.state?.isTabNavigation === true;

    // 2. 신규 멀티 웹뷰 환경이고 메인 탭이 아니며, 탭 이동 옵션도 없는 경우 -> 새 웹뷰 액티비티로 오픈
    if (supportsMultiWebView() && !isMainTabPath(path) && !isTabNavigation && !opts?.replace) {
      const fullPath = typeof to === "string"
        ? to
        : `${to.pathname || ""}${to.search || ""}${to.hash || ""}`;
      appBridge.navigateTo(fullPath);
      return Promise.resolve(); // 현재 웹뷰에서의 SPA 라우팅을 수행하지 않음
    }

    return (originalNavigate as any).call(router, to, opts);
  };

}


