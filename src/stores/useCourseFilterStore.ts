import { useMemo } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { broadcastSync } from "@/stores/middleware/broadcastSync";
import useUserStore from "@/stores/useUserStore";
import {
  DEFAULT_FILTERS,
  type FilterState,
} from "@/components/mobile/timetable/filter/courseFilterModel";

/**
 * 시간표 편집 화면의 "확정된" 강의 검색 필터.
 *
 * 이 스토어가 존재하는 이유는 멀티 웹뷰다. 필터 화면(/timetable/filter)은 RN 셸에서
 * 별도 WebView로 push되므로(router.tsx가 router.navigate를 패치해 appBridge.navigateTo로
 * 위임한다) 편집 화면과 **다른 JS 런타임**에서 돈다. 그래서:
 *
 *  - `navigate(path, { state })`의 state는 브릿지를 건너지 못한다(NavigateToPayload는
 *    { path, url }뿐). 필터 화면의 location.state는 앱에서 항상 undefined다.
 *  - pop 시 편집 화면 웹뷰에는 SPA 라우팅이 일어나지 않아 location.key가 불변이고,
 *    따라서 마운트/라우트 변경에 걸어둔 복원 로직은 재실행되지 않는다.
 *  - `storage` 이벤트는 WebView 인스턴스 사이를 건너지 않는다.
 *
 * 그래서 확정 필터를 in-memory 컴포넌트 상태가 아니라 broadcastSync 스토어가 소유한다.
 * 필터 화면이 applyFilters를 부르면 BroadcastChannel + 네이티브 브릿지 릴레이 이중
 * 경로로 편집 화면 웹뷰에 즉시 도달한다(useUserStore가 로그인 화면에 대해 쓰는 것과
 * 같은 방식). persist는 콜드스타트 복원용이다.
 *
 * 편집 중인 초안(draft)은 여기 두지 않는다. 필터 화면이 로컬 useState로 들고 있다가
 * "저장"에서만 applyFilters를 부르므로, 토글 하나하나가 브로드캐스트되지 않는다.
 */

export const TIMETABLE_COURSE_FILTERS_KEY = "timetable_course_filters";

interface CourseFilterState {
  filters: FilterState;
  applyFilters: (filters: FilterState) => void;
}

export const useCourseFilterStore = create<CourseFilterState>()(
  persist(
    broadcastSync<CourseFilterState>({
      name: "course-filter-sync",
      // 액션은 제외하고 확정 필터만 실어 보낸다.
      partialize: (state) => ({ filters: state.filters }),
    })((set) => ({
      filters: DEFAULT_FILTERS,
      applyFilters: (filters) => set({ filters }),
    })),
    {
      name: TIMETABLE_COURSE_FILTERS_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ filters: state.filters }) as CourseFilterState,
      // 저장 포맷이 { state: { filters } }라 예전의 평평한 FilterState와 다르다.
      // 구 포맷이 남아 있으면 persist가 filters를 못 찾으므로 기본값으로 시작한다
      // (필터를 한 번 다시 적용하면 새 포맷으로 저장된다).
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<CourseFilterState>;
        return {
          ...current,
          filters: saved.filters
            ? { ...DEFAULT_FILTERS, ...saved.filters }
            : current.filters,
        };
      },
    },
  ),
);

const FALLBACK_MAJOR = "컴퓨터공학부";

/**
 * 화면이 실제로 조회에 쓰는 필터.
 *
 * 저장된 major가 없으면 사용자 학과로 채운다. 편집 화면(서버 조회)과 검색 시트(받아온
 * 목록의 2차 로컬 필터링)가 반드시 같은 값을 봐야 하므로 이 파생을 한 곳에서만 정의한다.
 */
export const useEffectiveCourseFilters = (): FilterState => {
  const filters = useCourseFilterStore((state) => state.filters);
  const userDepartment = useUserStore((state) => state.userInfo.department);

  return useMemo(
    () => ({
      ...filters,
      major: filters.major ?? (userDepartment || FALLBACK_MAJOR),
    }),
    [filters, userDepartment],
  );
};

/**
 * 브릿지 릴레이가 없는 셸(구 네이티브 앱: bridgeChannel === null 인데 멀티 웹뷰 push는
 * 하는 조합)에서는 BroadcastChannel 한 경로만 남고, WKWebView에서는 그마저 웹뷰 간
 * 전달이 불안정하다. 그 경우를 위해 화면이 다시 앞으로 올라올 때 저장소에서 한 번 더
 * 끌어온다. 브로드캐스트가 이미 도달했다면 값이 같아 리렌더도 일어나지 않는다.
 */
if (typeof window !== "undefined") {
  const rehydrate = () => {
    void useCourseFilterStore.persist.rehydrate();
  };
  window.addEventListener("focus", rehydrate);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") rehydrate();
  });
}
