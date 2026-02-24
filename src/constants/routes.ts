export const ROUTES = {
  ROOT: "/",
  MOBILE_ROOT: "/m",

  LOGIN: "/login",

  HOME: "/home",
  MOBILE_HOME: "/m/home",

  AI: "/ai",
  SAVE: "/save",

  //시간표
  TIMETABLE: {
    ROOT: "/timetable",
    EDIT: "/timetable/edit",
  },

  //전화번호부
  PHONEBOOK: {
    ROOT: "/phonebook",
  },

  // 마이페이지
  MYPAGE: {
    ROOT: "/mypage",
    PROFILE: "/mypage/profile",
    POSTS: "/mypage/post",
    LIKES: "/mypage/like",
    COMMENTS: "/mypage/comment",
    DELETE: "/mypage/delete",
  },

  // 게시판 및 기능
  BOARD: {
    ALERT: "/home/alert",
    TIPS: "/home/tips",
    TIPS_CATEGORY: (category: string) => `/home/tips/category/${category}`,
    TIPS_DETAIL: (id: string | number) => `/home/tips/${id}`,
    TIPS_WRITE: "/home/tips/write",
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
    DETAIL: "/bus/info/detail",
    STOP_INFO: "/bus/stopinfo",
    SHUTTLE_HELLO: "/bus/shuttle/hellobus",
    SHUTTLE_ROUTE: "/bus/shuttle",
  },

  // 기타
  UNIDORM: "/unidorm",

  // 관리자
  ADMIN: {
    ROOT: "/admin",
    USER_STAT: "/admin/userstatistics",
    API_STAT: "/admin/apistatistics",
  },
} as const;
