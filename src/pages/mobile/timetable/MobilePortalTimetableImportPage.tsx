import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import {
  AlertCircle,
  Check,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import CapsuleButton from "@/components/common/CapsuleButton";
import { PortalAccountModal } from "@/components/mobile/agent/PortalAccountModal";
import {
  checkPortalAccountLinked,
  fetchStudentTimetableFromApp,
  fetchFullAcademicReportFromApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import {
  resolvePortalTimetableItems,
  ResolvedPortalTimetableItem,
} from "@/utils/resolvePortalTimetableOfferings";
import { useSemesters } from "@/hooks/useSemesters";
import {
  useCreateTimeTable,
  useCreateTimeTableCourseItem,
  syncTimeTableDetail,
} from "@/hooks/useTimeTables";
import { useTimetableStore } from "@/stores/useTimetableStore";
import {
  formatSemester,
  pickCurrentSemester,
  termToTmGbn,
} from "@/utils/semester";
import { mixpanelTrack } from "@/utils/mixpanel";
import { ROUTES } from "@/constants/routes";
import { savePortalGradesToCalculatorStorage } from "@/utils/portalGradeSync";
import { useHeader } from "@/context/HeaderContext";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import type { Term } from "@/types/timetables";

type ImportStep =
  | "SELECT_SEMESTER"
  | "SELECT_MODE"
  | "FETCHING"
  | "REVIEW"
  | "SAVING"
  | "ASK_GRADE_IMPORT"
  | "FETCHING_GRADES"
  | "GRADE_SUCCESS";

export interface SemesterCourseGroup {
  semesterId: number;
  year: number;
  term: Term;
  label: string;
  courses: ResolvedPortalTimetableItem[];
  isExpanded: boolean;
}

export default function MobilePortalTimetableImportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { semesters } = useSemesters();
  const { timetables, setActiveTimetable, setSemester } = useTimetableStore();
  const createTimeTableMutation = useCreateTimeTable();
  const createItemMutation = useCreateTimeTableCourseItem();

  const targetTimetableId = useMemo(() => {
    const paramId = searchParams.get("id");
    return paramId && !Number.isNaN(Number(paramId)) ? Number(paramId) : null;
  }, [searchParams]);

  const [step, setStep] = useState<ImportStep>("SELECT_SEMESTER");
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [selectedSemesterIds, setSelectedSemesterIds] = useState<number[]>([]);
  const [semesterGroups, setSemesterGroups] = useState<SemesterCourseGroup[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [createNewTimetable, setCreateNewTimetable] = useState(false);
  const [emptySemesterLabels, setEmptySemesterLabels] = useState<string[]>([]);

  const [savedTimetableResult, setSavedTimetableResult] = useState<{
    totalAdded: number;
    totalSkipped: number;
    semesterCount: number;
  }>({ totalAdded: 0, totalSkipped: 0, semesterCount: 0 });

  const [gradeResult, setGradeResult] = useState<{
    semestersCount: number;
    subjectsCount: number;
  }>({ semestersCount: 0, subjectsCount: 0 });

  const semesterOptions = useMemo(
    () =>
      semesters.map((s) => ({
        id: s.id,
        year: s.year,
        term: s.term,
        label: formatSemester(s.year, s.term),
      })),
    [semesters],
  );

  const activeTimetable = useMemo(
    () => timetables.find((t) => t.id === targetTimetableId) ?? null,
    [timetables, targetTimetableId],
  );

  const existingOfferingIds = useMemo(() => {
    if (!activeTimetable || createNewTimetable) return [];
    return activeTimetable.events
      .map((e) => e.courseOfferingId)
      .filter((id): id is number => id !== undefined);
  }, [activeTimetable, createNewTimetable]);

  const existingSubjectNumbers = useMemo(() => {
    if (!activeTimetable || createNewTimetable) return [];
    return activeTimetable.events
      .map((e) => e.courseId)
      .filter((id): id is string => Boolean(id));
  }, [activeTimetable, createNewTimetable]);

  const isMultipleSemesters = selectedSemesterIds.length > 1;

  const singleSelectedSemester = useMemo(
    () =>
      selectedSemesterIds.length === 1
        ? semesterOptions.find((s) => s.id === selectedSemesterIds[0]) ?? null
        : null,
    [selectedSemesterIds, semesterOptions],
  );

  const isSemesterMatched = useMemo(() => {
    if (!activeTimetable || !singleSelectedSemester) return false;
    return (
      activeTimetable.year === singleSelectedSemester.year &&
      activeTimetable.term === singleSelectedSemester.term
    );
  }, [activeTimetable, singleSelectedSemester]);

  const canAddToCurrent = Boolean(
    !isMultipleSemesters && activeTimetable && isSemesterMatched,
  );

  const disabledReason = useMemo(() => {
    if (isMultipleSemesters) {
      return "여러 학기를 동시에 가져올 때는 각 학기별로 새로운 시간표가 생성돼요.";
    }
    if (!activeTimetable) {
      return "추가할 기존 시간표가 없습니다.";
    }
    if (!isSemesterMatched && singleSelectedSemester) {
      return `현재 시간표(${activeTimetable.semester})와 선택한 학기(${singleSelectedSemester.label})가 달라 추가할 수 없어요.`;
    }
    return null;
  }, [isMultipleSemesters, activeTimetable, isSemesterMatched, singleSelectedSemester]);

  useEffect(() => {
    const current = pickCurrentSemester(semesters);
    const initialId = current?.id ?? semesterOptions[0]?.id ?? null;
    setSelectedSemesterIds(initialId ? [initialId] : []);
  }, [semesters, semesterOptions]);

  useEffect(() => {
    if (canAddToCurrent) {
      setCreateNewTimetable(false);
    } else {
      setCreateNewTimetable(true);
    }
  }, [canAddToCurrent]);

  const isLoading =
    step === "FETCHING" || step === "SAVING" || step === "FETCHING_GRADES";

  useHeader({
    title: "포털에서 가져오기",
    hasback: !isLoading,
    pageBgColor: "var(--bg-subtle, #f8f9fb)",
    onBack: () => {
      if (isLoading) return;
      if (step === "SELECT_MODE") {
        setStep("SELECT_SEMESTER");
      } else if (step === "REVIEW") {
        setStep("SELECT_MODE");
      } else if (step === "ASK_GRADE_IMPORT" || step === "GRADE_SUCCESS") {
        navigate(ROUTES.TIMETABLE.ROOT);
      } else {
        navigate(-1);
      }
    },
  });

  const toggleSemesterSelection = (semesterId: number) => {
    setSelectedSemesterIds((prev) =>
      prev.includes(semesterId)
        ? prev.filter((id) => id !== semesterId)
        : [...prev, semesterId],
    );
  };

  const toggleAllSemesters = () => {
    if (selectedSemesterIds.length === semesterOptions.length) {
      const current = pickCurrentSemester(semesters);
      setSelectedSemesterIds(current ? [current.id] : [semesterOptions[0]?.id]);
    } else {
      setSelectedSemesterIds(semesterOptions.map((s) => s.id));
    }
  };

  const executeFetchAllTimetables = async () => {
    const targets = semesterOptions.filter((s) =>
      selectedSemesterIds.includes(s.id),
    );
    if (targets.length === 0) return;

    setStep("FETCHING");
    setErrorMessage("");

    const fetchedGroups: SemesterCourseGroup[] = [];
    const emptyLabels: string[] = [];

    for (let i = 0; i < targets.length; i++) {
      const sem = targets[i];
      setLoadingMessage(
        `${sem.label} 시간표를 가져오는 중이에요... (${i + 1}/${targets.length})`,
      );

      const tmGbn = termToTmGbn(sem.term);

      try {
        const res = await fetchStudentTimetableFromApp({
          yy: String(sem.year),
          tmGbn,
        });

        if (!res.success) {
          if (res.errorCode === "AUTH_REQUIRED") {
            setIsPortalModalOpen(true);
            setStep("SELECT_MODE");
            return;
          }
          console.warn(`${sem.label} 조회 실패:`, res.errorMessage);
          continue;
        }

        const rawItems = res.data ?? [];
        if (rawItems.length === 0) {
          emptyLabels.push(sem.label);
          continue;
        }

        const isCurrentTarget =
          activeTimetable &&
          activeTimetable.year === sem.year &&
          activeTimetable.term === sem.term;

        const resolved = await resolvePortalTimetableItems(
          rawItems,
          sem.year,
          sem.term,
          isCurrentTarget ? existingOfferingIds : [],
          isCurrentTarget ? existingSubjectNumbers : [],
        );

        fetchedGroups.push({
          semesterId: sem.id,
          year: sem.year,
          term: sem.term,
          label: sem.label,
          courses: resolved,
          isExpanded: true,
        });
      } catch (err: any) {
        console.error(`${sem.label} 처리 오류:`, err);
      }
    }

    setEmptySemesterLabels(emptyLabels);

    if (fetchedGroups.length === 0) {
      setErrorMessage(
        emptyLabels.length > 0
          ? "선택한 학기에 등록된 수강신청 내역이 없습니다."
          : "포털에서 시간표를 불러오지 못했습니다. 계정 정보를 확인해주세요.",
      );
      setStep("SELECT_MODE");
      return;
    }

    setSemesterGroups(fetchedGroups);
    setStep("REVIEW");
  };

  const handleStartFetch = async () => {
    if (!isMobileAppEnvironment()) {
      alert("포털 시간표 가져오기는 인팁 모바일 앱 환경에서 지원됩니다.");
      return;
    }

    const isLinked = await checkPortalAccountLinked();
    if (!isLinked) {
      setIsPortalModalOpen(true);
      return;
    }

    await executeFetchAllTimetables();
  };

  const handlePortalAccountSuccess = () => {
    setIsPortalModalOpen(false);
    executeFetchAllTimetables();
  };

  const toggleCourseSelect = (groupIndex: number, courseIndex: number) => {
    setSemesterGroups((prev) =>
      prev.map((g, gIdx) => {
        if (gIdx !== groupIndex) return g;
        const newCourses = g.courses.map((c, cIdx) => {
          if (cIdx !== courseIndex) return c;
          return { ...c, isSelected: !c.isSelected };
        });
        return { ...g, courses: newCourses };
      }),
    );
  };

  const toggleGroupSelectAll = (groupIndex: number) => {
    setSemesterGroups((prev) =>
      prev.map((g, gIdx) => {
        if (gIdx !== groupIndex) return g;
        const selectableCourses = g.courses.filter(
          (c) => !c.isAlreadyAdded && c.offering,
        );
        const isAllSelected =
          selectableCourses.length > 0 &&
          selectableCourses.every((c) => c.isSelected);

        const newCourses = g.courses.map((c) => {
          if (c.isAlreadyAdded || !c.offering) return c;
          return { ...c, isSelected: !isAllSelected };
        });
        return { ...g, courses: newCourses };
      }),
    );
  };

  const toggleGroupExpand = (groupIndex: number) => {
    setSemesterGroups((prev) =>
      prev.map((g, gIdx) =>
        gIdx === groupIndex ? { ...g, isExpanded: !g.isExpanded } : g,
      ),
    );
  };

  const handleApplyToTimetable = async () => {
    const groupsWithSelections = semesterGroups
      .map((g) => ({
        ...g,
        selectedCourses: g.courses.filter(
          (c) => c.isSelected && c.offering && !c.isAlreadyAdded,
        ),
      }))
      .filter((g) => g.selectedCourses.length > 0);

    if (groupsWithSelections.length === 0) {
      alert("등록할 강의를 선택해 주세요.");
      return;
    }

    setStep("SAVING");
    let totalAdded = 0;
    let totalSkipped = 0;
    let lastCreatedTimetableId: number | null = null;
    let lastSemesterLabel = "";

    try {
      for (const group of groupsWithSelections) {
        setLoadingMessage(`${group.label} 시간표를 저장하고 있어요...`);

        let destTimetableId: number | null = null;

        if (
          groupsWithSelections.length === 1 &&
          !createNewTimetable &&
          targetTimetableId
        ) {
          destTimetableId = targetTimetableId;
        } else {
          const termShort =
            group.term === "FIRST"
              ? "1"
              : group.term === "SECOND"
                ? "2"
                : group.term === "SUMMER"
                  ? "여름"
                  : "겨울";
          const created = await createTimeTableMutation.mutateAsync({
            semesterId: group.semesterId,
            timeTableName: `${group.year}-${termShort} 포털시간표`,
          });
          destTimetableId = created.id;
        }

        lastCreatedTimetableId = destTimetableId;
        lastSemesterLabel = group.label;

        for (const item of group.selectedCourses) {
          if (!item.offering) continue;
          try {
            await createItemMutation.mutateAsync({
              timeTableId: destTimetableId,
              body: { courseOfferingId: item.offering.id },
            });
            totalAdded += 1;
          } catch (error: any) {
            const status = error.response?.status;
            const msg = String(error.response?.data?.msg ?? "");
            if (
              status === 409 ||
              msg.includes("중복") ||
              msg.includes("동일") ||
              msg.includes("존재")
            ) {
              totalSkipped += 1;
            } else {
              console.error("강의 등록 실패:", item.rawItem.courseName, error);
            }
          }
        }

        await syncTimeTableDetail(queryClient, destTimetableId);
      }

      if (lastCreatedTimetableId) {
        setSemester(lastSemesterLabel);
        setActiveTimetable(lastCreatedTimetableId);
      }

      mixpanelTrack.timetableFeatureClicked(
        "포털 시간표 가져오기 완료",
        "포털 페이지",
        {
          semesterCount: groupsWithSelections.length,
          totalAdded,
          totalSkipped,
        },
      );

      setSavedTimetableResult({
        totalAdded,
        totalSkipped,
        semesterCount: groupsWithSelections.length,
      });

      setStep("ASK_GRADE_IMPORT");
    } catch (err: any) {
      console.error("시간표 일괄 등록 중 오류:", err);
      alert(err?.response?.data?.msg || err?.message || "강의 등록에 실패했어요.");
      setStep("REVIEW");
    }
  };

  const handleSkipGrade = () => {
    alert(
      savedTimetableResult.totalSkipped > 0
        ? `총 ${savedTimetableResult.totalAdded}개 강의를 시간표에 등록했어요. (중복 ${savedTimetableResult.totalSkipped}개 제외)`
        : `총 ${savedTimetableResult.totalAdded}개 강의를 시간표에 등록했어요.`,
    );
    navigate(ROUTES.TIMETABLE.ROOT);
  };

  const handleImportGrades = async () => {
    setStep("FETCHING_GRADES");
    setLoadingMessage("포털에서 전체 학기 성적을 불러와 학점 계산기에 저장하고 있어요...");

    try {
      const reportRes = await fetchFullAcademicReportFromApp();
      if (!reportRes.success || !reportRes.data) {
        throw new Error(reportRes.errorMessage || "성적 정보를 불러오지 못했어요.");
      }

      const saveResult = savePortalGradesToCalculatorStorage(
        reportRes.data.courseGrades,
      );

      setGradeResult({
        semestersCount: saveResult.semestersCount,
        subjectsCount: saveResult.subjectsCount,
      });
      setStep("GRADE_SUCCESS");
    } catch (err: any) {
      console.error("성적 불러오기 오류:", err);
      alert(err?.message || "성적 정보를 불러오지 못했습니다.");
      handleSkipGrade();
    }
  };

  const totalSelectedCount = semesterGroups.reduce(
    (sum, g) => sum + g.courses.filter((c) => c.isSelected).length,
    0,
  );

  const totalFoundCourses = semesterGroups.reduce(
    (sum, g) => sum + g.courses.length,
    0,
  );

  return (
    <PageWrapper>
      <ScrollContainer>
        {step === "SELECT_SEMESTER" && (
          <ReadyContent>
            <TitleContentArea
              description={
                <>
                  인천대학교 포털사이트에서 시간표 정보를 가져와요.{" "}
                  <strong>가져오는 과정은 이 기기에서만 처리</strong>되며, 가져온
                  데이터를 INTIP 시간표에 등록해요.
                </>
              }
            />

            <SectionGroup>
              <SemesterHeaderRow>
                <Label>가져올 학기 선택</Label>
                <SelectAllButton type="button" onClick={toggleAllSemesters}>
                  {selectedSemesterIds.length === semesterOptions.length
                    ? "최신 학기만"
                    : "전체 선택"}
                </SelectAllButton>
              </SemesterHeaderRow>

              <SemesterCheckList>
                {semesterOptions.map((sem) => {
                  const isChecked = selectedSemesterIds.includes(sem.id);
                  return (
                    <SemesterCheckCard
                      key={sem.id}
                      $selected={isChecked}
                      onClick={() => toggleSemesterSelection(sem.id)}
                    >
                      <Checkbox $checked={isChecked}>
                        {isChecked && (
                          <Check size={14} color="#ffffff" strokeWidth={3} />
                        )}
                      </Checkbox>
                      <SemesterLabelText>{sem.label}</SemesterLabelText>
                    </SemesterCheckCard>
                  );
                })}
              </SemesterCheckList>
            </SectionGroup>

            {errorMessage && (
              <ErrorBox>
                <AlertCircle size={16} color="#f04452" />
                <span>{errorMessage}</span>
              </ErrorBox>
            )}
          </ReadyContent>
        )}

        {step === "SELECT_MODE" && (
          <ReadyContent>
            <TitleContentArea
              description={
                selectedSemesterIds.length > 1
                  ? `선택한 ${selectedSemesterIds.length}개 학기의 시간표를 등록할 방식을 선택해 주세요.`
                  : "가져온 시간표를 어떻게 등록할지 선택해 주세요."
              }
            />

            <SelectedSemesterSummaryCard>
              <SummaryLabel>
                선택된 학기 ({selectedSemesterIds.length}개)
              </SummaryLabel>
              <SummarySemesterChips>
                {semesterOptions
                  .filter((s) => selectedSemesterIds.includes(s.id))
                  .map((s) => (
                    <SemesterChip key={s.id}>{s.label}</SemesterChip>
                  ))}
              </SummarySemesterChips>
            </SelectedSemesterSummaryCard>

            <SectionGroup>
              <Label>등록 방식</Label>

              {/* 1. 현재 시간표에 추가 */}
              <OptionCard
                $selected={!createNewTimetable && canAddToCurrent}
                $disabled={!canAddToCurrent}
                onClick={() => {
                  if (!canAddToCurrent) return;
                  setCreateNewTimetable(false);
                }}
              >
                <RadioCircle
                  $selected={!createNewTimetable && canAddToCurrent}
                  $disabled={!canAddToCurrent}
                >
                  {!createNewTimetable && canAddToCurrent && <RadioDot />}
                </RadioCircle>
                <OptionInfo>
                  <OptionTitleRow>
                    <OptionTitle $disabled={!canAddToCurrent}>
                      현재 시간표에 추가
                    </OptionTitle>
                    {!canAddToCurrent && (
                      <DisabledBadge>선택 불가</DisabledBadge>
                    )}
                  </OptionTitleRow>
                  <OptionDesc $disabled={!canAddToCurrent}>
                    {canAddToCurrent
                      ? `"${activeTimetable?.name}"에 과목들을 바로 추가해요.`
                      : disabledReason}
                  </OptionDesc>
                </OptionInfo>
              </OptionCard>

              {/* 2. 새 시간표로 만들기 */}
              <OptionCard
                $selected={createNewTimetable}
                onClick={() => setCreateNewTimetable(true)}
              >
                <RadioCircle $selected={createNewTimetable}>
                  {createNewTimetable && <RadioDot />}
                </RadioCircle>
                <OptionInfo>
                  <OptionTitleRow>
                    <OptionTitle>
                      {isMultipleSemesters
                        ? "학기별 새 시간표로 만들기"
                        : "새 시간표로 만들기"}
                    </OptionTitle>
                    {isMultipleSemesters && (
                      <AutoSelectedBadge>기본 선택</AutoSelectedBadge>
                    )}
                  </OptionTitleRow>
                  <OptionDesc>
                    {isMultipleSemesters
                      ? `선택한 ${selectedSemesterIds.length}개 학기 각각에 대해 새로운 시간표를 생성해 과목들을 등록해요.`
                      : "새로운 시간표를 생성해 과목들을 등록해요."}
                  </OptionDesc>
                </OptionInfo>
              </OptionCard>
            </SectionGroup>

            {errorMessage && (
              <ErrorBox>
                <AlertCircle size={16} color="#f04452" />
                <span>{errorMessage}</span>
              </ErrorBox>
            )}
          </ReadyContent>
        )}

        {isLoading && (
          <LoadingContainer>
            <Spinner />
            <LoadingTitle>
              {step === "FETCHING"
                ? "포털 시간표 불러오는 중"
                : step === "FETCHING_GRADES"
                  ? "성적 정보 가져오는 중"
                  : "시간표 저장 중"}
            </LoadingTitle>
            <LoadingDesc>{loadingMessage}</LoadingDesc>
            <LoadingWarning>
              진행 중에는 화면을 닫거나 다른 앱으로 이동하지 마세요.
            </LoadingWarning>
          </LoadingContainer>
        )}

        {step === "REVIEW" && (
          <ReviewContent>
            <ReviewHeader>
              <SummaryText>
                총 <strong>{semesterGroups.length}개 학기</strong>,{" "}
                <strong>{totalFoundCourses}개</strong> 과목을 찾았어요
              </SummaryText>
              {emptySemesterLabels.length > 0 && (
                <ExcludedNoticeBox>
                  <Info size={15} color="#4e5968" />
                  <span>
                    {emptySemesterLabels.join(", ")}은(는) 수강 내역이 없어 제외되었어요.
                  </span>
                </ExcludedNoticeBox>
              )}
            </ReviewHeader>

            <SemesterGroupsWrapper>
              {semesterGroups.map((group, gIdx) => {
                const groupSelectable = group.courses.filter(
                  (c) => !c.isAlreadyAdded && c.offering,
                );
                const isGroupAllSelected =
                  groupSelectable.length > 0 &&
                  groupSelectable.every((c) => c.isSelected);

                return (
                  <GroupCard key={group.semesterId}>
                    <GroupHeaderRow onClick={() => toggleGroupExpand(gIdx)}>
                      <GroupTitleArea>
                        <GroupCheckboxSlot
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGroupSelectAll(gIdx);
                          }}
                        >
                          <Checkbox $checked={isGroupAllSelected}>
                            {isGroupAllSelected && (
                              <Check size={14} color="#ffffff" strokeWidth={3} />
                            )}
                          </Checkbox>
                        </GroupCheckboxSlot>
                        <GroupTitle>{group.label}</GroupTitle>
                        <GroupCountBadge>
                          {group.courses.length}과목
                        </GroupCountBadge>
                      </GroupTitleArea>

                      <ExpandIconSlot>
                        {group.isExpanded ? (
                          <ChevronUp size={18} color="#8b95a1" />
                        ) : (
                          <ChevronDown size={18} color="#8b95a1" />
                        )}
                      </ExpandIconSlot>
                    </GroupHeaderRow>

                    {group.isExpanded && (
                      <GroupCourseList>
                        {group.courses.map((item, cIdx) => (
                          <CourseItemCard
                            key={`${item.rawItem.courseCode}-${cIdx}`}
                            $selected={item.isSelected}
                            $disabled={item.isAlreadyAdded || !item.offering}
                            onClick={() => {
                              if (item.isAlreadyAdded || !item.offering) return;
                              toggleCourseSelect(gIdx, cIdx);
                            }}
                          >
                            <CourseCheckboxSlot>
                              <Checkbox
                                $checked={item.isSelected}
                                $disabled={item.isAlreadyAdded || !item.offering}
                              >
                                {item.isSelected && (
                                  <Check size={12} color="#ffffff" strokeWidth={3} />
                                )}
                              </Checkbox>
                            </CourseCheckboxSlot>

                            <CourseMain>
                              <CourseTopRow>
                                <CourseBadgeGroup>
                                  <CourseTypeBadge>
                                    {item.rawItem.courseType || "과목"}
                                  </CourseTypeBadge>
                                  {item.isAlreadyAdded && (
                                    <AlreadyAddedBadge>이미 등록됨</AlreadyAddedBadge>
                                  )}
                                  {!item.offering && !item.isAlreadyAdded && (
                                    <UnmatchedBadge>시간표 미개설</UnmatchedBadge>
                                  )}
                                </CourseBadgeGroup>
                                <CreditsText>{item.rawItem.credits}학점</CreditsText>
                              </CourseTopRow>

                              <CourseTitle>{item.rawItem.courseName}</CourseTitle>

                              <CourseMetaRow>
                                {item.rawItem.professorName && (
                                  <MetaItem>
                                    <User size={13} color="#8b95a1" />
                                    <span>{item.rawItem.professorName}</span>
                                  </MetaItem>
                                )}
                                {item.rawItem.timeInfoRaw && (
                                  <MetaItem>
                                    <Clock size={13} color="#8b95a1" />
                                    <span>{item.rawItem.timeInfoRaw}</span>
                                  </MetaItem>
                                )}
                              </CourseMetaRow>

                              {item.offering &&
                                item.matchStatus === "MATCHED_EXACT" && (
                                  <MatchSuccessNotice>
                                    <Check size={12} color="#0061ff" />
                                    <span>개설 강의 자동 매칭 완료</span>
                                  </MatchSuccessNotice>
                                )}
                            </CourseMain>
                          </CourseItemCard>
                        ))}
                      </GroupCourseList>
                    )}
                  </GroupCard>
                );
              })}
            </SemesterGroupsWrapper>
          </ReviewContent>
        )}

        {step === "ASK_GRADE_IMPORT" && (
          <GradePromptContent>
            <TimetableSuccessSummaryCard>
              <TimetableSuccessIconBox>
                <CheckCircle2 size={20} color="#0061ff" />
              </TimetableSuccessIconBox>
              <TimetableSuccessTextBox>
                <TimetableSuccessTitle>
                  {savedTimetableResult.semesterCount > 1
                    ? `${savedTimetableResult.semesterCount}개 학기 시간표 등록 완료`
                    : "시간표 등록 완료"}
                </TimetableSuccessTitle>
                <TimetableSuccessDesc>
                  총 {savedTimetableResult.totalAdded}개 강의를 시간표에 등록했어요.
                  {savedTimetableResult.totalSkipped > 0 &&
                    ` (중복 ${savedTimetableResult.totalSkipped}개 제외)`}
                </TimetableSuccessDesc>
              </TimetableSuccessTextBox>
            </TimetableSuccessSummaryCard>

            <PromptBadge>
              <Sparkles size={16} color="#0061ff" />
              <span>성적 연동</span>
            </PromptBadge>

            <PromptTitle>성적 정보를 학점 계산기에 불러올까요?</PromptTitle>
            <PromptDesc>
              방금 등록한 시간표와 함께 포털에 등록된 전체 학기 성적(과목별 성적, 취득학점, 평점)을 학점 계산기에 자동으로 등록할 수 있어요.
            </PromptDesc>

            <PromptFeatureCard>
              <FeatureItem>
                <FeatureIconBox>
                  <GraduationCap size={18} color="#0061ff" />
                </FeatureIconBox>
                <FeatureTextBox>
                  <FeatureTextTitle>전 학기 과목 및 평점 자동 등록</FeatureTextTitle>
                  <FeatureTextDesc>
                    과목명, 취득학점, 성적(A+, A0 등), 전공/교양 이수구분이 자동으로 채워져요.
                  </FeatureTextDesc>
                </FeatureTextBox>
              </FeatureItem>
              <FeatureItem>
                <FeatureIconBox>
                  <CheckCircle2 size={18} color="#0061ff" />
                </FeatureIconBox>
                <FeatureTextBox>
                  <FeatureTextTitle>서버 전송 없는 안전한 기기 내 저장</FeatureTextTitle>
                  <FeatureTextDesc>
                    성적 정보는 오직 내 휴대폰 로컬 저장소에만 안전하게 보관돼요.
                  </FeatureTextDesc>
                </FeatureTextBox>
              </FeatureItem>
            </PromptFeatureCard>
          </GradePromptContent>
        )}

        {step === "GRADE_SUCCESS" && (
          <GradeSuccessContent>
            <SuccessIconCircle>
              <CheckCircle2 size={36} color="#0061ff" />
            </SuccessIconCircle>
            <SuccessTitle>성적을 모두 불러왔어요!</SuccessTitle>
            <SuccessDesc>
              총 <strong>{gradeResult.semestersCount}개 학기</strong>,{" "}
              <strong>{gradeResult.subjectsCount}개 과목</strong> 성적이 학점 계산기에 안전하게 저장되었어요.
            </SuccessDesc>
          </GradeSuccessContent>
        )}
      </ScrollContainer>

      {/* 하단 고정 액션바 */}
      <FixedBottomArea>
        <FixedBottomContent>
          {step === "SELECT_SEMESTER" && (
            <FixedButtonRow>
              <CancelBottomButton
                variant="secondary"
                onClick={() => navigate(-1)}
              >
                취소
              </CancelBottomButton>
              <PrimaryBottomButton
                variant="primary"
                disabled={selectedSemesterIds.length === 0}
                onClick={() => setStep("SELECT_MODE")}
              >
                다음
              </PrimaryBottomButton>
            </FixedButtonRow>
          )}

          {step === "SELECT_MODE" && (
            <FixedButtonRow>
              <CancelBottomButton
                variant="secondary"
                onClick={() => setStep("SELECT_SEMESTER")}
              >
                이전
              </CancelBottomButton>
              <PrimaryBottomButton
                variant="primary"
                onClick={handleStartFetch}
              >
                {selectedSemesterIds.length > 1
                  ? `포털에서 ${selectedSemesterIds.length}개 학기 시간표 불러오기`
                  : "포털에서 시간표 불러오기"}
              </PrimaryBottomButton>
            </FixedButtonRow>
          )}

          {step === "REVIEW" && (
            <FixedButtonRow>
              <CancelBottomButton
                variant="secondary"
                onClick={() => setStep("SELECT_MODE")}
              >
                다시 설정
              </CancelBottomButton>
              <PrimaryBottomButton
                variant="primary"
                disabled={totalSelectedCount === 0}
                onClick={handleApplyToTimetable}
              >
                선택한 {totalSelectedCount}개 강의 등록
              </PrimaryBottomButton>
            </FixedButtonRow>
          )}

          {step === "ASK_GRADE_IMPORT" && (
            <FixedButtonRow>
              <CancelBottomButton
                variant="secondary"
                onClick={handleSkipGrade}
              >
                다음에 할게요
              </CancelBottomButton>
              <PrimaryBottomButton
                variant="primary"
                onClick={handleImportGrades}
              >
                불러올게요
              </PrimaryBottomButton>
            </FixedButtonRow>
          )}

          {step === "GRADE_SUCCESS" && (
            <FixedButtonRow>
              <CancelBottomButton
                variant="secondary"
                onClick={() => navigate(ROUTES.TIMETABLE.CALCULATOR)}
              >
                학점 계산기
              </CancelBottomButton>
              <PrimaryBottomButton
                variant="primary"
                onClick={() => navigate(ROUTES.TIMETABLE.ROOT)}
              >
                시간표 보러가기
              </PrimaryBottomButton>
            </FixedButtonRow>
          )}
        </FixedBottomContent>
      </FixedBottomArea>

      <PortalAccountModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        onSuccess={handlePortalAccountSuccess}
      />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height, 56px));
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-subtle, #f8f9fb);
`;

const ScrollContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 16px 20px 140px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
`;

const FixedBottomArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: linear-gradient(
    180deg,
    rgba(248, 249, 251, 0) 0%,
    rgba(248, 249, 251, 0.45) 45%,
    rgba(248, 249, 251, 0.85) 100%
  );
  z-index: 100;
  pointer-events: none;
`;

const FixedBottomContent = styled.div`
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  padding: 12px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: auto;
`;

const FixedButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const CancelBottomButton = styled(CapsuleButton)`
  width: 120px;
  height: 56px;
  min-height: 56px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
`;

const PrimaryBottomButton = styled(CapsuleButton)`
  flex: 1;
  height: 56px;
  min-height: 56px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
`;

const SelectedSemesterSummaryCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 14px;
`;

const SummaryLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #4e5968;
`;

const SummarySemesterChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SemesterChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 8px;
  background: var(--bg-brand-subtle, #eff6ff);
  color: var(--text-brand, #0061ff);
  font-size: 13px;
  font-weight: 600;
`;

const ReadyContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SemesterHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333d4b;
`;

const SelectAllButton = styled.button`
  font-size: 12.5px;
  color: #0061ff;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const SemesterCheckList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SemesterCheckCard = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${(props) => (props.$selected ? "#f0f6ff" : "#ffffff")};
  border: 1.5px solid ${(props) => (props.$selected ? "#0061ff" : "#f2f4f6")};
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
`;

const Checkbox = styled.div<{ $checked: boolean; $disabled?: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: ${(props) =>
    props.$disabled
      ? "#e5e8eb"
      : props.$checked
        ? "#0061ff"
        : "#ffffff"};
  border: 1.5px solid
    ${(props) =>
      props.$disabled
        ? "#e5e8eb"
        : props.$checked
          ? "#0061ff"
          : "#d1d6db"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SemesterLabelText = styled.span`
  font-size: 14.5px;
  font-weight: 600;
  color: #191f28;
`;

const OptionCard = styled.div<{ $selected: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${(props) =>
    props.$disabled
      ? "#f8f9fa"
      : props.$selected
        ? "#f0f6ff"
        : "#ffffff"};
  border: 1.5px solid
    ${(props) =>
      props.$disabled
        ? "#e5e8eb"
        : props.$selected
          ? "#0061ff"
          : "#f2f4f6"};
  border-radius: 14px;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.72 : 1)};
  transition: all 0.15s ease;
`;

const RadioCircle = styled.div<{ $selected: boolean; $disabled?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid
    ${(props) =>
      props.$disabled
        ? "#d1d6db"
        : props.$selected
          ? "#0061ff"
          : "#d1d6db"};
  background: ${(props) => (props.$disabled ? "#f2f4f6" : "transparent")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const RadioDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #0061ff;
`;

const OptionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
`;

const OptionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const OptionTitle = styled.div<{ $disabled?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => (props.$disabled ? "#8b95a1" : "#191f28")};
`;

const DisabledBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  background: #f2f4f6;
  color: #8b95a1;
  font-size: 11px;
  font-weight: 600;
`;

const AutoSelectedBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  background: #e8f3ff;
  color: #0061ff;
  font-size: 11px;
  font-weight: 600;
`;

const OptionDesc = styled.div<{ $disabled?: boolean }>`
  font-size: 12px;
  color: ${(props) => (props.$disabled ? "#8b95a1" : "#6b7684")};
  line-height: 1.35;
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #fef0f0;
  border-radius: 10px;
  font-size: 13px;
  color: #f04452;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  text-align: center;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e8f3ff;
  border-top-color: #0061ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingTitle = styled.div`
  font-size: 17px;
  font-weight: 700;
  color: #191f28;
`;

const LoadingDesc = styled.div`
  font-size: 13.5px;
  color: #8b95a1;
`;

const LoadingWarning = styled.div`
  font-size: 12px;
  color: #8b95a1;
  background: #f2f4f6;
  padding: 6px 12px;
  border-radius: 8px;
  margin-top: 6px;
`;

const ReviewContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ReviewHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

const ExcludedNoticeBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background: #f2f4f6;
  border-radius: 10px;
  font-size: 13px;
  color: #4e5968;
`;

const SummaryText = styled.div`
  font-size: 15px;
  color: #333d4b;

  strong {
    color: #0061ff;
    font-weight: 700;
  }
`;

const SemesterGroupsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GroupCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #f2f4f6;
  overflow: hidden;
`;

const GroupHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #f9fafb;
  cursor: pointer;
`;

const GroupTitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const GroupCheckboxSlot = styled.div`
  display: flex;
  align-items: center;
`;

const GroupTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
`;

const GroupCountBadge = styled.span`
  padding: 2px 7px;
  border-radius: 10px;
  background: #e8f3ff;
  color: #0061ff;
  font-size: 11px;
  font-weight: 600;
`;

const ExpandIconSlot = styled.div`
  display: flex;
  align-items: center;
`;

const GroupCourseList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 12px 12px;
  gap: 8px;
`;

const CourseItemCard = styled.div<{ $selected: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: ${(props) =>
    props.$disabled ? "#fafafa" : props.$selected ? "#f0f6ff" : "#ffffff"};
  border: 1px solid
    ${(props) =>
      props.$disabled ? "#f2f4f6" : props.$selected ? "#0061ff" : "#f2f4f6"};
  border-radius: 12px;
  cursor: ${(props) => (props.$disabled ? "default" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};
`;

const CourseCheckboxSlot = styled.div`
  margin-top: 2px;
`;

const CourseMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const CourseTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CourseBadgeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CourseTypeBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  background: #f2f4f6;
  color: #4e5968;
  font-size: 11px;
  font-weight: 600;
`;

const AlreadyAddedBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  background: #e5e8eb;
  color: #6b7684;
  font-size: 11px;
`;

const UnmatchedBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  background: #fef0f0;
  color: #f04452;
  font-size: 11px;
`;

const CreditsText = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #6b7684;
`;

const CourseTitle = styled.div`
  font-size: 14.5px;
  font-weight: 700;
  color: #191f28;
`;

const CourseMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #8b95a1;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MatchSuccessNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #0061ff;
  font-weight: 600;
  margin-top: 2px;
`;

const GradePromptContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 4px 16px;
  gap: 16px;
`;

const TimetableSuccessSummaryCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  text-align: left;
`;

const TimetableSuccessIconBox = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f0f6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TimetableSuccessTextBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
`;

const TimetableSuccessTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
`;

const TimetableSuccessDesc = styled.div`
  font-size: 13px;
  color: #6b7684;
`;

const PromptBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #e8f3ff;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
  color: #0061ff;
`;

const PromptTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #191f28;
  margin: 0;
  line-height: 1.35;
`;

const PromptDesc = styled.p`
  font-size: 14px;
  color: #6b7684;
  margin: 0;
  line-height: 1.5;
  word-break: keep-all;
`;

const PromptFeatureCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  padding: 18px 16px;
  background-color: #ffffff;
  border: 1px solid #f2f4f6;
  border-radius: 16px;
  text-align: left;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const FeatureIconBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: #e8f3ff;
  flex-shrink: 0;
`;

const FeatureTextBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FeatureTextTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #333d4b;
`;

const FeatureTextDesc = styled.div`
  font-size: 12px;
  color: #8b95a1;
  line-height: 1.4;
`;

const GradeSuccessContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 4px 16px;
  gap: 16px;
`;

const SuccessIconCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: #e8f3ff;
`;

const SuccessTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #191f28;
  margin: 0;
`;

const SuccessDesc = styled.p`
  font-size: 14.5px;
  color: #4e5968;
  margin: 0;
  line-height: 1.5;
  word-break: keep-all;

  strong {
    color: #0061ff;
  }
`;
