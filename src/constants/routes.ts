export const ROUTES = {
  ROOT: "/",
  MOBILE_ROOT: "/m",

  LOGIN: "/login",

  HOME: "/home",
  MOBILE_HOME: "/m/home",
  HOME_V2: "/home/v2",

  // 횃불이 AI
  AI: {
    ROOT: "/ai",
    IMAGE_GEN: "/ai/image-generation",
  },
  SAVE: "/save",

  FESTIVAL2026: "/festival2026",
  FESTIVAL2026_DETAIL: "/festival2026/detail",

  TIMETABLE: {
    ROOT: "/timetable",
    EDIT: "/timetable/edit",
    COMPARE: "/timetable/compare",
    VISIBILITY: "/timetable/visibility",
    ADD: "/timetable/add",
    SIMULATOR: "/timetable/simulator",
    FILTER: "/timetable/filter",
    LIST: "/timetable/list",
    CALCULATOR: "/timetable/calculator",
    SYLLABUS: "/timetable/syllabus",
    WIZARD: "/timetable/wizard",
  },

  // 친구
  FRIEND: {
    LIST: "/friend/list",
    QR: "/friend/qr",
    // 초대 링크. functions/_middleware.ts 의 OG 태그 주입 경로와 맞춰져 있다.
    INVITE: (code: string) => `/friend/invite/${code}`,
    INVITE_PATTERN: "/friend/invite/:code",
  },

  //전화번호부
  PHONEBOOK: {
    ROOT: "/phonebook",
    SEARCH: "/phonebook/search",
    DETAIL: "/phonebook/detail",
  },

  //앱센터의 다른 앱
  MORE_APPS: {
    ROOT: "/more-apps",
  },

  //실험실
  LABS: {
    ROOT: "/labs",
    PORTAL: {
      BASIC_INFO: "/labs/portal/basic-info",
    },
  },

  // 마이페이지
  MYPAGE: {
    ROOT: "/mypage",
    PROFILE: "/mypage/profile",
    POSTS: "/mypage/post",
    LIKES: "/mypage/like",
    COMMENTS: "/mypage/comment",
    DELETE: "/mypage/delete",
    FCM: "/mypage/fcm",
    NOTIFICATION: "/mypage/notification",
  },

  // 게시판 및 기능
  BOARD: {
    ALERT: "/home/alert",
    TIPS: "/home/tips",
    TIPS_CATEGORY: (category: string) => `/home/tips/category/${category}`,
    TIPS_DETAIL: (id: string | number) => `/home/tips/${id}`,
    TIPS_WRITE: "/home/tips/write",
    TIPS_EDIT: (id: string | number) => `/home/tips/write/${id}`,
    NOTICE: "/home/notice",
    DEPT_NOTICE: "/home/deptnotice",
    DEPT_NOTICE_DETAIL: (dept: string | number) =>
      `/home/deptnotice?dept=${dept}`,
    DEPT_SETTING: "/home/deptnotice/setting",
    MENU: "/home/menu",
    CALENDAR: "/home/calendar",
    CAMPUS: "/home/campus",
    UTIL: "/home/util",
    COUNCIL: "/home/council",
    CLUB: "/home/club",
    CLUB_RECRUIT_DETAIL: "/home/recruitdetail",
  },

  // 상세 페이지
  DETAIL: {
    POST: "/postdetail",
    COUNCIL_NOTICE: "/councilnoticedetail",
    PETITION: "/petitiondetail",
  },

  // 버스
  BUS: {
    ROOT: "/bus",
    INFO: "/bus/info",
    INFO_MAP: "/bus/info/map",
    DETAIL: "/bus/info/detail",
    STOP_INFO: "/bus/stopinfo",
    SHUTTLE_HELLO: "/bus/shuttle/hellobus",
    SHUTTLE_ROUTE: "/bus/shuttle",
  },

  // 채팅
  CHAT: {
    ROOT: "/chat",
    LIST: "/chat/list",
    CREATE_PERSONAL: "/chat/create/personal",
  },

  // 기타
  UNIDORM: "/unidorm",

  // 관리자
  ADMIN: {
    ROOT: "/admin",
    USER_STAT: "/admin/userstatistics",
    API_STAT: "/admin/apistatistics",
    USER_NOTIFICATIION: "/admin/usernotification",
    FEATURE_FLAGS: "/admin/feature-flags",
    CHAT: "/admin/chat",
    BUS: "/admin/bus",
  },

} as const;

export const MAIN_TAB_PATHS = new Set([
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
  "/m/timetable",
]);

export function isMainTabPath(path: string): boolean {
  if (!path) return false;
  const cleanPath = path.split("?")[0].split("#")[0];
  return MAIN_TAB_PATHS.has(cleanPath);
}

