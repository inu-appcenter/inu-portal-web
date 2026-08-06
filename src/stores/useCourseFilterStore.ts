import { useMemo } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { broadcastSync, flushBroadcastSync } from "@/stores/middleware/broadcastSync";
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
  /**
   * 사용자가 필터를 한 번이라도 확정했는지. 학과 기본값을 "읽을 때마다 채우는 폴백"이
   * 아니라 "한 번만 심는 씨앗"으로 만들기 위해 필요하다 — 이 값이 true면 major가
   * null인 것은 미설정이 아니라 **사용자가 전공 필터를 명시적으로 해제한 상태**이므로
   * 소속 학과로 되돌려서는 안 된다.
   */
  hasApplied: boolean;
  applyFilters: (filters: FilterState) => void;
}

const SYNC_CHANNEL = "course-filter-sync";

export const useCourseFilterStore = create<CourseFilterState>()(
  persist(
    broadcastSync<CourseFilterState>({
      name: SYNC_CHANNEL,
      // 액션은 제외하고 확정 필터만 실어 보낸다.
      partialize: (state) => ({
        filters: state.filters,
        hasApplied: state.hasApplied,
      }),
    })((set) => ({
      filters: DEFAULT_FILTERS,
      hasApplied: false,
      applyFilters: (filters) => {
        set({ filters, hasApplied: true });
        // 이 액션의 유일한 호출부(필터 화면 "저장")는 곧바로 goBack을 보내 자기
        // 웹뷰를 pop시킨다. 기본 마이크로태스크 병합에 맡기면 goBack이 먼저
        // 네이티브에 도착해 브로드캐스트가 유실되므로 여기서 즉시 내보낸다.
        flushBroadcastSync(SYNC_CHANNEL);
      },
    })),
    {
      name: TIMETABLE_COURSE_FILTERS_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        ({
          filters: state.filters,
          hasApplied: state.hasApplied,
        }) as CourseFilterState,
      // 저장 포맷이 { state: { filters } }라 예전의 평평한 FilterState와 다르다.
      // 구 포맷이 남아 있으면 persist가 filters를 못 찾으므로 기본값으로 시작한다
      // (필터를 한 번 다시 적용하면 새 포맷으로 저장된다).
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<CourseFilterState>;
        if (!saved.filters) return current;
        return {
          ...current,
          filters: { ...DEFAULT_FILTERS, ...saved.filters },
          hasApplied: true,
        };
      },
    },
  ),
);

const FALLBACK_MAJOR = "컴퓨터공학부";

/**
 * 화면이 실제로 조회에 쓰는 필터.
 *
 * 아직 한 번도 필터를 확정한 적이 없을 때만 major를 사용자 학과로 채운다. 확정 이력이
 * 있으면 저장된 값을 그대로 쓴다 — 전공 필터를 해제한 사용자에게 소속 학과를 다시
 * 끼워 넣지 않기 위해서다. 편집 화면(서버 조회)과 검색 시트(받아온 목록의 2차 로컬
 * 필터링)가 반드시 같은 값을 봐야 하므로 이 파생을 한 곳에서만 정의한다.
 */
export const useEffectiveCourseFilters = (): FilterState => {
  const filters = useCourseFilterStore((state) => state.filters);
  const hasApplied = useCourseFilterStore((state) => state.hasApplied);
  const userDepartment = useUserStore((state) => state.userInfo.department);

  return useMemo(() => {
    if (hasApplied) return filters;
    return { ...filters, major: userDepartment || FALLBACK_MAJOR };
  }, [filters, hasApplied, userDepartment]);
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
