import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import { useSemesters } from "@/hooks/useSemesters";
import { formatSemester, pickCurrentSemester } from "@/utils/semester";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";
import { appBridge, supportsMultiWebView } from "@/utils/appBridgeAdapter";
import { showToast } from "@/utils/toast";
import {
  WIZARD_CREDIT_TOLERANCE,
  WIZARD_MAX_CREDIT_SCALE,
  WIZARD_MIN_CREDIT_SCALE,
  getWizardCreditRange,
  useTimetableWizardStore,
} from "@/stores/useTimetableWizardStore";
import { generateWizardCandidates } from "@/utils/timetableWizardGenerator";
import WizardStepIndicator from "@/components/mobile/timetable/wizard/WizardStepIndicator";
import WizardCourseSearchSheet from "@/components/mobile/timetable/wizard/WizardCourseSearchSheet";
import WizardGeneratingScreen from "@/components/mobile/timetable/wizard/WizardGeneratingScreen";
import WizardResultsScreen from "@/components/mobile/timetable/wizard/WizardResultsScreen";
import WizardDetailScreen from "@/components/mobile/timetable/wizard/WizardDetailScreen";
import WizardSaveCandidatesSheet from "@/components/mobile/timetable/wizard/WizardSaveCandidatesSheet";
import {
  WizardEmptyState,
  WizardErrorState,
} from "@/components/mobile/timetable/wizard/WizardEmptyErrorScreens";
import {
  WizardBottomCTA,
  WizardCard,
  WizardCreditSlider,
  WizardDashedButton,
  WizardDayChip,
  WizardSectionLabel,
  WizardSelectField,
  WizardToggleRow,
} from "@/components/mobile/timetable/wizard/ui";

import {
  WIZARD_DAY_NAMES,
  mapWizardCoursesToClassItems,
  toWishlistCourseCards,
} from "@/utils/timetableWizardFormat";
import {
  DEFAULT_EXCLUSION_CONDITIONS,
  type WizardPreferenceConditions,
  type WizardCourseOption,
} from "@/types/timetableWizard";
import { CourseCard } from "@/components/mobile/timetable/CourseCard";
import ClassDetailBottomSheet from "@/components/mobile/timetable/ClassDetailBottomSheet";
import type { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import type { CourseCardOfferingView } from "@/types/courseCardView";
import { typography } from "@/styles/typography";

const GENERATING_MIN_VISIBLE_MS = 1600;
/** 새 시안은 강의선택 → 조건설정 2단계 */
const TOTAL_CONDITION_STEPS = 2;
/** 조건설정 "오전 수업 피하기": 10시 이전에 시작하는 수업을 감점 (시안 문구) */
const MORNING_START_AFTER = 10;

// Figma: INTIP / 시간표 마법사 (5834:17926)
export default function MobileTimetableWizardPage() {
  const navigate = useNavigate();
  const { semesters } = useSemesters();
  const userDepartment = useUserStore((state) => state.userInfo.department);

  const step = useTimetableWizardStore((s) => s.step);
  const semester = useTimetableWizardStore((s) => s.semester);
  const targetCredit = useTimetableWizardStore((s) => s.targetCredit);
  const allowCreditTolerance = useTimetableWizardStore((s) => s.allowCreditTolerance);
  const wishlist = useTimetableWizardStore((s) => s.wishlist);
  const preference = useTimetableWizardStore((s) => s.preference);
  const result = useTimetableWizardStore((s) => s.result);
  const selectedCandidateId = useTimetableWizardStore((s) => s.selectedCandidateId);
  const isSaveSheetOpen = useTimetableWizardStore((s) => s.isSaveSheetOpen);

  const setStep = useTimetableWizardStore((s) => s.setStep);
  const setSemester = useTimetableWizardStore((s) => s.setSemester);
  const setTargetCredit = useTimetableWizardStore((s) => s.setTargetCredit);
  const setAllowCreditTolerance = useTimetableWizardStore((s) => s.setAllowCreditTolerance);
  const removeWishlistCourse = useTimetableWizardStore((s) => s.removeWishlistCourse);
  const updatePreference = useTimetableWizardStore((s) => s.updatePreference);
  const setResult = useTimetableWizardStore((s) => s.setResult);
  const selectCandidate = useTimetableWizardStore((s) => s.selectCandidate);
  const openSaveSheet = useTimetableWizardStore((s) => s.openSaveSheet);
  const closeSaveSheet = useTimetableWizardStore((s) => s.closeSaveSheet);
  const openCourseSearch = useTimetableWizardStore((s) => s.openCourseSearch);
  const closeTopLayer = useTimetableWizardStore((s) => s.closeTopLayer);
  const seedDefaultMajor = useTimetableWizardStore((s) => s.seedDefaultMajor);
  const resetWizard = useTimetableWizardStore((s) => s.resetWizard);

  // 검색 시트의 기본 전공 필터를 사용자 학과로 1회만 심는다(이후 사용자의 선택을 덮지 않음)
  useEffect(() => {
    seedDefaultMajor(userDepartment || "컴퓨터공학부");
  }, [userDepartment, seedDefaultMajor]);

  // 이전 버전의 3단계(제외 조건)는 새 시안에 없다. 스토어 복원이 접어 주지만,
  // 런타임에 들어오는 경우까지 마지막 조건 단계로 돌린다.
  useEffect(() => {
    if (step === "step3") setStep("step2");
  }, [step, setStep]);

  // 아직 고른 학기가 없거나, 저장돼 있던 학기가 서버 목록에서 사라진 경우 기본값을 채운다
  // (진행중 학기 우선). 후자를 방치하면 select의 value와 실제 조회 학기가 어긋난다.
  useEffect(() => {
    if (semesters.length === 0) return;
    if (semester && semesters.some((s) => s.id === semester.id)) return;
    const preferred = pickCurrentSemester(semesters);
    if (!preferred) return;
    setSemester({ id: preferred.id, year: preferred.year, term: preferred.term });
  }, [semesters, semester, setSemester]);

  // 조합 생성. 위시리스트가 강의 스냅샷을 들고 있어 서버 조회에 전혀 의존하지 않으므로
  // 이 단계는 순수 계산이다. 타이머는 결과가 순식간에 튀어 나와 화면이 깜빡이는 걸 막는
  // 최소 노출 시간일 뿐이다.
  useEffect(() => {
    if (step !== "generating") return;

    let generated;
    try {
      generated = generateWizardCandidates({
        basic: {
          semester,
          ...getWizardCreditRange(targetCredit, allowCreditTolerance),
          wishlist,
        },
        preference,
        // 새 시안에는 제외 조건 화면이 없다. 예전 버전에서 저장된 제외 조건이 보이지 않는
        // 채로 결과를 깎아 먹지 않도록 항상 빈 조건으로 돌린다.
        exclusion: DEFAULT_EXCLUSION_CONDITIONS,
      });
    } catch (e) {
      console.error("시간표 조합 생성 실패:", e);
      setStep("error");
      return;
    }

    const timer = window.setTimeout(() => {
      setResult(generated);
      setStep(generated.candidates.length === 0 ? "empty" : "results");
    }, GENERATING_MIN_VISIBLE_MS);

    return () => window.clearTimeout(timer);
  }, [
    step,
    semester,
    targetCredit,
    allowCreditTolerance,
    wishlist,
    preference,
    setResult,
    setStep,
  ]);

  const runGeneration = useCallback(() => setStep("generating"), [setStep]);

  // 빈 결과 화면에서 원인 강의를 바로 빼고 그 자리에서 재생성한다(#248).
  const handleRemoveWishlistCourseFromConflict = useCallback(
    (subjectNumber: string) => {
      removeWishlistCourse(subjectNumber);
      runGeneration();
    },
    [removeWishlistCourse, runGeneration],
  );

  // 원인 강의를 다른 분반으로 "교체"한다(#248). 강의를 빼고, 같은 과목명으로 미리
  // 필터링된 검색 시트를 연다. 몇 개를 더 조정할지는 사용자가 정하므로 자동 재생성은
  // 하지 않는다 - 다 고른 뒤 "다시 만들기"로 직접 재생성한다.
  const handleReplaceWishlistCourseFromConflict = useCallback(
    (course: WizardCourseOption) => {
      removeWishlistCourse(course.subjectNumber);
      openCourseSearch("wishlist", course.title);
    },
    [removeWishlistCourse, openCourseSearch],
  );

  // 위시리스트는 개설강의 단위 스냅샷이고 카드는 과목 단위라, 그리기 직전에만 묶는다.
  const wishlistCards = useMemo(() => toWishlistCourseCards(wishlist), [wishlist]);

  // 담은 강의 행을 누르면 편집 화면과 같은 ClassDetailBottomSheet로 상세를 보여 준다(#397).
  const wishlistGridEvents = useMemo(
    () => mapWizardCoursesToClassItems(wishlist.map((item) => item.course)),
    [wishlist],
  );
  const wishlistColorMap = useMemo(() => new Map<string, string>(), []);
  const [selectedWishlistClass, setSelectedWishlistClass] = useState<ClassItem | null>(null);
  const [isWishlistDetailOpen, setIsWishlistDetailOpen] = useState(false);

  const handleSelectWishlistOffering = useCallback(
    (offering: CourseCardOfferingView) => {
      // gridEvents에서 되찾지 않고 위시리스트 스냅샷에서 직접 만든다 - 시간 정보가 없는
      // (이러닝 등) 강의는 gridEvents에 항목 자체가 없다.
      const item = wishlist.find((w) => w.course.courseOfferingId === offering.offeringId);
      if (!item) return;
      const firstMeeting = item.course.meetings[0];
      setSelectedWishlistClass({
        id: offering.offeringId,
        name: item.course.title,
        room: firstMeeting?.location ?? "",
        day: firstMeeting?.day ?? 0,
        startTime: firstMeeting?.startTime ?? 0,
        endTime: firstMeeting?.endTime ?? 0,
        credits: item.course.credit,
        professor: item.course.professor ?? undefined,
        ssupTypeName: item.course.ssupTypeName ?? undefined,
        ssupTypeCode: item.course.ssupTypeCode ?? undefined,
        courseOfferingId: item.course.courseOfferingId,
        courseId: item.course.subjectNumber,
        evaluation: item.course.gradeEvaluationMethod ?? undefined,
        isUntimed: item.course.meetings.length === 0,
      });
      setIsWishlistDetailOpen(true);
    },
    [wishlist],
  );

  const selectedCandidate = useMemo(
    () => result?.candidates.find((c) => c.id === selectedCandidateId) ?? null,
    [result, selectedCandidateId],
  );

  const goToTimetable = useCallback(
    (timeTableId: number) => {
      resetWizard();
      const path = `${ROUTES.TIMETABLE.ROOT}?id=${timeTableId}`;
      // 멀티 웹뷰 앱에서는 네이티브 스택을 root로 collapse하고 그 root를 이 경로로
      // 이동시켜야 한다(마법사는 push된 별도 웹뷰라 SPA navigate로는 root가 안 바뀐다).
      if (supportsMultiWebView()) {
        appBridge.goHome(path);
      } else {
        navigate(path, { replace: true });
      }
    },
    [resetWizard, navigate],
  );

  // 뒤로가기 한 번이 무엇을 닫는지는 스토어의 closeTopLayer가 단독으로 결정한다
  // (필터 오버레이 → 강의 시트 → 스텝). 화면마다 제각각 판단하지 않는다.
  const handleBack = useCallback(() => {
    if (closeTopLayer()) return;
    switch (step) {
      case "step1":
        navigate(-1);
        break;
      case "detail":
        setStep("results");
        break;
      default:
        setStep(step === "step2" ? "step1" : "step2");
    }
  }, [closeTopLayer, step, navigate, setStep]);

  const headerConfig = useMemo(() => {
    switch (step) {
      case "step1":
        return { title: "필수 조건" };
      case "step2":
      case "step3":
        return { title: "선택 조건" };
      case "generating":
        return { title: "조건 설정" };
      case "detail":
        return {
          title: selectedCandidate?.label ?? "추천 시간표",
          rightArea: selectedCandidate && (
            <HeaderSummary>
              {selectedCandidate.totalCredit}학점 · {selectedCandidate.courses.length}과목
            </HeaderSummary>
          ),
        };
      default:
        // 결과·실패 화면 모두 조건을 그대로 둔 채 다시 뽑을 수 있다 (시안 동일)
        return {
          title: "추천 시간표",
          rightArea: (
            <HeaderTextButton type="button" onClick={runGeneration}>
              다시 만들기
            </HeaderTextButton>
          ),
        };
    }
  }, [step, runGeneration, selectedCandidate]);

  useHeader({
    hasback: true,
    showAlarm: false,
    pageBgColor: "var(--bg-subtle)",
    // 헤더 우측 영역이 기본 원형(아이콘 전용) 폭으로 제한되어 긴 텍스트가 줄바꿈되는 문제 방지
    rightAreaNotCircle: true,
    onBack: handleBack,
    ...headerConfig,
  });

  // 실패 원인에 따라 고칠 곳이 있는 단계로 보낸다(공강 요일은 조건설정, 나머지는 강의선택)
  const handleRelax = () => {
    const kind = result?.conflicts[0]?.kind;
    setStep(kind === "freeDay" ? "step2" : "step1");
  };

  return (
    <PageWrapper>
      {step === "step1" && (
        <>
          <WizardStepIndicator step={1} total={TOTAL_CONDITION_STEPS} />
          <Body $gap={32}>
            <Section>
              <WizardSectionLabel required>학기</WizardSectionLabel>
              <WizardSelectField
                aria-label="학기"
                placeholder="학기를 선택하세요"
                value={semester ? String(semester.id) : ""}
                options={semesters.map((s) => ({
                  value: String(s.id),
                  label: formatSemester(s.year, s.term),
                }))}
                onChange={(value) => {
                  const found = semesters.find((s) => s.id === Number(value));
                  if (!found) return;
                  setSemester({ id: found.id, year: found.year, term: found.term });
                }}
              />
            </Section>

            <Section>
              <WizardSectionLabel trailing={`${targetCredit}학점`}>
                목표 학점
              </WizardSectionLabel>
              <WizardCard>
                <SliderArea>
                  <WizardCreditSlider
                    min={WIZARD_MIN_CREDIT_SCALE}
                    max={WIZARD_MAX_CREDIT_SCALE}
                    value={targetCredit}
                    onChange={setTargetCredit}
                  />
                </SliderArea>
                <WizardToggleRow
                  title="오차 범위 허용"
                  description={`목표 학점에서 ±${WIZARD_CREDIT_TOLERANCE} 정도 차이나요.`}
                  checked={allowCreditTolerance}
                  onCheckedChange={setAllowCreditTolerance}
                  hideDivider
                />
              </WizardCard>
            </Section>

            <Section $gap={12}>
              <WizardSectionLabel>장바구니</WizardSectionLabel>
              {/* 학기만 정해지면 항상 열 수 있다. 조회 결과가 0건이어도 시트 안에서
                  필터를 되돌릴 수 있어야 하므로 결과 개수로 막지 않는다. */}
              <WizardDashedButton
                disabled={semester === null}
                onClick={() => openCourseSearch("wishlist")}
              >
                + 강의 담기
              </WizardDashedButton>
              {wishlistCards.map((card) => (
                <CourseCard
                  key={card.courseId}
                  data={card}
                  onRemoveOffering={(offering) =>
                    removeWishlistCourse(offering.subjectNumber)
                  }
                  onSelectOffering={handleSelectWishlistOffering}
                />
              ))}
            </Section>
          </Body>

          <ClassDetailBottomSheet
            open={isWishlistDetailOpen}
            onOpenChange={setIsWishlistDetailOpen}
            selectedClass={selectedWishlistClass}
            allEvents={wishlistGridEvents}
            colorMap={wishlistColorMap}
            readOnly
          />

          <WizardBottomCTA disabled={semester === null} onClick={() => setStep("step2")}>
            다음
          </WizardBottomCTA>
        </>
      )}

      {(step === "step2" || step === "step3") && (
        <>
          <WizardStepIndicator step={2} total={TOTAL_CONDITION_STEPS} />
          <ConditionStep preference={preference} onChange={updatePreference} />
          <WizardBottomCTA onClick={runGeneration}>시간표 만들기</WizardBottomCTA>
        </>
      )}

      {step === "generating" && <WizardGeneratingScreen onCancel={() => setStep("step2")} />}

      {step === "results" && result && (
        <>
          <WizardResultsScreen
            candidates={result.candidates}
            onSelectCandidate={(id) => {
              selectCandidate(id);
              setStep("detail");
            }}
          />
          <WizardBottomCTA onClick={openSaveSheet}>시간표 저장하기</WizardBottomCTA>
        </>
      )}

      {step === "detail" && selectedCandidate && (
        <>
          <WizardDetailScreen candidate={selectedCandidate} reserveBottomSpace={false} />
          <WizardBottomCTA onClick={openSaveSheet}>이 시간표 저장</WizardBottomCTA>
        </>
      )}

      {step === "empty" && result && (
        <WizardEmptyState
          conflicts={result.conflicts}
          targetCredit={targetCredit}
          onRelax={handleRelax}
          onRemoveWishlistCourse={handleRemoveWishlistCourseFromConflict}
          onReplaceWishlistCourse={handleReplaceWishlistCourseFromConflict}
        />
      )}

      {step === "error" && <WizardErrorState onRetry={runGeneration} />}

      <WizardCourseSearchSheet />

      {/* 결과 화면("시간표 저장하기")과 상세 화면("이 시간표 저장")이 같은 시트를 쓴다
          (Figma 3901:12300). 상세에서 열면 보던 시간표만 체크된 채로 연다. */}
      {result && (
        <WizardSaveCandidatesSheet
          open={isSaveSheetOpen}
          onOpenChange={(open) => {
            if (!open) closeSaveSheet();
          }}
          candidates={result.candidates}
          semesterId={semester?.id ?? null}
          initialSelectedIds={
            step === "detail" && selectedCandidate ? [selectedCandidate.id] : undefined
          }
          onSaved={(ids) => {
            if (ids.length === 0) return;
            showToast(`시간표 ${ids.length}개를 저장했어요`, {
              action: { text: "보러 가기", onClick: () => goToTimetable(ids[0]) },
            });
          }}
        />
      )}
    </PageWrapper>
  );
}

// --- 조건설정 (Figma 3231:9737) -------------------------------------------

interface ConditionStepProps {
  preference: WizardPreferenceConditions;
  onChange: (
    updater: (prev: WizardPreferenceConditions) => WizardPreferenceConditions,
  ) => void;
}

function ConditionStep({ preference, onChange }: ConditionStepProps) {
  const selectedDays = preference.freeDayOfWeek.enabled ? preference.freeDayOfWeek.days : [];

  const toggleDay = (day: number) =>
    onChange((prev) => {
      const current = prev.freeDayOfWeek.enabled ? prev.freeDayOfWeek.days : [];
      const days = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort((a, b) => a - b);
      // 시안에는 켜고 끄는 스위치가 없다 - 요일을 하나라도 고르면 조건이 켜진 것으로 본다
      return { ...prev, freeDayOfWeek: { enabled: days.length > 0, days } };
    });

  return (
    <Body $gap={20}>
      <Section>
        <WizardSectionLabel>반드시 지킬 조건</WizardSectionLabel>
        <OffDaysCard>
          <CardText>
            <CardTitle>공강으로 비울 요일</CardTitle>
            <CardDescription>선택한 요일에 수업이 하나라도 있으면 제외돼요</CardDescription>
          </CardText>
          <DayChips role="group" aria-label="공강으로 비울 요일">
            {WIZARD_DAY_NAMES.map((label, day) => (
              <WizardDayChip
                key={label}
                label={label}
                selected={selectedDays.includes(day)}
                onClick={() => toggleDay(day)}
              />
            ))}
          </DayChips>
        </OffDaysCard>
      </Section>

      <Section>
        <WizardSectionLabel>이왕이면 이런 시간표</WizardSectionLabel>
        <WizardCard>
          <WizardToggleRow
            title="공강 최대화"
            description="지정한 요일 외에 빈 평일이 더 생기면 가점"
            checked={preference.manyFreeDays}
            onCheckedChange={(checked) =>
              onChange((prev) => ({ ...prev, manyFreeDays: checked }))
            }
          />
          <WizardToggleRow
            title="오전 수업 피하기"
            description="10시 이전 시작 수업 감점"
            checked={preference.noMorningClasses.enabled}
            onCheckedChange={(checked) =>
              onChange((prev) => ({
                ...prev,
                noMorningClasses: { enabled: checked, startAfter: MORNING_START_AFTER },
              }))
            }
          />
          <WizardToggleRow
            title="야간 수업 피하기"
            description="18시 이후 종료 수업 감점"
            checked={preference.noNightClasses}
            onCheckedChange={(checked) =>
              onChange((prev) => ({ ...prev, noNightClasses: checked }))
            }
          />
          <WizardToggleRow
            title="연강 피하기"
            description="3시간 이상 연속 수업 감점"
            checked={preference.fewConsecutive}
            onCheckedChange={(checked) =>
              onChange((prev) => ({ ...prev, fewConsecutive: checked }))
            }
            hideDivider
          />
        </WizardCard>
      </Section>
    </Body>
  );
}

// --- styled-components ---------------------------------------------------

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--header-height));
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-subtle);
`;

const Body = styled.div<{ $gap: number }>`
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap}px;
`;

const Section = styled.section<{ $gap?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 8 }) => $gap}px;
`;

const SliderArea = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border-default);
`;

const OffDaysCard = styled(WizardCard)`
  padding: 16px;
  gap: 16px;
`;

const CardText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardTitle = styled.span`
  color: var(--text-secondary);
  ${typography.heading2}
`;

const CardDescription = styled.span`
  color: var(--text-tertiary);
  ${typography.caption1}
`;

// 7개 요일(48px × 7 + 간격)이 좁은 화면에서 넘치면 가로로 밀어서 본다
const DayChips = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  margin: 0 -16px;
  padding: 0 16px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const HeaderTextButton = styled.button`
  padding: 8px 4px;
  border: none;
  background: none;
  color: var(--text-brand);
  white-space: nowrap;
  cursor: pointer;
  ${typography.label1}
`;

const HeaderSummary = styled.span`
  padding: 8px 4px;
  color: var(--text-secondary);
  white-space: nowrap;
  ${typography.label1}
`;
