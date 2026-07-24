import { create } from "zustand";
import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import type { TimeTable, TimeTableVisibility } from "@/types/timetables";
import { formatSemester } from "@/utils/semester";

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
  // TODO(#202): 아래 로컬 뮤테이터는 각 API 연동 완료 시 제거
  setRepresentative: (id: number) => void;
  renameTimetable: (id: number, name: string) => void;
  deleteTimetable: (id: number) => void;
  updateTimetableTheme: (id: number, theme: TimetableTheme) => void;
  updateTimetableEvents: (id: number, events: ClassItem[]) => void;
}

export const useTimetableStore = create<TimetableStore>((set) => ({
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
  setRepresentative: (id) =>
    set((state) => {
      const target = state.timetables.find((t) => t.id === id);
      if (!target) return {};
      const updated = state.timetables.map((t) => {
        if (t.semester === target.semester) {
          return { ...t, isRepresentative: t.id === id };
        }
        return t;
      });
      return { timetables: updated };
    }),
  renameTimetable: (id, name) =>
    set((state) => ({
      timetables: state.timetables.map((t) =>
        t.id === id ? { ...t, name } : t
      ),
    })),
  deleteTimetable: (id) =>
    set((state) => {
      const remaining = state.timetables.filter((t) => t.id !== id);

      // If we deleted the active timetable, find a new active one
      let newActiveId = state.activeTimetableId;
      if (state.activeTimetableId === id) {
        const sameSemester = remaining.filter(
          (t) => t.semester === state.selectedSemester,
        );
        if (sameSemester.length > 0) {
          newActiveId = sameSemester[0].id;
        } else {
          newActiveId = remaining.length > 0 ? remaining[0].id : null;
        }
      }

      return {
        timetables: remaining,
        activeTimetableId: newActiveId,
      };
    }),
  updateTimetableTheme: (id, theme) =>
    set((state) => ({
      timetables: state.timetables.map((t) =>
        t.id === id ? { ...t, theme } : t
      ),
    })),
  updateTimetableEvents: (id, events) =>
    set((state) => ({
      timetables: state.timetables.map((t) =>
        t.id === id ? { ...t, events } : t
      ),
    })),
}));
