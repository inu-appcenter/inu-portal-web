import { useCallback, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import CapsuleButton from "@/components/common/CapsuleButton";
import Badge from "@/components/common/Badge";
import { useSemesters } from "@/hooks/useSemesters";
import useUserStore from "@/stores/useUserStore";
import {
  GROUP_WIZARD_MAX_CREDIT_SCALE,
  GROUP_WIZARD_MIN_CREDIT_SCALE,
  useTimetableGroupWizardStore,
} from "@/stores/useTimetableGroupWizardStore";
import { generateGroupWizardCandidates } from "@/utils/timetableGroupWizardGenerator";
import CreditRangeSlider from "@/components/mobile/timetable/wizard/CreditRangeSlider";
import WizardStepIndicator from "@/components/mobile/timetable/wizard/WizardStepIndicator";
import WizardGeneratingScreen from "@/components/mobile/timetable/wizard/WizardGeneratingScreen";
import WizardResultsScreen from "@/components/mobile/timetable/wizard/WizardResultsScreen";
import WizardDetailScreen from "@/components/mobile/timetable/wizard/WizardDetailScreen";
import WizardSaveFlow from "@/components/mobile/timetable/wizard/WizardSaveFlow";
import {
  WizardEmptyState,
  WizardErrorState,
} from "@/components/mobile/timetable/wizard/WizardEmptyErrorScreens";
import GroupWizardCourseSearchSheet from "@/components/mobile/timetable/wizard/group/GroupWizardCourseSearchSheet";
import GroupWizardPreferenceStep from "@/components/mobile/timetable/wizard/group/GroupWizardPreferenceStep";
import GroupWizardStep3Exclusion from "@/components/mobile/timetable/wizard/group/GroupWizardStep3Exclusion";

const GENERATING_MIN_VISIBLE_MS = 1600;

const COMPACT_TERM_LABELS: Record<string, string> = {
  FIRST: "1학기",
  SECOND: "2학기",
  SUMMER: "여름학기",
  WINTER: "겨울학기",
};
const formatSemesterCompact = (year: number, term: string) =>
  `${year}-${COMPACT_TERM_LABELS[term] ?? term}`;

/**
 * 에브리타임식 그룹 마법사 페이지.
 *
 * 기존 마법사(MobileTimetableWizardPage)와 스텝 구성(기본조건 → 선호 → 제외 → 생성 →
 * 결과 → 상세 → 저장)은 같지만, "강의 선택과 최초 경우의 수 생성"만 다르다:
 *  - 스텝1의 강의 선택이 위시리스트가 아니라 사용자가 만든 그룹들이다.
 *  - 생성기가 각 그룹에서 하나씩 꺼내 카르테시안 곱으로 조합을 만든다.
 * 그 외 선호·제외 스텝, 생성중/결과/상세/저장 화면은 기존 프레젠테이션 컴포넌트를 그대로
 * 재사용한다(기존 파일은 수정하지 않는다).
 */
export default function MobileTimetableGroupWizardPage() {
  const navigate = useNavigate();
  const { semesters } = useSemesters();
  const userDepartment = useUserStore((state) => state.userInfo.department);

  const step = useTimetableGroupWizardStore((s) => s.step);
  const semester = useTimetableGroupWizardStore((s) => s.semester);
  const minCredit = useTimetableGroupWizardStore((s) => s.minCredit);
  const maxCredit = useTimetableGroupWizardStore((s) => s.maxCredit);
  const groups = useTimetableGroupWizardStore((s) => s.groups);
  const preference = useTimetableGroupWizardStore((s) => s.preference);
  const exclusion = useTimetableGroupWizardStore((s) => s.exclusion);
  const result = useTimetableGroupWizardStore((s) => s.result);
  const selectedCandidateId = useTimetableGroupWizardStore((s) => s.selectedCandidateId);
  const isSaveSheetOpen = useTimetableGroupWizardStore((s) => s.isSaveSheetOpen);

  const setStep = useTimetableGroupWizardStore((s) => s.setStep);
  const setSemester = useTimetableGroupWizardStore((s) => s.setSemester);
  const setCreditRange = useTimetableGroupWizardStore((s) => s.setCreditRange);
  const addGroup = useTimetableGroupWizardStore((s) => s.addGroup);
  const removeGroup = useTimetableGroupWizardStore((s) => s.removeGroup);
  const removeCourseFromGroup = useTimetableGroupWizardStore(
    (s) => s.removeCourseFromGroup,
  );
  const updatePreference = useTimetableGroupWizardStore((s) => s.updatePreference);
  const setResult = useTimetableGroupWizardStore((s) => s.setResult);
  const selectCandidate = useTimetableGroupWizardStore((s) => s.selectCandidate);
  const openSaveSheet = useTimetableGroupWizardStore((s) => s.openSaveSheet);
  const closeSaveSheet = useTimetableGroupWizardStore((s) => s.closeSaveSheet);
  const openCourseSearch = useTimetableGroupWizardStore((s) => s.openCourseSearch);
  const closeTopLayer = useTimetableGroupWizardStore((s) => s.closeTopLayer);
  const seedDefaultMajor = useTimetableGroupWizardStore((s) => s.seedDefaultMajor);
  const resetWizard = useTimetableGroupWizardStore((s) => s.resetWizard);

  useEffect(() => {
    seedDefaultMajor(userDepartment || "컴퓨터공학부");
  }, [userDepartment, seedDefaultMajor]);

  useEffect(() => {
    if (semesters.length === 0) return;
    if (semester && semesters.some((s) => s.id === semester.id)) return;
    const preferred = semesters.find((s) => s.status === "OPEN") ?? semesters[0];
    setSemester({ id: preferred.id, year: preferred.year, term: preferred.term });
  }, [semesters, semester, setSemester]);

  useEffect(() => {
    if (step !== "generating") return;

    let generated;
    try {
      generated = generateGroupWizardCandidates({
        basic: { semester, minCredit, maxCredit, groups },
        preference,
        exclusion,
      });
    } catch (e) {
      console.error("그룹 시간표 조합 생성 실패:", e);
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
    groups,
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
        return { title: "그룹 강의 선택", rightArea: <StepBadge>1/3</StepBadge> };
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

  const totalPickedCount = groups.reduce((sum, g) => sum + g.options.length, 0);

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
              min={GROUP_WIZARD_MIN_CREDIT_SCALE}
              max={GROUP_WIZARD_MAX_CREDIT_SCALE}
              valueMin={minCredit}
              valueMax={maxCredit}
              onChange={({ min, max }) => setCreditRange(min, max)}
            />
          </Card>

          <GroupsIntro>
            <GroupsIntroTitle>그룹마다 듣고 싶은 강의를 1개 이상 담아주세요</GroupsIntroTitle>
            <GroupsIntroText>
              각 그룹에서 강의를 하나씩 꺼내 조합해 시간표를 만들어요. 시간은 무관하지만
              "이 중 하나는 꼭 듣고 싶은" 강의들을 한 그룹에 담아두세요.
            </GroupsIntroText>
          </GroupsIntro>

          {groups.map((group, index) => (
            <GroupCard key={group.id}>
              <GroupHead>
                <GroupTitle>그룹 {index + 1}</GroupTitle>
                <GroupCount>{group.options.length}개</GroupCount>
                <GroupHeadSpacer />
                <GroupRemoveButton
                  type="button"
                  aria-label={`그룹 ${index + 1} 삭제`}
                  onClick={() => removeGroup(group.id)}
                >
                  <X size={16} />
                </GroupRemoveButton>
              </GroupHead>

              {group.options.length > 0 && (
                <ChipRow>
                  {group.options.map((option) => (
                    <Chip key={option.subjectNumber}>
                      <ChipText>
                        {option.title}
                        {option.professor ? ` · ${option.professor}` : ""}
                      </ChipText>
                      <ChipRemove
                        type="button"
                        onClick={() =>
                          removeCourseFromGroup(group.id, option.subjectNumber)
                        }
                      >
                        <X size={12} />
                      </ChipRemove>
                    </Chip>
                  ))}
                </ChipRow>
              )}

              <AddCourseButton
                type="button"
                disabled={semester === null}
                onClick={() => openCourseSearch({ kind: "group", groupId: group.id })}
              >
                <Plus size={18} />
                강의 추가
              </AddCourseButton>
            </GroupCard>
          ))}

          <AddGroupButton type="button" onClick={addGroup}>
            <Plus size={18} />
            그룹 추가
          </AddGroupButton>

          <BottomActionsSpacer />
        </ScrollContent>
      )}

      {step === "step2" && (
        <GroupWizardPreferenceStep preference={preference} onChange={updatePreference} />
      )}

      {step === "step3" && <GroupWizardStep3Exclusion />}

      {step === "generating" && (
        <WizardGeneratingScreen onCancel={() => setStep("step3")} />
      )}

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
            {step === "step1"
              ? totalPickedCount > 0
                ? "다음"
                : "강의를 담고 다음"
              : step === "step3"
                ? "시간표 만들기"
                : "다음"}
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

      <GroupWizardCourseSearchSheet />

      {selectedCandidate && (
        <WizardSaveFlow
          open={isSaveSheetOpen}
          onOpenChange={(open) => {
            if (!open) closeSaveSheet();
          }}
          candidate={selectedCandidate}
          semesterId={semester?.id ?? null}
          onSaved={() => {
            resetWizard();
            navigate(-1);
          }}
        />
      )}
    </PageWrapper>
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

const GroupsIntro = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 2px 4px;
`;

const GroupsIntroTitle = styled.h2`
  margin: 0;
  color: var(--text-primary, #191f28);
  font-size: 15px;
  font-weight: 700;
  line-height: 22px;
`;

const GroupsIntroText = styled.p`
  margin: 0;
  color: var(--text-tertiary, #8b95a1);
  font-size: 12px;
  line-height: 18px;
`;

const GroupCard = styled(Card)`
  gap: 12px;
`;

const GroupHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GroupTitle = styled.span`
  color: var(--text-primary, #191f28);
  font-size: 15px;
  font-weight: 700;
  line-height: 22px;
`;

const GroupCount = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  font-weight: 400;
`;

const GroupHeadSpacer = styled.div`
  flex: 1;
`;

const GroupRemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border: none;
  border-radius: 999px;
  background: var(--bg-neutral-subtle, #f2f4f6);
  color: var(--text-tertiary, #8b95a1);
  cursor: pointer;
  padding: 0;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px 6px 12px;
  border-radius: 999px;
  background: var(--bg-brand, #eff6ff);
  border: 1px solid transparent;
  max-width: 100%;
`;

const ChipText = styled.span`
  color: var(--interactive-primary, #3b82f6);
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  flex-shrink: 0;
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

const AddGroupButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 52px;
  border-radius: 16px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  color: var(--text-secondary, #333d4b);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
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
