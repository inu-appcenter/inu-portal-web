/**
 * "한 번 보여줬으면 다시 안 띄우는" 안내들의 확인 여부를 한곳에서 관리한다.
 *
 * 예전에는 안내마다 localStorage 키를 따로 만들어(`daily_brief_intro_shown`,
 * `has_swiped` …) 어떤 안내가 있는지, 테스트 중에 무엇을 지워야 다시 뜨는지
 * 찾기 어려웠다. 이제 모든 확인 여부는 `promotion-seen-v1` 키 하나에
 * `{ [id]: 처음 확인한 시각(epoch ms) }` 형태로 저장한다.
 *
 * - 새 안내는 `SEEN_PROMOTIONS`에 id를 추가하고 `promotionSeenStorage`로 읽고 쓴다.
 * - 소개 내용이 크게 바뀌어 다시 보여줘야 하면 id 뒤 버전을 올린다.
 * - 빈도 제한·우선순위가 필요한 안내는 `usePromotion` 큐를 쓰고, 여기서는
 *   "이미 봤는지"만 다룬다.
 */

const PROMOTION_SEEN_STORAGE_KEY = "promotion-seen-v1";

export const SEEN_PROMOTIONS = {
  /** 앱에서 포털·도서관 정보를 자동으로 불러오는 기능 소개 시트 */
  PORTAL_AUTO_SYNC_INTRO: "portal-auto-sync-intro-v1",
  /** 잠금화면·다이내믹 아일랜드 실시간 수업 카드(Live Activity) 소개 시트 */
  LIVE_ACTIVITY_INTRO: "live-activity-intro-v1",
  /** 학점계산기 기능 소개 시트 */
  GRADE_CALCULATOR_INTRO: "grade-calculator-intro-v1",
  /** 오늘의 브리핑 첫 방문 안내 모달 */
  DAILY_BRIEF_INTRO: "daily-brief-intro-v1",
  /** 강의평이 에브리타임으로 연결된다는 안내 */
  LECTURE_REVIEW_NOTICE: "lecture-review-everytime-notice-v1",
  /**
   * 카테고리 탭 좌우 스와이프 힌트. 학교 공지·동아리·학식·채팅 목록·버스 정보가
   * 함께 쓴다(어느 화면에서든 한 번 스와이프하면 전부 숨김).
   */
  CATEGORY_SWIPE_HINT: "category-swipe-hint-v1",
} as const;

export type SeenPromotionId =
  (typeof SEEN_PROMOTIONS)[keyof typeof SEEN_PROMOTIONS];

/**
 * 통합 전에 쓰던 개별 키. 이미 본 사람에게 같은 안내가 다시 뜨지 않도록
 * 처음 읽을 때 한 번 옮겨 담고 지운다.
 */
const LEGACY_KEYS: Partial<Record<SeenPromotionId, string>> = {
  [SEEN_PROMOTIONS.GRADE_CALCULATOR_INTRO]: "grade-calculator-intro-seen-v1",
  [SEEN_PROMOTIONS.DAILY_BRIEF_INTRO]: "daily_brief_intro_shown",
  [SEEN_PROMOTIONS.LECTURE_REVIEW_NOTICE]: "lectureReviewEverytimeNoticeShown",
  [SEEN_PROMOTIONS.CATEGORY_SWIPE_HINT]: "has_swiped",
};

type SeenMap = Partial<Record<string, number>>;

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    // 일부 인앱 브라우저는 localStorage 접근만으로 SecurityError를 던진다.
    return null;
  }
}

function readSeenMap(storage: Storage): SeenMap {
  const raw = storage.getItem(PROMOTION_SEEN_STORAGE_KEY);
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // 깨진 값은 비어 있는 것으로 보고 다음 mark에서 덮어쓴다.
    return {};
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {};
  }

  const map: SeenMap = {};
  Object.entries(parsed).forEach(([id, seenAt]) => {
    if (typeof seenAt === "number") map[id] = seenAt;
  });
  return map;
}

/** 레거시 키를 통합 키로 옮긴다. 옮긴 게 있으면 true. */
function migrateLegacyKey(
  storage: Storage,
  map: SeenMap,
  id: SeenPromotionId,
): boolean {
  const legacyKey = LEGACY_KEYS[id];
  if (!legacyKey) return false;

  const legacyValue = storage.getItem(legacyKey);
  if (legacyValue === null) return false;

  // 레거시 키는 모두 "true"를 썼다. 다른 값이면 본 적 없는 것으로 보고 지우기만 한다.
  if (legacyValue === "true" && map[id] === undefined) {
    map[id] = Date.now();
    storage.setItem(PROMOTION_SEEN_STORAGE_KEY, JSON.stringify(map));
  }
  storage.removeItem(legacyKey);
  return map[id] !== undefined;
}

export const promotionSeenStorage = {
  /**
   * 이미 확인한 안내인지.
   * 저장소를 쓸 수 없는 환경에서는 `true`를 돌려준다. 볼 때마다 뜨는 것보다
   * 아예 안 뜨는 쪽이 낫다.
   */
  has(id: SeenPromotionId): boolean {
    const storage = getStorage();
    if (!storage) return true;

    try {
      const map = readSeenMap(storage);
      if (map[id] !== undefined) return true;
      return migrateLegacyKey(storage, map, id);
    } catch (error) {
      console.warn("[promotionSeenStorage] Failed to read", error);
      return true;
    }
  },

  /** 확인 처리. 이미 확인한 안내면 처음 시각을 유지한다. */
  mark(id: SeenPromotionId): void {
    const storage = getStorage();
    if (!storage) return;

    try {
      const map = readSeenMap(storage);
      if (map[id] !== undefined) return;
      map[id] = Date.now();
      storage.setItem(PROMOTION_SEEN_STORAGE_KEY, JSON.stringify(map));
    } catch (error) {
      console.warn("[promotionSeenStorage] Failed to save", error);
    }
  },

  /** 아직 확인하지 않았으면 확인 처리하고 `true`를 돌려준다. "최초 1회" 판정용. */
  markIfFirst(id: SeenPromotionId): boolean {
    if (this.has(id)) return false;
    this.mark(id);
    return true;
  },

  /** 처음 확인한 시각(epoch ms). 확인 전이면 `null`. */
  getSeenAt(id: SeenPromotionId): number | null {
    const storage = getStorage();
    if (!storage) return null;

    try {
      return readSeenMap(storage)[id] ?? null;
    } catch {
      return null;
    }
  },

  /** 다시 보여주고 싶을 때(QA 등). id를 생략하면 전부 초기화한다. */
  reset(id?: SeenPromotionId): void {
    const storage = getStorage();
    if (!storage) return;

    try {
      if (id === undefined) {
        storage.removeItem(PROMOTION_SEEN_STORAGE_KEY);
        return;
      }
      const map = readSeenMap(storage);
      delete map[id];
      storage.setItem(PROMOTION_SEEN_STORAGE_KEY, JSON.stringify(map));
    } catch (error) {
      console.warn("[promotionSeenStorage] Failed to reset", error);
    }
  },
};

export { PROMOTION_SEEN_STORAGE_KEY };
