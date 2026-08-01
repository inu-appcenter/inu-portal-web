import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import CapsuleButton from "@/components/common/CapsuleButton";
import Badge from "@/components/common/Badge";
import { useSemesters } from "@/hooks/useSemesters";
import { useCourses } from "@/hooks/useCourses";
import { useCourseOfferings } from "@/hooks/useCourseOfferings";
import { buildWizardCourseOptions } from "@/utils/timetableWizardPool";
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
import {
  DEFAULT_EXCLUSION_CONDITIONS,
  DEFAULT_PREFERENCE_CONDITIONS,
} from "@/types/timetableWizard";
import type {
  WizardBasicConditions,
  WizardCourseOption,
  WizardGenerationResult,
} from "@/types/timetableWizard";

type WizardStep =
  | "step1"
  | "step2"
  | "step3"
  | "generating"
  | "results"
  | "detail"
  | "empty"
  | "error";

const MIN_CREDIT_SCALE = 12;
const MAX_CREDIT_SCALE = 21;
const DEFAULT_MIN_CREDIT = 15;
const DEFAULT_MAX_CREDIT = 18;
const MAX_MUST_HAVE = 6;
const GENERATING_MIN_VISIBLE_MS = 1600;
const GENERATING_MAX_WAIT_MS = 10000;

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
  const { courses } = useCourses();

  const [step, setStep] = useState<WizardStep>("step1");

  const [basic, setBasic] = useState<WizardBasicConditions>({
    semesterId: null,
    year: null,
    term: null,
    minCredit: DEFAULT_MIN_CREDIT,
    maxCredit: DEFAULT_MAX_CREDIT,
    mustHaveSubjectNumbers: [],
  });
  const [preference, setPreference] = useState(DEFAULT_PREFERENCE_CONDITIONS);
  const [exclusion, setExclusion] = useState(DEFAULT_EXCLUSION_CONDITIONS);

  // 학기 목록이 로드되면 1회에 한해 기본 학기를 자동 선택 (진행중 학기 우선, 없으면 최신 학기)
  useEffect(() => {
    if (basic.semesterId !== null || semesters.length === 0) return;
    const preferred = semesters.find((s) => s.status === "OPEN") ?? semesters[0];
    setBasic((prev) => ({
      ...prev,
      semesterId: preferred.id,
      year: preferred.year,
      term: preferred.term,
    }));
  }, [semesters, basic.semesterId]);

  const {
    courseOfferings,
    isLoading: isOfferingsLoading,
    isError: isOfferingsError,
  } = useCourseOfferings(basic.year ?? undefined, basic.term ?? undefined);

  const coursePool = useMemo(
    () => buildWizardCourseOptions(courses, courseOfferings),
    [courses, courseOfferings],
  );

  const findBySubjectNumber = useCallback(
    (sn: string) => coursePool.find((c) => c.subjectNumber === sn),
    [coursePool],
  );

  const mustHaveCourses = useMemo(
    () =>
      basic.mustHaveSubjectNumbers
        .map(findBySubjectNumber)
        .filter((c): c is WizardCourseOption => !!c),
    [basic.mustHaveSubjectNumbers, findBySubjectNumber],
  );

  const excludedCourses = useMemo(
    () =>
      exclusion.excludedSubjectNumbers
        .map(findBySubjectNumber)
        .filter((c): c is WizardCourseOption => !!c),
    [exclusion.excludedSubjectNumbers, findBySubjectNumber],
  );

  const pickedSubjectNumbers = useMemo(
    () => [...basic.mustHaveSubjectNumbers, ...exclusion.excludedSubjectNumbers],
    [basic.mustHaveSubjectNumbers, exclusion.excludedSubjectNumbers],
  );

  const [generationResult, setGenerationResult] =
    useState<WizardGenerationResult | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );
  const [isMustHaveSheetOpen, setMustHaveSheetOpen] = useState(false);
  const [isSaveSheetOpen, setSaveSheetOpen] = useState(false);

  // generating 단계 진입 시 실제 조합 계산을 수행. 서버 추천 API가 없어 이미 받아온
  // course-offerings 데이터를 바탕으로 클라이언트에서 직접 조합을 탐색한다.
  useEffect(() => {
    if (step !== "generating") return;

    if (isOfferingsError) {
      setStep("error");
      return;
    }

    if (isOfferingsLoading) {
      const timer = window.setTimeout(() => {
        setStep((s) => (s === "generating" ? "error" : s));
      }, GENERATING_MAX_WAIT_MS);
      return () => window.clearTimeout(timer);
    }

    let cancelled = false;
    const startedAt = Date.now();
    let result: WizardGenerationResult;
    try {
      result = generateWizardCandidates(coursePool, { basic, preference, exclusion });
    } catch (e) {
      console.error(e);
      setStep("error");
      return;
    }

    const remaining = Math.max(0, GENERATING_MIN_VISIBLE_MS - (Date.now() - startedAt));
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setGenerationResult(result);
      setStep(result.candidates.length === 0 ? "empty" : "results");
    }, remaining);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [step, isOfferingsLoading, isOfferingsError, coursePool, basic, preference, exclusion]);

  const runGeneration = useCallback(() => setStep("generating"), []);

  const addMustHave = (course: WizardCourseOption) => {
    setBasic((prev) =>
      prev.mustHaveSubjectNumbers.includes(course.subjectNumber)
        ? prev
        : {
            ...prev,
            mustHaveSubjectNumbers: [...prev.mustHaveSubjectNumbers, course.subjectNumber],
          },
    );
    setMustHaveSheetOpen(false);
  };

  const removeMustHave = (subjectNumber: string) => {
    setBasic((prev) => ({
      ...prev,
      mustHaveSubjectNumbers: prev.mustHaveSubjectNumbers.filter((sn) => sn !== subjectNumber),
    }));
  };

  const selectedCandidate = useMemo(
    () => generationResult?.candidates.find((c) => c.id === selectedCandidateId) ?? null,
    [generationResult, selectedCandidateId],
  );

  const headerConfig = useMemo(() => {
    switch (step) {
      case "step1":
        return {
          title: "기본 조건",
          rightArea: <StepBadge>1/3</StepBadge>,
          onBack: () => navigate(-1),
        };
      case "step2":
        return {
          title: "선호 조건",
          rightArea: <StepBadge>2/3</StepBadge>,
          onBack: () => setStep("step1"),
        };
      case "step3":
        return {
          title: "제외 조건",
          rightArea: <StepBadge>3/3</StepBadge>,
          onBack: () => setStep("step2"),
        };
      case "generating":
        return { visible: false };
      case "results":
        return {
          title: "추천 시간표",
          rightArea: <HeaderTextButton onClick={runGeneration}>다시 만들기</HeaderTextButton>,
          onBack: () => setStep("step3"),
        };
      case "detail":
        return {
          title: selectedCandidate?.label ?? "추천 시간표",
          rightArea: selectedCandidate && (
            <Badge
              text={`${selectedCandidate.totalCredit}학점 · ${selectedCandidate.courses.length}과목`}
            />
          ),
          onBack: () => setStep("results"),
        };
      case "empty":
      case "error":
      default:
        return { title: "추천 시간표", onBack: () => setStep("step3") };
    }
  }, [step, navigate, runGeneration, selectedCandidate]);

  useHeader({
    hasback: true,
    showAlarm: false,
    pageBgColor: "var(--bg-subtle, #f8f9fb)",
    // 헤더 우측 영역이 기본 원형(아이콘 전용) 폭으로 제한되어 "1/3"보다 긴 텍스트/배지가
    // 줄바꿈되는 문제 방지 (MobileHeader의 $isCircle 로직 참고)
    rightAreaNotCircle: true,
    ...headerConfig,
  });

  const canProceedStep1 = basic.semesterId !== null;

  const handlePrimaryNext = () => {
    if (step === "step1") setStep("step2");
    else if (step === "step2") setStep("step3");
    else if (step === "step3") runGeneration();
  };

  const semesterLabel = useMemo(() => {
    if (basic.year === null || basic.term === null) return "학기를 선택하세요";
    return formatSemesterCompact(basic.year, basic.term);
  }, [basic.year, basic.term]);

  return (
    <PageWrapper>
      {(step === "step1" || step === "step2" || step === "step3") && (
        <WizardStepIndicator step={step === "step1" ? 1 : step === "step2" ? 2 : 3} />
      )}
      {step === "step1" && (
        <ScrollContent>
          <Card>
            <CardLabel>
              학기<Required>*</Required>
            </CardLabel>
            <SelectBox
              value={basic.semesterId ?? ""}
              onChange={(e) => {
                const found = semesters.find((s) => s.id === Number(e.target.value));
                if (!found) return;
                setBasic((prev) => ({
                  ...prev,
                  semesterId: found.id,
                  year: found.year,
                  term: found.term,
                }));
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
                {basic.minCredit} ~ {basic.maxCredit}학점
              </CardLabelValue>
            </CardLabelRow>
            <CreditRangeSlider
              min={MIN_CREDIT_SCALE}
              max={MAX_CREDIT_SCALE}
              valueMin={basic.minCredit}
              valueMax={basic.maxCredit}
              onChange={({ min, max }) =>
                setBasic((prev) => ({ ...prev, minCredit: min, maxCredit: max }))
              }
            />
          </Card>

          <Card>
            <CardLabelRow>
              <CardLabel>꼭 넣고 싶은 강의</CardLabel>
              <CardLabelValue>
                {mustHaveCourses.length} / {MAX_MUST_HAVE}
              </CardLabelValue>
            </CardLabelRow>
            {mustHaveCourses.length > 0 && (
              <ChipRow>
                {mustHaveCourses.map((c) => (
                  <Chip key={c.subjectNumber}>
                    <span>{c.title}</span>
                    <ChipRemove onClick={() => removeMustHave(c.subjectNumber)}>
                      <X size={12} />
                    </ChipRemove>
                  </Chip>
                ))}
              </ChipRow>
            )}
            <AddCourseButton
              type="button"
              disabled={mustHaveCourses.length >= MAX_MUST_HAVE || coursePool.length === 0}
              onClick={() => setMustHaveSheetOpen(true)}
            >
              <Plus size={18} />
              강의 추가
            </AddCourseButton>
          </Card>
          <BottomActionsSpacer />
        </ScrollContent>
      )}

      {step === "step2" && (
        <Step2PreferenceConditions preference={preference} onChange={setPreference} />
      )}

      {step === "step3" && (
        <WizardStep3Exclusion
          coursePool={coursePool}
          exclusion={exclusion}
          onChangeExclusion={setExclusion}
          excludedCourses={excludedCourses}
        />
      )}

      {step === "generating" && (
        <WizardGeneratingScreen onCancel={() => setStep("step3")} />
      )}

      {step === "results" && generationResult && (
        <WizardResultsScreen
          candidates={generationResult.candidates}
          onSelectCandidate={(id) => {
            setSelectedCandidateId(id);
            setStep("detail");
          }}
        />
      )}

      {step === "detail" && selectedCandidate && (
        <WizardDetailScreen candidate={selectedCandidate} />
      )}

      {step === "empty" && generationResult && (
        <WizardEmptyState
          conflicts={generationResult.conflicts}
          onRelax={() => setStep("step1")}
        />
      )}

      {step === "error" && <WizardErrorState onRetry={runGeneration} />}

      {(step === "step1" || step === "step2" || step === "step3") && (
        <FixedBottomContainer>
          <BottomActionButton
            variant="primary"
            disabled={step === "step1" && !canProceedStep1}
            onClick={handlePrimaryNext}
          >
            {step === "step1" ? "시작하기" : step === "step3" ? "시간표 만들기" : "다음"}
          </BottomActionButton>
        </FixedBottomContainer>
      )}

      {step === "detail" && selectedCandidate && (
        <FixedBottomContainer>
          <BottomActionButton variant="primary" onClick={() => setSaveSheetOpen(true)}>
            이 시간표 저장
          </BottomActionButton>
        </FixedBottomContainer>
      )}

      <WizardCourseSearchSheet
        open={isMustHaveSheetOpen}
        onOpenChange={setMustHaveSheetOpen}
        title="꼭 넣고 싶은 강의 검색"
        pool={coursePool}
        disabledSubjectNumbers={pickedSubjectNumbers}
        onSelect={addMustHave}
      />

      {selectedCandidate && (
        <WizardSaveFlow
          open={isSaveSheetOpen}
          onOpenChange={setSaveSheetOpen}
          candidate={selectedCandidate}
          semesterId={basic.semesterId}
          onSaved={() => navigate(-1)}
        />
      )}
    </PageWrapper>
  );
}

// --- Step 2: 선호조건 --------------------------------------------------

interface Step2Props {
  preference: typeof DEFAULT_PREFERENCE_CONDITIONS;
  onChange: (updater: (prev: typeof DEFAULT_PREFERENCE_CONDITIONS) => typeof DEFAULT_PREFERENCE_CONDITIONS) => void;
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
            freeDayOfWeek: { ...prev.freeDayOfWeek, enabled: !prev.freeDayOfWeek.enabled },
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
            noMorningClasses: { ...prev.noMorningClasses, enabled: !prev.noMorningClasses.enabled },
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
                noMorningClasses: { ...prev.noMorningClasses, startAfter: Number(e.target.value) },
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
        onToggle={() => onChange((prev) => ({ ...prev, noNightClasses: !prev.noNightClasses }))}
        title="야간 수업 제외"
        code="C-04"
      />

      <PreferenceCard
        checked={preference.fewConsecutive}
        onToggle={() => onChange((prev) => ({ ...prev, fewConsecutive: !prev.fewConsecutive }))}
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
          <PreferenceTitle>{title}</PreferenceTitle>
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
  border-color: ${({ $checked }) =>
    $checked ? "var(--border-brand, #0061ff)" : "var(--border-default, #e5e8eb)"};
`;

const WarningInline = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-warning, #fff7ed);
  border: 1px solid var(--border-warning, #fde68a);
  color: var(--orange-500, #f59e0b);
  font-size: 13px;
  font-weight: 500;
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
  color: var(--text-brand, #0061ff);
  font-size: 15px;
  font-weight: 600;
`;

const Required = styled.span`
  color: var(--text-error, #ef4444);
  margin-left: 2px;
`;

const SelectBox = styled.select`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-subtle, #f8f9fb);
  color: var(--text-primary, #333d4b);
  font-size: 16px;
  font-weight: 500;
  box-sizing: border-box;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%238B95A1' stroke-width='1.5' fill='none' fill-rule='evenodd'/></svg>");
  background-repeat: no-repeat;
  background-position: right 16px center;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 8px 8px 14px;
  border-radius: 999px;
  background: var(--bg-brand-subtle, #eff6ff);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);

  span {
    color: var(--text-brand, #0061ff);
    font-size: 14px;
    font-weight: 500;
  }
`;

const ChipRemove = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--text-brand, #0061ff);
  cursor: pointer;
`;

const AddCourseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 48px;
  border-radius: 14px;
  border: 1px dashed var(--border-default, #e5e8eb);
  background: var(--bg-subtle, #f8f9fb);
  color: var(--text-secondary, #333d4b);
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
  color: var(--text-secondary, #333d4b);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
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

const PreferenceTitle = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 16px;
  font-weight: 600;
  line-height: 23px;
`;

const PreferenceCode = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 12px;
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
    border-color: var(--border-brand, #0061ff);
    background-color: var(--border-brand, #0061ff);
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
  border-radius: 12px;
  border: 1px solid
    ${({ $active }) => ($active ? "var(--border-brand, #0061ff)" : "var(--border-default, #e5e8eb)")};
  background: ${({ $active }) => ($active ? "var(--bg-brand-subtle, #eff6ff)" : "var(--bg-base, #ffffff)")};
  color: ${({ $active }) => ($active ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #333d4b)")};
  font-size: 15px;
  font-weight: 600;
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
