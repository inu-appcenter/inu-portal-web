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
  WizardWishlistItem,
} from "@/types/timetableWizard";
import {
  DEFAULT_FILTERS,
  type FilterState,
  type FilterSubView,
} from "@/components/mobile/timetable/filter/courseFilterModel";

/**
 * 시간표 마법사 전체 상태의 단일 진실 공급원.
 *
 * 이전 구조에서 강의선택 바텀시트가 계속 이상 동작한 근본 원인은 "같은 사실이 여러 곳에
 * 동시에 존재"했다는 것이다. 활성 필터만 해도 시트 로컬 state / 페이지 state /
 * localStorage("applied_filters") / localStorage(화면별 키) / 필터 페이지 로컬 state
 * 다섯 군데에 있었고, 서로를 이벤트(focus·visibilitychange·storage)로 덮어쓰면서
 * 시트가 저절로 열리거나 필터 배지와 실제 조회 조건이 어긋났다.
 *
 * 그래서 이 스토어의 설계 규칙은 세 가지다.
 *
 *  1. 사실 하나에 소유자 하나. 파생값(쿼리 파라미터, 배지 개수, 선택된 후보 등)은
 *     저장하지 않고 읽는 쪽에서 계산한다.
 *  2. 표현 불가능한 상태는 타입으로 막는다. 예를 들어 시트의 열림 여부는 boolean이 아니라
 *     `search.target`(위시리스트용 | 제외용 | 닫힘) 하나로, 필터 오버레이는 별도 플래그가
 *     아니라 `search.filterDraft`(있으면 열림)로 표현한다. "두 목적으로 동시에 열림"이나
 *     "오버레이는 열렸는데 초안이 없음" 같은 상태가 아예 만들어지지 않는다.
 *  3. 시트는 명시적인 사용자 액션으로만 열린다. 스토어 밖의 어떤 이벤트 리스너도
 *     시트를 열 수 없다.
 */

// 바텀시트가 멈춰 설 수 있는 높이(뷰포트 비율). 시간표 편집 화면의 검색 시트와 같은 3단이다.
// 인덱스로만 주고받아 부동소수 비교를 없앤다.
export const WIZARD_SEARCH_SNAP_POINTS = [0.18, 0.45, 0.9] as const;
export const WIZARD_SEARCH_DEFAULT_SNAP_INDEX = 1;

export const WIZARD_MIN_CREDIT_SCALE = 12;
export const WIZARD_MAX_CREDIT_SCALE = 21;
const DEFAULT_MIN_CREDIT = 15;
const DEFAULT_MAX_CREDIT = 18;

/** 강의 검색 시트를 어떤 목적으로 열었는지. null이면 닫힌 상태다. */
export type CourseSearchTarget = "wishlist" | "exclusion";

/** 필터 오버레이가 편집 중인 초안. null이면 오버레이가 닫혀 있다. */
export interface FilterDraft {
  filters: FilterState;
  view: FilterSubView;
  majorLevel1: string | null;
  majorLevel2: string | null;
}

interface CourseSearchState {
  target: CourseSearchTarget | null;
  snapIndex: number;
  expandedOfferingId: number | null;
  keyword: string;
  /** 실제 조회에 반영되는 확정 필터. 초안이 아니다. */
  filters: FilterState;
  filterDraft: FilterDraft | null;
}

interface WizardState {
  step: WizardStep;
  semester: WizardSemesterSelection | null;
  minCredit: number;
  maxCredit: number;
  wishlist: WizardWishlistItem[];
  preference: WizardPreferenceConditions;
  exclusion: WizardExclusionConditions;
  /** 생성 결과는 조건에서 파생되지만 계산 비용이 있어 보관한다. 조건이 바뀌면 즉시 버린다. */
  result: WizardGenerationResult | null;
  selectedCandidateId: string | null;
  /** 상세 화면에서 "이 시간표 저장"을 눌러 저장 시트를 열었는지. 후보 선택과는 별개의 사실이다. */
  isSaveSheetOpen: boolean;
  search: CourseSearchState;
  /** 사용자 학과를 기본 전공 필터로 1회만 심었는지. 재진입 시 사용자의 선택을 덮지 않기 위함. */
  didSeedDefaultMajor: boolean;
}

interface WizardActions {
  // --- 스텝 ---
  setStep: (step: WizardStep) => void;

  // --- 기본 조건 (스텝 1) ---
  setSemester: (semester: WizardSemesterSelection) => void;
  setCreditRange: (min: number, max: number) => void;
  addWishlistCourse: (course: WizardCourseOption) => void;
  removeWishlistCourse: (subjectNumber: string) => void;
  toggleWishlistRequired: (subjectNumber: string) => void;

  // --- 선호 조건 (스텝 2) ---
  updatePreference: (
    updater: (prev: WizardPreferenceConditions) => WizardPreferenceConditions,
  ) => void;

  // --- 제외 조건 (스텝 3) ---
  setExcludedSlots: (slots: string[]) => void;
  addExcludedCourse: (course: WizardCourseOption) => void;
  removeExcludedCourse: (subjectNumber: string) => void;

  // --- 생성 결과 ---
  setResult: (result: WizardGenerationResult) => void;
  selectCandidate: (candidateId: string) => void;
  openSaveSheet: () => void;
  closeSaveSheet: () => void;

  // --- 강의 검색 시트 ---
  // initialKeyword: 빈 결과 화면의 "교체" 버튼(#248)에서, 원인이 된 과목명으로
  // 미리 필터링한 채로 열기 위해 쓴다. 생략하면 기존처럼 빈 검색어로 연다.
  openCourseSearch: (target: CourseSearchTarget, initialKeyword?: string) => void;
  closeCourseSearch: () => void;
  setSearchSnapIndex: (index: number) => void;
  toggleExpandedOffering: (offeringId: number) => void;
  setSearchKeyword: (keyword: string) => void;

  // --- 필터 오버레이 (초안 → 적용/취소) ---
  openFilterOverlay: () => void;
  updateFilterDraft: (patch: Partial<FilterDraft>) => void;
  resetFilterDraft: () => void;
  applyFilterDraft: () => void;
  cancelFilterOverlay: () => void;

  /**
   * 뒤로가기 한 번이 닫아야 할 "가장 위 레이어"를 닫는다.
   * 닫을 게 있었으면 true. 뒤로가기 처리 순서를 한 곳에 모아 화면마다 어긋나지 않게 한다.
   */
  closeTopLayer: () => boolean;

  seedDefaultMajor: (department: string) => void;
  resetWizard: () => void;
}

export type TimetableWizardStore = WizardState & WizardActions;

const createInitialSearchState = (): CourseSearchState => ({
  target: null,
  snapIndex: WIZARD_SEARCH_DEFAULT_SNAP_INDEX,
  expandedOfferingId: null,
  keyword: "",
  filters: { ...DEFAULT_FILTERS },
  filterDraft: null,
});

const createInitialState = (): WizardState => ({
  step: "step1",
  semester: null,
  minCredit: DEFAULT_MIN_CREDIT,
  maxCredit: DEFAULT_MAX_CREDIT,
  wishlist: [],
  preference: { ...DEFAULT_PREFERENCE_CONDITIONS },
  exclusion: { ...DEFAULT_EXCLUSION_CONDITIONS },
  result: null,
  selectedCandidateId: null,
  isSaveSheetOpen: false,
  search: createInitialSearchState(),
  didSeedDefaultMajor: false,
});

// 조건이 바뀌면 이전 생성 결과는 무조건 무효다. 결과 화면에 옛 조건의 시안이 남아 있는
// 상태를 막기 위해 조건을 건드리는 모든 액션이 이 패치를 함께 적용한다.
const INVALIDATE_RESULT = {
  result: null,
  selectedCandidateId: null,
  isSaveSheetOpen: false,
} as const;

const clampSnapIndex = (index: number) =>
  Math.min(Math.max(Math.trunc(index), 0), WIZARD_SEARCH_SNAP_POINTS.length - 1);

// 스텝1~3만 복원 대상. 생성중/결과/상세는 결과 데이터가 없으면 의미가 없으므로
// 다시 만들기를 누르면 되는 스텝3으로 되돌린다.
const RESTORABLE_STEPS: WizardStep[] = ["step1", "step2", "step3"];

const LEGACY_DRAFT_KEY = "timetableWizardDraft";

export const useTimetableWizardStore = create<TimetableWizardStore>()(
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
                // 학기가 바뀌면 이전 학기 개설강의로 담은 위시리스트/제외 강의는 전부 무의미하다.
                wishlist: [],
                exclusion: { ...state.exclusion, excludedCourses: [] },
                ...INVALIDATE_RESULT,
              },
        ),

      setCreditRange: (min, max) =>
        set({
          minCredit: Math.max(WIZARD_MIN_CREDIT_SCALE, Math.min(min, max)),
          maxCredit: Math.min(WIZARD_MAX_CREDIT_SCALE, Math.max(min, max)),
          ...INVALIDATE_RESULT,
        }),

      addWishlistCourse: (course) =>
        set((state) =>
          state.wishlist.some((item) => item.course.subjectNumber === course.subjectNumber)
            ? state
            : {
                // 담는 시점의 강의 정보를 그대로 확정해 보관한다(조회 상태와 분리)
                wishlist: [...state.wishlist, { course, required: false }],
                ...INVALIDATE_RESULT,
              },
        ),

      removeWishlistCourse: (subjectNumber) =>
        set((state) => ({
          wishlist: state.wishlist.filter(
            (item) => item.course.subjectNumber !== subjectNumber,
          ),
          ...INVALIDATE_RESULT,
        })),

      toggleWishlistRequired: (subjectNumber) =>
        set((state) => ({
          wishlist: state.wishlist.map((item) =>
            item.course.subjectNumber === subjectNumber
              ? { ...item, required: !item.required }
              : item,
          ),
          ...INVALIDATE_RESULT,
        })),

      updatePreference: (updater) =>
        set((state) => ({ preference: updater(state.preference), ...INVALIDATE_RESULT })),

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

      openCourseSearch: (target, initialKeyword) =>
        set((state) => ({
          search: {
            ...state.search,
            target,
            // 열 때마다 일회성 UI 상태는 초기화한다. 확정 필터는 사용자가 직전에 고른
            // 조건이므로 유지 - 이게 사용자가 기대하는 유일한 "기억"이다.
            snapIndex: WIZARD_SEARCH_DEFAULT_SNAP_INDEX,
            expandedOfferingId: null,
            keyword: initialKeyword ?? "",
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
            // 필터를 보려면 시트가 충분히 올라와 있어야 한다
            snapIndex: WIZARD_SEARCH_SNAP_POINTS.length - 1,
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
                  // 조건이 바뀌면 이전 결과의 펼침 상태는 무의미하다
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
          // 필터 오버레이 안에서는 드릴다운 한 단계씩 거슬러 올라간 뒤 오버레이를 닫는다
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
          // 필터와 학과 시딩 여부는 "다시 만들기"로 날릴 성질이 아니다
          didSeedDefaultMajor: state.didSeedDefaultMajor,
          search: {
            ...createInitialSearchState(),
            filters: state.search.filters,
          },
        })),
    }),
    {
      name: "timetable-wizard",
      version: 1,
      // 저장하는 건 "사용자가 입력한 조건"뿐이다. 시트 열림/스냅/펼침/검색어/오버레이 초안처럼
      // 화면에 붙어 있는 일회성 상태를 저장하면 다시 들어왔을 때 시트가 저절로 열려 있는
      // 부류의 버그가 그대로 되살아난다.
      partialize: (state) => ({
        // 생성중/결과/상세는 결과 데이터가 저장 대상이 아니라 복원해도 빈 화면이 된다.
        // 조건을 다시 확인하고 재생성할 수 있는 스텝3으로 접어서 저장한다.
        step: RESTORABLE_STEPS.includes(state.step) ? state.step : "step3",
        semester: state.semester,
        minCredit: state.minCredit,
        maxCredit: state.maxCredit,
        wishlist: state.wishlist,
        preference: state.preference,
        exclusion: state.exclusion,
        didSeedDefaultMajor: state.didSeedDefaultMajor,
        searchFilters: state.search.filters,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<WizardState> & {
          searchFilters?: FilterState;
        };
        return {
          ...current,
          ...saved,
          step:
            saved.step && RESTORABLE_STEPS.includes(saved.step) ? saved.step : "step1",

          // 저장 대상이 아닌 것들은 항상 초기값에서 시작한다
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
      onRehydrateStorage: () => () => {
        // 구조가 완전히 달라진 이전 버전 초안(subjectNumber 참조 기반)은 되살릴 수 없다
        try {
          localStorage.removeItem(LEGACY_DRAFT_KEY);
        } catch {
          /* 저장소 접근 불가 환경은 무시 */
        }
      },
    },
  ),
);
