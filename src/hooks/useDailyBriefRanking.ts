import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useUserStore from "@/stores/useUserStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useTimeTables, useTimeTableDetail } from "@/hooks/useTimeTables";

export type DailyBriefCardType =
  | "timetable"
  | "library"
  | "cafeteria"
  | "bus"
  | "weather"
  | "notice"
  | "lms"
  | "fortune";

export interface DailyBriefCardMeta {
  type: DailyBriefCardType;
  name: string;
  description: string;
  icon: string;
}

export const ALL_DAILY_BRIEF_CARDS: DailyBriefCardType[] = [
  "timetable",
  "library",
  "cafeteria",
  "bus",
  "weather",
  "notice",
  "lms",
  "fortune",
];

export const DAILY_BRIEF_CARD_METAS: Record<DailyBriefCardType, DailyBriefCardMeta> = {
  timetable: {
    type: "timetable",
    name: "오늘의 강의 & 공강",
    description: "오늘 강의 일정, 진행 상황 및 스마트 공강 안내",
    icon: "calendar",
  },
  library: {
    type: "library",
    name: "학산도서관 좌석 현황",
    description: "실시간 일반열람실 잔여석 및 혼잡도 안내",
    icon: "book",
  },
  cafeteria: {
    type: "cafeteria",
    name: "오늘의 학식 추천",
    description: "식당별 추천 메뉴 및 실시간 운영 식당 안내",
    icon: "coffee",
  },
  bus: {
    type: "bus",
    name: "실시간 캠퍼스 버스",
    description: "정류장별 실시간 버스 도착 정보 및 노선도",
    icon: "car",
  },
  weather: {
    type: "weather",
    name: "송도 캠퍼스 날씨",
    description: "기상청 실시간 송도 날씨 및 미세먼지",
    icon: "cloud",
  },
  notice: {
    type: "notice",
    name: "주요 공지사항",
    description: "학교 및 내 학과 최근 주요 공지",
    icon: "bell",
  },
  lms: {
    type: "lms",
    name: "이러닝 과제 마감",
    description: "마감 임박 과제 및 학습 동영상 리마인드",
    icon: "check-circle",
  },
  fortune: {
    type: "fortune",
    name: "횃불이 한마디",
    description: "상황 인지형 캠퍼스 꿀팁 및 응원 메시지",
    icon: "message-circle",
  },
};

export const DAILY_BRIEF_STORAGE_KEYS = {
  MODE: "inu_daily_brief_card_mode", // 'auto' | 'custom'
  ORDER: "inu_daily_brief_custom_order", // JSON string of DailyBriefCardType[]
  VISIBILITY: "inu_daily_brief_card_visibility", // JSON string of Record<DailyBriefCardType, boolean>
};

export function getStoredBriefMode(): "auto" | "custom" {
  if (typeof window === "undefined") return "auto";
  const stored = localStorage.getItem(DAILY_BRIEF_STORAGE_KEYS.MODE);
  return stored === "custom" ? "custom" : "auto";
}

export function setStoredBriefMode(mode: "auto" | "custom"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DAILY_BRIEF_STORAGE_KEYS.MODE, mode);
  window.dispatchEvent(new Event("daily_brief_settings_changed"));
}

export function getStoredBriefOrder(): DailyBriefCardType[] {
  if (typeof window === "undefined") return ALL_DAILY_BRIEF_CARDS;
  try {
    const raw = localStorage.getItem(DAILY_BRIEF_STORAGE_KEYS.ORDER);
    if (!raw) return ALL_DAILY_BRIEF_CARDS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.filter((c) => ALL_DAILY_BRIEF_CARDS.includes(c));
      const missing = ALL_DAILY_BRIEF_CARDS.filter((c) => !valid.includes(c));
      return [...valid, ...missing];
    }
  } catch {}
  return ALL_DAILY_BRIEF_CARDS;
}

export function setStoredBriefOrder(order: DailyBriefCardType[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DAILY_BRIEF_STORAGE_KEYS.ORDER, JSON.stringify(order));
  window.dispatchEvent(new Event("daily_brief_settings_changed"));
}

export function getStoredBriefVisibility(): Record<DailyBriefCardType, boolean> {
  const defaultMap = ALL_DAILY_BRIEF_CARDS.reduce(
    (acc, card) => {
      acc[card] = true;
      return acc;
    },
    {} as Record<DailyBriefCardType, boolean>,
  );

  if (typeof window === "undefined") return defaultMap;
  try {
    const raw = localStorage.getItem(DAILY_BRIEF_STORAGE_KEYS.VISIBILITY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultMap, ...parsed };
    }
  } catch {}
  return defaultMap;
}

export function setStoredBriefVisibility(
  visibility: Record<DailyBriefCardType, boolean>,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    DAILY_BRIEF_STORAGE_KEYS.VISIBILITY,
    JSON.stringify(visibility),
  );
  window.dispatchEvent(new Event("daily_brief_settings_changed"));
}

export function useDailyBriefRanking(): DailyBriefCardType[] {
  const [searchParams] = useSearchParams();
  const focusParam = searchParams.get("focus") as DailyBriefCardType | null;

  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken);
  const { timetables, selectedSemester } = useTimetableStore();

  const [mode, setMode] = useState<"auto" | "custom">(getStoredBriefMode);
  const [customOrder, setCustomOrder] = useState<DailyBriefCardType[]>(getStoredBriefOrder);
  const [visibility, setVisibility] = useState<Record<DailyBriefCardType, boolean>>(getStoredBriefVisibility);

  // 로컬 스토리지 변경 이벤트 동기화
  useEffect(() => {
    const syncSettings = () => {
      setMode(getStoredBriefMode());
      setCustomOrder(getStoredBriefOrder());
      setVisibility(getStoredBriefVisibility());
    };

    window.addEventListener("daily_brief_settings_changed", syncSettings);
    window.addEventListener("storage", syncSettings);
    return () => {
      window.removeEventListener("daily_brief_settings_changed", syncSettings);
      window.removeEventListener("storage", syncSettings);
    };
  }, []);

  useTimeTables(undefined, undefined, {
    enabled: isLoggedIn,
  });

  const now = useMemo(() => new Date(), []);
  const currentHour = now.getHours();
  const todayDayOfWeek = (now.getDay() + 6) % 7; // 0: 월 ~ 6: 일
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 대표 시간표 찾기
  const representativeTimetableId = useMemo(() => {
    if (!isLoggedIn) return null;
    const targetSemester =
      selectedSemester ||
      (timetables.find((t) => t.isRepresentative)?.semester ??
        timetables[0]?.semester);
    const inSemester = targetSemester
      ? timetables.filter((t) => t.semester === targetSemester)
      : timetables;
    return (
      inSemester.find((t) => t.isRepresentative)?.id ??
      inSemester[0]?.id ??
      timetables.find((t) => t.isRepresentative)?.id ??
      timetables[0]?.id ??
      null
    );
  }, [isLoggedIn, selectedSemester, timetables]);

  useTimeTableDetail(representativeTimetableId, {
    enabled: isLoggedIn && representativeTimetableId != null,
  });

  const activeTimetable = useMemo(
    () =>
      timetables.find((timetable) => timetable.id === representativeTimetableId),
    [representativeTimetableId, timetables],
  );

  // 오늘 강의 목록
  const todayClasses = useMemo(() => {
    if (!activeTimetable || !activeTimetable.events) return [];
    return activeTimetable.events
      .filter((cls) => cls.day === todayDayOfWeek)
      .sort((a, b) => a.startTime - b.startTime);
  }, [activeTimetable, todayDayOfWeek]);

  // 오늘 남은 강의 목록
  const remainingClasses = useMemo(() => {
    return todayClasses.filter((cls) => {
      const endMins = Math.round(cls.endTime * 60);
      return endMins > currentMinutes;
    });
  }, [todayClasses, currentMinutes]);

  // 오늘 1.5시간 이상 공강 여부 판별
  const hasLongBreak = useMemo(() => {
    if (todayClasses.length < 2) return false;
    for (let i = 0; i < todayClasses.length - 1; i++) {
      const gap = todayClasses[i + 1].startTime - todayClasses[i].endTime;
      if (gap >= 1.5) return true;
    }
    return false;
  }, [todayClasses]);

  const isDayOff = isLoggedIn && todayClasses.length === 0;
  const isWeekend = todayDayOfWeek === 5 || todayDayOfWeek === 6; // 토(5), 일(6)

  // 동적 카드 순서 계산
  const rankedCards = useMemo<DailyBriefCardType[]>(() => {
    // 1. 커스텀 모드일 경우 사용자 정의 순서 사용
    if (mode === "custom") {
      const activeCustomCards = customOrder.filter((card) => visibility[card] !== false);
      if (focusParam && ALL_DAILY_BRIEF_CARDS.includes(focusParam)) {
        const filtered = activeCustomCards.filter((card) => card !== focusParam);
        return [focusParam, ...filtered];
      }
      return activeCustomCards;
    }

    // 2. AI / 시간대 상황 기반 동적 순서
    let baseOrder: DailyBriefCardType[];

    if (isWeekend || isDayOff) {
      // 주말 / 공강일: 날씨 -> 도서관(자습) -> 공지 -> 학식 -> 과제 -> 한마디 -> 시간표 -> 버스
      baseOrder = [
        "weather",
        "library",
        "notice",
        "cafeteria",
        "lms",
        "fortune",
        "timetable",
        "bus",
      ];
    } else if (currentHour >= 6 && currentHour < 11) {
      // 아침 등교 시간대 (06:00 ~ 10:59): 시간표 -> 버스 -> 날씨 -> 학식 -> 도서관 -> 과제 -> 공지 -> 한마디
      baseOrder = [
        "timetable",
        "bus",
        "weather",
        "cafeteria",
        "library",
        "lms",
        "notice",
        "fortune",
      ];
    } else if (currentHour >= 11 && currentHour < 14) {
      // 점심 시간대 (11:00 ~ 13:59): 학식 -> 시간표 -> (공강 시 도서관 우선) -> 버스 -> 날씨 -> 공지 -> 과제 -> 한마디
      baseOrder = hasLongBreak
        ? [
            "cafeteria",
            "library",
            "timetable",
            "bus",
            "weather",
            "notice",
            "lms",
            "fortune",
          ]
        : [
            "cafeteria",
            "timetable",
            "weather",
            "bus",
            "library",
            "notice",
            "lms",
            "fortune",
          ];
    } else if (currentHour >= 14 && currentHour < 20) {
      // 오후/하교 시간대 (14:00 ~ 19:59): 버스 -> 도서관/시간표 -> 공지 -> 과제 -> 날씨 -> 학식 -> 한마디
      if (remainingClasses.length > 0) {
        baseOrder = [
          "bus",
          "timetable",
          "library",
          "lms",
          "notice",
          "weather",
          "cafeteria",
          "fortune",
        ];
      } else {
        baseOrder = [
          "bus",
          "library",
          "lms",
          "notice",
          "weather",
          "timetable",
          "cafeteria",
          "fortune",
        ];
      }
    } else {
      // 저녁/밤/새벽 (20:00 ~ 05:59): 내일 시간표 -> 과제 마감 -> 공지 -> 도서관 -> 날씨 -> 학식 -> 버스 -> 한마디
      baseOrder = [
        "timetable",
        "lms",
        "notice",
        "library",
        "weather",
        "cafeteria",
        "bus",
        "fortune",
      ];
    }

    // 사용자 가시성 필터링 (자동 모드에서도 숨긴 카드는 제외)
    let visibleOrder = baseOrder.filter((card) => visibility[card] !== false);

    // 포커스 파라미터가 있을 경우 최상단으로 강제 이동
    if (focusParam && ALL_DAILY_BRIEF_CARDS.includes(focusParam)) {
      const filtered = visibleOrder.filter((card) => card !== focusParam);
      return [focusParam, ...filtered];
    }

    return visibleOrder;
  }, [
    mode,
    customOrder,
    visibility,
    isWeekend,
    isDayOff,
    currentHour,
    remainingClasses.length,
    hasLongBreak,
    focusParam,
  ]);

  return rankedCards;
}
