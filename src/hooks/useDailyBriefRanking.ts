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

export interface DailyBriefPresentation {
  cards: DailyBriefCardType[];
  title: string;
  subtitle: string;
}

interface AutoBriefInput {
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
}

const getDefaultGreeting = (hour: number) => {
  if (hour >= 5 && hour < 12) {
    return {
      title: "상쾌한 아침이에요",
      subtitle: "지금 필요한 캠퍼스 소식만 모아봤어요.",
    };
  }
  if (hour >= 12 && hour < 18) {
    return {
      title: "활기찬 오후예요",
      subtitle: "남은 일정에 필요한 정보만 확인해 보세요.",
    };
  }
  if (hour >= 18 && hour < 22) {
    return {
      title: "편안한 저녁이에요",
      subtitle: "하루를 마무리하는 데 필요한 소식을 모았어요.",
    };
  }
  return {
    title: "고요한 밤이에요",
    subtitle: "급한 일정이 있는지 가볍게 확인해 보세요.",
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
  } = input;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const hour = now.getHours();
  const scores = new Map<DailyBriefCardType, number>();
  const addScore = (card: DailyBriefCardType, score: number) => {
    scores.set(card, Math.max(scores.get(card) ?? 0, score));
  };

  activeRoutineCards.forEach((card) => addScore(card, 115));

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
        ? "수업 이동 전에 비 소식을 확인해 보세요."
        : "송도 캠퍼스에 비 소식이 있어요.",
    };
  } else if (hasSnow) {
    greeting = {
      title: "눈길을 조심하세요",
      subtitle: "따뜻하게 입고 이동 시간을 조금 여유 있게 잡아보세요.",
    };
  } else if (hasBadAir) {
    greeting = {
      title: "오늘은 공기가 좋지 않아요",
      subtitle: "야외 이동이 있다면 마스크를 챙겨주세요.",
    };
  } else if (minutesUntilNext !== null && minutesUntilNext <= 20) {
    greeting = {
      title: `다음 수업까지 ${minutesUntilNext}분 남았어요`,
      subtitle: `${nextClass?.name ?? "다음 수업"} 준비를 시작할 시간이에요.`,
    };
  } else if (hasTimeForLunch) {
    greeting = {
      title: "지금은 점심 먹기 좋은 시간이에요",
      subtitle: minutesUntilNext
        ? `다음 수업까지 ${minutesUntilNext}분 남았어요.`
        : "오늘 운영 중인 학생식당 메뉴를 확인해 보세요.",
    };
  } else if (isLongBreak && minutesUntilNext !== null) {
    greeting = {
      title: "공강을 여유롭게 활용해 보세요",
      subtitle: `다음 수업까지 ${minutesUntilNext}분 남았어요.`,
    };
  } else if (recentlyFinished) {
    greeting = {
      title: "오늘 수업이 모두 끝났어요",
      subtitle: "귀가편을 확인하거나 도서관에서 하루를 마무리해 보세요.",
    };
  } else if (urgentAssignmentCount > 0) {
    greeting = {
      title: "마감이 가까운 과제가 있어요",
      subtitle: `이러닝에서 ${urgentAssignmentCount}개의 일정을 확인해 주세요.`,
    };
  } else if (currentClass) {
    greeting = {
      title: "오늘 일정이 진행 중이에요",
      subtitle: `${currentClass.name} 이후 일정을 미리 확인해 보세요.`,
    };
  } else if (isLoggedIn && hasTimetableContext && todayClasses.length === 0) {
    greeting = {
      title: "오늘은 예정된 수업이 없어요",
      subtitle: "필요한 캠퍼스 소식만 가볍게 확인해 보세요.",
    };
  }

  return { cards, ...greeting };
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
      if (focusParam && ALL_DAILY_BRIEF_CARDS.includes(focusParam)) {
        const filtered = activeCustomCards.filter(
          (card) => card !== focusParam,
        );
        cards = [focusParam, ...filtered];
      }
      return { cards, ...getDefaultGreeting(currentHour) };
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
