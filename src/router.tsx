import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES, isMainTabPath } from "@/constants/routes";
import { appBridge, supportsMultiWebView } from "@/utils/appBridgeAdapter";


// Layouts
import RootLayout from "@/layout/RootLayout";
import MainTabLayout from "@/layout/MainTabLayout";
import FullscreenSubLayout from "@/layout/FullscreenSubLayout";
import SubLayout from "@/layout/SubLayout";
import RouteErrorBoundary from "@/components/common/RouteErrorBoundary";

// Main Tab Pages (정적 임포트 유지)
import MobileHomePageV2 from "@/pages/mobile/MobileHomePageV2";
import MobileBusPage from "@/pages/mobile/MobileBus/MobileBusPage";
import MobileSavePage from "@/pages/mobile/MobileSavePage";
import MobileMyPage from "@/pages/mobile/MobileMyPage";
import MobileTimeTablePage from "@/pages/mobile/MobileTimeTablePage";
import MobileChatListPage from "@/pages/mobile/MobileChatListPage";

// Lazy-loaded Sub Pages
const AiPage = lazy(() => import("@/pages/desktop/AiPage"));
const AiBrandPage = lazy(() => import("@/pages/mobile/Ai/AiBrandPage"));
const MobileWritePage = lazy(() => import("@/pages/mobile/MobileWritePage"));
const AlarmSettingPage = lazy(() => import("@/pages/mobile/AlarmSettingPage"));
const MobileMenuPage = lazy(() => import("@/pages/mobile/MobileMenuPage"));
const MobileCalendarPage = lazy(() => import("@/pages/mobile/MobileCalendarPage"));
const MobileCampusPage = lazy(() => import("@/pages/mobile/MobileCampusPage"));
const MobileUtilPage = lazy(() => import("@/pages/mobile/MobileUtilPage"));
const MobileCouncilPage = lazy(() => import("@/pages/mobile/MobileCouncilPage"));
const MobileClubPage = lazy(() => import("@/pages/mobile/MobileClubPage"));
const MobileClubRecruitDetailPage = lazy(() => import("@/pages/mobile/MobileClubRecruitDetailPage"));
const MobilePostDetailPage = lazy(() => import("@/pages/mobile/MobilePostDetailPage"));
const MobileCouncilNoticeDetailPage = lazy(() => import("@/pages/mobile/MobileCouncilNoticeDetailPage"));
const MobilePetitionDetailPage = lazy(() => import("@/pages/mobile/MobilePetitionDetailPage"));
const MobileProfilePage = lazy(() => import("@/pages/mobile/MobileProfilePage"));
const MobileMyPagePost = lazy(() => import("@/pages/mobile/MobileMyPagePost"));
const MobileMyPageLike = lazy(() => import("@/pages/mobile/MobileMyPageLike"));
const MobileMyPageComment = lazy(() => import("@/pages/mobile/MobileMyPageComment"));
const MobileDeletePage = lazy(() => import("@/pages/mobile/MobileDelete"));
const MobileFcmStatusPage = lazy(() => import("@/pages/mobile/MobileFcmStatusPage"));
const MobileLoginPage = lazy(() => import("@/pages/mobile/MobileLoginPage"));
const MobileBusInfoPage = lazy(() => import("@/pages/mobile/MobileBus/MobileBusInfoPage"));
const MobileBusDetailPage = lazy(() => import("@/pages/mobile/MobileBus/MobileBusDetailPage"));
const MobileBusStopPage = lazy(() => import("@/pages/mobile/MobileBus/MobileBusStopPage"));
const MobileBusMapPage = lazy(() => import("@/pages/mobile/MobileBus/MobileBusMapPage"));
const MobileBusShuttleHelloBusPage = lazy(() => import("@/pages/mobile/MobileBus/MobileBusShuttleHelloBusPage"));
const MobileBusShuttleRouteInfoPage = lazy(() => import("@/pages/mobile/MobileBus/MobileBusShuttleRouteInfoPage"));
const MobileUnidormPage = lazy(() => import("@/pages/mobile/MobileUnidormPage"));
const MobileAdminPage = lazy(() => import("@/pages/mobile/Admin/MobileAdminPage"));
const MobileAdminUserStatisticsPage = lazy(() => import("@/pages/mobile/Admin/MobileAdminUserStatisticsPage"));
const MobileAdminApiStatisticsPage = lazy(() => import("@/pages/mobile/Admin/MobileAdminApiStatisticsPage"));
const MobileAdminFeatureFlagsPage = lazy(() => import("@/pages/mobile/Admin/MobileAdminFeatureFlagsPage"));
const MobileAdminBusPage = lazy(() => import("@/pages/mobile/Admin/MobileAdminBusPage"));
const MobileAdminSearchPage = lazy(() => import("@/pages/mobile/Admin/MobileAdminSearchPage"));

const MobileSchoolNoticePage = lazy(() => import("@/pages/mobile/MobileSchoolNoticePage"));
const MobileSchoolNoticeDetailPage = lazy(() => import("@/pages/mobile/MobileSchoolNoticeDetailPage"));
const MobileDeptNoticePage = lazy(() => import("@/pages/mobile/MobileDeptNoticePage"));
const MobileTipsPage = lazy(() => import("@/pages/mobile/MobileTipsPage"));
const MobileTipsCategoryPage = lazy(() => import("@/pages/mobile/MobileTipsCategoryPage"));
const MobileAlertPage = lazy(() => import("@/pages/mobile/MobileAlertPage"));
const MobileTimeTableEditPage = lazy(() => import("@/pages/mobile/MobileTimeTableEditPage"));
const MobileFriendListPage = lazy(() => import("@/pages/mobile/MobileFriendListPage"));
const AgentPage = lazy(() => import("@/pages/AgentPage"));
const MobileFriendQrPage = lazy(() => import("@/pages/mobile/MobileFriendQrPage"));
const MobileFriendInvitePage = lazy(() => import("@/pages/mobile/MobileFriendInvitePage"));
const MobileTimeTableComparePage = lazy(() => import("@/pages/mobile/timetable/MobileTimeTableComparePage"));
const MobileTimeTableVisibilityPage = lazy(() => import("@/pages/mobile/timetable/MobileTimeTableVisibilityPage"));
const MobileCourseAddPage = lazy(() => import("@/pages/mobile/timetable/MobileCourseAddPage"));
const MobileSugangSimulatorPage = lazy(() => import("@/pages/mobile/timetable/MobileSugangSimulatorPage"));
const MobileCourseFilterPage = lazy(() => import("@/pages/mobile/timetable/MobileCourseFilterPage"));
const MobileTimetableWizardPage = lazy(() => import("@/pages/mobile/timetable/MobileTimetableWizardPage"));
const MobileTimetableGroupWizardPage = lazy(() => import("@/pages/mobile/timetable/MobileTimetableGroupWizardPage"));
const MobileTimetableImageImportPage = lazy(() => import("@/pages/mobile/timetable/MobileTimetableImageImportPage"));
const MobileTimetableImportHubPage = lazy(() => import("@/pages/mobile/timetable/MobileTimetableImportHubPage"));
const MobilePortalTimetableImportPage = lazy(() => import("@/pages/mobile/timetable/MobilePortalTimetableImportPage"));
const MobileTimeTableListPage = lazy(() => import("@/pages/mobile/timetable/MobileTimeTableListPage"));
const MobileGradeCalculatorPage = lazy(() => import("@/pages/mobile/timetable/MobileGradeCalculatorPage"));
const MobileSyllabusPage = lazy(() => import("@/pages/mobile/timetable/MobileSyllabusPage"));
const MobilePhoneBookPage = lazy(() => import("@/pages/mobile/phonebook/MobilePhoneBookPage"));
const MobilePhoneBookDetailPage = lazy(() => import("@/pages/mobile/phonebook/MobilePhoneBookDetailPage"));
const MobilePhoneBookSearchPage = lazy(() => import("@/pages/mobile/phonebook/MobilePhoneBookSearchPage"));
const MobileAdminNotificationPage = lazy(() => import("@/pages/mobile/Admin/MobileAdminNotificationPage"));
const MobileAdminChatPage = lazy(() => import("@/pages/mobile/Admin/MobileAdminChatPage"));
const MoreAppsPage = lazy(() => import("@/pages/mobile/MoreApps/MoreAppsPage"));
const LabsPage = lazy(() => import("@/pages/mobile/Labs/LabsPage"));
const LabsRoutinePage = lazy(() => import("@/pages/mobile/Labs/LabsRoutinePage"));
const BasicInfoPage = lazy(() => import("@/pages/mobile/Labs/BasicInfoPage"));
const PortalTimetableLabPage = lazy(() => import("@/pages/mobile/Labs/PortalTimetableLabPage"));
const PortalDormitoryLabPage = lazy(() => import("@/pages/mobile/Labs/PortalDormitoryLabPage"));
const MobileDormitoryCardPage = lazy(() => import("@/pages/mobile/dormitory/MobileDormitoryCardPage"));
const Festival2026Page = lazy(() => import("@/pages/mobile/Festival2026Page"));
const Festival2026DetailPage = lazy(() => import("@/pages/mobile/Festival2026DetailPage"));
const ChattingPage = lazy(() => import("@/pages/mobile/ChattingPage"));
const CreatePersonalChatPage = lazy(() => import("@/pages/mobile/CreatePersonalChatPage"));
const InviteChatMembersPage = lazy(() => import("@/pages/mobile/InviteChatMembersPage"));
const MobileNotificationSettingsPage = lazy(() => import("@/pages/mobile/MobileNotificationSettingsPage"));
const MobileDailyBriefSettingPage = lazy(() => import("@/pages/mobile/MobileDailyBriefSettingPage"));
const MobileDailyBriefPage = lazy(() => import("@/pages/mobile/MobileDailyBriefPage"));
const MobileSmartWatchManagementPage = lazy(() => import("@/pages/mobile/MobileSmartWatchManagementPage"));
const MobilePortalAccountPage = lazy(() => import("@/pages/mobile/MyPage/MobilePortalAccountPage"));
const MobileLibraryHubPage = lazy(() => import("@/pages/mobile/MobileLibraryHubPage"));
const MobileLmsHubPage = lazy(() => import("@/pages/mobile/MobileLmsHubPage"));
const MobileRoutineDetailPage = lazy(() => import("@/pages/mobile/MobileRoutineDetailPage"));
const MobileUnifiedSearchPage = lazy(() => import("@/pages/mobile/search/MobileUnifiedSearchPage"));
const SchedulePollCreatePage = lazy(() => import("@/pages/mobile/schedulePoll/SchedulePollCreatePage"));
const SchedulePollInvitePage = lazy(() => import("@/pages/mobile/schedulePoll/SchedulePollInvitePage"));
const SchedulePollInputPage = lazy(() => import("@/pages/mobile/schedulePoll/SchedulePollInputPage"));
const SchedulePollStatusPage = lazy(() => import("@/pages/mobile/schedulePoll/SchedulePollStatusPage"));
const SchedulePollResultPage = lazy(() => import("@/pages/mobile/schedulePoll/SchedulePollResultPage"));
const SchedulePollJoinPage = lazy(() => import("@/pages/mobile/schedulePoll/SchedulePollJoinPage"));
const SchedulePollListPage = lazy(() => import("@/pages/mobile/schedulePoll/SchedulePollListPage"));

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
          { path: "", element: <MobileHomePageV2 /> },
          { path: ROUTES.HOME, element: <MobileHomePageV2 /> },
          { path: ROUTES.HOME_V2, element: <Navigate to={ROUTES.HOME} replace /> },
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
          { path: "", element: <MobileHomePageV2 /> },
          { path: "home", element: <MobileHomePageV2 /> },
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
        element: <SubLayout showNav={false} backgroundColor="var(--bg-base)" />,
        children: [
          // 채팅
          { path: "/chat/:roomId", element: <ChattingPage /> },
          { path: "/chat/:roomId/invite", element: <InviteChatMembersPage /> },
          { path: ROUTES.CHAT.CREATE_PERSONAL, element: <CreatePersonalChatPage /> },
        ],
      },
      {
        element: <SubLayout showNav={false} backgroundColor="transparent" />,
        children: [
          // 로그인
          { path: ROUTES.LOGIN, element: <MobileLoginPage /> },

          //시간표
          { path: ROUTES.TIMETABLE.EDIT, element: <MobileTimeTableEditPage /> },
          { path: ROUTES.FRIEND.LIST, element: <MobileFriendListPage /> },
          { path: ROUTES.FRIEND.QR, element: <MobileFriendQrPage /> },
          {
            path: ROUTES.FRIEND.INVITE_PATTERN,
            element: <MobileFriendInvitePage />,
          },
          { path: ROUTES.TIMETABLE.COMPARE, element: <MobileTimeTableComparePage /> },
          { path: ROUTES.TIMETABLE.VISIBILITY, element: <MobileTimeTableVisibilityPage /> },
          { path: ROUTES.TIMETABLE.ADD, element: <MobileCourseAddPage /> },
          { path: ROUTES.TIMETABLE.FILTER, element: <MobileCourseFilterPage /> },
          { path: ROUTES.TIMETABLE.WIZARD, element: <MobileTimetableWizardPage /> },
          {
            path: ROUTES.TIMETABLE.WIZARD_GROUP,
            element: <MobileTimetableGroupWizardPage />,
          },
          {
            path: ROUTES.TIMETABLE.IMPORT_HUB,
            element: <MobileTimetableImportHubPage />,
          },
          {
            path: ROUTES.TIMETABLE.PORTAL_IMPORT,
            element: <MobilePortalTimetableImportPage />,
          },
          {
            path: ROUTES.TIMETABLE.IMAGE_IMPORT,
            element: <MobileTimetableImageImportPage />,
          },
          { path: ROUTES.TIMETABLE.LIST, element: <MobileTimeTableListPage /> },
          { path: ROUTES.TIMETABLE.CALCULATOR, element: <MobileGradeCalculatorPage /> },
          { path: ROUTES.TIMETABLE.SYLLABUS, element: <MobileSyllabusPage /> },

          // 시간 맞추기(일정 조율)
          { path: ROUTES.SCHEDULE_POLL.LIST, element: <SchedulePollListPage /> },
          { path: ROUTES.SCHEDULE_POLL.NEW, element: <SchedulePollCreatePage /> },
          {
            path: ROUTES.SCHEDULE_POLL.JOIN_PATTERN,
            element: <SchedulePollJoinPage />,
          },
          {
            path: ROUTES.SCHEDULE_POLL.INVITE_PATTERN,
            element: <SchedulePollInvitePage />,
          },
          {
            path: ROUTES.SCHEDULE_POLL.INPUT_PATTERN,
            element: <SchedulePollInputPage />,
          },
          {
            path: ROUTES.SCHEDULE_POLL.STATUS_PATTERN,
            element: <SchedulePollStatusPage />,
          },
          {
            path: ROUTES.SCHEDULE_POLL.RESULT_PATTERN,
            element: <SchedulePollResultPage />,
          },

          //전화번호부
          { path: ROUTES.PHONEBOOK.ROOT, element: <MobilePhoneBookPage /> },

          // 통합 검색
          { path: ROUTES.UNIFIED_SEARCH, element: <MobileUnifiedSearchPage /> },
          { path: "/m/search", element: <MobileUnifiedSearchPage /> },

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
                /* 실제 경로: /labs/routine */
                path: "routine",
                element: <LabsRoutinePage />,
              },
              {
                /* 실제 경로: /labs/portal/basic-info */
                path: "portal/basic-info",
                element: <BasicInfoPage />,
              },
              {
                /* 실제 경로: /labs/portal/timetable */
                path: "portal/timetable",
                element: <PortalTimetableLabPage />,
              },
              {
                /* 실제 경로: /labs/portal/dormitory */
                path: "portal/dormitory",
                element: <PortalDormitoryLabPage />,
              },
            ],
          },

          // 스마트 캠퍼스 서비스 허브 (도서관, LMS)
          {
            path: ROUTES.SERVICES.LIBRARY,
            element: <MobileLibraryHubPage />,
          },
          {
            path: ROUTES.SERVICES.LMS,
            element: <MobileLmsHubPage />,
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
          {
            path: ROUTES.AI.ROOT,
            children: [
              { index: true, element: <AiBrandPage /> },
              { path: "image-generation", element: <AiPage /> },
            ],
          },

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
          {
            path: ROUTES.BOARD.NOTICE,
            children: [
              { index: true, element: <MobileSchoolNoticePage /> },
              { path: ":id", element: <MobileSchoolNoticeDetailPage /> },
            ],
          },
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
          { path: ROUTES.MYPAGE.PORTAL_ACCOUNT, element: <MobilePortalAccountPage /> },
          { path: ROUTES.MYPAGE.NOTIFICATION, element: <MobileNotificationSettingsPage /> },
          { path: ROUTES.MYPAGE.DAILY_BRIEF, element: <MobileDailyBriefSettingPage /> },
          { path: ROUTES.DAILY_BRIEF.ROOT, element: <MobileDailyBriefPage /> },
          {
            path: ROUTES.DAILY_BRIEF.ROUTINE_DETAIL_PATTERN,
            element: <MobileRoutineDetailPage />,
          },
          { path: ROUTES.MYPAGE.SMART_WATCH, element: <MobileSmartWatchManagementPage /> },

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
          {
            path: ROUTES.ADMIN.BUS,
            element: <MobileAdminBusPage />,
          },
          {
            path: ROUTES.ADMIN.SEARCH,
            element: <MobileAdminSearchPage />,
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
        element: <FullscreenSubLayout backgroundColor="var(--bg-base)" />,
        children: [
          { path: ROUTES.TIMETABLE.SIMULATOR, element: <MobileSugangSimulatorPage /> },
          { path: "/agent", element: <AgentPage /> },
          { path: "/assistant", element: <AgentPage /> },
          { path: ROUTES.DORMITORY_CARD, element: <MobileDormitoryCardPage /> },
          { path: ROUTES.LABS.PORTAL.DORMITORY_CARD, element: <MobileDormitoryCardPage /> },
        ],
      },
    ],
  },
]);

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
        // 이 웹뷰 안에 되돌릴 것(모달/SPA 히스토리)이 있으면 웹에서 처리하고,
        // 없을 때만 네이티브가 웹뷰를 pop 한다. appBridgeAdapter 참고.
        appBridge.requestBack();
        return Promise.resolve();
      }
      return (originalNavigate as any).call(router, to, opts);
    }

    const path = getPathname(to);
    const isTabNavigation = opts?.state?.isTabNavigation === true;
    const isHomePath = path === ROUTES.HOME || path === ROUTES.MOBILE_HOME;
    // 이 웹뷰 자신의 최초 부트스트랩 리다이렉트(루트 인덱스 라우트의
    // <Navigate to={ROUTES.HOME} replace />, router.tsx 라우트 테이블 참고).
    const isBootstrapRedirect = window.location.pathname === "/" && isHomePath;

    // 단순 해시(#)나 쿼리(?)만 변경하는 라우팅이거나 빈 이동인지 확인
    const isHashOrSearchOnly =
      to === "" ||
      (typeof to === "string" && (to.startsWith("#") || to.startsWith("?"))) ||
      (typeof to === "object" && to !== null && !to.pathname);
    const isSamePath = window.location.pathname === path;
    const isCurrentInMainTab = isMainTabPath(window.location.pathname);

    // 2. 메인 탭 경로 이동:
    // - 이미 루트/메인 탭 화면에 있는 상태에서 다른 메인 탭으로 이동하거나 쿼리를 변경하는 경우: 웹 내부 SPA 이동 유지
    // - 서브 웹뷰(pushed webview)에서 메인 탭으로 복귀하는 경우에만 네이티브로 위임(collapse stack)
    if (
      supportsMultiWebView() &&
      isMainTabPath(path) &&
      !isCurrentInMainTab &&
      !isTabNavigation &&
      !isBootstrapRedirect &&
      !isSamePath &&
      !isHashOrSearchOnly
    ) {
      appBridge.goHome(path);
      return Promise.resolve();
    }

    // 3. 신규 멀티 웹뷰 환경이고 메인 탭이 아니며, 탭 이동 옵션도 없는 경우 -> 새 웹뷰 액티비티로 오픈
    if (
      supportsMultiWebView() &&
      !isMainTabPath(path) &&
      !isTabNavigation &&
      !opts?.replace &&
      !isHashOrSearchOnly
    ) {
      const fullPath = typeof to === "string"
        ? to
        : `${to.pathname || ""}${to.search || ""}${to.hash || ""}`;
      appBridge.navigateTo(fullPath);
      return Promise.resolve(); // 현재 웹뷰에서의 SPA 라우팅을 수행하지 않음
    }

    return (originalNavigate as any).call(router, to, opts);
  };
}


