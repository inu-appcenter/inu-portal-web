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
  trackEvent("Page Viewed", {
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
    trackEvent("Nav Tab Clicked", {
      tab_name: tabName,
    });
  },

  /**
   * 주요 기능 버튼 클릭 (홈 카테고리, 칩, 하단 탭, 메뉴 버튼 등)
   */
  featureClicked: (featureName: string, location: string) => {
    trackEvent("Feature Clicked", {
      feature_name: featureName,
      location: location,
    });
  },

  // --- 2. 기능별 핵심 액션 (Core Actions) ---

  /**
   * 버스 UI 버전 스위칭 (신버전 <-> 구버전)
   */
  busUiSwitched: (toVersion: "new" | "legacy", fromLocation: string) => {
    trackEvent("Bus UI Switched", {
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
    trackEvent("Bus Checked", {
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
    trackEvent("Cafeteria Viewed", {
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
    trackEvent("Notice Viewed", {
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
    trackEvent("Notice Viewed", {
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
    trackEvent("Academic Calendar Viewed", {
      year: year,
      month: month,
    });
  },

  /**
   * 특정 날짜의 상세 일정 클릭
   */
  calendarDateClicked: (date: string) => {
    trackEvent("Calendar Date Clicked", {
      clicked_date: date,
    });
  },

  /**
   * 학사 일정 알림 설정 버튼 클릭
   */
  calendarNotificationClicked: () => {
    trackEvent("Calendar Notification Clicked");
  },

  /**
   * 일정 상세 모달 조회
   */
  scheduleModalViewed: (
    source: "Calendar" | "Dept Notice",
    scheduleCount: number,
  ) => {
    trackEvent("Schedule Modal Viewed", {
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
    trackEvent("Schedule Interaction", {
      action_type: actionType,
      schedule_title: title,
      schedule_type: type,
    });
  },

  /**
   * 캠퍼스맵 탭 전환
   */
  campusMapTabSwitched: (tabName: string) => {
    trackEvent("Campus Map Tab Switched", {
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
    trackEvent("Campus Map Place Selected", {
      place_name: placeName,
      category: category,
      selection_method: method,
    });
  },

  /**
   * 캠퍼스맵 현위치 추적 토글
   */
  campusMapTrackingToggled: (isEnabled: boolean) => {
    trackEvent("Campus Map Tracking Toggled", {
      is_enabled: isEnabled,
    });
  },

  /**
   * 동아리 카테고리 필터링
   */
  clubCategorySelected: (category: string) => {
    trackEvent("Club Category Selected", {
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
    trackEvent("Club External Link Clicked", {
      club_name: clubName,
      link_type: linkType,
    });
  },

  /**
   * 동아리 모집 공고 조회
   */
  clubRecruitViewed: (clubName: string) => {
    trackEvent("Club Recruit Viewed", {
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
    trackEvent("Phonebook Search Performed", {
      keyword: keyword,
      category: category,
      section: section,
    });
  },

  /**
   * 전화번호부 상세 정보 조회
   */
  phonebookDetailViewed: (name: string, kind: "person" | "office") => {
    trackEvent("Phonebook Detail Viewed", {
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
    trackEvent("Phonebook Interaction", {
      action_type: actionType,
      entry_name: entryName,
      field_label: label,
    });
  },

  /**
   * 게시판(TIPS) 상세 조회
   */
  tipViewed: (category: string, title: string) => {
    trackEvent("Tip Viewed", {
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
    trackEvent("Board Interaction", {
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
    trackEvent("Search Performed", {
      search_type: searchType,
      keyword: keyword,
      result_count: resultCount,
    });
  },

  /**
   * 알림 상세 클릭
   */
  notificationClicked: (type: string, title: string) => {
    trackEvent("Notification Clicked", {
      notification_type: type,
      title: title,
    });
  },

  /**
   * 알림 설정 페이지 진입
   */
  notificationSettingsOpened: (location: string, tab?: string) => {
    trackEvent("Notification Settings Opened", {
      location: location,
      tab: tab,
    });
  },

  /**
   * 알림 설정 탭 전환
   */
  noticeSettingTabSwitched: (toTab: string) => {
    trackEvent("Notice Setting Tab Switched", {
      to_tab: toTab,
    });
  },

  /**
   * 학교 공지 카테고리 알림 토글
   */
  noticeCategoryToggled: (category: string, isSubscribed: boolean) => {
    trackEvent("Notice Category Toggled", {
      notice_type: "School",
      category_name: category,
      is_subscribed: isSubscribed,
    });
  },

  /**
   * 공지 키워드 추가
   */
  noticeKeywordAdded: (
    noticeType: "School" | "Department",
    keyword: string,
    extraInfo?: string,
  ) => {
    const properties: Record<string, any> = {
      notice_type: noticeType,
      keyword: keyword,
    };
    if (noticeType === "School") {
      properties.category_scope = extraInfo || "전체";
    } else {
      properties.department_name = extraInfo;
    }

    trackEvent("Notice Keyword Added", properties);
  },

  /**
   * 공지 키워드 삭제
   */
  noticeKeywordDeleted: (
    noticeType: "School" | "Department",
    keyword: string,
    extraInfo?: string,
  ) => {
    const properties: Record<string, any> = {
      notice_type: noticeType,
      keyword: keyword,
    };
    if (noticeType === "School") {
      properties.category_scope = extraInfo || "전체";
    } else {
      properties.department_name = extraInfo;
    }

    trackEvent("Notice Keyword Deleted", properties);
  },

  /**
   * 학과 공지 전체 알림 토글
   */
  noticeAllToggled: (departmentName: string, isSubscribed: boolean) => {
    trackEvent("Notice All Toggled", {
      notice_type: "Department",
      department_name: departmentName,
      is_subscribed: isSubscribed,
    });
  },

  /**
   * 프로모션/배너 노출
   */
  promotionImpression: (promoName: string, location: string) => {
    trackEvent("Promotion Impression", {
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
    trackEvent("Promotion Clicked", {
      promo_name: promoName,
      action_type: actionType,
      location: location,
    });
  },

  /**
   * 마이페이지 메뉴 클릭
   */
  mypageMenuClicked: (menuName: string) => {
    trackEvent("Mypage Menu Clicked", {
      menu_name: menuName,
    });
  },

  /**
   * 프로필 수정 완료
   */
  profileUpdated: (updatedFields: string[]) => {
    trackEvent("Profile Updated", {
      updated_fields: updatedFields,
    });
  },

  /**
   * 로그아웃
   */
  userLoggedOut: () => {
    trackEvent("User Logged Out");
    resetMixpanel();
  },

  /**
   * 회원 탈퇴
   */
  userAccountDeleted: (reason?: string) => {
    trackEvent("User Account Deleted", {
      reason: reason,
    });
    resetMixpanel();
  },
};
