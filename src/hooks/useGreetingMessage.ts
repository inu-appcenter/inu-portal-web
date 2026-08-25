import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  ALL_NOTICE_CATEGORY,
  getNoticeListQueryKey,
  getNotices,
  NOTICE_LIST_STALE_TIME,
} from "@/apis/notices";
import type { Notice } from "@/types/notices";
import {
  getLastSeenNoticeAt,
  hasUnseenNotice,
  NOTICE_SEEN_EVENT,
} from "@/utils/noticeSeenStorage";
import {
  resolveGreeting,
  type GreetingClass,
  type GreetingMessage,
} from "@/utils/greeting";

/** 인사말은 "다음 수업까지 N분"을 다루므로 1분마다 다시 계산한다. */
const GREETING_TICK_INTERVAL_MS = 60 * 1000;

// TODO: "중요 공지" 기준 확정 보류. 지금은 카테고리에 "학사"가 들어간 공지를
// 중요 공지로 간주한다. 서버에 중요도/구독 키워드 기반 기준이 생기면 교체할 것.
const isAcademicNotice = (notice: Notice) =>
  Boolean(notice.category?.includes("학사"));

/** 로컬에 저장된 "공지 마지막 확인 시각"을 구독한다. */
const useLastSeenNoticeAt = () => {
  const [lastSeenAt, setLastSeenAt] = useState<number | null>(() =>
    getLastSeenNoticeAt(),
  );

  useEffect(() => {
    const sync = () => setLastSeenAt(getLastSeenNoticeAt());

    // 같은 탭(커스텀 이벤트) / 다른 탭(storage) 양쪽 변경을 반영한다.
    window.addEventListener(NOTICE_SEEN_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(NOTICE_SEEN_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return lastSeenAt;
};

/** 1분 단위로만 바뀌는 "현재 시각" */
const useMinuteTick = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(
      () => setNow(new Date()),
      GREETING_TICK_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, []);

  return now;
};

export interface UseGreetingMessageParams {
  nickname?: string | null;
  /** 오늘 시간표에 등록된 수업 */
  todayClasses: GreetingClass[];
  /** 대표 시간표 존재 여부(없으면 공강으로 단정하지 않는다) */
  hasTimetable: boolean;
  /** 시간표 데이터가 준비됐는지(로그인 + 로딩 완료) */
  isTimetableReady: boolean;
}

export function useGreetingMessage({
  nickname,
  todayClasses,
  hasTimetable,
  isTimetableReady,
}: UseGreetingMessageParams): GreetingMessage {
  const now = useMinuteTick();
  const lastSeenAt = useLastSeenNoticeAt();

  // 홈 공지 위젯과 같은 목록을 공유해 추가 요청이 생기지 않게 한다.
  const { data: notices = [] } = useQuery({
    queryKey: getNoticeListQueryKey(ALL_NOTICE_CATEGORY, "date", 1),
    queryFn: () => getNotices(ALL_NOTICE_CATEGORY, "date", 1),
    select: (response) => response.data.contents,
    staleTime: NOTICE_LIST_STALE_TIME,
  });

  const { hasUnreadNotice, hasUnreadAcademicNotice } = useMemo(() => {
    const nowMs = now.getTime();
    const academicDates = notices
      .filter(isAcademicNotice)
      .map((notice) => notice.createDate);
    const allDates = notices.map((notice) => notice.createDate);

    return {
      hasUnreadNotice: hasUnseenNotice(allDates, lastSeenAt, nowMs),
      hasUnreadAcademicNotice: hasUnseenNotice(
        academicDates,
        lastSeenAt,
        nowMs,
      ),
    };
  }, [notices, lastSeenAt, now]);

  return useMemo(
    () =>
      resolveGreeting({
        nickname,
        now,
        hasUnreadNotice,
        hasUnreadAcademicNotice,
        todayClasses,
        hasTimetable,
        isReady: isTimetableReady,
      }),
    [
      nickname,
      now,
      hasUnreadNotice,
      hasUnreadAcademicNotice,
      todayClasses,
      hasTimetable,
      isTimetableReady,
    ],
  );
}
