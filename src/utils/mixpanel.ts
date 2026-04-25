import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

/**
 * Mixpanel 초기화
 */
export const initMixpanel = () => {
  if (MIXPANEL_TOKEN) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: import.meta.env.DEV,
      track_pageview: false, // SPA이므로 수동 추적 권장
      persistence: "localStorage",

      record_sessions_percent: 100, // 0~100 (샘플링 비율)
    });

    // 모든 이벤트에 공통으로 포함될 전역 속성 등록
    mixpanel.register({
      platform: "Web",
      service_name: "inu-portal-web",
    });
  } else {
    if (import.meta.env.DEV) {
      console.warn(
        "Mixpanel token이 없습니다. .env에 VITE_MIXPANEL_TOKEN을 등록해주세요.",
      );
    }
  }
};

/**
 * 일반 이벤트 추적
 */
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>,
) => {
  if (MIXPANEL_TOKEN) {
    mixpanel.track(eventName, properties);
  }
};

/**
 * 사용자 식별
 */
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (MIXPANEL_TOKEN) {
    mixpanel.identify(userId);
    if (traits) {
      mixpanel.people.set(traits);
    }
  }
};

/**
 * 로그아웃 시 사용자 정보 초기화
 */
export const resetMixpanel = () => {
  if (MIXPANEL_TOKEN) {
    mixpanel.reset();
  }
};

/**
 * 페이지 뷰 추적
 */
export const trackPageView = (
  pageName: string,
  properties?: Record<string, any>,
) => {
  trackEvent("페이지 조회", {
    page_name: pageName,
    ...properties,
  });
};

/**
 * 핵심 기능별 프리셋 함수 (Navigation vs. Action 계층 구조)
 * 속성명은 Mixpanel 권장사항인 snake_case를 사용합니다.
 */
export const mixpanelTrack = {
  // --- 1. 진입 및 이동 (Navigation) ---

  /**
   * 하단 네비게이션 탭 클릭
   */
  navTabClicked: (tabName: string) => {
    trackEvent("바텀바 탭 클릭", {
      tab_name: tabName,
    });
  },

  /**
   * 주요 기능 버튼 클릭 (홈 카테고리, 칩, 하단 탭, 메뉴 버튼 등)
   */
  featureClicked: (featureName: string, location: string) => {
    trackEvent("기능 클릭", {
      feature_name: featureName,
      location: location,
    });
  },

  // --- 2. 기능별 핵심 액션 (Core Actions) ---

  /**
   * 버스 UI 버전 스위칭 (신버전 <-> 구버전)
   */
  busUiSwitched: (toVersion: "new" | "legacy", fromLocation: string) => {
    trackEvent("[인입런] UI 전환", {
      to_version: toVersion,
      location: fromLocation,
    });
  },

  /**
   * 버스 정보 조회 (도착 정보, 노선 등)
   */
  busChecked: (
    busType: string,
    routeName: string,
    stopName?: string,
    uiVersion?: string,
  ) => {
    trackEvent("[인입런] 버스 정보 확인", {
      bus_type: busType,
      route_name: routeName,
      stop_name: stopName,
      ui_version: uiVersion,
    });
  },

  /**
   * 식당 메뉴 조회
   */
  cafeteriaViewed: (cafeteriaName: string, day: string) => {
    trackEvent("[식당 메뉴] 조회", {
      cafeteria_name: cafeteriaName,
      day_of_week: day,
    });
  },

  /**
   * 학교 공지사항 상세 조회
   */
  noticeViewed: (
    category: string,
    title: string,
    isFromSearch: boolean = false,
  ) => {
    trackEvent("[학교 공지] 조회", {
      notice_type: "School",
      category: category,
      title: title,
      is_from_search: isFromSearch,
    });
  },

  /**
   * 학과 공지사항 상세 조회
   */
  deptNoticeViewed: (
    deptName: string,
    title: string,
    isFromSearch: boolean = false,
  ) => {
    trackEvent("[학과 공지] 조회", {
      notice_type: "Department",
      department_name: deptName,
      title: title,
      is_from_search: isFromSearch,
    });
  },

  /**
   * 학사 일정 조회 및 인터랙션 (월 단위)
   */
  academicCalendarViewed: (year: number, month: number) => {
    trackEvent("[학사 일정] 조회", {
      year: year,
      month: month,
    });
  },

  /**
   * 특정 날짜의 상세 일정 클릭
   */
  calendarDateClicked: (date: string) => {
    trackEvent("[학사 일정] 날짜 클릭", {
      clicked_date: date,
    });
  },

  /**
   * 학사 일정 알림 설정 버튼 클릭
   */
  calendarNotificationClicked: () => {
    trackEvent("[학사 일정] 알림 설정 버튼 클릭", {});
  },

  /**
   * 일정 상세 모달 조회
   */
  scheduleModalViewed: (
    source: "Calendar" | "Dept Notice",
    scheduleCount: number,
  ) => {
    trackEvent("[학사 일정] 상세 모달 조회", {
      source: source,
      schedule_count: scheduleCount,
    });
  },

  /**
   * 일정 상세 인터랙션 (토글, 링크 클릭 등)
   */
  scheduleInteraction: (
    actionType: "Toggle Detail" | "View Original Notice",
    title: string,
    type: "school" | "dept",
  ) => {
    trackEvent("[학사 일정] 상세 모달 상호작용", {
      action_type: actionType,
      schedule_title: title,
      schedule_type: type,
    });
  },

  /**
   * 캠퍼스맵 탭 전환
   */
  campusMapTabSwitched: (tabName: string) => {
    trackEvent("[캠퍼스맵] 탭 전환", {
      tab_name: tabName,
    });
  },

  /**
   * 캠퍼스맵 장소 선택 (리스트 혹은 마커 클릭)
   */
  campusMapPlaceSelected: (
    placeName: string,
    category: string,
    method: "List" | "Marker",
  ) => {
    trackEvent("[캠퍼스맵] 장소 선택", {
      place_name: placeName,
      category: category,
      selection_method: method,
    });
  },

  /**
   * 캠퍼스맵 현위치 추적 토글
   */
  campusMapTrackingToggled: (isEnabled: boolean) => {
    trackEvent("[캠퍼스맵] 내 위치 버튼", {
      is_enabled: isEnabled,
    });
  },

  /**
   * 동아리 카테고리 필터링
   */
  clubCategorySelected: (category: string) => {
    trackEvent("[동아리] 카테고리 선택", {
      category: category,
    });
  },

  /**
   * 동아리 관련 외부 링크 클릭 (소개 페이지, 홈페이지 등)
   */
  clubExternalLinkClicked: (
    clubName: string,
    linkType: "Intro" | "Homepage",
  ) => {
    trackEvent("[동아리] 외부 링크 클릭", {
      club_name: clubName,
      link_type: linkType,
    });
  },

  /**
   * 동아리 모집 공고 조회
   */
  clubRecruitViewed: (clubName: string) => {
    trackEvent("[동아리] 공고 조회", {
      club_name: clubName,
    });
  },

  /**
   * 전화번호부 검색 수행
   */
  phonebookSearchPerformed: (
    keyword: string,
    category: string,
    section: string,
  ) => {
    trackEvent("[전화번호부] 검색", {
      keyword: keyword,
      category: category,
      section: section,
    });
  },

  /**
   * 전화번호부 상세 정보 조회
   */
  phonebookDetailViewed: (name: string, kind: "person" | "office") => {
    trackEvent("[전화번호부] 상세 조회", {
      entry_name: name,
      entry_kind: kind,
    });
  },

  /**
   * 전화번호부 내 인터랙션 (전화, 복사, 사이트 방문 등)
   */
  phonebookInteraction: (
    actionType: "Call" | "Copy" | "Email" | "Visit",
    entryName: string,
    label: string,
  ) => {
    trackEvent("[전화번호부] 상호작용", {
      action_type: actionType,
      entry_name: entryName,
      field_label: label,
    });
  },

  /**
   * 게시판(TIPS) 상세 조회
   */
  tipViewed: (category: string, title: string) => {
    trackEvent("[TIPS] 글 조회", {
      category: category,
      title: title,
    });
  },

  /**
   * 게시판 내 인터랙션 (글쓰기, 댓글, 좋아요, 스크랩)
   */
  boardInteraction: (
    actionType: "Write" | "Comment" | "Like" | "Scrap",
    boardType: string,
    category?: string,
  ) => {
    trackEvent("[TIPS] 상호작용", {
      action_type: actionType,
      board_type: boardType,
      category: category,
    });
  },

  /**
   * 검색 수행
   */
  searchPerformed: (
    searchType: "Phonebook" | "Post" | "Notice",
    keyword: string,
    resultCount: number,
  ) => {
    trackEvent("[TIPS] 수행", {
      search_type: searchType,
      keyword: keyword,
      result_count: resultCount,
    });
  },

  /**
   * 알림 상세 클릭
   */
  notificationClicked: (type: string, title: string) => {
    trackEvent("[알림] 클릭", {
      notification_type: type,
      title: title,
    });
  },

  /**
   * 알림 설정 페이지 진입
   */
  notificationSettingsOpened: (location: string, tab?: string) => {
    trackEvent("[공지알리미] 설정 진입", {
      location: location,
      tab: tab,
    });
  },

  /**
   * 알림 설정 탭 전환
   */
  noticeSettingTabSwitched: (toTab: string) => {
    trackEvent("[공지알리미] 탭 전환", {
      to_tab: toTab,
    });
  },

  /**
   * 학교 공지 카테고리 알림 토글
   */
  noticeCategoryToggled: (
    category: string,
    isSubscribed: boolean,
    location?: string,
  ) => {
    trackEvent("[공지알리미] 학교 공지 카테고리 토글", {
      notice_type: "School",
      category_name: category,
      is_subscribed: isSubscribed,
      location: location,
    });
  },

  /**
   * 공지 키워드 추가
   */
  noticeKeywordAdded: (
    noticeType: "School" | "Department",
    keyword: string,
    extraInfo?: string,
    location?: string,
  ) => {
    const properties: Record<string, any> = {
      notice_type: noticeType,
      keyword: keyword,
      location: location,
    };
    if (noticeType === "School") {
      properties.category_scope = extraInfo || "전체";
    } else {
      properties.department_name = extraInfo;
    }

    trackEvent("[공지알리미] 키워드 추가", properties);
  },

  /**
   * 공지 키워드 삭제
   */
  noticeKeywordDeleted: (
    noticeType: "School" | "Department",
    keyword: string,
    extraInfo?: string,
    location?: string,
  ) => {
    const properties: Record<string, any> = {
      notice_type: noticeType,
      keyword: keyword,
      location: location,
    };
    if (noticeType === "School") {
      properties.category_scope = extraInfo || "전체";
    } else {
      properties.department_name = extraInfo;
    }

    trackEvent("[공지알리미] 공지 키워드 삭제", properties);
  },

  /**
   * 학과 공지 전체 알림 토글
   */
  noticeAllToggled: (
    departmentName: string,
    isSubscribed: boolean,
    location?: string,
  ) => {
    trackEvent("[공지알리미] 학과 공지 전체 토글", {
      notice_type: "Department",
      department_name: departmentName,
      is_subscribed: isSubscribed,
      location: location,
    });
  },

  /**
   * 프로모션/배너 노출
   */
  promotionImpression: (promoName: string, location: string) => {
    trackEvent("[프로모션/배너] 노출", {
      promo_name: promoName,
      location: location,
    });
  },

  /**
   * 프로모션/배너 클릭 혹은 액션
   */
  promotionClicked: (
    promoName: string,
    actionType: string,
    location: string,
  ) => {
    trackEvent("[프로모션/배너] 클릭", {
      promo_name: promoName,
      action_type: actionType,
      location: location,
    });
  },

  /**
   * 마이페이지 메뉴 클릭
   */
  mypageMenuClicked: (menuName: string) => {
    trackEvent("[마이페이지] 메뉴 클릭", {
      menu_name: menuName,
    });
  },

  /**
   * 프로필 수정 완료
   */
  profileUpdated: (updatedFields: string[]) => {
    trackEvent("[내정보] 프로필 수정 완료", {
      updated_fields: updatedFields,
    });
  },

  /**
   * 로그아웃
   */
  userLoggedOut: () => {
    trackEvent("사용자 로그아웃");
    resetMixpanel();
  },

  /**
   * 회원 탈퇴
   */
  userAccountDeleted: (reason?: string) => {
    trackEvent("회원 탈퇴", {
      reason: reason,
    });
    resetMixpanel();
  },
};
