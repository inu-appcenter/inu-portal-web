import { useState, useMemo, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import styled from "styled-components";
import { RotateCcw } from "lucide-react";
import { useNavigate, useBlocker, useBeforeUnload } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import { backHandler } from "@/utils/backHandler";
import Modal from "@/components/common/Modal";
import CapsuleButton from "@/components/common/CapsuleButton";
import { mixpanelTrack } from "@/utils/mixpanel";
import { useTimetableStore } from "@/stores/useTimetableStore";
import useUserStore from "@/stores/useUserStore";
import {
  useCourseFilterStore,
  useEffectiveCourseFilters,
} from "@/stores/useCourseFilterStore";
import CourseFilterPanel, {
  resetTimeFilter,
} from "@/components/mobile/timetable/filter/CourseFilterPanel";
import {
  DEFAULT_FILTERS,
  FILTER_SUB_VIEW_TITLES,
} from "@/components/mobile/timetable/filter/courseFilterModel";
import type {
  FilterState,
  FilterSubView,
} from "@/components/mobile/timetable/filter/courseFilterModel";

// 필터 값의 정의는 courseFilterModel이 단독으로 소유한다. 이 화면(별도 라우트)과
// 마법사의 시트 내부 오버레이가 같은 UI(CourseFilterPanel)와 같은 값 규약을 공유하되,
// 저장/이탈 처리 같은 수명주기 로직만 각자 갖는다.
export type { FilterState } from "@/components/mobile/timetable/filter/courseFilterModel";
export {
  DEFAULT_FILTERS,
  formatSlotsToTimeStr,
} from "@/components/mobile/timetable/filter/courseFilterModel";

export default function MobileCourseFilterPage() {
  const navigate = useNavigate();
  const { timetables, activeTimetableId } = useTimetableStore();
  const userDepartment = useUserStore((state) => state.userInfo.department);
  const activeTimetable = useMemo(() => {
    return timetables.find((t) => t.id === activeTimetableId) || null;
  }, [timetables, activeTimetableId]);
  const activeTimetableEvents = activeTimetable?.events ?? [];
  const [isApplying, setIsApplying] = useState(false);

  // 이 화면은 멀티 웹뷰에서 별도 웹뷰로 뜨므로 location.state가 오지 않는다.
  // 현재 확정 필터는 항상 스토어에서 읽는다(persist가 콜드스타트를 책임진다).
  const effectiveFilters = useEffectiveCourseFilters();
  const applyFilters = useCourseFilterStore((state) => state.applyFilters);

  // 마운트 시점의 확정 필터를 초안의 출발점으로 삼는다. 편집 도중 다른 웹뷰가
  // 필터를 바꿔 초안이 튀는 일이 없도록 스토어 변화를 따라가지는 않는다.
  const [initialFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTERS,
    ...effectiveFilters,
  }));

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [view, setSubView] = useState<FilterSubView>("main");
  const [majorLevel1, setMajorLevel1] = useState<string | null>(null);
  const [majorLevel2, setMajorLevel2] = useState<string | null>(null);

  const setView = (newView: FilterSubView) => {
    setSubView(newView);
    if (newView === "major") {
      setMajorLevel1(null);
      setMajorLevel2(null);
    }
  };
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  // 저장하지 않고 나가는 경로(헤더 뒤로가기, OS 백키, 브라우저 뒤로가기)를 위한 복원
  // 로직은 더 이상 필요 없다. 초안은 이 화면의 로컬 state이고 확정 필터는 applyFilters를
  // 부를 때만 바뀌므로, 그냥 나가면 스토어가 손대지지 않은 채로 남는다.

  // 초기 상태 대비 변경 사항이 존재하는지 깊은 비교
  const hasChanges = useMemo(() => {
    return JSON.stringify(filters) !== JSON.stringify(initialFilters);
  }, [filters, initialFilters]);

  const [hasPushState, setHasPushState] = useState(false);
  const isOverlayOpen = view !== "main";

  // 라우터 이탈 방지용 blocker (상세 오버레이 스택 정리 중인 back() 동작과 충돌하지 않도록 처리, 저장 중이면 비활성)
  const shouldBlockNavigation =
    !hasPushState && !isSaving && !isApplying && view === "main" && hasChanges;
  const blocker = useBlocker(shouldBlockNavigation);

  useEffect(() => {
    if (blocker.state === "blocked" && !isSavingRef.current && !isApplying) {
      setShowUnsavedModal(true);
    }
  }, [blocker.state, isApplying]);

  useBeforeUnload(
    (event) => {
      if (view !== "main" || !hasChanges || isSaving || isApplying) return;
      event.preventDefault();
      event.returnValue = "";
    },
    { capture: true },
  );

  const handleStayOnPage = () => {
    setShowUnsavedModal(false);
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  const handleLeaveWithoutSaving = () => {
    setShowUnsavedModal(false);
    backHandler.setPageUnsavedChanges(false);

    // 확정 필터(스토어)는 애초에 건드리지 않았으므로 되돌릴 것이 없다.

    if (blocker.state === "blocked") {
      blocker.proceed();
      return;
    }

    // navigate(-1) 호출 전 blocker를 비활성화하여 이중 모달 방지
    isSavingRef.current = true;
    setIsSaving(true);
    if (
      window.AndroidBridge &&
      typeof window.AndroidBridge.goBack === "function"
    ) {
      window.AndroidBridge.goBack();
    } else {
      navigate(-1);
    }
  };

  // 1회성 pushState 스택 관리 및 뒤로가기 popstate 연동
  useEffect(() => {
    if (isOverlayOpen) {
      if (!hasPushState) {
        window.history.pushState({ filterOverlayOpen: true }, "");
        setHasPushState(true);
      }

      const handlePopState = () => {
        setHasPushState(false);

        if (view === "major") {
          if (majorLevel2) {
            setMajorLevel2(null);
            window.history.pushState({ filterOverlayOpen: true }, "");
            setHasPushState(true);
          } else if (majorLevel1) {
            setMajorLevel1(null);
            window.history.pushState({ filterOverlayOpen: true }, "");
            setHasPushState(true);
          } else {
            setView("main");
          }
        } else {
          setView("main");
        }
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    } else {
      if (hasPushState) {
        window.history.back();
        // window.history.back() 비동기 동작이 완료되고 react-router-dom의
        // popstate 수신 전파가 끝날 때까지 useBlocker 활성화를 150ms 지연하여 타이밍 충돌을 방지합니다.
        setTimeout(() => {
          setHasPushState(false);
        }, 150);
      }
    }
  }, [isOverlayOpen, view, majorLevel1, majorLevel2, hasPushState]);

  // 페이지 단위 미저장이탈 방지 등록 (필터 메인이고 변경사항이 있을 때)
  useEffect(() => {
    const handlePageBack = () => {
      if (isSavingRef.current || isApplying) return false;
      setShowUnsavedModal(true);
      return true;
    };

    if (view === "main" && hasChanges && !isSaving && !isApplying) {
      backHandler.setPageUnsavedChanges(true, handlePageBack);
    } else {
      backHandler.setPageUnsavedChanges(false);
    }

    return () => {
      backHandler.setPageUnsavedChanges(false);
    };
  }, [view, hasChanges, isSaving, isApplying]);

  // 헤더 변경 연동
  const headerConfig = useMemo(() => {
    const configMap: Record<
      FilterSubView,
      { title: string; onBack: () => void }
    > = {
      main: {
        title: FILTER_SUB_VIEW_TITLES.main,
        onBack: () => {
          if (hasChanges) {
            setShowUnsavedModal(true);
          } else {
            navigate(-1);
          }
        },
      },
      major: {
        title: FILTER_SUB_VIEW_TITLES.major,
        onBack: () => {
          if (majorLevel2) {
            setMajorLevel2(null);
          } else if (majorLevel1) {
            setMajorLevel1(null);
          } else {
            setView("main");
          }
        },
      },
      sort: {
        title: FILTER_SUB_VIEW_TITLES.sort,
        onBack: () => setView("main"),
      },
      time: {
        title: FILTER_SUB_VIEW_TITLES.time,
        onBack: () => setView("main"),
      },
      grade: {
        title: FILTER_SUB_VIEW_TITLES.grade,
        onBack: () => setView("main"),
      },
      type: {
        title: FILTER_SUB_VIEW_TITLES.type,
        onBack: () => setView("main"),
      },
      field: {
        title: FILTER_SUB_VIEW_TITLES.field,
        onBack: () => setView("main"),
      },
      online: {
        title: FILTER_SUB_VIEW_TITLES.online,
        onBack: () => setView("main"),
      },
      credit: {
        title: FILTER_SUB_VIEW_TITLES.credit,
        onBack: () => setView("main"),
      },
    };

    return configMap[view];
  }, [view, majorLevel1, majorLevel2, hasChanges, navigate]);

  useHeader({
    title: headerConfig.title,
    hasback: true,
    showAlarm: false,
    onBack: headerConfig.onBack,
    pageBgColor: "var(--bg-subtle, #f8f9fb)",
  });

  // 초기화 핸들러
  const handleReset = () => {
    if (!window.confirm("선택된 필터를 초기화할까요?")) return;
    mixpanelTrack.timetableCourseSearchAction("필터 초기화", {
      scope: "전체",
    });
    setFilters({ ...DEFAULT_FILTERS });
  };

  // 시간 전용 초기화 핸들러
  const handleResetTime = () => {
    mixpanelTrack.timetableCourseSearchAction("필터 초기화", {
      scope: "시간",
    });
    setFilters((prev) => resetTimeFilter(prev));
  };

  // 저장하기 핸들러.
  //
  // 예전에는 여기서 개설강의를 미리 fetch한 뒤 복귀했는데, 멀티 웹뷰에서 이 화면은
  // 편집 화면과 다른 JS 런타임이라 그 prefetch는 **이 웹뷰의** QueryClient만 데웠다.
  // 복귀만 그만큼 느려질 뿐이라 걷어냈다(편집 화면은 확정 필터를 받는 즉시 자기
  // 쿼리를 돌리고, 성공 데이터는 broadcastQueryClient가 웹뷰 간에 실어 나른다).
  const handleSave = () => {
    if (isApplying) return;
    setIsApplying(true);

    backHandler.setPageUnsavedChanges(false); // 앱 환경의 native back 이벤트 방어
    isSavingRef.current = true;
    setShowUnsavedModal(false);

    // 확정 필터 갱신. broadcastSync가 다른 웹뷰(편집 화면)로 실어 나르고,
    // persist가 localStorage에 남긴다.
    applyFilters(filters);

    mixpanelTrack.timetableCourseSearchAction("필터 적용", {
      has_major: Boolean(filters.major),
      has_time:
        filters.time !== "전체 시간" || Boolean(filters.selectedSlots?.length),
      grade_count: filters.grades.length,
      type_count: filters.types.length,
      online_type_count: filters.onlineTypes?.length ?? 0,
      isu_field_count: filters.isuFields?.length ?? 0,
      credit_count: filters.credits.length,
      sort: filters.sort,
    });

    flushSync(() => {
      setIsSaving(true); // blocker 비활성화 후 navigate
    });
    navigate(-1);
  };

  // 즐겨찾기 별표 토글
  return (
    <PageWrapper>
      <CourseFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        view={view}
        onViewChange={setView}
        majorLevel1={majorLevel1}
        majorLevel2={majorLevel2}
        onMajorLevelChange={(level1, level2) => {
          setMajorLevel1(level1);
          setMajorLevel2(level2);
        }}
        timetableEvents={activeTimetableEvents}
        userDepartment={userDepartment}
      />

      {/* 하단 고정 액션바 - 하위 화면마다 필요한 버튼이 달라 컨테이너가 그린다.
          버튼이 없는 화면(전공/정렬)에서는 아예 렌더링하지 않는다. */}
      {view !== "major" && view !== "sort" && (
        <FixedBottomContainer
          style={view === "time" ? { justifyContent: "center" } : undefined}
        >
          {view === "main" && (
            <>
              <ResetBottomButton
                variant="secondary"
                onClick={handleReset}
                leftIcon={<RotateCcw size={16} />}
              >
                초기화
              </ResetBottomButton>
              <BottomActionButton
                variant="primary"
                onClick={handleSave}
                loading={isApplying}
                disabled={isApplying}
              >
                {isApplying ? "적용 중..." : "적용하기"}
              </BottomActionButton>
            </>
          )}
          {view === "time" && (
            <ResetBottomButton
              variant="secondary"
              onClick={handleResetTime}
              leftIcon={<RotateCcw size={16} />}
            >
              초기화
            </ResetBottomButton>
          )}
          {(view === "grade" ||
            view === "type" ||
            view === "field" ||
            view === "credit" ||
            view === "online") && (
            <BottomActionButton
              variant="primary"
              onClick={() => setView("main")}
            >
              선택 완료
            </BottomActionButton>
          )}
        </FixedBottomContainer>
      )}

      {/* 이탈 방지 모달 */}
      <Modal
        isOpen={showUnsavedModal}
        onClose={handleStayOnPage}
        title="변경사항 적용 안 함"
        description="필터 변경사항이 있습니다. 적용하지 않고 시간표 편집 화면으로 돌아갈까요?"
        primaryButton={{
          text: "적용 안 함",
          onClick: handleLeaveWithoutSaving,
          variant: "danger",
        }}
        secondaryButton={{
          text: "취소",
          onClick: handleStayOnPage,
        }}
      />
    </PageWrapper>
  );
}

// --- styled-components ---

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height));
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-subtle, #f8f9fb);
`;

const FixedBottomContainer = styled.div`
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 768px;
  background: transparent;
  padding: 0 24px;
  display: flex;
  flex-direction: row;
  gap: 12px;
  box-sizing: border-box;
  z-index: 100;
`;

const BottomActionButton = styled(CapsuleButton)`
  flex: 1 1 0;
  width: auto;
  min-width: 0;
  height: 56px;
  min-height: 56px;
  padding: 12px 24px;
`;

const ResetBottomButton = styled(BottomActionButton)`
  flex: 0 0 auto;
  width: auto;
  padding: 12px 16px;

  span {
    gap: 6px;
    white-space: nowrap;
  }
`;
