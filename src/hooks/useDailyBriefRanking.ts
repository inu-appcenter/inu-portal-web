import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import useUserStore from "@/stores/useUserStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useTimeTables, useTimeTableDetail } from "@/hooks/useTimeTables";

export type DailyBriefCardType =
  | "timetable"
  | "weather"
  | "notice"
  | "cafeteria"
  | "bus"
  | "fortune";

export const ALL_DAILY_BRIEF_CARDS: DailyBriefCardType[] = [
  "timetable",
  "weather",
  "notice",
  "cafeteria",
  "bus",
  "fortune",
];

export function useDailyBriefRanking(): DailyBriefCardType[] {
  const [searchParams] = useSearchParams();
  const focusParam = searchParams.get("focus") as DailyBriefCardType | null;

  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken);
  const { timetables, selectedSemester } = useTimetableStore();

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

  const isDayOff = isLoggedIn && todayClasses.length === 0;
  const isWeekend = todayDayOfWeek === 5 || todayDayOfWeek === 6; // 토(5), 일(6)

  // 동적 카드 순서 계산
  const rankedCards = useMemo<DailyBriefCardType[]>(() => {
    let baseOrder: DailyBriefCardType[];

    if (isWeekend || isDayOff) {
      // 1. 공강일/주말: 날씨와 학식, 공지사항을 우선으로 안내
      baseOrder = [
        "weather",
        "notice",
        "cafeteria",
        "fortune",
        "timetable",
        "bus",
      ];
    } else if (currentHour >= 6 && currentHour < 11) {
      // 2. 아침 등교 시간대 (06:00 ~ 10:59): 시간표 -> 실시간 버스 -> 날씨 -> 학식 -> 공지 -> 한마디
      baseOrder = [
        "timetable",
        "bus",
        "weather",
        "cafeteria",
        "notice",
        "fortune",
      ];
    } else if (currentHour >= 11 && currentHour < 14) {
      // 3. 점심 시간대 (11:00 ~ 13:59): 학식 -> 시간표 -> 날씨 -> 버스 -> 공지 -> 한마디
      baseOrder = [
        "cafeteria",
        "timetable",
        "weather",
        "bus",
        "notice",
        "fortune",
      ];
    } else if (currentHour >= 14 && currentHour < 20) {
      // 4. 하교 시간대 (14:00 ~ 19:59): 실시간 버스 -> 공지 -> 시간표 -> 날씨 -> 학식 -> 한마디
      // (단, 수업이 아직 많이 남아있으면 시간표를 버스 바로 다음으로)
      if (remainingClasses.length > 0) {
        baseOrder = [
          "bus",
          "timetable",
          "notice",
          "weather",
          "cafeteria",
          "fortune",
        ];
      } else {
        baseOrder = [
          "bus",
          "notice",
          "weather",
          "timetable",
          "cafeteria",
          "fortune",
        ];
      }
    } else {
      // 5. 저녁/밤/새벽 (20:00 ~ 05:59): 내일 준비 및 공지/날씨
      baseOrder = [
        "timetable",
        "notice",
        "weather",
        "cafeteria",
        "bus",
        "fortune",
      ];
    }

    // 포커스 파라미터가 있을 경우 최상단으로 강제 이동
    if (focusParam && ALL_DAILY_BRIEF_CARDS.includes(focusParam)) {
      const filtered = baseOrder.filter((card) => card !== focusParam);
      return [focusParam, ...filtered];
    }

    return baseOrder;
  }, [
    isWeekend,
    isDayOff,
    currentHour,
    remainingClasses.length,
    focusParam,
  ]);

  return rankedCards;
}
