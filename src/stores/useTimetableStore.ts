import { create } from "zustand";
import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";

// MOCK DATA
const MOCK_TIMETABLE_2026_1: ClassItem[] = [
  { id: 1, name: "데이터구조", room: "302호", day: 0, startTime: 9, endTime: 11 },
  { id: 2, name: "운영체제", room: "404호", day: 0, startTime: 13, endTime: 15 },
  { id: 3, name: "컴퓨터네트워크", room: "201호", day: 1, startTime: 10, endTime: 12 },
  { id: 4, name: "데이터구조", room: "302호", day: 2, startTime: 9, endTime: 11 },
  { id: 5, name: "데이터베이스", room: "105호", day: 2, startTime: 14, endTime: 16 },
  { id: 6, name: "운영체제", room: "404호", day: 3, startTime: 13, endTime: 15 },
  { id: 7, name: "인공지능", room: "501호", day: 4, startTime: 15, endTime: 18 },
];

const MOCK_TIMETABLE_2025_1_A: ClassItem[] = [
  { id: 21, name: "알고리즘", room: "202호", day: 1, startTime: 9, endTime: 11 },
  { id: 22, name: "소프트웨어공학", room: "303호", day: 3, startTime: 14, endTime: 16 },
];

const MOCK_TIMETABLE_2025_1_B: ClassItem[] = [
  { id: 23, name: "컴퓨터그래픽스", room: "401호", day: 0, startTime: 13, endTime: 16 },
  { id: 24, name: "웹프로그래밍", room: "104호", day: 2, startTime: 10, endTime: 12 },
];

const MOCK_TIMETABLE_2024_2: ClassItem[] = [
  { id: 31, name: "이산수학", room: "101호", day: 1, startTime: 13, endTime: 15 },
  { id: 32, name: "선형대수학", room: "102호", day: 3, startTime: 9, endTime: 11 },
];

export interface Timetable {
  id: number;
  name: string;
  semester: string;
  isRepresentative: boolean;
  events: ClassItem[];
}

interface TimetableStore {
  selectedSemester: string;
  activeTimetableId: number | null;
  timetables: Timetable[];
  setSemester: (semester: string) => void;
  setActiveTimetable: (id: number) => void;
  setRepresentative: (id: number) => void;
  addTimetable: (semester: string, name: string) => void;
}

export const useTimetableStore = create<TimetableStore>((set) => ({
  selectedSemester: "2026년 1학기",
  activeTimetableId: 1,
  timetables: [
    {
      id: 1,
      name: "시간표 1",
      semester: "2026년 1학기",
      isRepresentative: true,
      events: MOCK_TIMETABLE_2026_1,
    },
    {
      id: 2,
      name: "시간표 1",
      semester: "2025년 1학기",
      isRepresentative: true,
      events: MOCK_TIMETABLE_2025_1_A,
    },
    {
      id: 3,
      name: "시간표 2",
      semester: "2025년 1학기",
      isRepresentative: false,
      events: MOCK_TIMETABLE_2025_1_B,
    },
    {
      id: 4,
      name: "시간표 3",
      semester: "2025년 1학기",
      isRepresentative: false,
      events: [],
    },
    {
      id: 5,
      name: "시간표 1",
      semester: "2024년 2학기",
      isRepresentative: true,
      events: MOCK_TIMETABLE_2024_2,
    },
    {
      id: 6,
      name: "시간표 2",
      semester: "2024년 2학기",
      isRepresentative: false,
      events: [],
    },
  ],
  setSemester: (semester) => set({ selectedSemester: semester }),
  setActiveTimetable: (id) => set({ activeTimetableId: id }),
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
  addTimetable: (semester, name) =>
    set((state) => {
      const newId = Math.max(0, ...state.timetables.map((t) => t.id)) + 1;
      const isFirst = !state.timetables.some((t) => t.semester === semester);
      const newTimetable: Timetable = {
        id: newId,
        name,
        semester,
        isRepresentative: isFirst,
        events: [],
      };
      return {
        timetables: [...state.timetables, newTimetable],
        activeTimetableId: newId,
        selectedSemester: semester,
      };
    }),
}));
