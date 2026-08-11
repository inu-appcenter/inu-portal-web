import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_EXCLUSION_CONDITIONS,
  DEFAULT_PREFERENCE_CONDITIONS,
} from "@/types/timetableWizard";
import type {
  WizardCourseOption,
  WizardExclusionConditions,
  WizardGenerationResult,
  WizardPreferenceConditions,
  WizardSemesterSelection,
  WizardStep,
} from "@/types/timetableWizard";
import type { WizardCourseGroup } from "@/types/timetableGroupWizard";
import {
  DEFAULT_FILTERS,
  type FilterState,
  type FilterSubView,
} from "@/components/mobile/timetable/filter/courseFilterModel";

/**
 * 에브리타임식 "그룹 마법사"의 단일 상태 공급원.
 *
 * 기존 useTimetableWizardStore와 설계 규칙(사실 하나에 소유자 하나, 표현 불가능한 상태는
 * 타입으로 차단, 시트는 명시적 액션으로만 열림)은 그대로 따르되, 강의 선택 모델만 다르다.
 * 위시리스트(필수/선택 토글) 대신 사용자가 직접 만든 그룹 배열을 들고 있고, 강의 검색
 * 시트는 "어느 그룹에 담는지"까지 target에 실어 표현 불가능한 상태를 차단한다.
 *
 * 기존 마법사 스토어와 완전히 분리되어 있어(별도 persist 키) 두 플로우가 서로의 상태를
 * 덮어쓰지 않는다. 기존 파일은 전혀 수정하지 않는다.
 */

export const GROUP_WIZARD_SEARCH_SNAP_POINTS = [0.18, 0.45, 0.9] as const;
export const GROUP_WIZARD_SEARCH_DEFAULT_SNAP_INDEX = 1;

export const GROUP_WIZARD_MIN_CREDIT_SCALE = 12;
export const GROUP_WIZARD_MAX_CREDIT_SCALE = 21;
const DEFAULT_MIN_CREDIT = 15;
const DEFAULT_MAX_CREDIT = 18;

const DEFAULT_GROUP_COUNT = 2;

let groupIdSeq = 0;
const makeGroupId = () =>
  `g_${Date.now().toString(36)}_${(groupIdSeq++).toString(36)}`;

const createDefaultGroups = (): WizardCourseGroup[] =>
  Array.from({ length: DEFAULT_GROUP_COUNT }, () => ({
    id: makeGroupId(),
    options: [],
  }));

/**
 * 강의 검색 시트를 어떤 목적으로 열었는지. null이면 닫힌 상태다.
 * 그룹에 담을 때는 어느 그룹인지까지 실어 "어느 그룹에 담는 시트인지 알 수 없는" 상태를 없앤다.
 */
export type GroupCourseSearchTarget =
  | { kind: "group"; groupId: string }
  | { kind: "exclusion" };

/** 필터 오버레이가 편집 중인 초안. null이면 오버레이가 닫혀 있다. */
export interface FilterDraft {
  filters: FilterState;
  view: FilterSubView;
  majorLevel1: string | null;
  majorLevel2: string | null;
}

interface CourseSearchState {
  target: GroupCourseSearchTarget | null;
  snapIndex: number;
  expandedOfferingId: number | null;
  keyword: string;
  filters: FilterState;
  filterDraft: FilterDraft | null;
}

interface GroupWizardState {
  step: WizardStep;
  semester: WizardSemesterSelection | null;
  minCredit: number;
  maxCredit: number;
  groups: WizardCourseGroup[];
  preference: WizardPreferenceConditions;
  exclusion: WizardExclusionConditions;
  result: WizardGenerationResult | null;
  selectedCandidateId: string | null;
  isSaveSheetOpen: boolean;
  search: CourseSearchState;
  didSeedDefaultMajor: boolean;
}

interface GroupWizardActions {
  setStep: (step: WizardStep) => void;

  setSemester: (semester: WizardSemesterSelection) => void;
  setCreditRange: (min: number, max: number) => void;

  // --- 그룹 (스텝 1) ---
  addGroup: () => void;
  removeGroup: (groupId: string) => void;
  addCourseToGroup: (groupId: string, course: WizardCourseOption) => void;
  removeCourseFromGroup: (groupId: string, subjectNumber: string) => void;

  updatePreference: (
    updater: (prev: WizardPreferenceConditions) => WizardPreferenceConditions,
  ) => void;

  setExcludedSlots: (slots: string[]) => void;
  addExcludedCourse: (course: WizardCourseOption) => void;
  removeExcludedCourse: (subjectNumber: string) => void;

  setResult: (result: WizardGenerationResult) => void;
  selectCandidate: (candidateId: string) => void;
  openSaveSheet: () => void;
  closeSaveSheet: () => void;

  openCourseSearch: (target: GroupCourseSearchTarget) => void;
  closeCourseSearch: () => void;
  setSearchSnapIndex: (index: number) => void;
  toggleExpandedOffering: (offeringId: number) => void;
  setSearchKeyword: (keyword: string) => void;

  openFilterOverlay: () => void;
  updateFilterDraft: (patch: Partial<FilterDraft>) => void;
  resetFilterDraft: () => void;
  applyFilterDraft: () => void;
  cancelFilterOverlay: () => void;

  closeTopLayer: () => boolean;

  seedDefaultMajor: (department: string) => void;
  resetWizard: () => void;
}

export type TimetableGroupWizardStore = GroupWizardState & GroupWizardActions;

const createInitialSearchState = (): CourseSearchState => ({
  target: null,
  snapIndex: GROUP_WIZARD_SEARCH_DEFAULT_SNAP_INDEX,
  expandedOfferingId: null,
  keyword: "",
  filters: { ...DEFAULT_FILTERS },
  filterDraft: null,
});

const createInitialState = (): GroupWizardState => ({
  step: "step1",
  semester: null,
  minCredit: DEFAULT_MIN_CREDIT,
  maxCredit: DEFAULT_MAX_CREDIT,
  groups: createDefaultGroups(),
  preference: { ...DEFAULT_PREFERENCE_CONDITIONS },
  exclusion: { ...DEFAULT_EXCLUSION_CONDITIONS },
  result: null,
  selectedCandidateId: null,
  isSaveSheetOpen: false,
  search: createInitialSearchState(),
  didSeedDefaultMajor: false,
});

const INVALIDATE_RESULT = {
  result: null,
  selectedCandidateId: null,
  isSaveSheetOpen: false,
} as const;

const clampSnapIndex = (index: number) =>
  Math.min(
    Math.max(Math.trunc(index), 0),
    GROUP_WIZARD_SEARCH_SNAP_POINTS.length - 1,
  );

const RESTORABLE_STEPS: WizardStep[] = ["step1", "step2", "step3"];

export const useTimetableGroupWizardStore = create<TimetableGroupWizardStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      setStep: (step) => set({ step }),

      setSemester: (semester) =>
        set((state) =>
          state.semester?.id === semester.id
            ? state
            : {
                semester,
                // 학기가 바뀌면 이전 학기 개설강의로 담은 그룹/제외 강의는 전부 무의미하다.
                groups: createDefaultGroups(),
                exclusion: { ...state.exclusion, excludedCourses: [] },
                ...INVALIDATE_RESULT,
              },
        ),

      setCreditRange: (min, max) =>
        set({
          minCredit: Math.max(GROUP_WIZARD_MIN_CREDIT_SCALE, Math.min(min, max)),
          maxCredit: Math.min(GROUP_WIZARD_MAX_CREDIT_SCALE, Math.max(min, max)),
          ...INVALIDATE_RESULT,
        }),

      addGroup: () =>
        set((state) => ({
          groups: [...state.groups, { id: makeGroupId(), options: [] }],
          ...INVALIDATE_RESULT,
        })),

      removeGroup: (groupId) =>
        set((state) => {
          // 그룹은 최소 1개는 남긴다(마지막 그룹을 지우면 빈 그룹 하나로 되돌린다)
          const remaining = state.groups.filter((g) => g.id !== groupId);
          return {
            groups:
              remaining.length > 0 ? remaining : [{ id: makeGroupId(), options: [] }],
            ...INVALIDATE_RESULT,
          };
        }),

      addCourseToGroup: (groupId, course) =>
        set((state) => {
          const group = state.groups.find((g) => g.id === groupId);
          if (!group) return state;
          if (group.options.some((o) => o.subjectNumber === course.subjectNumber)) {
            return state; // 같은 그룹에 이미 있는 분반은 중복으로 담지 않는다
          }
          return {
            groups: state.groups.map((g) =>
              g.id === groupId ? { ...g, options: [...g.options, course] } : g,
            ),
            ...INVALIDATE_RESULT,
          };
        }),

      removeCourseFromGroup: (groupId, subjectNumber) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  options: g.options.filter((o) => o.subjectNumber !== subjectNumber),
                }
              : g,
          ),
          ...INVALIDATE_RESULT,
        })),

      updatePreference: (updater) =>
        set((state) => ({
          preference: updater(state.preference),
          ...INVALIDATE_RESULT,
        })),

      setExcludedSlots: (slots) =>
        set((state) => ({
          exclusion: { ...state.exclusion, excludedSlots: slots },
          ...INVALIDATE_RESULT,
        })),

      addExcludedCourse: (course) =>
        set((state) =>
          state.exclusion.excludedCourses.some(
            (c) => c.subjectNumber === course.subjectNumber,
          )
            ? state
            : {
                exclusion: {
                  ...state.exclusion,
                  excludedCourses: [...state.exclusion.excludedCourses, course],
                },
                ...INVALIDATE_RESULT,
              },
        ),

      removeExcludedCourse: (subjectNumber) =>
        set((state) => ({
          exclusion: {
            ...state.exclusion,
            excludedCourses: state.exclusion.excludedCourses.filter(
              (c) => c.subjectNumber !== subjectNumber,
            ),
          },
          ...INVALIDATE_RESULT,
        })),

      setResult: (result) =>
        set({ result, selectedCandidateId: null, isSaveSheetOpen: false }),

      selectCandidate: (candidateId) => set({ selectedCandidateId: candidateId }),

      openSaveSheet: () => set({ isSaveSheetOpen: true }),

      closeSaveSheet: () => set({ isSaveSheetOpen: false }),

      openCourseSearch: (target) =>
        set((state) => ({
          search: {
            ...state.search,
            target,
            snapIndex: GROUP_WIZARD_SEARCH_DEFAULT_SNAP_INDEX,
            expandedOfferingId: null,
            keyword: "",
            filterDraft: null,
          },
        })),

      closeCourseSearch: () =>
        set((state) => ({
          search: {
            ...state.search,
            target: null,
            expandedOfferingId: null,
            keyword: "",
            filterDraft: null,
          },
        })),

      setSearchSnapIndex: (index) =>
        set((state) => ({
          search: { ...state.search, snapIndex: clampSnapIndex(index) },
        })),

      toggleExpandedOffering: (offeringId) =>
        set((state) => ({
          search: {
            ...state.search,
            expandedOfferingId:
              state.search.expandedOfferingId === offeringId ? null : offeringId,
          },
        })),

      setSearchKeyword: (keyword) =>
        set((state) => ({ search: { ...state.search, keyword } })),

      openFilterOverlay: () =>
        set((state) => ({
          search: {
            ...state.search,
            snapIndex: GROUP_WIZARD_SEARCH_SNAP_POINTS.length - 1,
            filterDraft: {
              filters: { ...state.search.filters },
              view: "main",
              majorLevel1: null,
              majorLevel2: null,
            },
          },
        })),

      updateFilterDraft: (patch) =>
        set((state) =>
          state.search.filterDraft
            ? {
                search: {
                  ...state.search,
                  filterDraft: { ...state.search.filterDraft, ...patch },
                },
              }
            : state,
        ),

      resetFilterDraft: () =>
        set((state) =>
          state.search.filterDraft
            ? {
                search: {
                  ...state.search,
                  filterDraft: {
                    ...state.search.filterDraft,
                    filters: { ...DEFAULT_FILTERS },
                  },
                },
              }
            : state,
        ),

      applyFilterDraft: () =>
        set((state) =>
          state.search.filterDraft
            ? {
                search: {
                  ...state.search,
                  filters: state.search.filterDraft.filters,
                  filterDraft: null,
                  expandedOfferingId: null,
                },
              }
            : state,
        ),

      cancelFilterOverlay: () =>
        set((state) => ({ search: { ...state.search, filterDraft: null } })),

      closeTopLayer: () => {
        const { search, isSaveSheetOpen } = get();
        const draft = search.filterDraft;

        if (draft) {
          if (draft.view === "major" && draft.majorLevel2) {
            get().updateFilterDraft({ majorLevel2: null });
          } else if (draft.view === "major" && draft.majorLevel1) {
            get().updateFilterDraft({ majorLevel1: null });
          } else if (draft.view !== "main") {
            get().updateFilterDraft({ view: "main" });
          } else {
            get().cancelFilterOverlay();
          }
          return true;
        }

        if (search.target) {
          get().closeCourseSearch();
          return true;
        }

        if (isSaveSheetOpen) {
          get().closeSaveSheet();
          return true;
        }

        return false;
      },

      seedDefaultMajor: (department) =>
        set((state) => {
          const major = department.trim();
          if (state.didSeedDefaultMajor || !major) return state;
          return {
            didSeedDefaultMajor: true,
            search: {
              ...state.search,
              filters: { ...state.search.filters, major },
            },
          };
        }),

      resetWizard: () =>
        set((state) => ({
          ...createInitialState(),
          didSeedDefaultMajor: state.didSeedDefaultMajor,
          search: {
            ...createInitialSearchState(),
            filters: state.search.filters,
          },
        })),
    }),
    {
      name: "timetable-group-wizard",
      version: 1,
      partialize: (state) => ({
        step: RESTORABLE_STEPS.includes(state.step) ? state.step : "step3",
        semester: state.semester,
        minCredit: state.minCredit,
        maxCredit: state.maxCredit,
        groups: state.groups,
        preference: state.preference,
        exclusion: state.exclusion,
        didSeedDefaultMajor: state.didSeedDefaultMajor,
        searchFilters: state.search.filters,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<GroupWizardState> & {
          searchFilters?: FilterState;
        };
        return {
          ...current,
          ...saved,
          // 저장된 그룹이 비었으면(구버전/손상) 기본 그룹으로 되돌린다
          groups:
            saved.groups && saved.groups.length > 0
              ? saved.groups
              : createDefaultGroups(),
          step:
            saved.step && RESTORABLE_STEPS.includes(saved.step) ? saved.step : "step1",

          result: null,
          selectedCandidateId: null,
          isSaveSheetOpen: false,
          search: {
            ...createInitialSearchState(),
            filters: saved.searchFilters
              ? { ...DEFAULT_FILTERS, ...saved.searchFilters }
              : { ...DEFAULT_FILTERS },
          },
        };
      },
    },
  ),
);
