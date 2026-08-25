import { safeLocalStorage } from "@/utils/safeStorage";

/**
 * 공지사항 "읽음" 상태를 내려주는 서버 API가 없어서,
 * 마지막으로 공지 목록을 확인한 시각을 로컬에 저장해 "안 읽은 공지"를 판단한다.
 */
// TODO: 서버에 공지/알림 읽음 상태 API가 생기면 로컬 저장 대신 그 값을 쓴다.
// 관련: inu-appcenter/inu-portal-server#337 (알림 읽음 처리 API)
const LAST_SEEN_NOTICE_KEY = "notice:lastSeenAt";

/** 저장된 기록이 없는 사용자에게 오래된 공지를 새 공지로 보여주지 않기 위한 기준(시간) */
export const NEW_NOTICE_WINDOW_HOURS = 24;

/**
 * 공지 createDate는 ISO("2026-08-20T09:00:00") 외에 "2026.08.20 09:00" 같은
 * 형태로도 내려와서 formatTimeAgo와 동일한 정규화를 거친다.
 */
export const parseNoticeDate = (value?: string | null): number | null => {
  if (!value) return null;

  const normalized = value
    .trim()
    .replace(/^(\d{4})\.(\d{1,2})\.(\d{1,2})/, "$1-$2-$3")
    .replace(" ", "T")
    .replace(/(\.\d{3})\d+/, "$1");

  const time = new Date(normalized).getTime();
  return Number.isNaN(time) ? null : time;
};

/** 같은 탭 안에서 저장 변경을 구독하기 위한 커스텀 이벤트 */
export const NOTICE_SEEN_EVENT = "notice-seen-change";

export const getLastSeenNoticeAt = (): number | null => {
  const stored = safeLocalStorage.getItem(LAST_SEEN_NOTICE_KEY);
  if (!stored) return null;

  const parsed = Number(stored);
  return Number.isFinite(parsed) ? parsed : null;
};

/** 공지 목록을 확인한 시점을 기록한다(뒤로 되돌리지는 않는다). */
export const markNoticesSeen = (at: number = Date.now()) => {
  const lastSeen = getLastSeenNoticeAt();
  if (lastSeen !== null && lastSeen >= at) return;

  safeLocalStorage.setItem(LAST_SEEN_NOTICE_KEY, String(at));
  window.dispatchEvent(new Event(NOTICE_SEEN_EVENT));
};

/**
 * 마지막 확인 시점 이후에 올라온 공지가 있는지.
 * 기록이 없으면 최근 NEW_NOTICE_WINDOW_HOURS 이내 공지만 새 공지로 본다.
 */
export const hasUnseenNotice = (
  noticeDates: Array<string | null | undefined>,
  lastSeenAt: number | null,
  now: number = Date.now(),
): boolean => {
  const threshold =
    lastSeenAt ?? now - NEW_NOTICE_WINDOW_HOURS * 60 * 60 * 1000;

  return noticeDates.some((date) => {
    const time = parseNoticeDate(date);
    return time !== null && time > threshold;
  });
};
