import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

/**
 * Mixpanel 초기화
 */
export const initMixpanel = () => {
  if (MIXPANEL_TOKEN) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: import.meta.env.DEV,
      track_pageview: false, // SPA이므로 수동 추적 권장
      persistence: 'localStorage',
    });

    // 모든 이벤트에 공통으로 포함될 전역 속성 등록
    mixpanel.register({
      platform: 'Web',
      service_name: 'inu-portal-web',
    });
  } else {
    if (import.meta.env.DEV) {
      console.warn('Mixpanel token is missing. Please set VITE_MIXPANEL_TOKEN in your .env file.');
    }
  }
};

/**
 * 일반 이벤트 추적
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
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
export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  trackEvent('Page Viewed', {
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
   * 주요 기능 버튼 클릭 (홈 카테고리, 칩, 하단 탭, 메뉴 버튼 등)
   */
  featureClicked: (featureName: string, location: string) => {
    trackEvent('Feature Clicked', {
      feature_name: featureName,
      location: location,
    });
  },

  // --- 2. 기능별 핵심 액션 (Core Actions) ---

  /**
   * 버스 UI 버전 스위칭 (신버전 <-> 구버전)
   */
  busUiSwitched: (toVersion: 'new' | 'legacy', fromLocation: string) => {
    trackEvent('Bus UI Switched', {
      to_version: toVersion,
      location: fromLocation,
    });
  },

  /**
   * 버스 정보 조회 (도착 정보, 노선 등)
   */
  busChecked: (busType: string, routeName: string, stopName?: string, uiVersion?: string) => {
    trackEvent('Bus Checked', {
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
    trackEvent('Cafeteria Viewed', {
      cafeteria_name: cafeteriaName,
      day_of_week: day,
    });
  },

  /**
   * 학교 공지사항 상세 조회
   */
  noticeViewed: (category: string, title: string) => {
    trackEvent('Notice Viewed', {
      notice_type: 'School',
      category: category,
      title: title,
    });
  },

  /**
   * 학과 공지사항 상세 조회
   */
  deptNoticeViewed: (deptName: string, title: string) => {
    trackEvent('Notice Viewed', {
      notice_type: 'Department',
      department_name: deptName,
      title: title,
    });
  },

  /**
   * 게시판(TIPS) 상세 조회
   */
  tipViewed: (category: string, title: string) => {
    trackEvent('Tip Viewed', {
      category: category,
      title: title,
    });
  },

  /**
   * 게시판 내 인터랙션 (글쓰기, 댓글, 좋아요, 스크랩)
   */
  boardInteraction: (actionType: 'Write' | 'Comment' | 'Like' | 'Scrap', boardType: string, category?: string) => {
    trackEvent('Board Interaction', {
      action_type: actionType,
      board_type: boardType,
      category: category,
    });
  },

  /**
   * 검색 수행
   */
  searchPerformed: (searchType: 'Phonebook' | 'Post' | 'Notice', keyword: string, resultCount: number) => {
    trackEvent('Search Performed', {
      search_type: searchType,
      keyword: keyword,
      result_count: resultCount,
    });
  },
};
