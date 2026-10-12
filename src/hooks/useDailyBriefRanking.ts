import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useUserStore from "@/stores/useUserStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useTimeTables, useTimeTableDetail } from "@/hooks/useTimeTables";
import { getAgentReminders } from "@/apis/agentReminder";
import type { AgentReminder } from "@/types/agentReminder";
import {
  useDailyBriefAssignments,
  useDailyBriefWeather,
} from "@/hooks/useDailyBriefSignals";
import type { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import type {
  DailyBriefTimeRule,
  DailyBriefCardDetailConfig,
} from "@/types/dailyBrief";
import {
  getLocalDailyBriefCardSettings,
  setLocalDailyBriefCardSettings,
} from "@/apis/dailyBrief";

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

export const DAILY_BRIEF_CARD_METAS: Record<
  DailyBriefCardType,
  DailyBriefCardMeta
> = {
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
  } catch {
    // 손상된 로컬 설정은 기본 순서로 복구한다.
  }
  return ALL_DAILY_BRIEF_CARDS;
}

export function setStoredBriefOrder(order: DailyBriefCardType[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DAILY_BRIEF_STORAGE_KEYS.ORDER, JSON.stringify(order));
  window.dispatchEvent(new Event("daily_brief_settings_changed"));
}

export function getStoredBriefVisibility(): Record<
  DailyBriefCardType,
  boolean
> {
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
  } catch {
    // 손상된 로컬 설정은 기본 노출 상태로 복구한다.
  }
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

export function getStoredBriefDetails(): DailyBriefCardDetailConfig {
  return getLocalDailyBriefCardSettings().details;
}

export function setStoredBriefDetails(details: DailyBriefCardDetailConfig): void {
  const current = getLocalDailyBriefCardSettings();
  setLocalDailyBriefCardSettings({ ...current, details });
}

export function getStoredBriefTimeRules(): DailyBriefTimeRule[] {
  return getLocalDailyBriefCardSettings().timeRules || [];
}

export function setStoredBriefTimeRules(timeRules: DailyBriefTimeRule[]): void {
  const current = getLocalDailyBriefCardSettings();
  setLocalDailyBriefCardSettings({ ...current, timeRules });
}

export interface DailyBriefTimetableState {
  beforeFirstClass: boolean;
  inClass: boolean;
  isLongBreak: boolean;
  recentlyFinished: boolean;
  noClassDay: boolean;
  firstClassStartHour?: number;
  lastClassEndHour?: number;
  recommendedBusType: "go-school" | "go-home";
}

export interface DailyBriefPresentation {
  cards: DailyBriefCardType[];
  title: string;
  subtitle: string;
  entrySubtitle: string;
  timetableState: DailyBriefTimetableState;
}

export interface AutoBriefInput {
  now: Date;
  isLoggedIn: boolean;
  hasTimetableContext: boolean;
  todayClasses: ClassItem[];
  weatherSky?: string;
  pm10Grade?: string;
  urgentAssignmentCount: number;
  activeRoutineCards: DailyBriefCardType[];
  visibility: Record<DailyBriefCardType, boolean>;
  focusCard: DailyBriefCardType | null;
  timeRules?: DailyBriefTimeRule[];
}

const getDefaultGreeting = (hour: number) => {
  if (hour >= 5 && hour < 12) {
    return {
      title: "좋은 아침이에요",
      subtitle: "오늘 일정과 캠퍼스 정보를 확인하세요.",
      entrySubtitle: "여기를 눌러 오늘 일정과 캠퍼스 정보를 확인하세요.",
    };
  }
  if (hour >= 12 && hour < 18) {
    return {
      title: "오후 일정이에요",
      subtitle: "남은 일정에 필요한 정보를 확인하세요.",
      entrySubtitle: "여기를 눌러 남은 일정에 필요한 정보를 확인하세요.",
    };
  }
  if (hour >= 18 && hour < 22) {
    return {
      title: "저녁 일정이에요",
      subtitle: "남은 일정과 캠퍼스 정보를 확인하세요.",
      entrySubtitle: "여기를 눌러 남은 일정과 캠퍼스 정보를 확인하세요.",
    };
  }
  return {
    title: "오늘 남은 일정이에요",
    subtitle: "마감이 임박한 일정이 있는지 확인하세요.",
    entrySubtitle: "여기를 눌러 마감이 임박한 일정을 확인하세요.",
  };
};

export function buildAutoDailyBrief(
  input: AutoBriefInput,
): DailyBriefPresentation {
  const {
    now,
    isLoggedIn,
    hasTimetableContext,
    todayClasses,
    weatherSky = "",
    pm10Grade = "",
    urgentAssignmentCount,
    activeRoutineCards,
    visibility,
    focusCard,
    timeRules = [],
  } = input;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const hour = now.getHours();
  const scores = new Map<DailyBriefCardType, number>();
  const addScore = (card: DailyBriefCardType, score: number) => {
    scores.set(card, Math.max(scores.get(card) ?? 0, score));
  };

  activeRoutineCards.forEach((card) => addScore(card, 115));

  // 0. 사용자 지정 시간대별 고정 규칙 (스마트 룰) 최우선 점수 가산
  if (timeRules && timeRules.length > 0) {
    for (const rule of timeRules) {
      const startMins = rule.startHour * 60 + rule.startMinute;
      const endMins = rule.endHour * 60 + rule.endMinute;
      if (startMins <= currentMinutes && currentMinutes <= endMins) {
        addScore(rule.pinCard, 500);
      }
    }
  }

  const hasSnow = weatherSky.includes("눈") || weatherSky.includes("진눈깨비");
  const hasRain =
    !hasSnow && (weatherSky.includes("비") || weatherSky.includes("소나기"));
  const hasBadAir = pm10Grade === "나쁨" || pm10Grade === "매우나쁨";
  if (hasRain || hasSnow) addScore("weather", 130);
  else if (hasBadAir) addScore("weather", 120);

  const currentClass = todayClasses.find((item) => {
    const start = Math.round(item.startTime * 60);
    const end = Math.round(item.endTime * 60);
    return start <= currentMinutes && currentMinutes < end;
  });
  const nextClass = todayClasses.find(
    (item) => Math.round(item.startTime * 60) > currentMinutes,
  );
  const previousClass = [...todayClasses]
    .reverse()
    .find((item) => Math.round(item.endTime * 60) <= currentMinutes);
  const firstClass = todayClasses[0];
  const lastClass = todayClasses[todayClasses.length - 1];
  const minutesUntilNext = nextClass
    ? Math.round(nextClass.startTime * 60) - currentMinutes
    : null;
  const lastClassEnd = lastClass ? Math.round(lastClass.endTime * 60) : null;
  const isBetweenClasses = Boolean(previousClass && nextClass && !currentClass);
  const isLongBreak = isBetweenClasses && (minutesUntilNext ?? 0) >= 60;
  const isLunchWindow = currentMinutes >= 11 * 60 && currentMinutes < 14 * 60;
  const hasTimeForLunch =
    !currentClass &&
    isLunchWindow &&
    (minutesUntilNext === null || minutesUntilNext >= 30);
  const hasFinishedClasses =
    Boolean(lastClass) &&
    lastClassEnd !== null &&
    currentMinutes >= lastClassEnd;
  const recentlyFinished =
    hasFinishedClasses &&
    lastClassEnd !== null &&
    currentMinutes <= lastClassEnd + 180;
  const beforeFirstClass =
    Boolean(firstClass) &&
    currentMinutes < Math.round(firstClass.startTime * 60);
  const isLastClassInProgress =
    Boolean(currentClass) && currentClass === lastClass;

  const timetableState: DailyBriefTimetableState = {
    beforeFirstClass,
    inClass: Boolean(currentClass),
    isLongBreak,
    recentlyFinished,
    noClassDay: todayClasses.length === 0,
    firstClassStartHour: firstClass ? Math.floor(firstClass.startTime) : undefined,
    lastClassEndHour: lastClass ? Math.floor(lastClass.endTime) : undefined,
    recommendedBusType: (hasFinishedClasses || hour >= 16) ? "go-home" : "go-school",
  };

  if (hasTimetableContext && todayClasses.length > 0) {
    if (currentClass) addScore("timetable", 105);
    if (minutesUntilNext !== null && minutesUntilNext <= 30) {
      addScore("timetable", 125);
    } else if (
      beforeFirstClass &&
      minutesUntilNext !== null &&
      minutesUntilNext <= 180
    ) {
      addScore("timetable", 105);
    } else if (isBetweenClasses) {
      addScore("timetable", 80);
    }

    if (
      beforeFirstClass &&
      minutesUntilNext !== null &&
      minutesUntilNext <= 90
    ) {
      addScore("bus", 85);
    }
    if (recentlyFinished) addScore("bus", 120);
    if (isLastClassInProgress) addScore("bus", 95);
    if (isLongBreak) addScore("library", 90);
    if (hasFinishedClasses && hour < 21) addScore("library", 70);
  }

  if (hasTimeForLunch) addScore("cafeteria", 110);
  if (urgentAssignmentCount > 0) addScore("lms", 118);

  // 개인 데이터가 없을 때도 지금 확인할 만한 공통 정보 하나는 남긴다.
  if (scores.size === 0) {
    if (isLunchWindow) addScore("cafeteria", 70);
    else if (hour >= 6 && hour < 11) addScore("weather", 65);
    else addScore("notice", 65);
  }

  if (focusCard && ALL_DAILY_BRIEF_CARDS.includes(focusCard)) {
    addScore(focusCard, 1000);
  }

  const cards = [...scores.entries()]
    .filter(
      ([card, score]) =>
        score >= 60 && (visibility[card] !== false || card === focusCard),
    )
    .sort((a, b) => b[1] - a[1])
    .map(([card]) => card);

  let greeting = getDefaultGreeting(hour);
  if (hasRain) {
    greeting = {
      title: "오늘은 우산을 챙겨주세요",
      subtitle: nextClass
        ? "수업 이동 전 비 소식을 확인하세요."
        : "송도 캠퍼스에 비 소식이 있어요.",
      entrySubtitle: "여기를 눌러 비 소식과 오늘 일정을 확인하세요.",
    };
  } else if (hasSnow) {
    greeting = {
      title: "눈길을 조심하세요",
      subtitle: "방한용품을 챙기고 이동 시간을 넉넉히 잡으세요.",
      entrySubtitle: "여기를 눌러 눈 소식과 이동 정보를 확인하세요.",
    };
  } else if (hasBadAir) {
    greeting = {
      title: "오늘은 공기가 좋지 않아요",
      subtitle: "야외 이동이 있다면 마스크를 챙겨주세요.",
      entrySubtitle: "여기를 눌러 대기 상태와 오늘 일정을 확인하세요.",
    };
  } else if (minutesUntilNext !== null && minutesUntilNext <= 20) {
    greeting = {
      title: `다음 수업까지 ${minutesUntilNext}분 남았어요`,
      subtitle: `${nextClass?.name ?? "다음 수업"} 시간과 강의실을 확인하세요.`,
      entrySubtitle: "여기를 눌러 다음 수업 정보를 확인하세요.",
    };
  } else if (hasTimeForLunch) {
    greeting = {
      title: "지금 식사할 시간이 있어요",
      subtitle: minutesUntilNext
        ? `다음 수업까지 ${minutesUntilNext}분 남았어요.`
        : "현재 운영 중인 학생식당 메뉴를 확인하세요.",
      entrySubtitle: "여기를 눌러 현재 이용할 수 있는 학식을 확인하세요.",
    };
  } else if (isLongBreak && minutesUntilNext !== null) {
    greeting = {
      title: "지금은 공강이에요",
      subtitle: `다음 수업까지 ${minutesUntilNext}분 남았어요.`,
      entrySubtitle: "여기를 눌러 공강 중 이용할 수 있는 정보를 확인하세요.",
    };
  } else if (recentlyFinished) {
    greeting = {
      title: "오늘 수업이 모두 끝났어요",
      subtitle: "귀가 교통편과 도서관 이용 정보를 확인하세요.",
      entrySubtitle: "여기를 눌러 하교와 남은 일정을 확인하세요.",
    };
  } else if (urgentAssignmentCount > 0) {
    greeting = {
      title: "마감이 가까운 과제가 있어요",
      subtitle: `이러닝 마감 일정이 ${urgentAssignmentCount}개 있어요.`,
      entrySubtitle: "여기를 눌러 마감이 가까운 과제를 확인하세요.",
    };
  } else if (currentClass) {
    greeting = {
      title: "오늘 일정이 진행 중이에요",
      subtitle: `${currentClass.name} 이후 일정을 확인하세요.`,
      entrySubtitle: "여기를 눌러 오늘 남은 일정을 확인하세요.",
    };
  } else if (isLoggedIn && hasTimetableContext && todayClasses.length === 0) {
    greeting = {
      title: "오늘은 예정된 수업이 없어요",
      subtitle: "오늘의 캠퍼스 정보를 확인하세요.",
      entrySubtitle: "여기를 눌러 오늘의 캠퍼스 정보를 확인하세요.",
    };
  }

  return { cards, timetableState, ...greeting };
}

export function useDailyBriefPresentation(): DailyBriefPresentation {
  const [searchParams] = useSearchParams();
  const focusParam = searchParams.get("focus") as DailyBriefCardType | null;

  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken);
  const { timetables, selectedSemester } = useTimetableStore();

  const [mode, setMode] = useState<"auto" | "custom">(getStoredBriefMode);
  const [customOrder, setCustomOrder] =
    useState<DailyBriefCardType[]>(getStoredBriefOrder);
  const [visibility, setVisibility] = useState<
    Record<DailyBriefCardType, boolean>
  >(getStoredBriefVisibility);
  const [reminders, setReminders] = useState<AgentReminder[]>([]);
  const [now, setNow] = useState(() => new Date());
  const { weather } = useDailyBriefWeather();
  const { assignments } = useDailyBriefAssignments();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

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

  // 맞춤 루틴 조회
  useEffect(() => {
    if (!isLoggedIn) return;
    let isMounted = true;
    getAgentReminders()
      .then((res) => {
        if (isMounted && res.data) {
          setReminders(res.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  const timetableListQuery = useTimeTables(undefined, undefined, {
    enabled: isLoggedIn,
  });

  const currentHour = now.getHours();
  const todayDayOfWeek = (now.getDay() + 6) % 7; // 0: 월 ~ 6: 일
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 현재 시간대 및 오늘 요일에 활성화된 맞춤 루틴 카드 추출
  const activeRoutineCards = useMemo<DailyBriefCardType[]>(() => {
    const todayIsWeekend = todayDayOfWeek === 5 || todayDayOfWeek === 6;
    const cardsToBoost: DailyBriefCardType[] = [];
    const todayKey = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][
      todayDayOfWeek
    ];

    for (const r of reminders) {
      if (!r.enabled) continue;

      let isMatched = false;

      // 1. Check multi-schedules if present
      if (r.schedulesJson) {
        try {
          const parsedSchedules = JSON.parse(r.schedulesJson);
          if (Array.isArray(parsedSchedules) && parsedSchedules.length > 0) {
            for (const s of parsedSchedules) {
              if (
                s.days &&
                Array.isArray(s.days) &&
                !s.days.includes(todayKey)
              ) {
                continue;
              }
              const [sHour, sMin] = (s.time || "08:00").split(":").map(Number);
              const reminderMins = sHour * 60 + sMin;
              const diff = Math.abs(currentMinutes - reminderMins);
              if (diff <= 60) {
                isMatched = true;
                break;
              }
            }
          }
        } catch {
          // 이전 형식의 알림 필드로 계속 판정한다.
        }
      }

      // 2. Legacy fallback
      if (!isMatched) {
        if (r.repeatType === "WEEKDAYS" && todayIsWeekend) continue;
        if (r.repeatType === "WEEKENDS" && !todayIsWeekend) continue;

        const [rHour, rMin] = (r.targetTime || "08:00").split(":").map(Number);
        const reminderMins = rHour * 60 + rMin;
        const diff = Math.abs(currentMinutes - reminderMins);
        if (diff <= 60) {
          isMatched = true;
        }
      }

      // 루틴 설정 시간 전후 60분 이내일 때 최우선 부스팅
      if (isMatched) {
        const tools = (r.targetTool || "")
          .split(",")
          .map((s) => s.trim().toUpperCase());
        for (const tool of tools) {
          if (tool.includes("CAFETERIA") && !cardsToBoost.includes("cafeteria"))
            cardsToBoost.push("cafeteria");
          if (tool.includes("BUS") && !cardsToBoost.includes("bus"))
            cardsToBoost.push("bus");
          if (tool.includes("WEATHER") && !cardsToBoost.includes("weather"))
            cardsToBoost.push("weather");
          if (tool.includes("TIMETABLE") && !cardsToBoost.includes("timetable"))
            cardsToBoost.push("timetable");
          if (tool.includes("NOTICE") && !cardsToBoost.includes("notice"))
            cardsToBoost.push("notice");
        }
      }
    }
    return cardsToBoost;
  }, [reminders, todayDayOfWeek, currentMinutes]);

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

  const timetableDetailQuery = useTimeTableDetail(representativeTimetableId, {
    enabled: isLoggedIn && representativeTimetableId != null,
  });

  const activeTimetable = useMemo(
    () =>
      timetables.find(
        (timetable) => timetable.id === representativeTimetableId,
      ),
    [representativeTimetableId, timetables],
  );

  // 오늘 강의 목록
  const todayClasses = useMemo(() => {
    if (!activeTimetable || !activeTimetable.events) return [];
    return activeTimetable.events
      .filter((cls) => cls.day === todayDayOfWeek)
      .sort((a, b) => a.startTime - b.startTime);
  }, [activeTimetable, todayDayOfWeek]);

  const presentation = useMemo<DailyBriefPresentation>(() => {
    // 1. 커스텀 모드일 경우 사용자 정의 순서 사용
    if (mode === "custom") {
      const activeCustomCards = customOrder.filter(
        (card) => visibility[card] !== false,
      );
      let cards = activeCustomCards;

      // 사용자 지정 시간대별 고정 규칙 (스마트 룰) 반영
      const timeRules = getStoredBriefTimeRules();
      for (const rule of timeRules) {
        const startMins = rule.startHour * 60 + rule.startMinute;
        const endMins = rule.endHour * 60 + rule.endMinute;
        if (
          startMins <= currentMinutes &&
          currentMinutes <= endMins &&
          visibility[rule.pinCard] !== false
        ) {
          cards = [rule.pinCard, ...cards.filter((c) => c !== rule.pinCard)];
          break;
        }
      }

      if (focusParam && ALL_DAILY_BRIEF_CARDS.includes(focusParam)) {
        const filtered = cards.filter((card) => card !== focusParam);
        cards = [focusParam, ...filtered];
      }

      const firstClass = todayClasses[0];
      const lastClass = todayClasses[todayClasses.length - 1];
      const currentClass = todayClasses.find((item) => {
        const start = Math.round(item.startTime * 60);
        const end = Math.round(item.endTime * 60);
        return start <= currentMinutes && currentMinutes < end;
      });
      const nextClass = todayClasses.find(
        (item) => Math.round(item.startTime * 60) > currentMinutes,
      );
      const beforeFirstClass = Boolean(
        firstClass && currentMinutes < Math.round(firstClass.startTime * 60),
      );
      const lastClassEnd = lastClass ? Math.round(lastClass.endTime * 60) : null;
      const hasFinishedClasses = Boolean(
        lastClass && lastClassEnd !== null && currentMinutes >= lastClassEnd,
      );
      const isLongBreak = Boolean(
        !currentClass &&
          nextClass &&
          Math.round(nextClass.startTime * 60) - currentMinutes >= 60,
      );

      const timetableState: DailyBriefTimetableState = {
        beforeFirstClass,
        inClass: Boolean(currentClass),
        isLongBreak,
        recentlyFinished:
          hasFinishedClasses &&
          lastClassEnd !== null &&
          currentMinutes <= lastClassEnd + 180,
        noClassDay: todayClasses.length === 0,
        firstClassStartHour: firstClass
          ? Math.floor(firstClass.startTime)
          : undefined,
        lastClassEndHour: lastClass
          ? Math.floor(lastClass.endTime)
          : undefined,
        recommendedBusType:
          hasFinishedClasses || currentHour >= 16 ? "go-home" : "go-school",
      };

      return { cards, timetableState, ...getDefaultGreeting(currentHour) };
    }
    const hasTimetableContext =
      !isLoggedIn ||
      (timetableListQuery.isSuccess &&
        (representativeTimetableId === null || timetableDetailQuery.isSuccess));
    const urgentAssignmentCount = assignments.filter(
      (item) => !item.isCompleted && (item.daysRemaining ?? 999) <= 2,
    ).length;
    return buildAutoDailyBrief({
      now,
      isLoggedIn,
      hasTimetableContext,
      todayClasses,
      weatherSky: weather?.sky,
      pm10Grade: weather?.pm10Grade,
      urgentAssignmentCount,
      activeRoutineCards,
      visibility,
      focusCard: focusParam,
      timeRules: getStoredBriefTimeRules(),
    });
  }, [
    mode,
    customOrder,
    visibility,
    currentHour,
    focusParam,
    activeRoutineCards,
    assignments,
    isLoggedIn,
    now,
    representativeTimetableId,
    timetableDetailQuery.isSuccess,
    timetableListQuery.isSuccess,
    todayClasses,
    weather?.pm10Grade,
    weather?.sky,
  ]);

  return presentation;
}

export function useDailyBriefRanking(): DailyBriefCardType[] {
  return useDailyBriefPresentation().cards;
}
