import { create } from "zustand";
import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import type { TimeTable, TimeTableVisibility } from "@/types/timetables";
import { formatSemester } from "@/utils/semester";
import { broadcastSync } from "@/stores/middleware/broadcastSync";

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

interface TimetableStore {
  selectedSemester: string;
  activeTimetableId: number | null;
  timetables: Timetable[];
  setSemester: (semester: string) => void;
  setActiveTimetable: (id: number) => void;
  setTimetables: (serverTimetables: TimeTable[]) => void;
  updateTimetableTheme: (id: number, theme: TimetableTheme) => void;
  updateTimetableEvents: (id: number, events: ClassItem[]) => void;
}

export const useTimetableStore = create<TimetableStore>()(
  broadcastSync<TimetableStore>({
    // 시간표 상세 화면 등이 별도 웹뷰로 뜬 RN 멀티 웹뷰 환경에서, 거기서 편집한
    // 시간표(요소 추가/테마 변경 등)가 이전 화면(다른 웹뷰)의 목록에도 즉시
    // 반영되도록 동기화한다.
    name: "timetable-store-sync",
    partialize: (state) => ({
      selectedSemester: state.selectedSemester,
      activeTimetableId: state.activeTimetableId,
      timetables: state.timetables,
    }),
  })((set) => ({
  selectedSemester: "",
  activeTimetableId: null,
  timetables: [],
  setSemester: (semester) => set({ selectedSemester: semester }),
  setActiveTimetable: (id) => set({ activeTimetableId: id }),
  // 서버에서 받아온 시간표 목록을 스토어 상태로 변환 (기존 events/theme는 유지)
  setTimetables: (serverTimetables) =>
    set((state) => {
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
          theme: prev?.theme,
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
    }),
  updateTimetableTheme: (id, theme) =>
    set((state) => ({
      timetables: state.timetables.map((t) =>
        t.id === id ? { ...t, theme } : t
      ),
    })),
  updateTimetableEvents: (id, events) =>
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
    }),
  })),
);
