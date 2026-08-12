import { useCallback, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import CapsuleButton from "@/components/common/CapsuleButton";
import Badge from "@/components/common/Badge";
import { useSemesters } from "@/hooks/useSemesters";
import { pickCurrentSemester } from "@/utils/semester";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";
import { appBridge, supportsMultiWebView } from "@/utils/appBridgeAdapter";
import {
  WIZARD_MAX_CREDIT_SCALE,
  WIZARD_MIN_CREDIT_SCALE,
  useTimetableWizardStore,
} from "@/stores/useTimetableWizardStore";
import { generateWizardCandidates } from "@/utils/timetableWizardGenerator";
import CreditRangeSlider from "@/components/mobile/timetable/wizard/CreditRangeSlider";
import WizardStepIndicator from "@/components/mobile/timetable/wizard/WizardStepIndicator";
import WizardCourseSearchSheet from "@/components/mobile/timetable/wizard/WizardCourseSearchSheet";
import WizardStep3Exclusion from "@/components/mobile/timetable/wizard/WizardStep3Exclusion";
import WizardGeneratingScreen from "@/components/mobile/timetable/wizard/WizardGeneratingScreen";
import WizardResultsScreen from "@/components/mobile/timetable/wizard/WizardResultsScreen";
import WizardDetailScreen from "@/components/mobile/timetable/wizard/WizardDetailScreen";
import WizardSaveFlow from "@/components/mobile/timetable/wizard/WizardSaveFlow";
import {
  WizardEmptyState,
  WizardErrorState,
} from "@/components/mobile/timetable/wizard/WizardEmptyErrorScreens";
import { formatCourseMeta } from "@/utils/timetableWizardFormat";
import type { WizardPreferenceConditions } from "@/types/timetableWizard";

const GENERATING_MIN_VISIBLE_MS = 1600;
const DAY_LABELS = ["월", "화", "수", "목", "금"];

// Figma 시안의 "2026-2학기" 표기를 위한 축약 포맷 (앱 전역 formatSemester와는 별개, 드롭다운 전용)
const COMPACT_TERM_LABELS: Record<string, string> = {
  FIRST: "1학기",
  SECOND: "2학기",
  SUMMER: "여름학기",
  WINTER: "겨울학기",
};
const formatSemesterCompact = (year: number, term: string) =>
  `${year}-${COMPACT_TERM_LABELS[term] ?? term}`;

export default function MobileTimetableWizardPage() {
  const navigate = useNavigate();
  const { semesters } = useSemesters();
  const userDepartment = useUserStore((state) => state.userInfo.department);

  const step = useTimetableWizardStore((s) => s.step);
  const semester = useTimetableWizardStore((s) => s.semester);
  const minCredit = useTimetableWizardStore((s) => s.minCredit);
  const maxCredit = useTimetableWizardStore((s) => s.maxCredit);
  const wishlist = useTimetableWizardStore((s) => s.wishlist);
  const preference = useTimetableWizardStore((s) => s.preference);
  const exclusion = useTimetableWizardStore((s) => s.exclusion);
  const result = useTimetableWizardStore((s) => s.result);
  const selectedCandidateId = useTimetableWizardStore((s) => s.selectedCandidateId);
  const isSaveSheetOpen = useTimetableWizardStore((s) => s.isSaveSheetOpen);

  const setStep = useTimetableWizardStore((s) => s.setStep);
  const setSemester = useTimetableWizardStore((s) => s.setSemester);
  const setCreditRange = useTimetableWizardStore((s) => s.setCreditRange);
  const removeWishlistCourse = useTimetableWizardStore((s) => s.removeWishlistCourse);
  const toggleWishlistRequired = useTimetableWizardStore((s) => s.toggleWishlistRequired);
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
  // 이 단계는 순수 계산이다 - 개설강의 전체 선로딩, 로딩/에러 경합, 페이지가 도착할
  // 때마다 계산이 처음부터 다시 도는 문제가 구조적으로 사라졌다.
  // 타이머는 결과가 순식간에 튀어 나와 화면이 깜빡이는 걸 막는 최소 노출 시간일 뿐이다.
  useEffect(() => {
    if (step !== "generating") return;

    let generated;
    try {
      generated = generateWizardCandidates({
        basic: { semester, minCredit, maxCredit, wishlist },
        preference,
        exclusion,
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
    minCredit,
    maxCredit,
    wishlist,
    preference,
    exclusion,
    setResult,
    setStep,
  ]);

  const runGeneration = useCallback(() => setStep("generating"), [setStep]);

  const selectedCandidate = useMemo(
    () => result?.candidates.find((c) => c.id === selectedCandidateId) ?? null,
    [result, selectedCandidateId],
  );

  // 뒤로가기 한 번이 무엇을 닫는지는 스토어의 closeTopLayer가 단독으로 결정한다
  // (필터 오버레이 → 강의 시트 → 스텝). 화면마다 제각각 판단하지 않는다.
  const handleBack = useCallback(() => {
    if (closeTopLayer()) return;
    switch (step) {
      case "step1":
        navigate(-1);
        break;
      case "step2":
        setStep("step1");
        break;
      case "step3":
        setStep("step2");
        break;
      case "detail":
        setStep("results");
        break;
      default:
        setStep("step3");
    }
  }, [closeTopLayer, step, navigate, setStep]);

  const headerConfig = useMemo(() => {
    switch (step) {
      case "step1":
        return { title: "기본 조건", rightArea: <StepBadge>1/3</StepBadge> };
      case "step2":
        return { title: "선호 조건", rightArea: <StepBadge>2/3</StepBadge> };
      case "step3":
        return { title: "제외 조건", rightArea: <StepBadge>3/3</StepBadge> };
      case "generating":
        return { visible: false };
      case "results":
        return {
          title: "추천 시간표",
          rightArea: (
            <HeaderTextButton onClick={runGeneration}>다시 만들기</HeaderTextButton>
          ),
        };
      case "detail":
        return {
          title: selectedCandidate?.label ?? "추천 시간표",
          rightArea: selectedCandidate && (
            <Badge
              text={`${selectedCandidate.totalCredit}학점 · ${selectedCandidate.courses.length}과목`}
            />
          ),
        };
      default:
        return { title: "추천 시간표" };
    }
  }, [step, runGeneration, selectedCandidate]);

  useHeader({
    hasback: true,
    showAlarm: false,
    pageBgColor: "var(--bg-subtle, #f8f9fb)",
    // 헤더 우측 영역이 기본 원형(아이콘 전용) 폭으로 제한되어 "1/3"보다 긴 텍스트/배지가
    // 줄바꿈되는 문제 방지 (MobileHeader의 $isCircle 로직 참고)
    rightAreaNotCircle: true,
    onBack: handleBack,
    ...headerConfig,
  });

  const isConditionStep = step === "step1" || step === "step2" || step === "step3";

  const handlePrimaryNext = () => {
    if (step === "step1") setStep("step2");
    else if (step === "step2") setStep("step3");
    else if (step === "step3") runGeneration();
  };

  const semesterLabel = semester
    ? formatSemesterCompact(semester.year, semester.term)
    : "학기를 선택하세요";

  return (
    <PageWrapper>
      {isConditionStep && (
        <WizardStepIndicator step={step === "step1" ? 1 : step === "step2" ? 2 : 3} />
      )}

      {step === "step1" && (
        <ScrollContent>
          <Card>
            <CardLabel>
              학기<Required>*</Required>
            </CardLabel>
            <SelectBox
              value={semester?.id ?? ""}
              onChange={(e) => {
                const found = semesters.find((s) => s.id === Number(e.target.value));
                if (!found) return;
                setSemester({ id: found.id, year: found.year, term: found.term });
              }}
            >
              {semesters.length === 0 && <option value="">{semesterLabel}</option>}
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatSemesterCompact(s.year, s.term)}
                </option>
              ))}
            </SelectBox>
          </Card>

          <Card>
            <CardLabelRow>
              <CardLabel>목표 학점</CardLabel>
              <CardLabelValue>
                {minCredit} ~ {maxCredit}학점
              </CardLabelValue>
            </CardLabelRow>
            <CreditRangeSlider
              min={WIZARD_MIN_CREDIT_SCALE}
              max={WIZARD_MAX_CREDIT_SCALE}
              valueMin={minCredit}
              valueMax={maxCredit}
              onChange={({ min, max }) => setCreditRange(min, max)}
            />
          </Card>

          <Card>
            <CardLabelRow>
              <CardLabel>듣고 싶은 강의 선택</CardLabel>
              <CardLabelCount>{wishlist.length}개</CardLabelCount>
            </CardLabelRow>
            <CardHint>
              강의 후보를 담아주세요. 반드시 들어가야 하는 강의는 "필수"로 바꿔주세요.
            </CardHint>
            {wishlist.length > 0 && (
              <ChipRow>
                {wishlist.map((item) => (
                  <Chip key={item.course.subjectNumber} $required={item.required}>
                    <ChipRequiredToggle
                      type="button"
                      $required={item.required}
                      onClick={() => toggleWishlistRequired(item.course.subjectNumber)}
                    >
                      {item.required ? "필수" : "선택"}
                    </ChipRequiredToggle>
                    <ChipTextWrap>
                      <ChipTitle $required={item.required}>{item.course.title}</ChipTitle>
                      <ChipMeta $required={item.required}>{formatCourseMeta(item.course)}</ChipMeta>
                    </ChipTextWrap>
                    <ChipRemove
                      type="button"
                      onClick={() => removeWishlistCourse(item.course.subjectNumber)}
                    >
                      <X size={12} />
                    </ChipRemove>
                  </Chip>
                ))}
              </ChipRow>
            )}
            {/* 학기만 정해지면 항상 열 수 있다. 조회 결과가 0건이어도 시트 안에서
                필터를 되돌릴 수 있어야 하므로 결과 개수로 막지 않는다. */}
            <AddCourseButton
              type="button"
              disabled={semester === null}
              onClick={() => openCourseSearch("wishlist")}
            >
              <Plus size={18} />
              강의 추가
            </AddCourseButton>
          </Card>
          <BottomActionsSpacer />
        </ScrollContent>
      )}

      {step === "step2" && (
        <Step2PreferenceConditions preference={preference} onChange={updatePreference} />
      )}

      {step === "step3" && <WizardStep3Exclusion />}

      {step === "generating" && <WizardGeneratingScreen onCancel={() => setStep("step3")} />}

      {step === "results" && result && (
        <WizardResultsScreen
          candidates={result.candidates}
          onSelectCandidate={(id) => {
            selectCandidate(id);
            setStep("detail");
          }}
        />
      )}

      {step === "detail" && selectedCandidate && (
        <WizardDetailScreen candidate={selectedCandidate} />
      )}

      {step === "empty" && result && (
        <WizardEmptyState conflicts={result.conflicts} onRelax={() => setStep("step1")} />
      )}

      {step === "error" && <WizardErrorState onRetry={runGeneration} />}

      {isConditionStep && (
        <FixedBottomContainer>
          <BottomActionButton
            variant="primary"
            disabled={step === "step1" && semester === null}
            onClick={handlePrimaryNext}
          >
            {step === "step1" ? "시작하기" : step === "step3" ? "시간표 만들기" : "다음"}
          </BottomActionButton>
        </FixedBottomContainer>
      )}

      {step === "detail" && selectedCandidate && (
        <FixedBottomContainer>
          <BottomActionButton variant="primary" onClick={openSaveSheet}>
            이 시간표 저장
          </BottomActionButton>
        </FixedBottomContainer>
      )}

      <WizardCourseSearchSheet />

      {selectedCandidate && (
        <WizardSaveFlow
          open={isSaveSheetOpen}
          onOpenChange={(open) => {
            if (!open) closeSaveSheet();
          }}
          candidate={selectedCandidate}
          semesterId={semester?.id ?? null}
          // 위시리스트 등 조건은 그대로 둔 채(resetWizard 미호출) 결과만 새로 뽑는다 -
          // 헤더의 "다시 만들기"와 동일한 동작.
          onGenerateMore={runGeneration}
          onViewTimetable={(timeTableId) => {
            resetWizard();
            const path = `${ROUTES.TIMETABLE.ROOT}?id=${timeTableId}`;
            // 멀티 웹뷰 앱에서는 네이티브 스택을 root로 collapse하고 그 root를
            // 이 경로로 이동시켜야 한다(마법사는 push된 별도 웹뷰이므로 일반 SPA
            // navigate로는 그 웹뷰 자신만 이동하고 root의 시간표 탭은 안 바뀐다).
            if (supportsMultiWebView()) {
              appBridge.goHome(path);
            } else {
              navigate(path, { replace: true });
            }
          }}
        />
      )}
    </PageWrapper>
  );
}

// --- Step 2: 선호조건 --------------------------------------------------

interface Step2Props {
  preference: WizardPreferenceConditions;
  onChange: (
    updater: (prev: WizardPreferenceConditions) => WizardPreferenceConditions,
  ) => void;
}

function Step2PreferenceConditions({ preference, onChange }: Step2Props) {
  const toggleDay = (day: number) => {
    onChange((prev) => {
      const days = prev.freeDayOfWeek.days.includes(day)
        ? prev.freeDayOfWeek.days.filter((d) => d !== day)
        : [...prev.freeDayOfWeek.days, day];
      return { ...prev, freeDayOfWeek: { ...prev.freeDayOfWeek, days } };
    });
  };

  return (
    <ScrollContent>
      <SectionHeading>원하는 조건을 골라주세요 (중복 선택 가능)</SectionHeading>

      <PreferenceCard
        checked={preference.manyFreeDays}
        onToggle={() => onChange((prev) => ({ ...prev, manyFreeDays: !prev.manyFreeDays }))}
        title="공강 많은 시간표"
        code="C-01"
      />

      <PreferenceCard
        checked={preference.freeDayOfWeek.enabled}
        onToggle={() =>
          onChange((prev) => ({
            ...prev,
            freeDayOfWeek: {
              ...prev.freeDayOfWeek,
              enabled: !prev.freeDayOfWeek.enabled,
            },
          }))
        }
        title="특정 요일 공강"
        code="C-02"
      >
        {preference.freeDayOfWeek.enabled && (
          <DayRow>
            {DAY_LABELS.map((label, index) => (
              <DayButton
                key={label}
                type="button"
                $active={preference.freeDayOfWeek.days.includes(index)}
                onClick={() => toggleDay(index)}
              >
                {label}
              </DayButton>
            ))}
          </DayRow>
        )}
      </PreferenceCard>

      <PreferenceCard
        checked={preference.noMorningClasses.enabled}
        onToggle={() =>
          onChange((prev) => ({
            ...prev,
            noMorningClasses: {
              ...prev.noMorningClasses,
              enabled: !prev.noMorningClasses.enabled,
            },
          }))
        }
        title="오전 수업 없는 시간표"
        code="C-03"
      >
        {preference.noMorningClasses.enabled && (
          <SelectBox
            value={preference.noMorningClasses.startAfter}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                noMorningClasses: {
                  ...prev.noMorningClasses,
                  startAfter: Number(e.target.value),
                },
              }))
            }
          >
            <option value={9.5}>9:30 이후 시작</option>
            <option value={10}>10:00 이후 시작</option>
            <option value={10.5}>10:30 이후 시작</option>
            <option value={11}>11:00 이후 시작</option>
            <option value={12}>12:00 이후 시작</option>
          </SelectBox>
        )}
        {preference.noMorningClasses.enabled && (
          <WarningInline>⚠ 선택한 조건으로는 시간표가 안 나올 수 있어요</WarningInline>
        )}
      </PreferenceCard>

      <PreferenceCard
        checked={preference.noNightClasses}
        onToggle={() =>
          onChange((prev) => ({ ...prev, noNightClasses: !prev.noNightClasses }))
        }
        title="야간 수업 제외"
        code="C-04"
      />

      <PreferenceCard
        checked={preference.fewConsecutive}
        onToggle={() =>
          onChange((prev) => ({ ...prev, fewConsecutive: !prev.fewConsecutive }))
        }
        title="연강 적은 시간표"
        code="C-05"
      />

      <PreferenceCard
        checked={preference.avoidCommute}
        onToggle={() => onChange((prev) => ({ ...prev, avoidCommute: !prev.avoidCommute }))}
        title="통학 시간 피하기"
        code="C-06"
      />

      <BottomActionsSpacer />
    </ScrollContent>
  );
}

interface PreferenceCardProps {
  checked: boolean;
  onToggle: () => void;
  title: string;
  code: string;
  children?: React.ReactNode;
}

function PreferenceCard({ checked, onToggle, title, code, children }: PreferenceCardProps) {
  return (
    <PreferenceCardBox $checked={checked}>
      <PreferenceHead onClick={onToggle}>
        <CheckboxInput type="checkbox" checked={checked} readOnly />
        <PreferenceTextWrap>
          <PreferenceTitle $checked={checked}>{title}</PreferenceTitle>
          <PreferenceCode>{code}</PreferenceCode>
        </PreferenceTextWrap>
      </PreferenceHead>
      {checked && children}
    </PreferenceCardBox>
  );
}

// --- styled-components ---------------------------------------------------

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--header-height));
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-subtle, #f8f9fb);
`;

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
`;

const StepBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  font-weight: 600;
`;

const HeaderTextButton = styled.button`
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  color: var(--text-brand, #0061ff);
  font-size: 15px;
  font-weight: 600;
  padding: 8px 4px;
  white-space: nowrap;
`;

const Card = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
`;

const PreferenceCardBox = styled(Card)<{ $checked: boolean }>`
  border-width: ${({ $checked }) => ($checked ? "1.5px" : "1px")};
  border-color: ${({ $checked }) =>
    $checked ? "var(--interactive-primary, #3b82f6)" : "var(--border-default, #e5e8eb)"};
`;

const WarningInline = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff8e9;
  border: 1px solid #fdd9aa;
  color: #d97706;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
`;

const CardLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardLabel = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 16px;
  font-weight: 600;
  line-height: 23px;
`;

const CardLabelValue = styled.span`
  color: var(--interactive-primary, #3b82f6);
  font-size: 15px;
  font-weight: 600;
`;

const CardLabelCount = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  font-weight: 400;
`;

const Required = styled.span`
  color: var(--interactive-primary, #3b82f6);
  margin-left: 2px;
`;

const SelectBox = styled.select`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-subtle, #f8f9fb);
  color: var(--text-primary, #191f28);
  font-size: 16px;
  font-weight: 500;
  line-height: 52px;
  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%238B95A1' stroke-width='1.5' fill='none' fill-rule='evenodd'/></svg>");
  background-repeat: no-repeat;
  background-position: right 16px center;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.div<{ $required: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 14px;
  background: ${({ $required }) =>
    $required ? "var(--bg-brand, #eff6ff)" : "var(--bg-subtle, #f8f9fb)"};
  border: ${({ $required }) =>
    $required
      ? "1px solid var(--interactive-primary, #3b82f6)"
      : "1px dashed var(--border-default, #e5e8eb)"};
`;

const ChipTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ChipTitle = styled.span<{ $required: boolean }>`
  color: ${({ $required }) =>
    $required ? "var(--interactive-primary, #3b82f6)" : "var(--text-primary, #191f28)"};
  font-size: 14px;
  font-weight: 600;
  line-height: 18px;
`;

const ChipMeta = styled.span<{ $required: boolean }>`
  color: ${({ $required }) =>
    $required ? "rgba(59, 130, 246, 0.8)" : "var(--text-tertiary, #8b95a1)"};
  font-size: 11px;
  font-weight: 400;
  line-height: 15px;
`;

const ChipRequiredToggle = styled.button<{ $required: boolean }>`
  flex-shrink: 0;
  border: none;
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  background: ${({ $required }) =>
    $required ? "var(--interactive-primary, #3b82f6)" : "var(--bg-disabled, #e5e8eb)"};
  color: ${({ $required }) => ($required ? "#ffffff" : "var(--text-tertiary, #8b95a1)")};
`;

const ChipRemove = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--interactive-primary, #3b82f6);
  cursor: pointer;
`;

const CardHint = styled.p`
  margin: -8px 0 0;
  color: var(--text-tertiary, #8b95a1);
  font-size: 12px;
  line-height: 18px;
`;

const AddCourseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 48px;
  border-radius: 14px;
  border: 1px dashed var(--interactive-primary, #3b82f6);
  background: var(--bg-subtle, #f8f9fb);
  color: var(--interactive-primary, #3b82f6);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SectionHeading = styled.h2`
  margin: 0 0 4px;
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
`;

const PreferenceHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const PreferenceTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PreferenceTitle = styled.span<{ $checked: boolean }>`
  color: var(--text-primary, #191f28);
  font-size: 15px;
  font-weight: ${({ $checked }) => ($checked ? 700 : 500)};
  line-height: 23px;
`;

const PreferenceCode = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 11px;
  line-height: 17px;
`;

const CheckboxInput = styled.input`
  appearance: none;
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 6px;
  border: 1.5px solid var(--gray-400, #b0b8c1);
  background-color: var(--bg-base, #ffffff);
  position: relative;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:checked {
    border-color: var(--interactive-primary, #3b82f6);
    background-color: var(--interactive-primary, #3b82f6);
  }

  &:checked::after {
    content: "";
    position: absolute;
    left: 7px;
    top: 3px;
    width: 5px;
    height: 10px;
    border: solid #ffffff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

const DayRow = styled.div`
  display: flex;
  gap: 8px;
`;

const DayButton = styled.button<{ $active: boolean }>`
  flex: 1;
  height: 44px;
  border-radius: 999px;
  border: 1px solid
    ${({ $active }) =>
      $active ? "var(--interactive-primary, #3b82f6)" : "var(--border-default, #e5e8eb)"};
  background: ${({ $active }) =>
    $active ? "var(--interactive-primary, #3b82f6)" : "var(--bg-subtle, #f8f9fb)"};
  color: ${({ $active }) => ($active ? "#ffffff" : "var(--text-secondary, #333d4b)")};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;

const BottomActionsSpacer = styled.div`
  height: 80px;
  flex-shrink: 0;
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
