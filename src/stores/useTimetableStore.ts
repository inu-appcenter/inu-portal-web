import { create } from "zustand";
import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import type { TimeTable, TimeTableVisibility } from "@/types/timetables";
import { formatSemester } from "@/utils/semester";
import { getMemberIdFromToken } from "@/utils/token";
import { broadcastSync } from "@/stores/middleware/broadcastSync";

export const TIMETABLES_QUERY_KEY = ["timetables"] as const;

export interface TimetableTheme {
  colorTheme: "default" | "pastelWarm" | "pastelCool" | "monotone";
  fontSize: "small" | "medium" | "large";
  showRoom: boolean;
  showProfessor: boolean;
}

export interface Timetable {
  id: number;
  name: string;
  semester: string;
  semesterId: number;
  year: number;
  term: TimeTable["term"];
  isRepresentative: boolean;
  visibility: TimeTableVisibility;
  events: ClassItem[];
  theme?: TimetableTheme;
}

interface TimetableCache {
  version: 1;
  selectedSemester: string;
  activeTimetableId: number | null;
  timetables: Timetable[];
}

const TIMETABLE_CACHE_PREFIX = "timetable-cache:v1";
const LEGACY_TIMETABLE_THEMES_STORAGE_KEY = "timetable-themes";

const getLegacyTimetableThemes = (): Record<number, TimetableTheme> => {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      window.localStorage.getItem(LEGACY_TIMETABLE_THEMES_STORAGE_KEY) ?? "{}",
    );
  } catch {
    return {};
  }
};

export const getCurrentMemberId = (token?: string | null) => {
  if (token) {
    const memberId = getMemberIdFromToken(token);
    if (memberId) return memberId;
  }

  if (typeof window === "undefined") return null;

  try {
    const tokenInfo = JSON.parse(window.localStorage.getItem("tokenInfo") ?? "{}");
    return getMemberIdFromToken(tokenInfo.accessToken);
  } catch {
    return null;
  }
};

const getTimetableCacheKey = (memberId?: string | null) => {
  const targetMemberId = memberId !== undefined ? memberId : getCurrentMemberId();
  return targetMemberId ? `${TIMETABLE_CACHE_PREFIX}:${targetMemberId}` : null;
};

export const getCachedTimetableState = (
  memberId?: string | null,
): Omit<TimetableCache, "version"> => {
  const empty = {
    selectedSemester: "",
    activeTimetableId: null,
    timetables: [],
  };
  const cacheKey = getTimetableCacheKey(memberId);
  if (!cacheKey) return empty;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(cacheKey) ?? "null");
    if (
      parsed?.version !== 1 ||
      typeof parsed.selectedSemester !== "string" ||
      !Array.isArray(parsed.timetables)
    ) {
      return empty;
    }

    return {
      selectedSemester: parsed.selectedSemester,
      activeTimetableId:
        typeof parsed.activeTimetableId === "number"
          ? parsed.activeTimetableId
          : null,
      timetables: parsed.timetables.filter(
        (timetable: unknown): timetable is Timetable => {
          if (!timetable || typeof timetable !== "object") return false;
          const candidate = timetable as Partial<Timetable>;
          return (
            typeof candidate.id === "number" &&
            typeof candidate.name === "string" &&
            typeof candidate.semester === "string" &&
            typeof candidate.year === "number" &&
            Array.isArray(candidate.events)
          );
        },
      ),
    };
  } catch {
    return empty;
  }
};

interface TimetableStore {
  selectedSemester: string;
  activeTimetableId: number | null;
  timetables: Timetable[];
  setSemester: (semester: string) => void;
  setActiveTimetable: (id: number | null) => void;
  setTimetables: (serverTimetables: TimeTable[]) => void;
  reloadTimetableCache: (memberId?: string | null) => void;
  updateTimetableTheme: (id: number, theme: TimetableTheme) => void;
  updateTimetableEvents: (id: number, events: ClassItem[]) => void;
}

const storeTimetableCache = (state: TimetableStore) => {
  const cacheKey = getTimetableCacheKey();
  if (!cacheKey) return;

  const cache: TimetableCache = {
    version: 1,
    selectedSemester: state.selectedSemester,
    activeTimetableId: state.activeTimetableId,
    timetables: state.timetables,
  };

  try {
    window.localStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch {
    // 저장 공간 부족 등으로 캐시할 수 없어도 서버 기반 시간표는 계속 동작한다.
  }
};

const initialCachedState = getCachedTimetableState();

const SYNC_CHANNEL = "timetable-store-sync";

export const useTimetableStore = create<TimetableStore>()(
  broadcastSync<TimetableStore>({
    // 시간표 상세 화면 등이 별도 웹뷰로 뜬 RN 멀티 웹뷰 환경에서, 거기서 편집한
    // 시간표(요소 추가/테마 변경 등)가 이전 화면(다른 웹뷰)의 목록에도 즉시
    // 반영되도록 동기화한다.
    name: SYNC_CHANNEL,
    partialize: (state) => ({
      selectedSemester: state.selectedSemester,
      activeTimetableId: state.activeTimetableId,
      timetables: state.timetables,
    }),
    onReceive: (_partial, state) => storeTimetableCache(state),
  })((set, get) => ({
  selectedSemester: initialCachedState.selectedSemester,
  activeTimetableId: initialCachedState.activeTimetableId,
  timetables: initialCachedState.timetables,
  reloadTimetableCache: (memberId) => {
    const nextState = getCachedTimetableState(memberId);
    set({
      selectedSemester: nextState.selectedSemester,
      activeTimetableId: nextState.activeTimetableId,
      timetables: nextState.timetables,
    });
  },
  setSemester: (semester) => {
    set({ selectedSemester: semester });
    storeTimetableCache(get());
  },
  setActiveTimetable: (id) => {
    set({ activeTimetableId: id });
    storeTimetableCache(get());
  },
  // 서버에서 받아온 시간표 목록을 스토어 상태로 변환 (기존 events/theme는 유지)
  setTimetables: (serverTimetables) => {
    set((state) => {
      const legacyThemes = getLegacyTimetableThemes();
      const timetables = serverTimetables.map<Timetable>((t) => {
        const prev = state.timetables.find((p) => p.id === t.id);
        return {
          id: t.id,
          name: t.timeTableName,
          semester: formatSemester(t.year, t.term),
          semesterId: t.semesterId,
          year: t.year,
          term: t.term,
          isRepresentative: t.isPrimary,
          visibility: t.visibility,
          events: prev?.events ?? [],
          theme: prev?.theme ?? legacyThemes[t.id],
        };
      });

      // 선택된 학기가 없으면 대표 시간표(없으면 첫 시간표)의 학기를 선택
      let selectedSemester = state.selectedSemester;
      if (!selectedSemester) {
        const primary =
          timetables.find((t) => t.isRepresentative) ?? timetables[0];
        selectedSemester = primary?.semester ?? "";
      }

      // 활성 시간표가 목록에 없으면 선택된 학기의 대표 시간표로 재설정
      let activeTimetableId = state.activeTimetableId;
      if (!timetables.some((t) => t.id === activeTimetableId)) {
        const inSemester = timetables.filter(
          (t) => t.semester === selectedSemester,
        );
        const fallback =
          inSemester.find((t) => t.isRepresentative) ?? inSemester[0];
        activeTimetableId = fallback?.id ?? null;
      }

      return { timetables, selectedSemester, activeTimetableId };
    });
    storeTimetableCache(get());
  },
  updateTimetableTheme: (id, theme) => {
    set((state) => {
      return {
        timetables: state.timetables.map((t) =>
          t.id === id ? { ...t, theme } : t
        ),
      };
    });
    storeTimetableCache(get());
  },
  updateTimetableEvents: (id, events) => {
    set((state) => {
      const target = state.timetables.find((t) => t.id === id);
      if (target && JSON.stringify(target.events) === JSON.stringify(events)) {
        return state;
      }
      return {
        timetables: state.timetables.map((t) =>
          t.id === id ? { ...t, events } : t
        ),
      };
    });
    storeTimetableCache(get());
  },
  })),
);
