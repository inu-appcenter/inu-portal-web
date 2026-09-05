import mixpanel from "mixpanel-browser";
import { getMobilePlatform } from "./getMobilePlatform";

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
      platform: getMobilePlatform(),
      service_name: "INTIP",
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
    location?: string,
  ) => {
    trackEvent("[학교 공지] 조회", {
      notice_type: "School",
      category: category,
      title: title,
      is_from_search: isFromSearch,
      location: location || (isFromSearch ? "School Notice Search" : "School Notice Page"),
    });
  },

  /**
   * 학과 공지사항 상세 조회
   */
  deptNoticeViewed: (
    deptName: string,
    title: string,
    isFromSearch: boolean = false,
    location?: string,
  ) => {
    trackEvent("[학과 공지] 조회", {
      notice_type: "Department",
      department_name: deptName,
      title: title,
      is_from_search: isFromSearch,
      location: location || (isFromSearch ? "Department Notice Search" : "Department Notice Page"),
    });
  },

  /**
   * 학사 일정 월 변경
   */
  academicCalendarMonthChanged: (
    year: number,
    month: number,
    direction: "Prev" | "Next",
  ) => {
    trackEvent("[학사 일정] 월 변경", {
      year: year,
      month: month,
      direction: direction,
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
   * 알림 클릭
   */
  notificationClicked: (properties: {
    notification_id: string;
    notification_type?: string;
    campaign_id?: string;
    source: "push" | "inbox";
    target_screen?: string;
    target_id?: number;
    sent_at?: string;
    clicked_at: string;
  }) => {
    trackEvent("notification_clicked", properties);
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
    isExcluded: boolean = false,
  ) => {
    const properties: Record<string, any> = {
      notice_type: noticeType,
      keyword: keyword,
      is_excluded: isExcluded,
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
    isExcluded: boolean = false,
  ) => {
    const properties: Record<string, any> = {
      notice_type: noticeType,
      keyword: keyword,
      is_excluded: isExcluded,
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
   * 홈 위젯 노출 (Impression)
   */
  widgetImpression: (widgetName: string, location: string) => {
    trackEvent("[홈 위젯] 노출", {
      widget_name: widgetName,
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

  /**
   * 축제 페이지 카테고리 탭 전환
   */
  festivalCategorySwitched: (categoryName: string) => {
    trackEvent("[축제] 카테고리 탭 전환", {
      category_name: categoryName,
    });
  },

  /**
   * 축제 상세 정보 조회
   */
  festivalDetailViewed: (infoType: string, infoTitle: string) => {
    trackEvent("[축제] 상세 정보 조회", {
      info_type: infoType,
      info_title: infoTitle,
    });
  },

  /**
   * 축제 채팅방 진입 시도
   */
  festivalChatEntered: (roomId: number) => {
    trackEvent("[축제] 채팅방 진입", {
      room_id: roomId,
    });
  },

  /**
   * 채팅 메시지 전송
   */
  chatMessageSent: (
    roomId: string,
    isAnonymous: boolean,
    hasImage: boolean,
    isFestivalChat: boolean = false,
  ) => {
    trackEvent("[채팅] 메시지 전송", {
      room_id: roomId,
      is_anonymous: isAnonymous,
      has_image: hasImage,
      is_festival_chat: isFestivalChat,
    });
  },

  /**
   * 채팅 탭 전환
   */
  chatTabSwitched: (tabName: string) => {
    trackEvent("[채팅] 탭 전환", {
      tab_name: tabName,
    });
  },

  /**
   * 채팅 목록에서 채팅방 클릭
   */
  chatRoomClicked: (roomId: number, roomType: string) => {
    trackEvent("[채팅] 채팅방 클릭", {
      room_id: roomId,
      room_type: roomType,
    });
  },

  /**
   * 친구 관련 기능 클릭
   */
  friendActionClicked: (actionName: string) => {
    trackEvent("[친구] 기능 클릭", {
      action_name: actionName,
    });
  },

  /**
   * 채팅방 내 메뉴/기능 클릭
   */
  chatRoomMenuClicked: (featureName: string, roomId: string) => {
    trackEvent("[채팅] 메뉴 클릭", {
      feature_name: featureName,
      room_id: roomId,
    });
  },

  /**
   * 채팅 푸시 알림 설정 토글
   */
  chatPushToggled: (isEnabled: boolean, location?: string) => {
    trackEvent("[채팅] 푸시 알림 토글", {
      is_enabled: isEnabled,
      location: location,
    });
  },

  /**
   * 시간표 화면 조회
   */
  timetableViewed: (
    pageName: string,
    properties?: {
      semester?: string;
      timetable_count?: number;
      course_count?: number;
      is_logged_in?: boolean;
    },
  ) => {
    trackEvent("[시간표] 화면 조회", {
      page_name: pageName,
      ...properties,
    });
  },

  /**
   * 시간표 메뉴/기능 클릭
   */
  timetableFeatureClicked: (
    featureName: string,
    location: string,
    properties?: Record<string, any>,
  ) => {
    trackEvent("[시간표] 기능 클릭", {
      feature_name: featureName,
      location: location,
      ...properties,
    });
  },

  /**
   * 시간표 생성/수정/삭제 등 관리 액션 완료
   */
  timetableActionCompleted: (
    actionType:
      | "생성"
      | "이름 변경"
      | "삭제"
      | "대표 설정"
      | "공개 범위 변경"
      | "테마 변경"
      | "링크 공유",
    properties?: Record<string, any>,
  ) => {
    trackEvent("[시간표] 관리 액션 완료", {
      action_type: actionType,
      ...properties,
    });
  },

  /**
   * 시간표 요소(강의/커스텀 일정) 액션 완료
   */
  timetableItemActionCompleted: (
    actionType: "강의 추가" | "직접 일정 추가" | "직접 일정 수정" | "항목 삭제",
    itemType: "강의" | "직접 일정",
    properties?: Record<string, any>,
  ) => {
    trackEvent("[시간표] 항목 액션 완료", {
      action_type: actionType,
      item_type: itemType,
      ...properties,
    });
  },

  /**
   * 강의 검색/필터 액션
   */
  timetableCourseSearchAction: (
    actionType: "필터 열기" | "필터 적용" | "필터 초기화" | "강의 펼치기",
    properties?: Record<string, any>,
  ) => {
    trackEvent("[시간표] 강의 검색 액션", {
      action_type: actionType,
      ...properties,
    });
  },

  /**
   * 시간표 비교/공강 기능 액션
   */
  timetableCompareAction: (
    actionType: "탭 전환" | "친구 선택" | "공강 선택" | "공유",
    properties?: Record<string, any>,
  ) => {
    trackEvent("[시간표] 비교 액션", {
      action_type: actionType,
      ...properties,
    });
  },

  /**
   * 시간표 마법사 액션
   */
  timetableWizardAction: (
    actionType: "시작" | "단계 완료" | "추천 생성" | "후보 선택" | "저장",
    properties?: Record<string, any>,
  ) => {
    trackEvent("[시간표] 마법사 액션", {
      action_type: actionType,
      ...properties,
    });
  },

  // --- 3. 운영/기술 이벤트 (Operational) ---

  /**
   * PWA 잔재(서비스워커 등록 + Cache Storage) 정리 완료.
   *
   * 옛 PWA·임시 핫픽스 워커가 아직 남아 있던 클라이언트에서만 발생한다. 이 이벤트가
   * 사실상 0으로 수렴하면 `public/sw.js`와 `utils/pwaCleanup.ts`를 지워도 된다.
   */
  pwaCleanupCompleted: (properties: {
    hadController: boolean;
    unregisteredCount: number;
    deletedCacheCount: number;
    scopes: string[];
  }) => {
    trackEvent("[PWA] 잔재 정리 완료", {
      had_controller: properties.hadController,
      unregistered_count: properties.unregisteredCount,
      deleted_cache_count: properties.deletedCacheCount,
      scopes: properties.scopes,
    });
  },

  /**
   * PWA 잔재 정리 실패. 워커가 계속 남아 옛 자원을 물고 있을 수 있는 상태다.
   */
  pwaCleanupFailed: (properties: {
    hadController: boolean;
    errorMessage: string;
  }) => {
    trackEvent("[PWA] 잔재 정리 실패", {
      had_controller: properties.hadController,
      error_message: properties.errorMessage,
    });
  },
};
